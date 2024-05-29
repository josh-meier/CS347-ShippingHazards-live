from django.shortcuts import render, redirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from .models import Player, Game, Board
from rest_framework import permissions, viewsets
import requests
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json
import sys
import random

from .serializers import PlayerSerializer, GameSerializer, BoardSerializer
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User

PLACEHOLDER_PLAYER_ID = 4

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

class GameViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows games to be viewed or edited.
    """
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

class BoardViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows boards to be viewed or edited.
    """
    queryset = Board.objects.all()
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

def get_player_games(request, username, status):
    u = User.objects.get(username=username)
    player = get_object_or_404(Player, user=u)

    if status == "active":
        games_as_player1 = player.player1_games.filter(status=0)
        print(games_as_player1)
        games_as_player2 = player.player2_games.filter(status=0)
        all_games = games_as_player1 | games_as_player2
    elif status == "inactive":
        games_as_player1 = player.player1_games.exclude(status=0)
        print(games_as_player1)
        games_as_player2 = player.player2_games.exclude(status=0)
        all_games = games_as_player1 | games_as_player2
    elif status == "all":
        games_as_player1 = player.player1_games.all()
        print(games_as_player1)
        games_as_player2 = player.player2_games.all()
        all_games = games_as_player1 | games_as_player2
    else:
         raise ValueError("status must be active, inactive, or all")

    games_list = []
    for game in all_games:
        games_list.append({
            'id': game.id,
            'is_ai_game': game.is_ai_game,
            'player1_id': game.player1.id,
            'player2_id': game.player2.id,
            'board1ID': game.board1ID,
            'board2ID': game.board2ID,
            'turn': game.turn,
            'status': game.status,
            'num_ships': game.num_ships,
            'winner': game.winner,
            'loser': game.loser,
        })

    return JsonResponse(games_list, safe=False)

def room(request, room_name):
    """
    Creates a room where the user can see all messages being sent through the websocket for a specified game.
    """
    return render(request, "shdatabase/room.html", {"room_name": room_name})

def new_board(board_size):
    """
    Creates a new Board object and returns its ID.
    """
    board = Board()
    board.size = board_size
    board.ship_board = "-"*100
    board.attack_board = "-"*100
    board.combined_board = "-"*100
    '''
    The default negative values for is_hit, shot_row, and shot_col represent that a shot has not 
    been made yet. Once a shot is made, they become nonnegative
    '''
    board.is_hit = -1
    board.shot_row = -1
    board.shot_col = -1
    board.is_sunk = -1
    board.save()
    return board.id

def new_game(request, player1_id, player2_id, num_ships, board_size, is_ai_game):
    """
    API endpoint that creates a new Game object and returns its ID along with the player IDs.
    """
    game = Game()
    if is_ai_game == "true":
        game.is_ai_game = True
    elif is_ai_game == "false":
        game.is_ai_game = False              
    else:
        raise ValueError("is_ai_game must be 'true' or 'false'")
    
    game.player1_id = player1_id
    game.player2_id = player2_id
    game.board1ID = new_board(board_size)
    game.board2ID = new_board(board_size)
    game.turn = 1
    game.status = 0
    game.num_ships = num_ships
    game.winner = 0 
    game.loser = 0
    game.save()

    if is_ai_game:
        requests.get('http://ai-server:5555/new-game/' + str(player1_id) + '/' + str(player2_id)  + '/' + 
                    str(num_ships) + '/' + str(board_size) + '/' + str(game.id))

    return JsonResponse({"game_id": game.id,
                         "player_1_id": player1_id,
                         "player_2_id": player2_id})

def change_opponent(request, game_id, player_id):
    """
    API endpoint that changes player 2 of a specified game if it is currently the placeholder player.
    Returns status (1 if change is made, 0 otherwise) and player 2 ID.
    """
    try: 
        game = Game.objects.get(id = game_id)
    except:
        return JsonResponse({"status": 0})
    else:
        if game.player2_id == PLACEHOLDER_PLAYER_ID:
            game.player2_id = player_id
            game.save()
            status = 1
        else:
            status = 0
        return JsonResponse({"status": status,
                            "player_2_id": game.player2_id})

def get_player_board(game, player_id): 
    """
    Returns the Board object corresponding to a specified player in a specified game.
    """
    if game.player1_id == player_id:
            board1 = Board.objects.get(id = game.board1ID)
            return board1
    elif game.player2_id == player_id:
            board2 = Board.objects.get(id = game.board2ID)
            return board2
    else:
        raise ValueError("Game ID does not correspond to Player ID")

def confirm_ships(request, game_id, player_id, ship_board):
    """
    API endpoint that saves a player's ship_board and returns it.
    """
    game = Game.objects.get(id = game_id)
    if game.player1_id == player_id:
        game.player1_ship_status = 1
        game.save()
    elif game.player2_id == player_id:
        game.player2_ship_status = 1
        game.save()

    board = get_player_board(game, player_id)
    board.ship_board = ship_board
    board.combined_board = ship_board
    board.save()

    #sends updated game state to all GameConsumers in this game through the websocket
    group_name = "game_%s" % game_id
    channel_layer = get_channel_layer()
    async_to_sync(channel_layer.group_send)(
        group_name,
        {
            "type": "game_message",
            "message": "%s" % ws_get_state(game_id, player_id)
        }
    )
    return JsonResponse({"ship_board": board.ship_board})
       
def get_opponent(game, player_id):
    """
    Returns the opponent's ID given a specified player and game.
    """
    if game.player1_id == player_id:
            return game.player2_id
    elif game.player2_id == player_id:
            return game.player1_id
    else:
        raise ValueError("Game ID does not correspond to Player ID")  

def get_player_ship_status(game, player_id): 
    """
    Returns whether a specified player in a specified game has confirmed their ships.
    """
    if game.player1_id == player_id:
            ship_status = game.player1_ship_status
            return ship_status
    elif game.player2_id == player_id:
            ship_status = game.player2_ship_status
            return ship_status
    else:
        raise ValueError("Game ID does not correspond to Player ID")   

def get_state(request, game_id, player_id):
    """
    API endpoint that returns the board state and game state of the specified player and game.
    Returns this information only to the client that asked.
    Used for login capabilities.
    """
    game = Game.objects.get(id = game_id)
    opponent_id = get_opponent(game, player_id)
    player_ship_status = get_player_ship_status(game, player_id)
    opponent_ship_status = get_player_ship_status(game, opponent_id)
    board = get_player_board(game, player_id)
    return JsonResponse({"player_id": player_id,
                        "opponent_id": opponent_id,
                        "player_ship_status": player_ship_status,
                        "opponent_ship_status": opponent_ship_status,
                        "ship_board": board.ship_board,
                        "attack_board": board.attack_board,
                        "combined_board": board.combined_board,
                        "is_hit": board.is_hit,
                        "is_sunk": board.is_sunk,
                        "shot_row": board.shot_row,
                        "shot_col": board.shot_col,
                        "turn": game.turn,
                        "status": game.status})

def ws_get_state(game_id, player_id):
    """
    Uses a websocket to send the board state and game state to all players in the game.
    Used for gameplay capabilities.
    """
    game = Game.objects.get(id = game_id) 
    board = get_player_board(game, player_id)
    dict = {"player_id": player_id,
            "player1_id": game.player1_id,
            "player2_id": game.player2_id,
            "player1_ship_status": game.player1_ship_status,
            "player2_ship_status": game.player2_ship_status,
            "ship_board": board.ship_board,
            "attack_board": board.attack_board,
            "combined_board": board.combined_board,
            "is_hit": board.is_hit,
            "is_sunk": board.is_sunk,
            "shot_row": board.shot_row,
            "shot_col": board.shot_col,
            "turn": game.turn,
            "status": game.status}
    return json.dumps(dict)

def is_player_turn(game, player_id):
    """
    Returns True if it's the specified player's turn in the specified game
    Otherwise, returns False
    """   
    if ((game.player1_id == player_id and game.turn == 1) or 
        (game.player2_id == player_id and game.turn == 2)):
        return True
    
    elif ((game.player1_id == player_id and game.turn == 2) or 
          (game.player2_id == player_id and game.turn == 1)):
        return False
    
    else:
        raise ValueError("Game ID does not correspond to Player ID")
    
def fire_shot(request, game_id, player_id, row, col):
    """
    API endpoint that fires shot, changes game state, and alerts websockets.
    """
    game = Game.objects.get(id = game_id)
    #checks if both players have confirmed their ships
    if game.player1_ship_status == 1 and game.player2_ship_status == 1:

        if is_player_turn(game, player_id):
            opponent_id = get_opponent(game, player_id)
            board = get_player_board(game, opponent_id) 

            #updates and saves attack board, combined board, shot row, and shot col
            combinedBoard, attackBoard = updateBoards(board.ship_board, board.combined_board, 
                                                    board.attack_board, row, col)
            board.attack_board = attackBoard
            board.combined_board = combinedBoard
            board.shot_row = row
            board.shot_col = col
            board.save()

            hit_status, ship_char = isHit(board.ship_board, row, col)
            if hit_status == True:
                board.is_hit = 1 
                board.save()

                #if the hit sunk a ship, updates the board info and player's profile stats
                if isShipSunk(combinedBoard, ship_char):
                    board.is_sunk = 1
                    board.save()
                    player = Player.objects.get(id = player_id) 
                    player.num_of_ships_sunk += 1
                    player.save()  

                    #if hit made the player win the game, updates information about game, player, and opponent
                    if isWinner(combinedBoard):
                        game.status = game.turn
                        game.winner = player_id
                        game.loser = opponent_id
                        game.save()

                        winning_player = Player.objects.get(id = player_id)
                        winning_player.wins += 1
                        winning_player.save()

                        losing_player = Player.objects.get(id = opponent_id)
                        losing_player.losses += 1
                        losing_player.save()  
                else:
                    board.is_sunk = 0
                    board.save()
                                
            else:
                #if the player missed their shot, updates and saves hit, sink, and turn
                board.is_hit = 0
                board.is_sunk = 0
                board.save()
                if game.turn == 1:
                    game.turn = 2
                    game.save()
                elif game.turn == 2:
                    game.turn = 1
                    game.save()
                else:
                    raise ValueError("Turn must be 1 or 2")
                
            #sends updated game state to all GameConsumers in this game through the websocket
            group_name = "game_%s" % game_id
            channel_layer = get_channel_layer()

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "game_message",
                    "message": "%s" % ws_get_state(game_id, opponent_id)
                }
            )
            #response is not used, but we must return something
            return JsonResponse({"response": 0})
        
        else:
            raise ValueError("Player cannot fire shot when it is not their turn")
    
    else:
        raise ValueError("Player cannot fire shot until both players have confirmed their ships")

def get_player_info(request, username):
    u = User.objects.get(username=username)
    player = get_object_or_404(Player, user=u)
    return JsonResponse({"is_ai_player":player.is_ai_player,
                        "player_id": player.id,
                        "screen_name": player.screen_name,
                        "wins": player.wins,
                        "losses": player.losses,
                        "num_of_ships_sunk": player.num_of_ships_sunk,
                        "color_preference": player.color_preference})

def change_preferences(request, username, screen_name, color_preference):
    u = User.objects.get(username=username)
    player = get_object_or_404(Player, user=u)
    player.screen_name = screen_name
    player.color_preference = color_preference
    player.save()

    return JsonResponse({'message': 'Player info updated successfully'})

def random_board(request, num_ships, board_size):
    newBoardPlacement = placeShips(num_ships, board_size)
    return JsonResponse({"random_board" : newBoardPlacement})
    
'''
The following game logic code was written by Josh Meier and Willow Gu in logic.py.
The code was copied and pasted here because this backend code is currently in a separate branch.
Once backend code is in main, we will remove the copied code and import the game logic code.
'''

# func that gives the item at certain coordinates
def charAt(board, row, col): # from Matt Lepinski connect4-server.py
    '''
    Input: any 10x10 board, int row, int col
    Output: the character at the (row, col) of the 10x10 board
    '''
    index = col + row*10
    return board[index]

# helper func that updates the char at certain coords in the board-string to be the new char 
def updateChar(board, newChar, row, col):
    '''
    Input: any 10x10 board, the new character, and what row and col to be updated
    Output: the updated board 
    '''
    index = col + row*10
    # board[index] = newChar
    return board[:index] + newChar + board[index+1:]


# start game (gives blank boardstate) 
def blankBoard():
    return "-"*100

# checking if a player wins
def isWinner(combinedBoard):
    '''
    Input: combinedBoard that has ship chars and attacks (hits and misses)
    Output: True if the board has no ships left, False if the board has ships left 
    '''
    for row in range(10):
        for col in range(10):
            if charAt(combinedBoard, row, col) not in ("X", "O", "-"):
                return False
    return True

# Check if the most recent attack is a valid move?
def isValidAttack(attackBoard, attackRow, attackCol):
    '''
    Input: attackBoard with only previous hits and misses, row and col of next attack
    Output: True if there has not been an attack at those coordinates before, otherwise False
    '''
    if charAt(attackBoard, attackRow, attackCol) == "-":
        return True
    else:
        return False

# Check if the most recent attack a hit or not
def isHit(shipBoard, attackRow, attackCol):
    '''
    Input: shipBoard, row and col of next attack
    Output: Whether there is a ship at the coordinates of the attack (True or False), and the char at the location of the attack
    '''
    char = charAt(shipBoard, attackRow, attackCol)
    if char != "-":
        return True, char
    else:
        return False, char
    
# has a ship been sunk?
def isShipSunk(combinedBoard, ship):
    '''
    Input: combinedBoard and the char signifying a specific ship
    Output: True if all parts of that specific ship have been hit, False otherwise
    '''
    for row in range(10):
        for col in range(10):
            if charAt(combinedBoard, row, col) == ship:
                return False
    return True


# updating combinedBoard and attackBoard given the attack row and col
def updateBoards(shipBoard, prevCombinedBoard, prevAttackBoard, attackRow, attackCol):
    '''
    Input: all 3 board types, and the row and col of the next attack
    Output: the combinedBoard and attackBoard with the result of the attack incorporated into both
    '''
    hitStatus, char = isHit(shipBoard, attackRow, attackCol)
    if hitStatus:
        char = "X"
    else:
        char = "O"
    newCombinedBoard = updateChar(prevCombinedBoard, char, attackRow, attackCol)
    newAttackBoard = updateChar(prevAttackBoard, char, attackRow, attackCol)
    return newCombinedBoard, newAttackBoard


#PlaceShips Code

def placeOneShip(size, ship_board, ship_letter):
    # horizontal
    if random.randint(0, 1) == 0:
        row = random.randint(0, 9)
        col = random.randint(0, 10 - size)
        # check that entire ship can be placed
        for i in range(size):
            if ship_board[row * 10 + col + i] != "-":
                return False
        # place ship
        for i in range(size):
                ship_board[row * 10 + col + i] = ship_letter
    # vertical
    else: 
        row = random.randint(0, 10 - size)
        col = random.randint(0, 9)
        # check that entire ship can be placed
        for i in range(size):
            if ship_board[(row + i) * 10 + col] != "-":
                return False
        # place ship
        for i in range(size):
                ship_board[(row + i) * 10 + col] = ship_letter
    return True


ships_composition = {
        4: [2, 3, 4, 5],
        5: [2, 3, 3, 4, 5],
        6: [2, 3, 3, 4, 4, 5],
    }
# randomize board configuration based on either 4, 5, or 6 ships
def placeShips(num_ships, board_size):
    ship_board = ["-" for _ in range(board_size * board_size)]

    ship_index = 0
    for size in ships_composition[num_ships]:
        placed = False
        ship_index += 1
        # https://www.pythoncheatsheet.org/builtin/chr
        # https://en.wikipedia.org/wiki/List_of_Unicode_characters
        ship_letter = chr(ship_index + 96) 
        while placed == False:
            placed = placeOneShip(size, ship_board, ship_letter)

    return ''.join(ship_board)
