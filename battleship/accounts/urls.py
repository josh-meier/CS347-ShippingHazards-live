from django.urls import path
from .views import get_user_info, react_login, react_signup, react_change_password, get_csrf_token, react_logout

urlpatterns = [
    path("login/", react_login, name="react_login"),
    path("signup/", react_signup, name="react_signup"),
    path("change_password/", react_change_password, name="react_change_password"),
    path("logout/", react_logout, name="react_logout"),
    path("csrf/", get_csrf_token, name="csrf"),
    path("get_user_info/", get_user_info, name="get_user_info"),
]
