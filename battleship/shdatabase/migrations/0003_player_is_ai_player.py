# Generated by Django 5.0.4 on 2024-05-02 03:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('shdatabase', '0002_game_is_ai_game'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='is_ai_player',
            field=models.BooleanField(default=True),
        ),
    ]
