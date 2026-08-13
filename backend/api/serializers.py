from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Language, Unit, Skill, Lesson, Exercise,
    UserStats, UserProgress, UserLessonAttempt, LeaderboardEntry,
    Achievement, UserAchievement
)


class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'code', 'name', 'flag_icon']


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ['id', 'type', 'prompt', 'order', 'content']


class LessonSerializer(serializers.ModelSerializer):
    exercises = ExerciseSerializer(many=True, read_only=True)

    class Meta:
        model = Lesson
        fields = ['id', 'title', 'order', 'xp_reward', 'exercises']


class SkillPathSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    is_completed = serializers.SerializerMethodField()
    completed_lessons = serializers.SerializerMethodField()
    current_crown = serializers.SerializerMethodField()
    total_lessons = serializers.SerializerMethodField()

    class Meta:
        model = Skill
        fields = [
            'id', 'title', 'icon', 'order', 'total_crowns',
            'is_unlocked', 'is_completed', 'completed_lessons',
            'current_crown', 'total_lessons'
        ]

    def get_user_progress(self, obj):
        progress_map = self.context.get('progress_map')
        if progress_map is not None:
            return progress_map.get(obj.id)
        user = self.context.get('user')
        if not user or user.is_anonymous:
            return None
        return UserProgress.objects.filter(user=user, skill=obj).first()

    def get_is_unlocked(self, obj):
        # First skill in first unit is always unlocked by default
        if obj.order == 1 and obj.unit.order == 1:
            return True
        progress = self.get_user_progress(obj)
        return progress.is_unlocked if progress else False

    def get_is_completed(self, obj):
        progress = self.get_user_progress(obj)
        return progress.is_completed if progress else False

    def get_completed_lessons(self, obj):
        progress = self.get_user_progress(obj)
        return progress.completed_lessons if progress else 0

    def get_current_crown(self, obj):
        progress = self.get_user_progress(obj)
        return progress.current_crown if progress else 0

    def get_total_lessons(self, obj):
        lessons = obj.lessons.all()
        return len(lessons) or 1


class UnitPathSerializer(serializers.ModelSerializer):
    skills = serializers.SerializerMethodField()

    class Meta:
        model = Unit
        fields = ['id', 'title', 'description', 'order', 'hex_color', 'skills']

    def get_skills(self, obj):
        skills = obj.skills.all()
        return SkillPathSerializer(skills, many=True, context=self.context).data


class UserStatsSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = UserStats
        fields = [
            'username', 'xp', 'streak', 'last_active_date',
            'hearts', 'max_hearts', 'gems', 'daily_xp_goal', 'daily_xp_today'
        ]


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = LeaderboardEntry
        fields = ['id', 'username', 'weekly_xp', 'league', 'rank']


class AchievementSerializer(serializers.ModelSerializer):
    is_unlocked = serializers.SerializerMethodField()
    current_progress = serializers.SerializerMethodField()

    class Meta:
        model = Achievement
        fields = ['id', 'title', 'description', 'icon', 'category', 'max_progress', 'is_unlocked', 'current_progress']

    def get_user_achievement(self, obj):
        user = self.context.get('user')
        if not user or user.is_anonymous:
            return None
        return UserAchievement.objects.filter(user=user, achievement=obj).first()

    def get_is_unlocked(self, obj):
        ua = self.get_user_achievement(obj)
        return ua.is_unlocked if ua else False

    def get_current_progress(self, obj):
        ua = self.get_user_achievement(obj)
        return ua.current_progress if ua else 0
