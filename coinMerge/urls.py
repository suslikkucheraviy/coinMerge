from django.contrib import admin
from django.urls import path, include
import app.views as views

urlpatterns = [
    #django built-in admin urls
    # path('genadmin/', admin.site.urls),
    path('accounts/', include('django.contrib.auth.urls')),

    #game page for debuging, can be disabled on production
    path('game', views.game),

    #custome admin urls
    ##Dashb
    path('admin', views.admin),

    ##Returns referals usage count
    path('admin/tag', views.admintag),

    ##Block game user
    path('admin/<uuid:userid>/block', views.block),

    ##Unblock game user
    path('admin/<uuid:userid>/unblock', views.unblock),

    ##Unblock return game page for a given user (since telegram does not quite like cookies, reference is throught uuid (must be kept in secret or generated on each game start request)
    path('game/<uuid:userid>', views.gameuser),

    ##Get pings from the user while game is open. Helps to derive statistics.
    path('game/<uuid:userid>/ping', views.gameuser_ping),

    ##Get scores of the of the user friends (telegram allow 3) with profile pic and score
    path('game/buddy/<uuid:userid>', views.buddy),

    ##Get overall lider board (we provide 10)
    path('game/liders/<uuid:userid>', views.liders),

    ##Register game score (a score verification mechanism from backend can be added for fairness)
    path('game/updatescore/<uuid:userid>', views.gamescore),

    ##Get user profile pic
    path('game/profilepic/<str:userid>', views.getProfileImage),

    ##Link to register telegram hook. It is better to disable it after linking the hook.
    # path('linkhook', views.telegram_hook),

    ##The link from which telegram communicates with server.
    path('<str:extra>', views.telegram_viewb),

]
