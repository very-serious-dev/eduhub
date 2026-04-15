from django.http import JsonResponse
from django.db.models import Q
from datetime import datetime
from ..models import Company, CompanyEvent
from ..util.serializers import companies_array_to_json, company_to_json, company_events_array_to_json
from ..util.exceptions import ConflictCompanyAlreadyExists, NotFound, Forbidden
from ..util.helpers import get_from_db, validate_company_event_type

def get_all_companies(request):
    companies = Company.objects.filter(is_archived=False)
    this_year = datetime.now().year
    last_year = this_year - 1
    important_events = CompanyEvent.objects.filter(type=CompanyEvent.CompanyEventType.INTERESTED_ABOUT_NEXT_TRAINEESHIP_PERIOD).filter(Q(date_time__year=this_year) | Q(date_time__year=last_year))
    return JsonResponse({"companies": companies_array_to_json(companies),
                         "interested_in_next_traineeship_period_events": company_events_array_to_json(important_events)})

def get_detail(request, company_id):
    company = get_from_db(Company, id=company_id)
    if company.is_archived:
        raise NotFound
    events = CompanyEvent.objects.filter(company=company)
    return JsonResponse({"company": company_to_json(company),
                         "events": company_events_array_to_json(events)})

def create_company(request, name, cif, address, overview, company_type):
    if Company.objects.filter(cif=cif).exists():
        raise ConflictCompanyAlreadyExists
    new_company = Company()
    new_company.name = name
    new_company.cif = cif
    new_company.address = address
    new_company.overview = overview
    if company_type == 'unspecified':
        new_company.type = Company.CompanyType.UNSPECIFIED
    elif company_type == 'software':
        new_company.type = Company.CompanyType.SOFTWARE
    elif company_type == 'accounting':
        new_company.type = Company.CompanyType.ACCOUNTING
    elif company_type == 'both':
        new_company.type = Company.CompanyType.BOTH
    new_company.save()
    return JsonResponse({"success": True}, status=201)

def edit_company(request, company_id, name, cif, address, overview, company_type):
    company = get_from_db(Company, id=company_id)
    if company.is_archived:
        raise NotFound
    if cif != company.cif and Company.objects.filter(cif=cif).exists():
        raise ConflictCompanyAlreadyExists
    company.name = name
    company.cif = cif
    company.address = address
    company.overview = overview
    if company_type == 'unspecified':
        new_company.type = Company.CompanyType.UNSPECIFIED
    elif company_type == 'software':
        new_company.type = Company.CompanyType.SOFTWARE
    elif company_type == 'accounting':
        new_company.type = Company.CompanyType.ACCOUNTING
    elif company_type == 'both':
        new_company.type = Company.CompanyType.BOTH
    company.save()
    return JsonResponse({"success": True}, status=200)

def delete_company(request, company_id):
    company = get_from_db(Company, id=company_id)
    company.is_archived = True
    company.save()
    return JsonResponse({"success": True}, status=200)

def create_event(request, company_id, event_type, date_time, participants, detail):
    company = get_from_db(Company, id=company_id)
    new_event = CompanyEvent()
    new_event.author = request.session.user
    new_event.company = company
    if event_type == 'meeting':
        new_event.type = CompanyEvent.CompanyEventType.MEETING
    elif event_type == 'virtual_meeting':
        new_event.type = CompanyEvent.CompanyEventType.VIRTUAL_MEETING
    elif event_type == 'interested_about_next_traineeship_period':
        new_event.type = CompanyEvent.CompanyEventType.INTERESTED_ABOUT_NEXT_TRAINEESHIP_PERIOD
    elif event_type == 'added_contact_details':
        new_event.type = CompanyEvent.CompanyEventType.ADDED_CONTACT_DETAILS
    elif event_type == 'other':
        new_event.type = CompanyEvent.CompanyEventType.OTHER
    if event_type in ['meeting', 'virtual_meeting']:
        new_event.date_time = date_time
        new_event.participants = participants
        new_event.description = detail
    elif event_type in ['interested_about_next_traineeship_period']:
        new_event.date_time = date_time
    elif event_type in ['added_contact_details']:
        new_event.description = detail
    elif event_type in ['other']:
        new_event.date_time = date_time
        new_event.description = detail
    new_event.save()
    return JsonResponse({"success": True}, status=201)

def delete_event(request, event_id):
    event = get_from_db(CompanyEvent, id=event_id)
    if event.author != request.session.user:
        raise Forbidden
    event.delete()
    return JsonResponse({"success": True}, status=200)
