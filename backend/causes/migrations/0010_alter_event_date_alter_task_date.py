# Generated by Django 4.0.4 on 2022-06-06 07:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('causes', '0009_merge_0005_alter_event_date_0008_volunteer_tasks'),
    ]

    operations = [
        migrations.AlterField(
            model_name='event',
            name='date',
            field=models.CharField(max_length=1000),
        ),
        migrations.AlterField(
            model_name='task',
            name='date',
            field=models.DateTimeField(),
        ),
    ]
