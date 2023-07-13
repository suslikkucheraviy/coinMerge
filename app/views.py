from django.shortcuts import render
from django.http import HttpResponse
import json
import coinMerge.settings as SETTINGS
from django.db.models import Avg, Count
from django.views.decorators.csrf import csrf_exempt


# import telegram  #python-telegram-bot 13.8.1
import datetime
from app.models import *
from django.contrib.auth.decorators import login_required

# bot = telegram.Bot(token=SETTINGS.TOKEN)
bot=None
@login_required(login_url='/accounts/login')
def admin(request):
    allsize=GameUsers.objects.count()
    perpage=50
    c_page=int(request.GET.get("p",1))
    sort_score=int(request.GET.get("score",0))
    sort_sessioncount=int(request.GET.get("session",0))
    sort_lastseesionduration=int(request.GET.get("sessionduration",0))
    sort_avgseesionduration=int(request.GET.get("avgsessionduration",0))
    pages=round(allsize/perpage+0.5)
    page_list=[(i, c_page==i) for i in range(1, pages+1)]

    filter_map = [1 if sort_score<=0 else -1, 1 if sort_sessioncount<=0 else -1, 1 if sort_lastseesionduration<=0 else -1, 1 if sort_avgseesionduration<=0 else -1]
    current_filter="?"
    if(sort_score!=0):
        current_filter="?score={0}&".format(sort_score)
        users = GameUsers.objects.all().order_by("{0}score".format("-" if sort_score>0 else ""))[(c_page - 1) * perpage:(c_page) * perpage]
    elif(sort_sessioncount!=0):
        current_filter="?session={0}&".format(sort_sessioncount)
        users = GameSession.objects.all().values('game_user').annotate(c=Count('game_user')).order_by('{0}c'.format("-" if sort_sessioncount>0 else "")).values('game_user')[(c_page - 1) * perpage:(c_page) * perpage]
        users=[GameUsers.objects.get(pk=x['game_user']) for x in users]
    elif(sort_lastseesionduration!=0):
        current_filter="?sessionduration={0}&".format(sort_lastseesionduration)
        users = ActiveSessionLedger.objects.all().order_by('{0}game_session__session_time'.format("-" if sort_lastseesionduration>0 else ""))[(c_page - 1) * perpage:(c_page) * perpage]
        users = [x.game_session.game_user for x in users]
    elif(sort_avgseesionduration!=0):
        current_filter="?avgsessionduration={0}&".format(sort_avgseesionduration)
        users = GameUsers.objects.all().order_by("{0}average_time".format("-" if sort_avgseesionduration > 0 else ""))[
                (c_page - 1) * perpage:(c_page) * perpage]
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
            no_user_sessions=GameSession.objects.filter(game_user=u).count()
            _data['no_sessions']=no_user_sessions
            print("No", no_user_sessions)
            user_sessions = GameSession.objects.filter(game_user=u)[:10]
            last10AverageTime=user_sessions.aggregate(Avg('session_time'))
            last10AverageTime=last10AverageTime['session_time__avg']
            u.average_time = last10AverageTime
            u.save()
            _data['avg_sessions_time'] = round(last10AverageTime/60,2)

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
    return render(request, "admin.html", {"current_filter":current_filter, "filter_map": filter_map,"stats": stats, "data": data, "pages": page_list})

@login_required(login_url='/accounts/login')
def admintag(request):
    allsize=Tag.objects.count()
    perpage=50
    c_page=int(request.GET.get("p",1))
    pages=round(allsize/perpage+0.5)
    page_list=[(i, c_page==i) for i in range(1, pages+1)]

    _tags=Tag.objects.all()[(c_page-1)*perpage:(c_page)*perpage]

    data=[]
    counter=0
    for tag in _tags:
        _data={}
        _data['tag']=tag
        data.append(_data)

    #active users last 24h
    time_threshold = datetime.datetime.now() - datetime.timedelta(hours=24)
    results = ActiveSessionLedger.objects.filter(game_session__session_last_active__gt=time_threshold)
    results=results.annotate(total=Count('game_user', distinct=True)).count()
    stats={}
    stats['tags_count']=allsize
    print(results)
    return render(request, "admin_tags.html", {"stats": stats, "data": data, "pages": page_list})

def game(request):
    return render(request, 'indexMatter.html')

def gameuser(request, userid):
    user=GameUsers.objects.get(record_id=userid)
    if(user.score is None):
        print("score is null")
        user.score=0
        user.save()
    print(user.score)
    if(user.is_blocked):
        return render(request, 'blocked.html')
    print("Best Score")
    return render(request, 'indexMatter.html', {'userid':userid, 'bestScore': user.score})

@csrf_exempt
def block(request, userid):
    if (request.method == 'POST'):
        if (request.user.is_admin == False):
            return HttpResponse(status=403)
        user=GameUsers.objects.get(record_id=userid)
        user.is_blocked=True
        user.save()
        return HttpResponse(status=200)

@csrf_exempt
def unblock(request, userid):
    if (request.method == 'POST'):
        if(request.user.is_admin == False):
            return HttpResponse(status=403)
        user=GameUsers.objects.get(record_id=userid)
        user.is_blocked=False
        user.save()
        return HttpResponse(status=200)


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

                user_sessions = GameSession.objects.filter(game_user=user)[:10]
                last10AverageTime = user_sessions.aggregate(Avg('session_time'))
                user.average_time=last10AverageTime['session_time__avg']
                user.save()
        except Exception as e:
            print(str(e))
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
            profpic=bot.getUserProfilePhotos(u.user.id, limit=1)
            img_path='https://coingames.site/static/assets/1.png'
            if(profpic['total_count']>0):
                img = bot.getFile(profpic['photos'][0][0]['file_id'])
                img_path=img['file_path']
                img_data = requests.get(img_path).content
                img_data  = base64.b64encode(img_data)
            else:
                img_data = requests.get(img_path).content
                img_data = base64.b64encode(img_data)
            resp[u.position]=[u.score, u.user.first_name, str(img_data)[2:-1]]
    return HttpResponse(json.dumps(resp), status=200)


#Get Top 10 User Socres
def liders(request, userid):
    if (request.method == 'GET'):

        #Get Top 10 User Socres
        top_10_users=GameUsers.objects.all().order_by('-score')[:10]
        resp={}
        position=0
        if(True):
            for u in top_10_users:
                position+=1
                resp[position]=[u.score, u.username, u.id]
            print(position)
    return HttpResponse(json.dumps(resp), status=200)

#get telegram profile user pic or default.
def getProfileImage(request, userid):
    img_path = 'https://coingames.site/static/assets/1.png'
    try:
        profpic = bot.getUserProfilePhotos(userid, limit=1)
        if(profpic['total_count']>0):
            img = bot.getFile(profpic['photos'][0][0]['file_id'])
            print(img)
            img_path=img['file_path']
            img_data = requests.get(img_path).content
        else:
            img_data = requests.get(img_path).content
    except:
        img_data = requests.get(img_path).content
    response = HttpResponse(img_data, content_type="image/png")
    return response

#Record game score and share it with telegram.
#Here we need @csrf_exempt to allow post from game user
#It is possible to extend security by generating unique access token on each game start
#and use it to verify eligibility of game making a score update request
@csrf_exempt
def gamescore(request, userid):
    if (request.method == 'POST'):
        print("Updating Score")
        user=GameUsers.objects.get(record_id=userid)
        data = json.loads(request.body)
        print(user.message_id)
        try:
            if(user.is_message):
                bot.setGameScore(user.id, data['score'], message_id=user.message_id, force=0)
            else:
                bot.setGameScore(user.id, data['score'], inline_message_id=user.message_id, force=0)
        except Exception as e:
            print(str(e))
        user.score=data['score']
        user.save()
        print("saved")
        return HttpResponse(status=200)

#If starts comminication with our bot, we register it in our database and provide unique uuid.
#When game starts, we use basic user data to create link between telegram user and our game to provide basic feedbacks such as:
#1. Game Score.
#2. Profile Pics in Game.
#3. Inline Game Info.
#4. Internal Game Stats.

@csrf_exempt
def telegram_viewb(request, extra):
    if (request.method == 'POST'):
        print(request.POST.keys())
        if (extra == SETTINGS.CUSTOMTOKEN):
            json_data = json.loads(request.body)
            update = telegram.Update.de_json(json_data, bot)
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

                try:
                    chat_id=json_data['callback_query']['message']['chat']['id']
                    user.chat_id=chat_id
                    user.save()
                except Exception as e:
                    print(str(e))
                    pass

                game_session=GameSession(game_user=user)
                game_session.save()

                active_session_record, _=ActiveSessionLedger.objects.get_or_create(game_user=user)
                active_session_record.game_session=game_session

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
                    print(str(e))
                try:
                    bot.answerCallbackQuery(update.callback_query.id, url=SETTINGS.GAME_URL+'/'+str(user.record_id))
                    active_session_record.save()
                except Exception as e:
                    pass
            else:
                try:
                    _search="/start "
                    _tag_holder=json_data['message']['text']
                    if(_search in _tag_holder):
                        _tag=_tag_holder[len(_search):]
                        print("TAG", _tag_holder[len(_search):])
                        _tag_model, _created=Tag.objects.get_or_create(tag=_tag)
                        _tag_model.use_count=_tag_model.use_count+1
                        _tag_model.save()
                except:
                    pass
                bot.send_game(update.effective_chat.id, 'CoinsMerge')
    return HttpResponse("ok", status=200)

@csrf_exempt
def telegram_test(request):
    if (request.method == 'POST'):
        print([x for x in request.POST.keys()])

    return HttpResponse("ok", status=200)


from django.shortcuts import render
