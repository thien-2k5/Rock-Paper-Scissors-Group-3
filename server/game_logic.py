# Game Logic - Rock Paper Scissors
# Thành viên 2

def get_result(player1_choice, player2_choice):
    """
    So sánh lựa chọn của 2 người chơi
    Trả về: 'player1' nếu player1 thắng, 'player2' nếu player2 thắng, 'draw' nếu hòa
    """
    if player1_choice == player2_choice:
        return "draw"
    
    # Player 1 thắng
    if (
        (player1_choice == "rock" and player2_choice == "scissors") or
        (player1_choice == "scissors" and player2_choice == "paper") or
        (player1_choice == "paper" and player2_choice == "rock")
    ):
        return "player1"
    
    # Player 2 thắng
    return "player2"


def format_result(player1_choice, player2_choice, result):
    """
    Format kết quả game thành chuỗi dễ đọc
    """
    result_text = ""
    
    if result == "draw":
        result_text = "HÒA!"
    elif result == "player1":
        result_text = "PLAYER 1 THẮNG!"
    else:
        result_text = "PLAYER 2 THẮNG!"
    
    return f"\n=== KẾT QUẢ ===\nPlayer 1: {player1_choice}\nPlayer 2: {player2_choice}\n{result_text}\n"
