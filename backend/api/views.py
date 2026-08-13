from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import (
    Language, Unit, Skill, Lesson, Exercise,
    UserStats, UserProgress, UserLessonAttempt, LeaderboardEntry,
    Achievement, UserAchievement
)
from .serializers import (
    UnitPathSerializer, LessonSerializer, UserStatsSerializer,
    LeaderboardEntrySerializer, AchievementSerializer
)
from .services import calculate_user_hearts, record_lesson_completion


def get_default_user():
    user = User.objects.filter(username='learner1').first()
    if not user:
        user = User.objects.first()
    if not user:
        user = User.objects.create_user(username='learner1', password='password123')
    return user


@api_view(['GET'])
@permission_classes([AllowAny])
def get_path(request):
    """GET /api/path/ - Full learning path with lock/unlock & progress state."""
    user = get_default_user()
    units = Unit.objects.prefetch_related('skills').all()
    serializer = UnitPathSerializer(units, many=True, context={'user': user})
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_skill_lesson(request, skill_id):
    """GET /api/skills/:id/lesson/ - Fetch/generate lesson for a skill."""
    skill = get_object_or_404(Skill, pk=skill_id)
    lesson = skill.lessons.first()
    if not lesson:
        return Response({'detail': 'No lessons found for this skill.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = LessonSerializer(lesson)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def complete_lesson(request, lesson_id):
    """
    POST /api/lessons/:id/complete/
    Payload: { "score": 100, "hearts_lost": 1 }
    Submit lesson results, award XP, update progress, update streak.
    """
    user = get_default_user()
    lesson = get_object_or_404(Lesson, pk=lesson_id)

    score = request.data.get('score', 100)
    hearts_lost = request.data.get('hearts_lost', 0)

    res = record_lesson_completion(
        user=user,
        lesson=lesson,
        score=score,
        hearts_lost=hearts_lost
    )

    return Response(res, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_user_stats(request):
    """GET /api/user/stats/ - XP, streak, hearts (with real timestamp regen), gems."""
    user = get_default_user()
    stats, _ = UserStats.objects.get_or_create(user=user)
    calculate_user_hearts(stats)
    serializer = UserStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([AllowAny])
def refill_hearts(request):
    """POST /api/user/hearts/refill/ - Instant hearts refill."""
    user = get_default_user()
    stats, _ = UserStats.objects.get_or_create(user=user)
    stats.hearts = stats.max_hearts
    stats.last_heart_loss_timestamp = None
    stats.save()
    return Response({'message': 'Hearts refilled successfully!', 'hearts': stats.hearts})


@api_view(['GET'])
@permission_classes([AllowAny])
def get_leaderboard(request):
    """GET /api/leaderboard/ - Seeded leaderboard across users."""
    entries = LeaderboardEntry.objects.select_related('user').order_by('-weekly_xp')[:20]
    serializer = LeaderboardEntrySerializer(entries, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_profile(request):
    """GET /api/user/profile/ - Stats + achievements for profile page."""
    user = get_default_user()
    stats, _ = UserStats.objects.get_or_create(user=user)
    calculate_user_hearts(stats)

    achievements = Achievement.objects.all()
    achievements_serialized = AchievementSerializer(achievements, many=True, context={'user': user}).data

    return Response({
        'username': user.username,
        'date_joined': user.date_joined,
        'stats': UserStatsSerializer(stats).data,
        'achievements': achievements_serialized
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def get_achievements(request):
    """GET /api/achievements/ - Bonus badges system."""
    user = get_default_user()
    achievements = Achievement.objects.all()
    serializer = AchievementSerializer(achievements, many=True, context={'user': user})
    return Response(serializer.data)
