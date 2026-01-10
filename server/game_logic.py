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


# ===== MAIN =====
player_choice = input("Chọn (rock/paper/scissors): ").lower()

if player_choice in choices:
    p, c, r = play_game(player_choice)
    print(f"\nBạn: {p} | Máy: {c} | Kết quả: {r.upper()}")
else:
    print("Lựa chọn không hợp lệ!")
