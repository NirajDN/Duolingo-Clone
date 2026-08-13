from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from .models import Language, Unit, Skill, Lesson, Exercise, UserStats, UserProgress, LeaderboardEntry
from .services import update_user_streak, calculate_user_hearts, record_lesson_completion


class StreakAndHeartsTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testlearner', password='password123')
        self.stats = UserStats.objects.create(
            user=self.user,
            xp=50,
            streak=1,
            hearts=5,
            max_hearts=5
        )

        self.language = Language.objects.create(code='es', name='Spanish', flag_icon='🇪🇸')
        self.unit = Unit.objects.create(language=self.language, title='Unit 1', description='Basics', order=1)
        self.skill = Skill.objects.create(unit=self.unit, title='Basics 1', order=1, total_crowns=1)
        self.lesson = Lesson.objects.create(skill=self.skill, title='Lesson 1', order=1, xp_reward=10)
        self.exercise = Exercise.objects.create(
            lesson=self.lesson,
            type='multiple_choice',
            prompt='Select the translation for "boy"',
            order=1,
            content={'question': 'El niño', 'options': [{'text': 'The boy', 'correct': True}]}
        )

    def test_streak_increment_consecutive_days(self):
        day1 = date(2026, 8, 1)
        day2 = date(2026, 8, 2)

        update_user_streak(self.stats, activity_date=day1)
        self.assertEqual(self.stats.streak, 1)
        self.assertEqual(self.stats.last_active_date, day1)

        update_user_streak(self.stats, activity_date=day2)
        self.assertEqual(self.stats.streak, 2)
        self.assertEqual(self.stats.last_active_date, day2)

    def test_streak_reset_after_missed_day(self):
        day1 = date(2026, 8, 1)
        day3 = date(2026, 8, 3)

        update_user_streak(self.stats, activity_date=day1)
        self.assertEqual(self.stats.streak, 1)

        # Skip August 2nd, active on August 3rd
        update_user_streak(self.stats, activity_date=day3)
        self.assertEqual(self.stats.streak, 1)
        self.assertEqual(self.stats.last_active_date, day3)

    def test_heart_regeneration(self):
        # User loses 2 hearts
        now = timezone.now()
        self.stats.hearts = 3
        self.stats.last_heart_loss_timestamp = now
        self.stats.save()

        # Advance time by 125 minutes (should regenerate 2 hearts)
        later = now + timedelta(minutes=125)
        calculate_user_hearts(self.stats, current_datetime=later)

        self.assertEqual(self.stats.hearts, 5)
        self.assertIsNone(self.stats.last_heart_loss_timestamp)

    def test_lesson_completion_xp_and_progress(self):
        res = record_lesson_completion(
            user=self.user,
            lesson=self.lesson,
            score=100,
            hearts_lost=0
        )
        self.assertEqual(res['xp_gained'], 10)
        self.assertEqual(res['new_total_xp'], 60)

        # Check progress record
        progress = UserProgress.objects.get(user=self.user, skill=self.skill)
        self.assertEqual(progress.completed_lessons, 1)
        self.assertTrue(progress.is_completed)
