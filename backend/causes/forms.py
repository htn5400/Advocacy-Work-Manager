from django import forms

class SigninForm(forms.Form):
  username = forms.CharField()
  password = forms.CharField()

class SignupVolForm(forms.Form):
  username = forms.CharField()
  email = forms.EmailField()
  password = forms.CharField()
  name = forms.CharField()
  bio = forms.CharField()

class SignupOrgForm(forms.Form):
  username = forms.CharField()
  email = forms.EmailField()
  password = forms.CharField()
  name = forms.CharField()
  category = forms.CharField()
  bio = forms.CharField()

class SearchOrgForm(forms.Form):
  searchInput = forms.CharField(required=False)

class CreateEventForm(forms.Form):
  name = forms.CharField()
  description = forms.CharField()
  category = forms.CharField()
  date = forms.DateTimeField()

class CreateTaskForm(forms.Form):
  name = forms.CharField()
  description = forms.CharField()
  date = forms.CharField()
  event = forms.CharField()
