from django.urls import path

from . import views

urlpatterns = [
    path('vol_org_link', views.vol_org_link, name='vol_org_link'),
    path('vol_org_unlink', views.vol_org_unlink, name='vol_org_unlink'),
    path('vol_event_link', views.vol_event_link, name='vol_event_link'),
    path('vol_event_unlink', views.vol_event_unlink, name='vol_event_unlink'),
    path('vol_task_link', views.vol_task_link, name='vol_event_link'),
    path('vol_task_unlink', views.vol_task_unlink, name='vol_event_unlink'),
    path('searchorgs', views.searchorgs, name='searchorgs'),
    path('createevent', views.createevent, name='createevent'),
    path('createtask', views.createtask, name='createtask'),
    path('get_user', views.get_user, name='get_user'),
    path('get_event', views.get_event, name='get_event'),
    path('get_org_full', views.get_organization_full, name='get_org_full'),
    path('signout', views.signout, name='signout'),
    path('signuporg', views.signuporg, name='signuporg'),
    path('signupvol', views.signupvol, name='signupvol'),
    path('signin', views.signin, name='signin')
]
