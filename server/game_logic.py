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


# ===== MAIN PROGRAM =====
print("=== GAME BÚA - KÉO - BAO ===")
print("Nhập lựa chọn của bạn: rock / paper / scissors")

player_choice = input("Your choice: ").lower()

if player_choice not in choices:
    print("❌ Lựa chọn không hợp lệ!")
else:
    player, computer, result = play_game(player_choice)

    print("\n--- KẾT QUẢ ---")
    print(f"Bạn chọn      : {player}")
    print(f"Máy chọn      : {computer}")

    if result == "win":
        print("🎉 KẾT QUẢ: BẠN THẮNG!")
    elif result == "lose":
        print("😢 KẾT QUẢ: BẠN THUA!")
    else:
        print("🤝 KẾT QUẢ: HÒA!")
