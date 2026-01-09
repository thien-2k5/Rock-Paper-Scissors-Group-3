import random

choices = ["rock", "paper", "scissors"]

def get_computer_choice():
    return random.choice(choices)

def get_result(player, computer):
    if player == computer:
        return "draw"
    if (
        (player == "rock" and computer == "scissors") or
        (player == "scissors" and computer == "paper") or
        (player == "paper" and computer == "rock")
    ):
        return "win"
    return "lose"

def play_game(player_choice):
    computer_choice = get_computer_choice()
    result = get_result(player_choice, computer_choice)
    return player_choice, computer_choice, result
