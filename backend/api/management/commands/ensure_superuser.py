"""
Create a Django superuser from environment variables if one does not exist yet.
Used on Render deploy so /admin/ works without paid Shell access.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create superuser from DJANGO_SUPERUSER_* env vars (skips if username exists).'

    def handle(self, *args, **options):
        import os

        username = os.environ.get('DJANGO_SUPERUSER_USERNAME', '').strip()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL', '').strip()
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', '')

        if not username or not password:
            self.stdout.write(
                self.style.WARNING(
                    'Skipping superuser setup: set DJANGO_SUPERUSER_USERNAME and '
                    'DJANGO_SUPERUSER_PASSWORD in environment variables.'
                )
            )
            return

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" already exists.'))
            return

        User.objects.create_superuser(
            username=username,
            email=email or f'{username}@localhost',
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))
