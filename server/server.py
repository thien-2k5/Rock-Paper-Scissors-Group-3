# Server Core - Rock Paper Scissors Game
# Thành viên 1
import socket
import threading
from game_logic import get_result, format_result

# Cấu hình server
HOST = '127.0.0.1'
PORT = 5555

# Lưu danh sách client kết nối
clients = []
rooms = []

class Room:
    def __init__(self):
        self.players = []
        self.choices = {}
        self.player_index = {}  # Map socket -> player index (0 or 1)
    
    def add_player(self, client):
        if len(self.players) < 2:
            player_idx = len(self.players)
            self.players.append(client)
            self.player_index[client] = player_idx
            return True
        return False
    
    def is_full(self):
        return len(self.players) == 2
    
    def set_choice(self, client, choice):
        self.choices[client] = choice
    
    def get_results(self):
        if len(self.choices) == 2:
            # Lấy lựa chọn của 2 players
            player1_choice = self.choices[self.players[0]]
            player2_choice = self.choices[self.players[1]]
            
            # Tính kết quả
            result = get_result(player1_choice, player2_choice)
            result_msg = format_result(player1_choice, player2_choice, result)
            
            return result_msg
        return None


def handle_client(client_socket, address):
    """Xử lý từng client"""
    print(f"[NEW CONNECTION] {address} connected.")
    
    # Tìm hoặc tạo phòng cho client
    room = None
    for r in rooms:
        if not r.is_full():
            room = r
            break
    
    if room is None:
        room = Room()
        rooms.append(room)
    
    # Thêm player vào phòng
    room.add_player(client_socket)
    player_num = room.player_index[client_socket] + 1
    
    # Gửi thông báo chào mừng
    welcome_msg = f"Chào mừng! Bạn là Player {player_num}."
    if not room.is_full():
        welcome_msg += "\nĐang chờ người chơi khác..."
    else:
        welcome_msg += "\nPhòng đã đủ người! Bắt đầu chơi."
        # Thông báo cho player còn lại
        other_player = room.players[0] if room.players[1] == client_socket else room.players[1]
        try:
            other_player.send("Đối thủ đã vào phòng! Bắt đầu chơi.".encode('utf-8'))
        except:
            pass
    
    client_socket.send(welcome_msg.encode('utf-8'))
    
    try:
        while True:
            # Nhận dữ liệu từ client
            data = client_socket.recv(1024).decode('utf-8').strip()
            
            if not data or data == 'exit':
                break
            
            # Kiểm tra lựa chọn hợp lệ
            if data not in ['rock', 'paper', 'scissors']:
                client_socket.send("Lựa chọn không hợp lệ!".encode('utf-8'))
                continue
            
            print(f"[{address}] Player {player_num} chọn: {data}")
            
            # Lưu lựa chọn của player
            room.set_choice(client_socket, data)
            
            # Thông báo đã nhận lựa chọn
            client_socket.send(f"Đã nhận lựa chọn: {data}. Đợi đối thủ...".encode('utf-8'))
            
            # Kiểm tra nếu đủ 2 người chọn
            results = room.get_results()
            if results:
                # Gửi kết quả cho cả 2 players
                for player in room.players:
                    try:
                        player.send(results.encode('utf-8'))
                    except:
                        pass
                
                # Reset room để chơi ván mới
                room.choices = {}
    
    except Exception as e:
        print(f"[ERROR] {e}")
    
    finally:
        # Đóng kết nối
        try:
            client_socket.close()
        except:
            pass
        
        if client_socket in clients:
            clients.remove(client_socket)
        
        # Xóa player khỏi room
        if client_socket in room.players:
            room.players.remove(client_socket)
        
        print(f"[DISCONNECTED] {address} disconnected.")


def start_server():
    """Khởi động server"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind((HOST, PORT))
    server.listen()
    
    print(f"[LISTENING] Server is listening on {HOST}:{PORT}")
    
    while True:
        # Chấp nhận kết nối mới
        client_socket, address = server.accept()
        clients.append(client_socket)
        
        # Tạo thread mới cho mỗi client
        thread = threading.Thread(target=handle_client, args=(client_socket, address))
        thread.start()
        
        print(f"[ACTIVE CONNECTIONS] {threading.active_count() - 1}")


if __name__ == "__main__":
    print("[STARTING] Server is starting...")
    start_server()
