from django.db import models
from django.conf import settings

class Organization(models.Model):
  user = models.ForeignKey(
    settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  name = models.CharField(max_length=100)
  description = models.CharField(max_length=1000)
  category = models.CharField(max_length=100)

  def __str__(self):
    return f'NAME: {self.name}, DESCRIPTION: {self.description}'

  def info_as_dict(self):
    return {
      'name' : self.name,
      'bio' : self.description,
      'category' : self.category
    }

class Event(models.Model):
  organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
  name = models.CharField(max_length=100)
  description = models.CharField(max_length=1000)
  category = models.CharField(max_length=100)
  date = models.DateTimeField()
  
  class Meta():
    ordering = ['date']

  def __str__(self):
    return self.name

  def info_as_dict(self):
    return {
      'orgName' : self.organization.name,
      'eventName' : self.name,
      'bio' : self.description,
      'category' : self.category,
      'date' : self.date,
      'tasks': [task.name for task in self.task_set.all()]
    }

class Task(models.Model):
  event = models.ForeignKey(Event, on_delete=models.DO_NOTHING)
  name = models.CharField(max_length=100)
  description = models.CharField(max_length=1000)
  date = models.DateTimeField()

  class Meta():
    ordering = ['date']

  def __str__(self):
    return self.name

  def info_as_dict(self):
    return {
      'orgName' : self.event.organization.name,
      'eventName' : self.event.name,
      'taskName' : self.name,
      'description' : self.description,
      'category' : self.category,
      'date' : self.date,
    }

class Volunteer(models.Model):
  user = models.ForeignKey(
    settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
  name = models.CharField(max_length=50)
  description = models.CharField(max_length=500)
  orgs = models.ManyToManyField(Organization)
  events = models.ManyToManyField(Event)
  tasks = models.ManyToManyField(Task)

  def __str__(self):
    return f'NAME: {self.name}, DESCRIPTION: {self.description}'

  def info_as_dict(self):
    return {
      'name' : self.name,
      'bio' : self.description,
      'orgs' : [org.name for org in self.orgs.all()],
      'events' : [{'name': event.name, 'org': event.organization.name} for event in self.events.all()],
      'tasks' : [{'name': task.name, 'event': task.event.name, 'org': task.event.organization.name} for task in self.tasks.all()]
    }


