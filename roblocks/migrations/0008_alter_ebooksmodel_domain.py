# Generated by Django 3.2.5 on 2021-08-12 12:01

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roblocks', '0007_alter_ebooksmodel_domain'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ebooksmodel',
            name='domain',
            field=models.FilePathField(blank=True, null=True, path='/home/kyle/JEDAI/test_domains/domino'),
        ),
    ]
