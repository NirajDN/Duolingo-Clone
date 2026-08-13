from django.urls import path
from . import views

urlpatterns = [
    path('path/', views.get_path, name='get_path'),
    path('skills/<int:skill_id>/lesson/', views.get_skill_lesson, name='get_skill_lesson'),
    path('lessons/<int:lesson_id>/complete/', views.complete_lesson, name='complete_lesson'),
    path('user/stats/', views.get_user_stats, name='get_user_stats'),
    path('user/hearts/refill/', views.refill_hearts, name='refill_hearts'),
    path('leaderboard/', views.get_leaderboard, name='get_leaderboard'),
    path('user/profile/', views.get_profile, name='get_profile'),
    path('achievements/', views.get_achievements, name='get_achievements'),
]
