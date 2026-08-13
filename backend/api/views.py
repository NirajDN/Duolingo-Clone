from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Prefetch
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


def get_tokens_for_user(user):
    """Generate JWT access + refresh tokens for a user."""
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


def auth_user_response(user):
    """Standard auth payload returned after login/register."""
    return {
        'user': {'id': user.id, 'username': user.username, 'email': user.email},
        **get_tokens_for_user(user),
    }


# ─── AUTH ENDPOINTS ──────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """GET /api/health/ — Lightweight ping for Render wake-up."""
    return Response({'status': 'ok'})


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """POST /api/auth/register/ — Create a new user account."""
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not username or not password:
        return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 6:
        return Response({'detail': 'Password must be at least 6 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Username already taken.'}, status=status.HTTP_400_BAD_REQUEST)

    if email and User.objects.filter(email=email).exists():
        return Response({'detail': 'Email already in use.'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, email=email, password=password)
    # Bootstrap default UserStats for the new user
    UserStats.objects.get_or_create(user=user)

    tokens = get_tokens_for_user(user)
    return Response({
        'user': {'id': user.id, 'username': user.username, 'email': user.email},
        **tokens,
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_user(request):
    """POST /api/auth/login/ — Login with username/email + password."""
    identifier = request.data.get('username', '').strip()
    password = request.data.get('password', '')

    if not identifier or not password:
        return Response({'detail': 'Username and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Allow login via email OR username
    user = None
    if '@' in identifier:
        try:
            user_obj = User.objects.get(email=identifier)
            user = authenticate(request, username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass
    else:
        user = authenticate(request, username=identifier, password=password)

    if user is None:
        return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

    if not user.is_active:
        return Response({'detail': 'Account is disabled.'}, status=status.HTTP_403_FORBIDDEN)

    tokens = get_tokens_for_user(user)
    return Response({
        'user': {'id': user.id, 'username': user.username, 'email': user.email},
        **tokens,
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_user(request):
    """POST /api/auth/logout/ — Blacklist the refresh token."""
    refresh_token = request.data.get('refresh')
    if not refresh_token:
        return Response({'detail': 'Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        token = RefreshToken(refresh_token)
        token.blacklist()
    except TokenError:
        pass  # Already blacklisted or invalid, that's fine
    return Response({'detail': 'Successfully logged out.'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    """GET /api/auth/me/ — Return current user info."""
    user = request.user
    stats, _ = UserStats.objects.get_or_create(user=user)
    calculate_user_hearts(stats)
    return Response({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'date_joined': user.date_joined,
        'stats': UserStatsSerializer(stats).data,
    })


# ─── LEARNING PATH ENDPOINTS ─────────────────────────────────────────────────

def _build_path_payload(user):
    units = (
        Unit.objects.prefetch_related(
            Prefetch(
                'skills',
                queryset=Skill.objects.prefetch_related('lessons').order_by('order'),
            )
        )
        .order_by('order')
    )
    progress_map = {
        p.skill_id: p
        for p in UserProgress.objects.filter(user=user).only(
            'skill_id', 'is_unlocked', 'is_completed', 'completed_lessons', 'current_crown'
        )
    }
    serializer = UnitPathSerializer(
        units,
        many=True,
        context={'user': user, 'progress_map': progress_map},
    )
    return serializer.data


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_path(request):
    """GET /api/path/ - Full learning path with lock/unlock & progress state."""
    return Response(_build_path_payload(request.user))


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard(request):
    """GET /api/dashboard/ - Path + stats in one request."""
    user = request.user
    stats, _ = UserStats.objects.get_or_create(user=user)
    calculate_user_hearts(stats)
    return Response({
        'path': _build_path_payload(user),
        'stats': UserStatsSerializer(stats).data,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_skill_lesson(request, skill_id):
    """GET /api/skills/:id/lesson/ - Fetch/generate lesson for a skill."""
    skill = get_object_or_404(Skill, pk=skill_id)
    lesson = skill.lessons.first()
    if not lesson:
        return Response({'detail': 'No lessons found for this skill.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = LessonSerializer(lesson)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_lesson(request, lesson_id):
    """
    POST /api/lessons/:id/complete/
    Payload: { "score": 100, "hearts_lost": 1 }
    """
    user = request.user
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
@permission_classes([IsAuthenticated])
def get_user_stats(request):
    """GET /api/user/stats/ - XP, streak, hearts, gems."""
    user = request.user
    stats, _ = UserStats.objects.get_or_create(user=user)
    calculate_user_hearts(stats)
    serializer = UserStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def refill_hearts(request):
    """POST /api/user/hearts/refill/ - Instant hearts refill."""
    user = request.user
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
@permission_classes([IsAuthenticated])
def get_profile(request):
    """GET /api/user/profile/ - Stats + achievements for profile page."""
    user = request.user
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
@permission_classes([IsAuthenticated])
def get_achievements(request):
    """GET /api/achievements/ - Bonus badges system."""
    user = request.user
    achievements = Achievement.objects.all()
    serializer = AchievementSerializer(achievements, many=True, context={'user': user})
    return Response(serializer.data)
