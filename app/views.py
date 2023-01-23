from django.shortcuts import render
from django.http import HttpResponse
import json
import nickgameDjango.settings as SETTINGS
from django.db.models import Avg, Count
from django.views.decorators.csrf import csrf_exempt


import telegram
import datetime
from app.models import *

bot = telegram.Bot(token=SETTINGS.TOKEN)

def admin(request):
    allsize=GameUsers.objects.count()
    perpage=50
    c_page=int(request.GET.get("p",1))
    sort_score=int(request.GET.get("score",-1))
    sort_sessioncount=int(request.GET.get("session",-1))
    pages=round(allsize/perpage+0.5)
    page_list=[(i, c_page==i) for i in range(1, pages+1)]
    if(sort_score!=-1):
        users = GameUsers.objects.all().order_by("-score")[(c_page - 1) * perpage:(c_page) * perpage]
    elif(sort_sessioncount!=-1):
        users = GameSession.objects.all().values('game_user').annotate(c=Count('game_user')).order_by('-c').values('game_user')[(c_page - 1) * perpage:(c_page) * perpage]
        users=[GameUsers.objects.get(pk=x['game_user']) for x in users]
    else:
        users=GameUsers.objects.all()[(c_page-1)*perpage:(c_page)*perpage]
    data=[]
    counter=0
    for u in users:
        print(u)
        _data={}
        _data['user']=u
        try:
            ledger, _=ActiveSessionLedger.objects.get_or_create(game_user=u)
            user_sessions=GameSession.objects.filter(game_user=u)
            _data['no_sessions']=len(user_sessions)
            print("No", (len(user_sessions)))
            user_sessions = GameSession.objects.filter(game_user=u)[:10]
            last10AverageTime=user_sessions.aggregate(Avg('session_time'))
            last10AverageTime=last10AverageTime['session_time__avg']
            _data['avg_sessions_time'] = round(last10AverageTime/60,2)
            # print(">>>", user_sessions)
            #
            # print("len sessions", len(user_sessions))
            if(ledger.game_session!=None):
                _data['session']=round(ledger.getDuration()/60, 2)
            else:
                print("None")
                _data['session']=0
        except Exception as e:
            print(e)
            _data['session'] = 0
        data.append(_data)

    #active users last 24h
    time_threshold = datetime.datetime.now() - datetime.timedelta(hours=24)
    results = ActiveSessionLedger.objects.filter(game_session__session_last_active__gt=time_threshold)
    results=results.annotate(total=Count('game_user', distinct=True)).count()
    stats={}
    stats['last24hActives']=results
    stats['totalNoUsers']=GameUsers.objects.all().count()
    print(results)
    return render(request, "admin.html", {"stats": stats, "data": data, "pages": page_list})

def game(request):
    return render(request, 'indexMatter.html')

def gameuser(request, userid):
    user=GameUsers.objects.get(record_id=userid)
    if(user.score is None):
        print("score is null")
        user.score=0
        user.save()
    print(user.score)
    return render(request, 'indexMatter.html', {'userid':userid, 'bestScore': user.score})


@csrf_exempt
def gameuser_ping(request, userid):
    if (request.method == 'POST'):
        user=GameUsers.objects.get(record_id=userid)
        try:
            active_session, _ = ActiveSessionLedger.objects.get_or_create(game_user=user)
            if(active_session.game_session != None):
                active_session.game_session.session_last_active=timezone.now()
                active_session.game_session.getUpdateDuration()
                active_session.game_session.save()
        except Exception as e:
            print(str(e))
        print("ping", userid)
        return HttpResponse(status=200)

import base64
import requests
def buddy(request, userid):
    if (request.method == 'GET'):
        user=GameUsers.objects.get(record_id=userid)
        if(user.is_message):
            res = bot.getGameHighScores(user_id=user.id, message_id=user.message_id)
        else:
            res=bot.getGameHighScores(user_id=user.id, inline_message_id=user.message_id)
        resp={}
        for u in res:
            print(u)
            print(u.user)
            profpic=bot.getUserProfilePhotos(u.user.id, limit=1)
            img_path='https://coingame.mdprojectth.fun/static/assets/10bitcoin.png'
            if(profpic['total_count']>0):
                # print()
                img = bot.getFile(profpic['photos'][0][0]['file_id'])
                print(img)
                img_path=img['file_path']
                img_data = requests.get(img_path).content
                img_data  = base64.b64encode(img_data)
            else:
                img_data = requests.get(img_path).content
                img_data = base64.b64encode(img_data)
                print(img_data)
                # with open(img_path, "rb") as image:
                #     img_data = base64.b64encode(image.read())

            resp[u.position]=[u.score, u.user.first_name, str(img_data)[2:-1]]
        print(resp)
    return HttpResponse(json.dumps(resp), status=200)


def liders(request, userid):
    if (request.method == 'GET'):

        #Get Top 10 User Socres
        top_10_users=GameUsers.objects.all().order_by('-score')[:10]
        # user=GameUsers.objects.get(record_id=userid)
        # if(user.is_message):
        #     res = bot.getGameHighScores(user_id=user.id, message_id=user.message_id)
        # else:
        #     res=bot.getGameHighScores(user_id=user.id, inline_message_id=user.message_id)
        resp={}
        position=0
        if(True):
            for u in top_10_users:
                position+=1
                profpic=bot.getUserProfilePhotos(u.id, limit=1)
                # img_path='https://coingames.site/static/assets/10bitcoin.png'
                # # if(profpic['total_count']>0):
                # if(False):
                #     # print(
                #     img = bot.getFile(profpic['photos'][0][0]['file_id'])
                #     print(img)
                #     img_path=img['file_path']
                #     img_data = requests.get(img_path).content
                #     img_data  = base64.b64encode(img_data)
                # else:
                #     img_data = requests.get(img_path).content
                #     img_data = base64.b64encode(img_data)
                #     print(img_data)
                #     # with open(img_path, "rb") as image:
                #     #     img_data = base64.b64encode(image.read())

                resp[position]=[u.score, u.username, u.id]#str(img_data)[2:-1]]
            print(position)
    return HttpResponse(json.dumps(resp), status=200)

def getProfileImage(request, userid):
    # user = GameUsers.objects.get(record_id=userid)
    profpic = bot.getUserProfilePhotos(userid, limit=1)
    img_path='https://coingames.site/static/assets/10bitcoin.png'
    if(profpic['total_count']>0):
    # if(False):
        # print(
        img = bot.getFile(profpic['photos'][0][0]['file_id'])
        print(img)
        img_path=img['file_path']
        img_data = requests.get(img_path).content
        # img_data  = base64.b64encode(img_data)
    else:
        img_data = requests.get(img_path).content
        # img_data = base64.b64encode(img_data)
        # print(img_data)
        # with open(img_path, "rb") as image:
        #     img_data = base64.b64encode(image.read())

    response = HttpResponse(img_data, content_type="image/png")
    # img_data.save(response, "PNG")
    return response

@csrf_exempt
def gamescore(request, userid):
    if (request.method == 'POST'):
        print("Updating Score")
        user=GameUsers.objects.get(record_id=userid)
        data = json.loads(request.body)
        print(user.message_id)
        if(user.is_message):
            bot.setGameScore(user.id, data['score'], message_id=user.message_id, force=1)
        else:
            bot.setGameScore(user.id, data['score'], inline_message_id=user.message_id, force=1)

        # bot.setGameScore(user_id=user.id, score=data['score'], message_id=user.message_id, chat_id=user.id)
        user.score=data['score']
        user.save()
        print("saved")
        return HttpResponse(status=200)


@csrf_exempt
def telegram_view(request, extra):
    if (request.method == 'POST'):
        if (extra == SETTINGS.TOKEN):
            json_data = json.loads(request.body)
            update = telegram.Update.de_json(json_data, bot)
            print(update)
            if (update.callback_query is not None):
                # print("PLAY BUTTON?")
                # print(update.callback_query.id)
                # print(update.callback_query.from_user)

                bot.answerCallbackQuery(update.callback_query.id, url=SETTINGS.GAME_URL)
            else:
                print("Hello")
                print(json_data)
                # update.message.reply_game("coinmergetest");
                bot.send_game(update.effective_chat.id, 'coinmergetest')
            # TODO: do something with the message
            # bot.answerCallbackQuery()

    return HttpResponse("ok", status=200)
#
# def telegram_hook(request):
#     print("Requesting Hook")
#     s = bot.setWebhook('{URL}{HOOK}'.format(URL=SETTINGS.URL, HOOK=SETTINGS.CUSTOMTOKEN))
#     print(s)
#     if s:
#         return "webhook ok"
#     else:
#         return "webhook failed"

@csrf_exempt
def telegram_viewb(request, extra):
    if (request.method == 'POST'):
        if (extra == SETTINGS.CUSTOMTOKEN):
            json_data = json.loads(request.body)
            update = telegram.Update.de_json(json_data, bot)
            print(update)
            #
            if (update.callback_query is not None):
                try:
                    user=GameUsers.objects.get(id=update.callback_query.from_user.id)
                except Exception as e:
                    username=update.callback_query.from_user.username
                    u_id=update.callback_query.from_user.id
                    first_name = update.callback_query.from_user.first_name
                    last_name = update.callback_query.from_user.last_name
                    is_bot = update.callback_query.from_user.is_bot
                    language_code = update.callback_query.from_user.language_code

                    _fname=""
                    _lname=""
                    if(first_name!=None):
                        _fname=first_name
                    if(last_name!=None):
                        _lname=last_name

                    user=GameUsers(id=u_id, username=username, first_name=_fname, last_name=_lname, is_bot=is_bot, language_code=language_code)
                    user.save()

                game_session=GameSession(game_user=user)
                game_session.save()

                active_session_record, _=ActiveSessionLedger.objects.get_or_create(game_user=user)
                active_session_record.game_session=game_session
                active_session_record.save()

                try:
                    if(update.callback_query.message is not None):
                        user.message_id = str(update.callback_query.message.message_id)
                        user.is_message=True
                        user.save()
                    else:
                        user.message_id=str(update.callback_query.inline_message_id)
                        user.is_message = False
                        user.save()
                except Exception as e:
                    print("Here")
                    # print(update.callback_query.message.inline_message_id)
                    print(str(e))
                print(SETTINGS.GAME_URL+'/'+str(user.record_id))


                bot.answerCallbackQuery(update.callback_query.id, url=SETTINGS.GAME_URL+'/'+str(user.record_id))
                # bot.answerCallbackQuery(update.callback_query.id, url=SETTINGS.GAME_URL)
            else:
                print("Hello")
                print(json_data)
                # update.message.reply_game("coinmergetest");
                bot.send_game(update.effective_chat.id, 'coinmergetest')
            # TODO: do something with the message
            # bot.answerCallbackQuery()

    return HttpResponse("ok", status=200)

@csrf_exempt
def telegram_test(request):
    if (request.method == 'POST'):
        print([x for x in request.POST.keys()])

    return HttpResponse("ok", status=200)


from django.shortcuts import render

# Create your views here.
