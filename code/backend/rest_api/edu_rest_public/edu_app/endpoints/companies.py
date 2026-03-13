from django.http import JsonResponse
from ..models import Company
from ..util.serializers import companies_array_to_json

def get_all(request):
    companies = Company.objects.filter(is_archived=False)
    return JsonResponse({"companies": companies_array_to_json(companies)})

def create(request, name, cif, address, overview):
    new_company = Company()
    new_company.name = name
    new_company.cif = cif
    new_company.address = address
    new_company.overview = overview
    new_company.save()
    return JsonResponse({"success": True}, status=201)
