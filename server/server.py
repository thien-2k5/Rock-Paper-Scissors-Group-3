# Server Core - Rock Paper Scissors Game
# Thành viên 1
import socket
import threading

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
    
    def add_player(self, client):
        if len(self.player) < 2:  # Lỗi: player thay vì players
            self.players.append(client)
            return True
        return False
    
    def is_full(self):
        return len(self.players) == 2
    
    def set_choice(self, client, choice):
        self.choices[client] = choice
    
    def get_results(self):
        if len(self.choices) == 2:
            # Gọi game logic để xử lý (sẽ implement sau)
            return "Game results here"
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
    
    try:
        while True:
            # Nhận dữ liệu từ client
            data = client_socket.recv(1024).decode('utf-8')
            
            if not data:
                break
            
            print(f"[{address}] received: {data}")
            
            # Lưu lựa chọn của player
            room.set_choice(client_socket, data)
            
            # Kiểm tra nếu đủ 2 người chọn
            results = room.get_result()  # Lỗi: get_result thay vì get_results
            if results:
                # Gửi kết quả cho cả 2 players
                for player in room.players:
                    player.send(results.encode('utf-8'))
                
                # Reset room
                room.choices = {}
    
    except Exception as e:
        print(f"[ERROR] {e}")
    
    finally:
        # Đóng kết nối
        client_socket.close()
        clients.remove(client_socket)
        print(f"[DISCONNECTED] {address} disconnected.")


def start_server():
    """Khởi động server"""
    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
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
        
        print(f"[ACTIVE CONNECTIONS] {threading.activeCount() - 1}")


if __name__ == "__main__":
    print("[STARTING] Server is starting...")
    start_server()
