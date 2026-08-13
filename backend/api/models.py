from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Language(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    flag_icon = models.CharField(max_length=10, default='🇪🇸')

    def __str__(self):
        return f"{self.name} ({self.code})"


class Unit(models.Model):
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='units')
    title = models.CharField(max_length=200)
    description = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)
    hex_color = models.CharField(max_length=20, default='#58CC02')

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Unit {self.order}: {self.title}"


class Skill(models.Model):
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name='skills')
    title = models.CharField(max_length=100)
    icon = models.CharField(max_length=50, default='coffee')
    order = models.PositiveIntegerField(default=1)
    total_crowns = models.PositiveIntegerField(default=5)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.unit.title} - Skill: {self.title}"


class Lesson(models.Model):
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=100)
    order = models.PositiveIntegerField(default=1)
    xp_reward = models.PositiveIntegerField(default=10)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.skill.title} - Lesson {self.order}"


class Exercise(models.Model):
    EXERCISE_TYPES = [
        ('multiple_choice', 'Multiple Choice'),
        ('translate', 'Translate / Word Bank'),
        ('match_pairs', 'Match Pairs'),
        ('fill_blank', 'Fill in the Blank'),
        ('type_answer', 'Type the Answer'),
    ]

    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='exercises')
    type = models.CharField(max_length=50, choices=EXERCISE_TYPES)
    prompt = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=1)
    content = models.JSONField(default=dict)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"Exercise {self.order} ({self.type}) for Lesson {self.lesson.id}"


class UserStats(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='stats')
    xp = models.PositiveIntegerField(default=0)
    streak = models.PositiveIntegerField(default=0)
    last_active_date = models.DateField(null=True, blank=True)
    hearts = models.PositiveIntegerField(default=5)
    max_hearts = models.PositiveIntegerField(default=5)
    last_heart_loss_timestamp = models.DateTimeField(null=True, blank=True)
    gems = models.PositiveIntegerField(default=500)
    daily_xp_goal = models.PositiveIntegerField(default=50)
    daily_xp_today = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Stats for {self.user.username} (XP: {self.xp}, Streak: {self.streak})"


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='user_progress')
    completed_lessons = models.PositiveIntegerField(default=0)
    current_crown = models.PositiveIntegerField(default=0)
    is_unlocked = models.BooleanField(default=False)
    is_completed = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['user', 'skill']

    def __str__(self):
        return f"{self.user.username} - {self.skill.title} (Crown {self.current_crown})"


class UserLessonAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lesson_attempts')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='attempts')
    score = models.PositiveIntegerField(default=100)
    hearts_lost = models.PositiveIntegerField(default=0)
    xp_earned = models.PositiveIntegerField(default=10)
    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} completed Lesson {self.lesson.id} with score {self.score}%"


class LeaderboardEntry(models.Model):
    LEAGUE_CHOICES = [
        ('Bronze', 'Bronze League'),
        ('Silver', 'Silver League'),
        ('Gold', 'Gold League'),
        ('Sapphire', 'Sapphire League'),
        ('Ruby', 'Ruby League'),
        ('Emerald', 'Emerald League'),
        ('Amethyst', 'Amethyst League'),
        ('Pearl', 'Pearl League'),
        ('Diamond', 'Diamond League'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='leaderboard_entry')
    weekly_xp = models.PositiveIntegerField(default=0)
    league = models.CharField(max_length=50, choices=LEAGUE_CHOICES, default='Bronze')
    rank = models.PositiveIntegerField(default=1)

    class Meta:
        ordering = ['-weekly_xp']

    def __str__(self):
        return f"{self.user.username} - {self.league} (XP: {self.weekly_xp})"


class Achievement(models.Model):
    title = models.CharField(max_length=100)
    description = models.CharField(max_length=255)
    icon = models.CharField(max_length=50, default='trophy')
    category = models.CharField(max_length=50, default='streak')
    max_progress = models.PositiveIntegerField(default=10)

    def __str__(self):
        return self.title


class UserAchievement(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='user_achievements')
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE)
    unlocked_at = models.DateTimeField(null=True, blank=True)
    current_progress = models.PositiveIntegerField(default=0)
    is_unlocked = models.BooleanField(default=False)

    class Meta:
        unique_together = ['user', 'achievement']

    def __str__(self):
        return f"{self.user.username} - {self.achievement.title} ({'Unlocked' if self.is_unlocked else 'In Progress'})"
