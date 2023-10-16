from django.contrib import admin

from .models import Organization, Volunteer, Event, Task

admin.site.register(Organization)
admin.site.register(Volunteer)
admin.site.register(Event)
admin.site.register(Task)
