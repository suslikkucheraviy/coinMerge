from django.shortcuts import render
from django.http import HttpResponse
import json
import nickgameDjango.settings as SETTINGS

from django.views.decorators.csrf import csrf_exempt

import telegram

from app.models import *

bot = telegram.Bot(token=SETTINGS.TOKEN)

def admin(request):
    users=GameUsers.objects.all()

    return render(request, "admin.html", {"users": users})

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

                resp[position]=[u.score, u.username, str(img_data)[2:-1]]
            print(position)
    return HttpResponse(json.dumps(resp), status=200)

@csrf_exempt
def gamescore(request, userid):
    if (request.method == 'POST'):
        print("Updating Score")
        user=GameUsers.objects.get(record_id=userid)
        data = json.loads(request.body)
        print(user.message_id)
        if(user.is_message):
            bot.setGameScore(user.id, data['score'], message_id=user.message_id)
        else:
            bot.setGameScore(user.id, data['score'], inline_message_id=user.message_id)

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


@csrf_exempt
def telegram_viewb(request, extra):
    if (request.method == 'POST'):
        if (extra == SETTINGS.TOKEN):
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

                    user=GameUsers(id=u_id, username=username, first_name=first_name, last_name=last_name, is_bot=is_bot, language_code=language_code)
                    user.save()
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


from django.shortcuts import render

# Create your views here.
