"""
Create or update a Django superuser from environment variables.
Used on Render deploy so /admin/ works without paid Shell access.
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User


class Command(BaseCommand):
    help = 'Create or update superuser from DJANGO_SUPERUSER_* environment variables.'

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

        user = User.objects.filter(username=username).first()

        if user:
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.is_active = True
            if email:
                user.email = email
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Superuser "{username}" password and permissions updated.')
            )
            return

        User.objects.create_superuser(
            username=username,
            email=email or f'{username}@localhost',
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))
