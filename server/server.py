# server/server.py
# Socket Server với Multi-threading cho game Rock-Paper-Scissors

import socket
import threading
import json
from game_logic import Game

# Cấu hình server
HOST = '127.0.0.1'  # localhost
PORT = 8080

# Biến toàn cục
games = {}
game_id_counter = 0
player_id_counter = 0
lock = threading.Lock()

def send_message(connection, message_type, data=None):
    """Gửi message dạng JSON tới client"""
    try:
        message = {'type': message_type}
        if data:
            message.update(data)
        
        json_message = json.dumps(message)
        connection.send(json_message.encode('utf-8'))
        print(f"📤 Gửi: {message}")
    except Exception as e:
        print(f"❌ Lỗi gửi message: {e}")

def receive_message(connection):
    """Nhận message từ client"""
    try:
        data = connection.recv(4096).decode('utf-8')
        if data:
            message = json.loads(data)
            print(f"📨 Nhận: {message}")
            return message
        return None
    except Exception as e:
        print(f"❌ Lỗi nhận message: {e}")
        return None

def handle_client(connection, address, player_id):
    """Xử lý kết nối của mỗi client trong thread riêng"""
    global game_id_counter, games
    
    current_game_id = None
    
    print(f"✅ Player {player_id} đã kết nối từ {address}")
    
    try:
        # Gửi Player ID cho client
        send_message(connection, 'playerId', {'playerId': player_id})
        
        while True:
            # Nhận message từ client
            message = receive_message(connection)
            
            if not message:
                break
            
            msg_type = message.get('type')
            
            # Xử lý JOIN GAME
            if msg_type == 'joinGame':
                with lock:
                    # Tìm game đang chờ người chơi
                    available_game = None
                    
                    for gid, game in games.items():
                        if not game.ready:
                            available_game = game
                            current_game_id = gid
                            break
                    
                    # Nếu không có, tạo game mới
                    if not available_game:
                        current_game_id = game_id_counter
                        game_id_counter += 1
                        available_game = Game(current_game_id)
                        games[current_game_id] = available_game
                        print(f"🎮 Tạo game mới: {current_game_id}")
                    
                    # Thêm player vào game
                    available_game.add_player(player_id, connection)
                    print(f"👤 Player {player_id} join game {current_game_id}")
                    
                    # Nếu đủ 2 người, bắt đầu game
                    if available_game.ready:
                        player_ids = available_game.get_player_ids()
                        print(f"🎮 Game {current_game_id} bắt đầu với: {player_ids}")
                        
                        # Gửi thông báo cho cả 2 player
                        for pid in player_ids:
                            player_conn = available_game.get_player_connection(pid)
                            send_message(player_conn, 'gameStart', {
                                'gameId': current_game_id,
                                'playerId': pid
                            })
            
            # Xử lý MAKE MOVE
            elif msg_type == 'makeMove':
                move = message.get('move')
                
                if current_game_id is not None and current_game_id in games:
                    game = games[current_game_id]
                    game.set_move(player_id, move)
                    print(f"🎯 Player {player_id} chọn: {move}")
                    
                    # Thông báo cho đối thủ
                    player_ids = game.get_player_ids()
                    opponent_id = next((pid for pid in player_ids if pid != player_id), None)
                    
                    if opponent_id is not None:
                        opponent_conn = game.get_player_connection(opponent_id)
                        send_message(opponent_conn, 'opponentReady')
                    
                    # Nếu cả hai đã chọn, tính kết quả
                    if game.both_players_ready():
                        result = game.get_result()
                        print(f"🏆 Kết quả: {result}")
                        
                        # Gửi kết quả cho cả 2 player
                        for pid in player_ids:
                            player_conn = game.get_player_connection(pid)
                            opponent_id = next((p for p in player_ids if p != pid), None)
                            
                            if result['result'] == 'draw':
                                player_result = 'draw'
                            elif result['winner'] == pid:
                                player_result = 'win'
                            else:
                                player_result = 'lose'
                            
                            send_message(player_conn, 'gameResult', {
                                'result': player_result,
                                'winner': result['winner'],
                                'playerMove': result['moves'][pid],
                                'opponentMove': result['moves'][opponent_id]
                            })
                        
                        # Reset game
                        game.reset()
    
    except Exception as e:
        print(f"❌ Lỗi xử lý client {player_id}: {e}")
    
    finally:
        # Xử lý disconnect
        print(f"🔌 Player {player_id} ngắt kết nối")
        
        if current_game_id is not None and current_game_id in games:
            game = games[current_game_id]
            player_ids = game.get_player_ids()
            opponent_id = next((pid for pid in player_ids if pid != player_id), None)
            
            # Thông báo cho đối thủ
            if opponent_id is not None:
                opponent_conn = game.get_player_connection(opponent_id)
                try:
                    send_message(opponent_conn, 'opponentDisconnect')
                except:
                    pass
            
            # Xóa game
            with lock:
                if current_game_id in games:
                    del games[current_game_id]
                    print(f"🗑️ Xóa game {current_game_id}")
        
        connection.close()

def start_server():
    """Khởi động server"""
    global player_id_counter
    
    # Tạo socket
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    
    try:
        server_socket.bind((HOST, PORT))
        server_socket.listen(10)  # Cho phép tối đa 10 kết nối chờ
        
        print(f"🚀 Server đã khởi động tại {HOST}:{PORT}")
        print(f"✅ Đang chờ kết nối từ client...\n")
        
        while True:
            # Chấp nhận kết nối
            connection, address = server_socket.accept()
            
            # Gán Player ID
            player_id = player_id_counter
            player_id_counter += 1
            
            # Tạo thread mới cho mỗi client
            client_thread = threading.Thread(
                target=handle_client,
                args=(connection, address, player_id)
            )
            client_thread.daemon = True
            client_thread.start()
    
    except Exception as e:
        print(f"❌ Lỗi server: {e}")
    finally:
        server_socket.close()

if __name__ == '__main__':
    print("=" * 50)
    print("🎮 ROCK-PAPER-SCISSORS SERVER")
    print("=" * 50)
    start_server()