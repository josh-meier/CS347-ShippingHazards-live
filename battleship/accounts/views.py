from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from shdatabase.models import Player
import json

@api_view(['POST'])
def react_login(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    user = authenticate(username=username, password=password)
    if user is not None:
        login(request, user)
        return JsonResponse({'status': 'success', 'message': 'User authenticated.'})
    else:
        return JsonResponse({'status': 'error', 'message': 'Invalid username or password.'}, status=401)

@api_view(['POST'])
def react_signup(request):
    data = json.loads(request.body)
    username = data.get('username')
    password = data.get('password')
    password2 = data.get('password2')
    screen_name = data.get('screen_name')

    if User.objects.filter(username=username).exists():
        return JsonResponse({'status': 'error', 'message': 'User Already Exists. Please Login.'}, status=400)

    if password != password2:
        return JsonResponse({'status': 'error', 'message': 'Passwords do not match'}, status=400)

    try:
        validate_password(password, username)
        user = User.objects.create_user(username=username, password=password)
        Player.objects.create(user=user, screen_name=screen_name)
        return JsonResponse({'status': 'success', 'message': 'Signup successful. Please login.'})
    except ValidationError as e:
        return JsonResponse({'status': 'error', 'message': e.messages}, status=400)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def react_change_password(request):
    user = request.user
    data = json.loads(request.body)
    current_password = data.get('current_password')
    new_password = data.get('new_password')
    new_password2 = data.get('new_password2')

    if not user.check_password(current_password):
        return JsonResponse({'status': 'error', 'message': 'Your current password is incorrect.'}, status=400)

    if new_password != new_password2:
        return JsonResponse({'status': 'error', 'message': 'Your new passwords do not match.'}, status=400)

    try:
        validate_password(new_password, user)
        user.set_password(new_password)
        user.save()
        return JsonResponse({'status': 'success', 'message': 'Your password has successfully changed!'})
    except ValidationError as e:
        return JsonResponse({'status': 'error', 'message': e.messages}, status=400)

@api_view(['GET'])
@ensure_csrf_cookie
def get_csrf_token(request):
    return JsonResponse({'message': 'CSRF cookie set'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def react_logout(request):
    logout(request)
    return JsonResponse({'status': 'success', 'message': 'Logout successful.'})
