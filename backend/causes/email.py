import sys
from django.core.mail import send_mail

def send_email(subject, message, emails):
  fail_count = 0
  last_failure = None

  for email in emails:
    try:
      send_mail(
          subject,
          message,
          'teampikamailing@gmail.com',
          [email],
          fail_silently=False,
      )
    except:
      fail_count += 1
      last_failure = sys.exc_info()[0]

  if fail_count == len(emails):
    print(f'All emails failed with exception:\n{last_failure}\nwhile sending email with subject:\n{subject}', file=sys.stderr)
  elif fail_count > 0:
    print(f'An email exception:\n{last_failure}\noccurred while sending email with subject:\n{subject}', file=sys.stderr)
  else:
    print('Email send successful.')
