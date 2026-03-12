from django.http import JsonResponse
from ..models import Company
from ..util.serializers import companies_array_to_json

def get_all(request):
    companies = Company.objects.filter(is_archived=False)
    return JsonResponse({"companies": companies_array_to_json(companies)})
