# Generated by Django 4.0.4 on 2022-05-25 20:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('causes', '0006_task'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='event',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='causes.event'),
        ),
        migrations.AlterField(
            model_name='task',
            name='organization',
            field=models.ForeignKey(on_delete=django.db.models.deletion.DO_NOTHING, to='causes.organization'),
        ),
    ]