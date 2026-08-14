from datetime import date

from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from django.utils import timezone

from api.models import (
    Achievement,
    Exercise,
    Language,
    LeaderboardEntry,
    Lesson,
    Skill,
    Unit,
    UserAchievement,
    UserProgress,
    UserStats,
)


def build_default_exercises(skill_title: str):
    """Generate polished fallback exercises instead of placeholder A/B/C items."""
    templates = {
        'Hobbies': [
            {
                'type': 'multiple_choice',
                'prompt': 'What does "leer" mean?',
                'order': 1,
                'content': {
                    'question': 'leer',
                    'options': [
                        {'text': 'to read', 'correct': True},
                        {'text': 'to write', 'correct': False},
                        {'text': 'to run', 'correct': False},
                        {'text': 'to dance', 'correct': False},
                    ],
                },
            },
            {
                'type': 'translate',
                'prompt': 'Translate this sentence',
                'order': 2,
                'content': {
                    'source_text': 'Me gusta escuchar música.',
                    'correct_words': ['I', 'like', 'listening', 'to', 'music.'],
                    'word_bank': ['I', 'like', 'listening', 'to', 'music.', 'game', 'book', 'travel'],
                },
            },
            {
                'type': 'match_pairs',
                'prompt': 'Match the hobbies',
                'order': 3,
                'content': {
                    'pairs': [
                        {'left': 'leer', 'right': 'to read'},
                        {'left': 'cantar', 'right': 'to sing'},
                        {'left': 'pintar', 'right': 'to paint'},
                        {'left': 'bailar', 'right': 'to dance'},
                    ],
                },
            },
            {
                'type': 'fill_blank',
                'prompt': 'Complete the sentence',
                'order': 4,
                'content': {
                    'sentence_parts': ['Yo ', ' en el parque.'],
                    'correct_word': 'corro',
                    'options': ['corro', 'bebo', 'duermo', 'escucho'],
                },
            },
            {
                'type': 'type_answer',
                'prompt': 'Type the English translation',
                'order': 5,
                'content': {
                    'prompt_text': 'Juego al fútbol los domingos.',
                    'accepted_answers': ['I play soccer on Sundays.', 'I play football on Sundays.'],
                },
            },
        ],
        'Travel': [
            {
                'type': 'multiple_choice',
                'prompt': 'How do you ask for the station?',
                'order': 1,
                'content': {
                    'question': 'Where is the train station?',
                    'options': [
                        {'text': '¿Dónde está la estación?', 'correct': True},
                        {'text': '¿Por qué estás aquí?', 'correct': False},
                        {'text': '¿Cuánto cuesta?', 'correct': False},
                        {'text': '¿Qué hora es?', 'correct': False},
                    ],
                },
            },
            {
                'type': 'translate',
                'prompt': 'Translate this sentence',
                'order': 2,
                'content': {
                    'source_text': 'Necesito un boleto para Madrid.',
                    'correct_words': ['I', 'need', 'a', 'ticket', 'to', 'Madrid.'],
                    'word_bank': ['I', 'need', 'a', 'ticket', 'to', 'Madrid.', 'bus', 'book', 'home'],
                },
            },
            {
                'type': 'match_pairs',
                'prompt': 'Match the travel words',
                'order': 3,
                'content': {
                    'pairs': [
                        {'left': 'autobús', 'right': 'bus'},
                        {'left': 'tren', 'right': 'train'},
                        {'left': 'aeropuerto', 'right': 'airport'},
                        {'left': 'coche', 'right': 'car'},
                    ],
                },
            },
            {
                'type': 'fill_blank',
                'prompt': 'Complete the sentence',
                'order': 4,
                'content': {
                    'sentence_parts': ['¿Puedes ir a la ', '?'],
                    'correct_word': 'estación',
                    'options': ['estación', 'comida', 'puerta', 'casa'],
                },
            },
            {
                'type': 'type_answer',
                'prompt': 'Type the Spanish answer',
                'order': 5,
                'content': {
                    'prompt_text': 'The flight leaves at 8:30.',
                    'accepted_answers': ['El vuelo sale a las ocho y media.', 'El vuelo sale a las 8:30.', 'el vuelo sale a las ocho y media.'],
                },
            },
        ],
    }

    fallback = [
        {
            'type': 'multiple_choice',
            'prompt': f'Select the best answer for {skill_title}.',
            'order': 1,
            'content': {
                'question': skill_title,
                'options': [
                    {'text': 'I understand the lesson well.', 'correct': True},
                    {'text': 'I am reading a sandwich.', 'correct': False},
                    {'text': 'The window is a bird.', 'correct': False},
                    {'text': 'We cook in the sky.', 'correct': False},
                ],
            },
        },
        {
            'type': 'translate',
            'prompt': 'Translate this sentence',
            'order': 2,
            'content': {
                'source_text': 'Estoy aprendiendo español cada día.',
                'correct_words': ['I', 'am', 'learning', 'Spanish', 'every', 'day.'],
                'word_bank': ['I', 'am', 'learning', 'Spanish', 'every', 'day.', 'dog', 'coffee', 'music'],
            },
        },
        {
            'type': 'match_pairs',
            'prompt': 'Match the words',
            'order': 3,
            'content': {
                'pairs': [
                    {'left': 'escuchar', 'right': 'to listen'},
                    {'left': 'aprender', 'right': 'to learn'},
                    {'left': 'caminar', 'right': 'to walk'},
                    {'left': 'estudiar', 'right': 'to study'},
                ],
            },
        },
        {
            'type': 'fill_blank',
            'prompt': 'Complete the sentence',
            'order': 4,
            'content': {
                'sentence_parts': ['Hoy yo ', ' mucho.'],
                'correct_word': 'aprendo',
                'options': ['aprendo', 'comes', 'duerme', 'hablas'],
            },
        },
        {
            'type': 'type_answer',
            'prompt': 'Type the English translation',
            'order': 5,
            'content': {
                'prompt_text': 'Hola, ¿cómo estás?',
                'accepted_answers': ['Hello, how are you?', 'Hi, how are you?'],
            },
        },
    ]
    return templates.get(skill_title, fallback)


class Command(BaseCommand):
    help = 'Seeds database with initial language course, units, skills, exercises, users, and progress.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Seeding Duolingo clone database...'))

        # 1. Create Spanish Language
        spanish, _ = Language.objects.get_or_create(
            code='es',
            defaults={'name': 'Spanish', 'flag_icon': '🇪🇸'}
        )

        # 2. Create Units
        units_data = [
            {
                'title': 'Unit 1: Form basic sentences',
                'description': 'Learn fundamental vocabulary, greetings, and basic sentence structures.',
                'order': 1,
                'hex_color': '#58CC02',  # Duolingo Green
            },
            {
                'title': 'Unit 2: Greet people & order food',
                'description': 'Master essential restaurant dialogues, food items, and polite greetings.',
                'order': 2,
                'hex_color': '#1CB0F6',  # Duolingo Blue
            },
            {
                'title': 'Unit 3: Ask for directions & travel',
                'description': 'Navigate around town, ask for directions, and use public transit.',
                'order': 3,
                'hex_color': '#FFC800',  # Duolingo Gold
            },
            {
                'title': 'Unit 4: Discuss hobbies & weather',
                'description': 'Talk about daily activities, weather conditions, and seasonal plans.',
                'order': 4,
                'hex_color': '#CE82FF',  # Duolingo Purple
            },
        ]

        units = []
        for u in units_data:
            unit_obj, _ = Unit.objects.get_or_create(
                language=spanish,
                order=u['order'],
                defaults={'title': u['title'], 'description': u['description'], 'hex_color': u['hex_color']}
            )
            units.append(unit_obj)

        # 3. Create Skills per Unit
        skills_structure = {
            1: [
                {'title': 'Basics 1', 'icon': 'egg', 'order': 1},
                {'title': 'Phrases', 'icon': 'speech', 'order': 2},
                {'title': 'Basics 2', 'icon': 'coffee', 'order': 3},
            ],
            2: [
                {'title': 'Food', 'icon': 'bread', 'order': 1},
                {'title': 'Animals', 'icon': 'bear', 'order': 2},
                {'title': 'Plurals', 'icon': 'sparkles', 'order': 3},
            ],
            3: [
                {'title': 'Travel', 'icon': 'plane', 'order': 1},
                {'title': 'Numbers', 'icon': 'target', 'order': 2},
                {'title': 'Questions', 'icon': 'help', 'order': 3},
            ],
            4: [
                {'title': 'Hobbies', 'icon': 'music', 'order': 1},
                {'title': 'Weather', 'icon': 'sun', 'order': 2},
                {'title': 'Family', 'icon': 'heart', 'order': 3},
            ]
        }

        all_skills = []
        for unit in units:
            for s_info in skills_structure[unit.order]:
                skill_obj, _ = Skill.objects.get_or_create(
                    unit=unit,
                    order=s_info['order'],
                    defaults={'title': s_info['title'], 'icon': s_info['icon'], 'total_crowns': 5}
                )
                all_skills.append(skill_obj)

        # 4. Create Lessons & Varied Exercises for Basics 1 & Phrases
        for skill in all_skills:
            # Create 2 lessons per skill
            for l_idx in range(1, 3):
                lesson, _ = Lesson.objects.get_or_create(
                    skill=skill,
                    order=l_idx,
                    defaults={'title': f'{skill.title} - Lesson {l_idx}', 'xp_reward': 10}
                )

                # Clear existing exercises if re-seeding
                lesson.exercises.all().delete()

                # Add 5-6 exercises per lesson across 5 exercise types
                if skill.title == 'Basics 1':
                    exercises_data = [
                        {
                            'type': 'multiple_choice',
                            'prompt': 'Select the correct translation for "the boy"',
                            'order': 1,
                            'content': {
                                'question': 'The boy',
                                'options': [
                                    {'text': 'El niño', 'correct': True, 'image': 'boy'},
                                    {'text': 'La niña', 'correct': False, 'image': 'girl'},
                                    {'text': 'El hombre', 'correct': False, 'image': 'man'},
                                ]
                            }
                        },
                        {
                            'type': 'translate',
                            'prompt': 'Translate this sentence into English',
                            'order': 2,
                            'content': {
                                'source_text': 'El niño bebe agua',
                                'correct_words': ['The', 'boy', 'drinks', 'water'],
                                'word_bank': ['The', 'boy', 'drinks', 'water', 'apple', 'woman', 'eats', 'she']
                            }
                        },
                        {
                            'type': 'match_pairs',
                            'prompt': 'Tap the matching pairs',
                            'order': 3,
                            'content': {
                                'pairs': [
                                    {'left': 'El niño', 'right': 'The boy'},
                                    {'left': 'La mujer', 'right': 'The woman'},
                                    {'left': 'Agua', 'right': 'Water'},
                                    {'left': 'Manzana', 'right': 'Apple'},
                                ]
                            }
                        },
                        {
                            'type': 'fill_blank',
                            'prompt': 'Fill in the missing word',
                            'order': 4,
                            'content': {
                                'sentence_parts': ['El niño ', ' agua.'],
                                'correct_word': 'bebe',
                                'options': ['bebe', 'comes', 'eres', 'somos']
                            }
                        },
                        {
                            'type': 'type_answer',
                            'prompt': 'Type the English translation',
                            'order': 5,
                            'content': {
                                'prompt_text': 'Un hombre y una mujer',
                                'accepted_answers': ['A man and a woman', 'a man and a woman']
                            }
                        }
                    ]
                elif skill.title == 'Phrases':
                    exercises_data = [
                        {
                            'type': 'multiple_choice',
                            'prompt': 'Select the correct translation for "Hello!"',
                            'order': 1,
                            'content': {
                                'question': 'Hello!',
                                'options': [
                                    {'text': '¡Hola!', 'correct': True},
                                    {'text': '¡Adiós!', 'correct': False},
                                    {'text': 'Gracias', 'correct': False},
                                ]
                            }
                        },
                        {
                            'type': 'translate',
                            'prompt': 'Translate "Good morning, how are you?"',
                            'order': 2,
                            'content': {
                                'source_text': 'Buenos días, ¿cómo estás?',
                                'correct_words': ['Good', 'morning,', 'how', 'are', 'you?'],
                                'word_bank': ['Good', 'morning,', 'how', 'are', 'you?', 'night', 'bye', 'please']
                            }
                        },
                        {
                            'type': 'match_pairs',
                            'prompt': 'Match the words',
                            'order': 3,
                            'content': {
                                'pairs': [
                                    {'left': '¡Hola!', 'right': 'Hello!'},
                                    {'left': 'Gracias', 'right': 'Thank you'},
                                    {'left': 'Por favor', 'right': 'Please'},
                                    {'left': '¡Adiós!', 'right': 'Goodbye!'},
                                ]
                            }
                        },
                        {
                            'type': 'fill_blank',
                            'prompt': 'Complete the greeting',
                            'order': 4,
                            'content': {
                                'sentence_parts': ['¡Buenos ', '!'],
                                'correct_word': 'días',
                                'options': ['días', 'noches', 'tardes', 'hola']
                            }
                        },
                        {
                            'type': 'type_answer',
                            'prompt': 'Type "Thank you very much" in Spanish',
                            'order': 5,
                            'content': {
                                'prompt_text': 'Thank you very much',
                                'accepted_answers': ['Muchas gracias', 'muchas gracias']
                            }
                        }
                    ]
                else:
                    exercises_data = build_default_exercises(skill.title)

                for ex_info in exercises_data:
                    Exercise.objects.create(
                        lesson=lesson,
                        type=ex_info['type'],
                        prompt=ex_info['prompt'],
                        order=ex_info['order'],
                        content=ex_info['content']
                    )

        # 5. Create Learner & Leaderboard Users
        learners_info = [
            {'username': 'learner1', 'xp': 240, 'streak': 5, 'weekly_xp': 240, 'league': 'Gold', 'rank': 3},
            {'username': 'duo_master', 'xp': 520, 'streak': 14, 'weekly_xp': 450, 'league': 'Gold', 'rank': 1},
            {'username': 'spanish_pro', 'xp': 410, 'streak': 9, 'weekly_xp': 380, 'league': 'Gold', 'rank': 2},
            {'username': 'polyglot_99', 'xp': 210, 'streak': 4, 'weekly_xp': 180, 'league': 'Gold', 'rank': 4},
            {'username': 'alex_coder', 'xp': 150, 'streak': 3, 'weekly_xp': 120, 'league': 'Gold', 'rank': 5},
            {'username': 'maria_g', 'xp': 90, 'streak': 2, 'weekly_xp': 90, 'league': 'Gold', 'rank': 6},
        ]

        main_user = None
        today = date.today()

        for l_data in learners_info:
            usr, created = User.objects.get_or_create(username=l_data['username'])
            if created:
                usr.set_password('password123')
                usr.save()

            if l_data['username'] == 'learner1':
                main_user = usr

            stats, _ = UserStats.objects.get_or_create(user=usr)
            stats.xp = l_data['xp']
            stats.streak = l_data['streak']
            stats.last_active_date = today
            stats.hearts = 5
            stats.max_hearts = 5
            stats.gems = 650
            stats.daily_xp_goal = 50
            stats.daily_xp_today = 30
            stats.save()

            lb, _ = LeaderboardEntry.objects.get_or_create(user=usr)
            lb.weekly_xp = l_data['weekly_xp']
            lb.league = l_data['league']
            lb.rank = l_data['rank']
            lb.save()

        # 6. Seed Progress for main_user (learner1)
        # Basics 1 -> Fully Completed (Crown 1)
        basics1 = Skill.objects.get(title='Basics 1')
        UserProgress.objects.update_or_create(
            user=main_user,
            skill=basics1,
            defaults={
                'completed_lessons': 2,
                'current_crown': 1,
                'is_unlocked': True,
                'is_completed': True
            }
        )

        # Phrases -> Unlocked, 1 lesson completed
        phrases = Skill.objects.get(title='Phrases')
        UserProgress.objects.update_or_create(
            user=main_user,
            skill=phrases,
            defaults={
                'completed_lessons': 1,
                'current_crown': 0,
                'is_unlocked': True,
                'is_completed': False
            }
        )

        # Basics 2 -> Unlocked, 0 completed
        basics2 = Skill.objects.get(title='Basics 2')
        UserProgress.objects.update_or_create(
            user=main_user,
            skill=basics2,
            defaults={
                'completed_lessons': 0,
                'current_crown': 0,
                'is_unlocked': True,
                'is_completed': False
            }
        )

        # 7. Seed Achievements
        achievements_list = [
            {'title': 'Wildfire', 'description': 'Reach a 7-day streak', 'icon': 'flame', 'category': 'streak', 'max_progress': 7},
            {'title': 'Sage', 'description': 'Earn 500 total XP', 'icon': 'zap', 'category': 'xp', 'max_progress': 500},
            {'title': 'Scholar', 'description': 'Complete 5 skills in a course', 'icon': 'book', 'category': 'skills', 'max_progress': 5},
            {'title': 'Sharpshooter', 'description': 'Complete 10 lessons with 100% accuracy', 'icon': 'target', 'category': 'accuracy', 'max_progress': 10},
            {'title': 'Legend', 'description': 'Unlock Gold League', 'icon': 'trophy', 'category': 'league', 'max_progress': 1},
        ]

        for ach_data in achievements_list:
            ach, _ = Achievement.objects.get_or_create(
                title=ach_data['title'],
                defaults=ach_data
            )
            # Link to main user with sample progress
            progress_val = 5 if ach.title == 'Wildfire' else (240 if ach.title == 'Sage' else 1)
            is_un = progress_val >= ach.max_progress
            UserAchievement.objects.update_or_create(
                user=main_user,
                achievement=ach,
                defaults={
                    'current_progress': progress_val,
                    'is_unlocked': is_un,
                    'unlocked_at': timezone.now() if is_un else None
                }
            )

        self.stdout.write(self.style.SUCCESS('Database successfully seeded!'))
