"""nickgameDjango URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
import app.views as views

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('game', views.game),
    path('admin', views.admin),
    path('game/<uuid:userid>', views.gameuser),
    path('game/<uuid:userid>/ping', views.gameuser_ping),
    path('game/buddy/<uuid:userid>', views.buddy),
    path('game/liders/<uuid:userid>', views.liders),
    path('game/updatescore/<uuid:userid>', views.gamescore),
    path('game/profilepic/<str:userid>', views.getProfileImage),
    # path('linkhook', views.telegram_hook),
    path('<str:extra>', views.telegram_viewb),
    # path('', views.telegram_test),

]
