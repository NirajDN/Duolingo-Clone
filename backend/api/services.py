from datetime import timedelta
from django.utils import timezone
from .models import (
    UserStats, UserProgress, Skill, Lesson, UserLessonAttempt, LeaderboardEntry,
    Achievement, UserAchievement,
)

REGEN_INTERVAL_MINUTES = 60  # 1 heart regenerated every 60 minutes
ACTIVE_LEAGUE = 'Gold'


def ensure_active_league(entry: LeaderboardEntry) -> LeaderboardEntry:
    """Everyone on the weekly board competes in the same league."""
    if entry.league != ACTIVE_LEAGUE:
        entry.league = ACTIVE_LEAGUE
        entry.save(update_fields=['league'])
    return entry


def calculate_user_hearts(stats: UserStats, current_datetime=None) -> UserStats:
    """
    Real timestamp-based heart regeneration logic.
    Regenerates 1 heart per REGEN_INTERVAL_MINUTES since last heart loss.
    """
    if stats.hearts >= stats.max_hearts:
        stats.last_heart_loss_timestamp = None
        stats.save()
        return stats

    if not stats.last_heart_loss_timestamp:
        return stats

    now = current_datetime or timezone.now()
    elapsed_seconds = (now - stats.last_heart_loss_timestamp).total_seconds()
    if elapsed_seconds < 0:
        return stats

    elapsed_minutes = elapsed_seconds / 60.0
    hearts_to_add = int(elapsed_minutes // REGEN_INTERVAL_MINUTES)

    if hearts_to_add > 0:
        new_hearts = min(stats.max_hearts, stats.hearts + hearts_to_add)
        stats.hearts = new_hearts

        if new_hearts >= stats.max_hearts:
            stats.last_heart_loss_timestamp = None
        else:
            # Advance last loss timestamp by full regen cycles processed
            stats.last_heart_loss_timestamp += timedelta(minutes=hearts_to_add * REGEN_INTERVAL_MINUTES)
        stats.save()

    return stats


def update_user_streak(stats: UserStats, activity_date=None) -> int:
    """
    Testable streak calculation logic allowing explicit date injection.
    """
    today = activity_date or timezone.now().date()

    if stats.last_active_date is None:
        stats.streak = 1
        stats.last_active_date = today
    elif stats.last_active_date == today:
        # Already logged activity today, streak stays current
        pass
    elif stats.last_active_date == today - timedelta(days=1):
        # Active yesterday, increment streak
        stats.streak += 1
        stats.last_active_date = today
    else:
        # Missed one or more days, reset streak to 1
        stats.streak = 1
        stats.last_active_date = today

    stats.save()
    return stats.streak


def build_leaderboard_payload(limit=20):
    """Ordered leaderboard rows with live ranks for the active league."""
    entries = list(LeaderboardEntry.objects.select_related('user').order_by('-weekly_xp', 'id'))
    for entry in entries:
        ensure_active_league(entry)

    data = []
    for idx, entry in enumerate(entries, start=1):
        data.append({
            'id': entry.id,
            'username': entry.user.username,
            'weekly_xp': entry.weekly_xp,
            'league': ACTIVE_LEAGUE,
            'rank': idx,
        })
    return data[:limit]


def get_leaderboard_rank(user) -> int:
    """Rank = 1 + number of users with strictly higher weekly XP."""
    lb, _ = LeaderboardEntry.objects.get_or_create(user=user, defaults={'league': ACTIVE_LEAGUE})
    ensure_active_league(lb)
    return 1 + LeaderboardEntry.objects.filter(weekly_xp__gt=lb.weekly_xp).count()


def recalculate_leaderboard_ranks():
    """Persist rank on each entry ordered by weekly XP (highest first)."""
    entries = LeaderboardEntry.objects.order_by('-weekly_xp', 'id')
    for idx, entry in enumerate(entries, start=1):
        if entry.rank != idx:
            entry.rank = idx
            entry.save(update_fields=['rank'])


def update_user_achievements(user, stats: UserStats):
    """Sync achievement progress from live user stats."""
    completed_skills = UserProgress.objects.filter(user=user, is_completed=True).count()
    perfect_lessons = UserLessonAttempt.objects.filter(user=user, score=100).count()
    lb = LeaderboardEntry.objects.filter(user=user).first()
    league_is_gold = bool(lb and lb.league == ACTIVE_LEAGUE)

    category_progress = {
        'streak': stats.streak,
        'xp': stats.xp,
        'skills': completed_skills,
        'accuracy': perfect_lessons,
        'league': 1 if league_is_gold else 0,
    }

    for ach in Achievement.objects.all():
        progress_val = category_progress.get(ach.category, 0)
        ua, _ = UserAchievement.objects.get_or_create(user=user, achievement=ach)
        ua.current_progress = min(progress_val, ach.max_progress)
        if ua.current_progress >= ach.max_progress and not ua.is_unlocked:
            ua.is_unlocked = True
            ua.unlocked_at = timezone.now()
        ua.save()


def record_lesson_completion(user, lesson: Lesson, score: int, hearts_lost: int, activity_datetime=None):
    """
    Processes lesson completion results:
    - Awards XP and updates UserStats
    - Deducts lost hearts & records loss timestamp if applicable
    - Updates UserProgress for current skill
    - Unlocks subsequent skills/units upon skill completion
    - Updates leaderboard weekly XP
    """
    now = activity_datetime or timezone.now()
    today = now.date()

    stats, _ = UserStats.objects.get_or_create(user=user)
    
    # 1. Update Hearts
    calculate_user_hearts(stats, current_datetime=now)
    if hearts_lost > 0:
        stats.hearts = max(0, stats.hearts - hearts_lost)
        if stats.last_heart_loss_timestamp is None:
            stats.last_heart_loss_timestamp = now

    # 2. Award XP & Daily Goal
    xp_gained = lesson.xp_reward
    stats.xp += xp_gained
    stats.daily_xp_today += xp_gained

    # 3. Update Streak
    old_streak = stats.streak
    update_user_streak(stats, activity_date=today)
    streak_increased = stats.streak > old_streak
    stats.save()

    # 4. Record Lesson Attempt
    UserLessonAttempt.objects.create(
        user=user,
        lesson=lesson,
        score=score,
        hearts_lost=hearts_lost,
        xp_earned=xp_gained,
        completed_at=now
    )

    # 5. Update Leaderboard Entry
    lb, _ = LeaderboardEntry.objects.get_or_create(user=user, defaults={'league': ACTIVE_LEAGUE})
    lb.weekly_xp += xp_gained
    ensure_active_league(lb)
    lb.save()
    recalculate_leaderboard_ranks()
    leaderboard_rank = get_leaderboard_rank(user)

    # 5b. Sync achievements
    update_user_achievements(user, stats)

    # 6. Update Skill Progress & Unlock Next
    skill = lesson.skill
    progress, _ = UserProgress.objects.get_or_create(user=user, skill=skill)
    total_lessons = skill.lessons.count() or 1

    progress.completed_lessons += 1
    if progress.completed_lessons >= total_lessons:
        progress.current_crown = min(skill.total_crowns, progress.current_crown + 1)
        if progress.current_crown >= skill.total_crowns:
            progress.is_completed = True

    progress.is_unlocked = True
    progress.save()

    # Unlock next skill in order if current lesson complete
    next_skill = Skill.objects.filter(unit=skill.unit, order__gt=skill.order).first()
    if not next_skill:
        # Try next unit's first skill
        next_unit = skill.unit.language.units.filter(order__gt=skill.unit.order).first()
        if next_unit:
            next_skill = next_unit.skills.first()

    next_skill_id = None
    if next_skill:
        next_progress, _ = UserProgress.objects.get_or_create(user=user, skill=next_skill)
        next_progress.is_unlocked = True
        next_progress.save()
        next_skill_id = next_skill.id

    return {
        'xp_gained': xp_gained,
        'new_total_xp': stats.xp,
        'streak': stats.streak,
        'hearts': stats.hearts,
        'skill_completed': progress.is_completed,
        'completed_lessons': progress.completed_lessons,
        'current_crown': progress.current_crown,
        'next_skill_unlocked_id': next_skill_id,
        'streak_increased': streak_increased,
        'leaderboard_rank': leaderboard_rank,
        'weekly_xp': lb.weekly_xp,
        'league': lb.league,
    }
