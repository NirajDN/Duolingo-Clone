from django.contrib import admin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin

from .models import (
    Language,
    Unit,
    Skill,
    Lesson,
    Exercise,
    UserStats,
    UserProgress,
    UserLessonAttempt,
    LeaderboardEntry,
    Achievement,
    UserAchievement,
)


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ('id', 'code', 'name', 'flag_icon')
    search_fields = ('code', 'name')


class SkillInline(admin.TabularInline):
    model = Skill
    extra = 0


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'title', 'language', 'hex_color')
    list_filter = ('language',)
    search_fields = ('title',)
    inlines = [SkillInline]


class LessonInline(admin.TabularInline):
    model = Lesson
    extra = 0


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'title', 'unit', 'total_crowns')
    list_filter = ('unit',)
    search_fields = ('title',)
    inlines = [LessonInline]


class ExerciseInline(admin.TabularInline):
    model = Exercise
    extra = 0


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'title', 'skill', 'xp_reward')
    list_filter = ('skill__unit', 'skill')
    search_fields = ('title',)
    inlines = [ExerciseInline]


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'type', 'prompt', 'lesson')
    list_filter = ('type',)
    search_fields = ('prompt',)


@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'xp',
        'streak',
        'hearts',
        'max_hearts',
        'gems',
        'daily_xp_today',
        'daily_xp_goal',
        'last_active_date',
    )
    list_filter = ('last_active_date',)
    search_fields = ('user__username', 'user__email')
    ordering = ('-xp',)


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = (
        'user',
        'skill',
        'completed_lessons',
        'current_crown',
        'is_unlocked',
        'is_completed',
        'last_accessed',
    )
    list_filter = ('is_unlocked', 'is_completed', 'skill__unit')
    search_fields = ('user__username', 'skill__title')
    ordering = ('-last_accessed',)


@admin.register(UserLessonAttempt)
class UserLessonAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'score', 'hearts_lost', 'xp_earned', 'completed_at')
    list_filter = ('completed_at',)
    search_fields = ('user__username', 'lesson__title')
    ordering = ('-completed_at',)


@admin.register(LeaderboardEntry)
class LeaderboardEntryAdmin(admin.ModelAdmin):
    list_display = ('user', 'weekly_xp', 'league', 'rank')
    list_filter = ('league',)
    search_fields = ('user__username',)
    ordering = ('rank',)


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'category', 'max_progress')
    search_fields = ('title',)


@admin.register(UserAchievement)
class UserAchievementAdmin(admin.ModelAdmin):
    list_display = ('user', 'achievement', 'current_progress', 'is_unlocked', 'unlocked_at')
    list_filter = ('is_unlocked',)
    search_fields = ('user__username', 'achievement__title')


# Extend default User admin to show join/login dates (useful for new signups)
admin.site.unregister(User)


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    list_display = ('id', 'username', 'email', 'date_joined', 'last_login', 'is_active')
    list_filter = ('is_active', 'is_staff', 'date_joined')
    search_fields = ('username', 'email')
    ordering = ('-date_joined',)
