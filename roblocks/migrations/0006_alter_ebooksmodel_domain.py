# Generated by Django 3.2.5 on 2021-08-12 11:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('roblocks', '0005_alter_ebooksmodel_domain'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ebooksmodel',
            name='domain',
            field=models.FileField(null=True, upload_to='documents/'),
        ),
    ]
