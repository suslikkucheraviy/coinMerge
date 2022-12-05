from django.shortcuts import render
from django.http import HttpResponse
import json
import nickgameDjango.settings as SETTINGS

from django.views.decorators.csrf import csrf_exempt

import telegram

from app.models import *

bot = telegram.Bot(token=SETTINGS.TOKEN)


def game(request):
    return render(request, 'indexMatter.html')

def gameuser(request, userid):
    user=GameUsers.objects.get(record_id=userid)
    if(user.score is None):
        user.score=0
        user.save()
    return render(request, 'indexMatter.html', {'userid':userid, 'bestScore': user.score})

@csrf_exempt
def gamescore(request, userid):
    if (request.method == 'POST'):
        print("Updating Score")
        # user=GameUsers.objects.get(record_id=userid)
        # # bot.setGameScore(user.id, 100)
        # data=json.loads(request.body)
        # bot.setGameScore(user_id=user.id, score=data['score'], message_id=user.message_id, chat_id=user.id)
        # user.score=data['score']
        # user.save()
        return HttpResponse(status=200)


@csrf_exempt
def telegram_view(request, extra):
    if (request.method == 'POST'):
        if (extra == SETTINGS.TOKEN):
            json_data = json.loads(request.body)
            update = telegram.Update.de_json(json_data, bot)
            # print(update)
            #
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
                print("PLAY BUTTON?")
                print(update.callback_query.id)
                print(update.callback_query.from_user)
                try:
                    user=GameUsers.objects.get(username=update.callback_query.from_user.username)
                except Exception as e:
                    username=update.callback_query.from_user.username
                    u_id=update.callback_query.from_user.id
                    first_name = update.callback_query.from_user.first_name
                    last_name = update.callback_query.from_user.last_name
                    is_bot = update.callback_query.from_user.is_bot
                    language_code = update.callback_query.from_user.language_code

                    user=GameUsers(id=u_id, username=username, first_name=first_name, last_name=last_name, is_bot=is_bot, language_code=language_code)
                    user.save()
                    print("added")
                try:
                    user.message_id=str(update.callback_query.message.message_id)
                    user.save()
                except Exception as e:
                    print(update.callback_query.message.message_id)
                    print(str(e))
                bot.answerCallbackQuery(update.callback_query.id, url=SETTINGS.GAME_URL+'/'+str(user.record_id))
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
