# Generated by Django 4.0.4 on 2022-05-26 22:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('causes', '0004_volunteer_orgs'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='date',
            field=models.DateTimeField(),
        ),
    ]
