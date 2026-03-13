from django.http import JsonResponse
from ..models import Company
from ..util.serializers import companies_array_to_json, company_to_json
from ..util.exceptions import ConflictCompanyAlreadyExists
from ..util.helpers import get_from_db

def get_all(request):
    companies = Company.objects.filter(is_archived=False)
    return JsonResponse({"companies": companies_array_to_json(companies)})

def get_detail(request, company_id):
    company = get_from_db(Company, id=company_id)
    return JsonResponse({"company": company_to_json(company),
                         "events": []}) # TO-DO

def create(request, name, cif, address, overview):
    if Company.objects.filter(cif=cif).exists():
        raise ConflictCompanyAlreadyExists
    new_company = Company()
    new_company.name = name
    new_company.cif = cif
    new_company.address = address
    new_company.overview = overview
    new_company.save()
    return JsonResponse({"success": True}, status=201)
