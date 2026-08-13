from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('health/', views.health_check, name='health_check'),

    # ── Auth ──────────────────────────────────────────────────
    path('auth/register/', views.register_user, name='register'),
    path('auth/login/', views.login_user, name='login'),
    path('auth/google/', views.google_auth, name='google_auth'),
    path('auth/logout/', views.logout_user, name='logout'),
    path('auth/me/', views.get_me, name='me'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # ── Learning Path ─────────────────────────────────────────
    path('path/', views.get_path, name='get_path'),
    path('skills/<int:skill_id>/lesson/', views.get_skill_lesson, name='get_skill_lesson'),
    path('lessons/<int:lesson_id>/complete/', views.complete_lesson, name='complete_lesson'),

    # ── User ──────────────────────────────────────────────────
    path('user/stats/', views.get_user_stats, name='get_user_stats'),
    path('user/hearts/refill/', views.refill_hearts, name='refill_hearts'),
    path('user/profile/', views.get_profile, name='get_profile'),

    # ── Leaderboard & Achievements ────────────────────────────
    path('leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    path('achievements/', views.get_achievements, name='get_achievements'),
]
