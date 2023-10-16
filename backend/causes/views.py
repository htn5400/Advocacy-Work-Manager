from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.contrib.auth.models import User
from causes.models import Volunteer, Organization, Event, Task
from .forms import SigninForm, SignupVolForm, SignupOrgForm, CreateEventForm, CreateTaskForm, SearchOrgForm
from .email import send_email
import json
import urllib
from django.db import IntegrityError

protocol = 'http'
host = 'localhost:3000'

def build_user_info(user):
    """
    Puts together a dictionary of information connected to a user.
    """
    user_type = ''
    attached_info = None
    if user.volunteer_set.first() != None:
        user_type = 'volunteer'
        attached_info = user.volunteer_set.first().info_as_dict()
    elif user.organization_set.first() != None:
        user_type = 'organization'
        attached_info = user.organization_set.first().info_as_dict()
    else:
        raise RuntimeError('User is neither volunteer or organization.')

    # user session is valid
    user_info = {
        'username' : user.username,
        'email' : user.email,
        user_type : attached_info
    }

    return user_info

def signin(request):
    """
    Sign a user in.
    """
    form = SigninForm(request.POST)

    if not form.is_valid():
        # malformed request
        return HttpResponse('Error: form invalid.', status=400)

    username = form.cleaned_data['username']
    password = form.cleaned_data['password']

    user = authenticate(request, username=username, password=password)

    if user is None:
        # user is not authenticated
        return HttpResponse("Error: invalid login credentials.", status=401)

    login(request, user)

    user_info = build_user_info(user)

    return JsonResponse(user_info)

def signout(request):
    """
    Log out a user.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    logout(request)
    return HttpResponse('Success!')

def signupvol(request):
    """
    Sign up a Volunteer user.
    """
    form = SignupVolForm(request.POST)

    if not form.is_valid():
        # malformed request
        return HttpResponse('Error: form invalid.', status=400)

    name = form.cleaned_data['name']
    bio = form.cleaned_data['bio']
    username = form.cleaned_data['username']
    email = form.cleaned_data['email']
    password = form.cleaned_data['password']

    # create new user
    try:
        user = User.objects.create_user(username, email, password)
    except IntegrityError:
        return HttpResponse("This username has already been taken. Please try entering a different username.", status=400)

    # create volunteer object which will have a
    # connection in the database to the new user
    volunteer = Volunteer(user = user, name = name, description = bio)
    volunteer.save()

    # log user in
    login(request, user)

    return HttpResponse('Success!')

def signuporg(request):
    """
    Sign up an Organization user.
    """
    form = SignupOrgForm(request.POST)

    if not form.is_valid():
        # malformed request
        return HttpResponse('Error: form invalid.', status=400)

    name = form.cleaned_data['name']
    category = form.cleaned_data['category']
    bio = form.cleaned_data['bio']
    username = form.cleaned_data['username']
    email = form.cleaned_data['email']
    password = form.cleaned_data['password']

    # create new user
    try:
        user = User.objects.create_user(username, email, password)
    except IntegrityError:
        return HttpResponse("This username has already been taken. Please try entering a different username.", status=400)

    organization = Organization(
        user = user, name = name, category = category, description = bio
    )
    organization.save()

    # log user in
    login(request, user)

    return HttpResponse('Success!')

def send_event_creation_email(org, event, emails):
    subject = f'{org} added a new event!'
    org_for_url = urllib.parse.quote_plus(org)
    event_for_url = urllib.parse.quote_plus(event)
    event_link = f'{protocol}://{host}/eventhome?org={org_for_url}&event={event_for_url}'
    message = f'An organization you are following added a new event!\nOrganization: {org}\nEvent: {event}\nLink to event: {event_link}'

    send_email(subject, message, emails)

def createevent(request):
    """
    Create a new event. Must be logged in as an Organization user.
    """
    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    form = CreateEventForm(request.POST)

    if not form.is_valid():
        # malformed request
        return HttpResponse('Error: Form invalid.', status=400)

    organization = user.organization_set.first()

    if organization == None:
        return HttpResponse(
            "Error: Must be an organization to create event", status=401
        )

    name = form.cleaned_data['name']
    description = form.cleaned_data['description']
    category = form.cleaned_data['category']
    date = form.cleaned_data['date']

    event = Event(
        name = name, description = description, category = category,
        date = date, organization = user.organization_set.first()
    )
    event.save()

    # send email to all people following this organization
    followers = organization.volunteer_set.all()
    # get user from each follower and get email from each user
    emails = [follower.user.email for follower in followers]
    send_event_creation_email(organization.name, event.name, emails)

    return HttpResponse('Success!')

def createtask(request):
    """
    Create a new task. Must be logged in as an Organization user.
    """
    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    form = CreateTaskForm(request.POST)

    if not form.is_valid():
        # malformed request
        return HttpResponse('Error: Form invalid.', status=400)

    if user.organization_set.first() == None:
        return HttpResponse(
            "Error: Must be an organization to create task", status=401
        )
    
    #task data
    name = form.cleaned_data['name']
    description = form.cleaned_data['description']
    date = form.cleaned_data['date']
    event = form.cleaned_data['event']

    #get org
    org = user.organization_set.first()

    #get event
    eventObject = org.event_set.get(name = event)

    task = Task(
        name = name, description = description, date = date, event = eventObject
    )
    #error 500 with save
    task.save()

    task_response = {
        'event_name' : eventObject.name,
        'org_name' : org.name
    }

    return JsonResponse(task_response)

def get_user(request):
    """
    Get user info for the logged in user.
    """
    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    # user session is valid
    user_info = build_user_info(user)

    return JsonResponse(user_info)

def get_organization_full(request):
    """
    Get Organization info and events related to the org in 'org' field, if
    present. Otherwise, get info and events for logged in organization. If
    'org' field not present and current user is not an organization, respond
    with error.
    """
    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    org = None
    if 'org' in request.GET:
        try:
            org = Organization.objects.get(name=request.GET['org'])
        except:
            org = None
    else:
        org = user.organization_set.first()

    if org == None:
        return HttpResponse("Error: no organization specified.", status=400)

    org_info = org.info_as_dict()

    org_events = org.event_set.all()

    org_event_list = [
        {'name' : e.name, 'date' : e.date, 'description' : e.description} for e in org_events
    ]

    org_response = {
        'org_info' : org_info,
        'events' : org_event_list,
        'user' : build_user_info(user)
    }

    return JsonResponse(org_response)

def get_event(request):
    """
    Handles GET request for an event.

    Data required in query parameters:
    'org', the name of the organization that organizes this event
    'event', the name of the event

    Returns JSON with the following fields:
    'eventName', the name of the event
    'orgName', the name of the organization that organizes the event
    'category', the category of the event
    'date', the date of the event
    'bio', the description of the event
    """

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    if 'org' not in request.GET or 'event' not in request.GET:
        return HttpResponse(
            "Error: organization and event must be specified.",
            status=400
        )

    try:
        org = Organization.objects.get(name=request.GET['org'])

        event = org.event_set.get(name=request.GET['event'])

        tasks = event.task_set.all()

        event_task_list = [
            {'name' : t.name, 'description' : t.description, 
            'date' : t.date, 'signedUp' : t.volunteer_set.filter(user = user).exists() } for t in tasks
        ]

        eventSignedUp = event.volunteer_set.filter(user = user).exists()

        event_response = {
            'event_info' : event.info_as_dict(),
            'eventSignedUp' : eventSignedUp, 
            'task' : event_task_list,
            'user' : build_user_info(user)
        }

        return JsonResponse(event_response)
    except:
        return HttpResponse("Error: event not found.", status=404)

def searchorgs(request):
    """
    Search Organizations. Can be either a Volunteer or an Organization user.
    """
    if not request.user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    form = SearchOrgForm(request.POST)

    if not form.is_valid():
        # malformed request
        return HttpResponse('Error: form invalid.', status=400)

    searchInput = form.cleaned_data['searchInput']

    org_set = Organization.objects.none()

    if len(searchInput) == 0:
        org_set = Organization.objects.all()
    else:
        list_words = searchInput.split()

        for word in list_words:
            name_search = Organization.objects.filter(name__icontains=word)

            description_search = Organization.objects.filter(
                description__icontains=word
            )

            category_search = Organization.objects.filter(category__icontains=word)

            org_set = org_set.union(
                name_search, description_search, category_search
            )

    org_info = []
    for org in org_set:
        org_dict = {
            'name' : org.name,
            'bio' : org.description,
            'category' : org.category
        }
        org_info.append(org_dict)

    return JsonResponse(org_info, safe=False)

def vol_org_link(request):
    """
    Signs a volunteer user up for the organization specified in the POST body.

    Returns a 401 error if the user is not logged in or is not a volunteer.

    Request body should be organized with a single URL-encoded query parameter
    called 'org'.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    volunteer = user.volunteer_set.first()
    if volunteer == None:
        return HttpResponse (
            "Error: must be a volunteer user to sign up for an organization.",
            status=401
        )

    json_body = request.body.decode('utf-8')
    org_param = json.loads(json_body)['org']
    org = Organization.objects.get(name=org_param)

    volunteer.orgs.add(org)

    return HttpResponse("Success!")

def vol_org_unlink(request):
    """
    Signs a volunteer user up for the organization specified in the POST body.

    Returns a 401 error if the user is not logged in or is not a volunteer.

    Request body should be organized with a single URL-encoded query parameter
    called 'org'.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    volunteer = user.volunteer_set.first()
    if volunteer == None:
        return HttpResponse (
            "Error: must be a volunteer user to sign up for an organization.",
            status=401
        )

    # remove org from user
    json_body = request.body.decode('utf-8')
    org_param = json.loads(json_body)['org']
    org = Organization.objects.get(name=org_param)

    volunteer.orgs.remove(org)

    return HttpResponse("Success!")

def vol_event_link(request):
    """
    Signs a volunteer user up for the event specified in the POST body.

    Returns a 401 error if the user is not logged in or is not a volunteer.

    Request body should be organized with a single URL-encoded query parameter
    called 'event'.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    volunteer = user.volunteer_set.first()
    if volunteer == None:
        return HttpResponse (
            "Error: must be a volunteer user to sign up for an event.",
            status=401
        )

    json_body = request.body.decode('utf-8')
    org_param = json.loads(json_body)['org']
    event_param = json.loads(json_body)['event']
    org = Organization.objects.get(name=org_param)
    event = org.event_set.get(name=event_param)

    volunteer.events.add(event)

    return HttpResponse("Success!")

def vol_event_unlink(request):
    """
    Signs a volunteer user up for the event specified in the POST body.

    Returns a 401 error if the user is not logged in or is not a volunteer.

    Request body should be organized with a single URL-encoded query parameter
    called 'event'.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    volunteer = user.volunteer_set.first()
    if volunteer == None:
        return HttpResponse (
            "Error: must be a volunteer user to sign up for an event.",
            status=401
        )

    # remove event from user
    json_body = request.body.decode('utf-8')
    org_param = json.loads(json_body)['org']
    event_param = json.loads(json_body)['event']
    org = Organization.objects.get(name=org_param)
    event = org.event_set.get(name=event_param)

    volunteer.events.remove(event)

    return HttpResponse("Success!")

def vol_task_link(request):
    """
    Signs a volunteer user up for the event specified in the POST body.

    Returns a 401 error if the user is not logged in or is not a volunteer.

    Request body should be organized with a single URL-encoded query parameter
    called 'event'.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    volunteer = user.volunteer_set.first()
    if volunteer == None:
        return HttpResponse (
            "Error: must be a volunteer user to sign up for a task",
            status=401
        )

    #add task to user
    json_body = request.body.decode('utf-8')

    org_param = json.loads(json_body)['org']
    event_param = json.loads(json_body)['event']
    task_param = json.loads(json_body)['task']
    
    org = Organization.objects.get(name=org_param)
    event = org.event_set.get(name=event_param)
    task = event.task_set.get(name=task_param)

    volunteer.tasks.add(task)

    print(volunteer.tasks.all())

    return HttpResponse("Success!")

def vol_task_unlink(request):
    """
    Signs a volunteer user up for the organization specified in the POST body.

    Returns a 401 error if the user is not logged in or is not a volunteer.

    Request body should be organized with a single URL-encoded query parameter
    called 'org'.
    """
    if request.method != 'POST':
        return HttpResponse("Error: must be POST request.", status=400)

    user = request.user

    if not user.is_authenticated:
        return HttpResponse("Error: invalid credentials.", status=401)

    volunteer = user.volunteer_set.first()
    if volunteer == None:
        return HttpResponse (
            "Error: must be a volunteer user to sign up for a task.",
            status=401
        )

    # remove task from user
    json_body = request.body.decode('utf-8')
    
    org_param = json.loads(json_body)['org']
    event_param = json.loads(json_body)['event']
    task_param = json.loads(json_body)['task']
    
    org = Organization.objects.get(name=org_param)
    event = org.event_set.get(name=event_param)
    task = event.task_set.get(name=task_param)

    volunteer.tasks.remove(task)

    print(volunteer.tasks.all())

    return HttpResponse("Success!")
