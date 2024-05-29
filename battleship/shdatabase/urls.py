from django.urls import path
from . import views

urlpatterns = [
    path("play/new-game/<int:player1_id>/<int:player2_id>/<int:num_ships>/<int:board_size>/<str:is_ai_game>", views.new_game, name="new_game"),
    path("play/confirm-ships/<int:game_id>/<int:player_id>/<ship_board>", views.confirm_ships, name="confirm_ships"),
    path("play/get-state/<int:game_id>/<int:player_id>", views.get_state, name="get_state"),
    path("play/fire-shot/<int:game_id>/<int:player_id>/<int:row>/<int:col>", views.fire_shot, name="fire_shot"),
    path("play/get-player-info/<str:username>", views.get_player_info, name="get_player_info"),
    path("play/<str:room_name>/", views.room, name="room"),
    path("play/<int:num_ships>/<int:board_size>", views.random_board, name="random_board"),
#     path("play/get-player-info/<int:player_id>", views.get_player_info, name="get_player_info")
    path("change-player-preferences/<str:username>/<str:screen_name>/<str:color_preference>", views.change_preferences, name="change_preferences"),
    path("play/change-opponent/<int:game_id>/<int:player_id>", views.change_opponent, name="change_opponent")
    path('<str:username>/games/<str:status>', views.get_player_games, name='get_player_games'), #status will be all, active, inactive

]


#Example Paths
    # path("", views.StartingPageView.as_view(), name="starting-page"),
    # path("posts", views.AllPostView.as_view(), name="posts-page"),
    # path("posts/<slug:slug>", views.SinglePostView.as_view(),
    #       name="post-detail-page"),
    # path('search/', views.search_view, name='search_view'),
    # path('proposal', views.ProposalPageView.as_view(), name="proposal"),
    # path('music', views.MusicPageView.as_view(), name="music"),
