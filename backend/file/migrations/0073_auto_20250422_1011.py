from django.db import migrations


def migrate_file_data(apps, schema_editor):
    Sell = apps.get_model('file', 'Sell')
    Rent = apps.get_model('file', 'Rent')
    Person = apps.get_model('utils', 'Person')
    
    for obj in Sell.objects.all():
        person, created = Person.objects.get_or_create(
            last_name=obj.owner_name,
            phone_number=obj.owner_phone,
            defaults={
                'created_at': obj.created,
            }
        )
        # Use direct ID assignment to avoid ORM issues
        obj.owner_id = person.id
        obj.save(update_fields=['owner_id'])

    for obj in Rent.objects.all():
        person, created = Person.objects.get_or_create(
            last_name=obj.owner_name,
            phone_number=obj.owner_phone,
            defaults={
                'created_at': obj.created,
            }
        )
        obj.owner_id = person.id
        obj.save(update_fields=['owner_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('file', '0072_auto_20250422_0955'),  
    ]

    operations = [
        migrations.RunPython(migrate_file_data),
    ]
