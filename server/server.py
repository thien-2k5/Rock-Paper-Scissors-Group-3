# server/server.py
# WebSocket Server cho Rock-Paper-Scissors Game
# Với Room System và Player Names

import asyncio
import websockets
import json
import random
import string
from game_logic import Game

# Biến toàn cục
games = {}  # Matchmaking games
rooms = {}  # Private rooms {room_code: Game}
game_id_counter = 0
player_id_counter = 0
connected_clients = {}  # {player_id: websocket}
player_names = {}  # {player_id: name}
player_rooms = {}  # {player_id: room_code}
player_games = {}  # {player_id: game_id} - Track game của mỗi player


def generate_room_code():
    """Tạo mã phòng 6 ký tự"""
    while True:
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        if code not in rooms:
            return code


async def send_message(websocket, message_type, data=None):
    """Gửi message JSON tới client"""
    try:
        message = {'type': message_type}
        if data:
            message.update(data)
        
        await websocket.send(json.dumps(message))
        print(f"📤 Gửi tới client: {message}")
    except Exception as e:
        print(f"❌ Lỗi gửi message: {e}")


async def handle_client(websocket):
    """Xử lý kết nối WebSocket của client"""
    global game_id_counter, player_id_counter
    
    player_id = player_id_counter
    player_id_counter += 1
    current_game_id = None
    current_room_code = None
    
    connected_clients[player_id] = websocket
    player_names[player_id] = f'Player {player_id}'
    
    print(f"✅ Player {player_id} đã kết nối")
    
    try:
        # Gửi Player ID
        await send_message(websocket, 'playerId', {'playerId': player_id})
        
        # Lắng nghe messages từ client
        async for message in websocket:
            try:
                data = json.loads(message)
                print(f"📨 Nhận từ Player {player_id}: {data}")
                
                msg_type = data.get('type')
                
                # SET NAME
                if msg_type == 'setName':
                    name = data.get('name', '').strip()
                    if name:
                        player_names[player_id] = name[:20]  # Giới hạn 20 ký tự
                        print(f"👤 Player {player_id} đổi tên thành: {name}")
                
                # CREATE ROOM
                elif msg_type == 'createRoom':
                    name = data.get('playerName', '').strip()
                    if name:
                        player_names[player_id] = name[:20]
                    
                    # Cleanup room/game cũ nếu player đang ở trong room/game khác
                    if player_id in player_rooms:
                        old_room_code = player_rooms[player_id]
                        if old_room_code in rooms:
                            old_room = rooms[old_room_code]
                            old_room.remove_player(player_id)
                            if len(old_room.get_player_ids()) == 0:
                                del rooms[old_room_code]
                                print(f"🗑️ Xóa room cũ: {old_room_code}")
                        del player_rooms[player_id]
                    
                    if player_id in player_games:
                        old_game_id = player_games[player_id]
                        if old_game_id in games:
                            old_game = games[old_game_id]
                            old_game.remove_player(player_id)
                            if len(old_game.get_player_ids()) == 0:
                                del games[old_game_id]
                                print(f"🗑️ Xóa game cũ: {old_game_id}")
                        del player_games[player_id]
                    
                    room_code = generate_room_code()
                    game = Game(room_code, room_code=room_code)
                    game.add_player(player_id, websocket)
                    game.set_player_name(player_id, player_names[player_id])
                    
                    rooms[room_code] = game
                    player_rooms[player_id] = room_code
                    current_room_code = room_code
                    current_game_id = room_code
                    
                    await send_message(websocket, 'roomCreated', {
                        'roomCode': room_code,
                        'playerId': player_id
                    })
                    print(f"🏠 Phòng {room_code} đã được tạo bởi Player {player_id}")
                
                # JOIN ROOM
                elif msg_type == 'joinRoom':
                    room_code = data.get('roomCode', '').strip().upper()
                    name = data.get('playerName', '').strip()
                    if name:
                        player_names[player_id] = name[:20]
                    
                    print(f"🚪 Player {player_id} đang cố vào phòng: '{room_code}'")
                    print(f"📋 Các phòng hiện có: {list(rooms.keys())}")
                    
                    if not room_code or len(room_code) != 6:
                        await send_message(websocket, 'roomError', {
                            'error': f'Mã phòng không hợp lệ! Nhận được: "{room_code}"'
                        })
                        continue
                    
                    if room_code not in rooms:
                        await send_message(websocket, 'roomError', {
                            'error': f'Phòng "{room_code}" không tồn tại hoặc đã hết hạn!'
                        })
                        continue
                    
                    game = rooms[room_code]
                    
                    if game.ready:
                        await send_message(websocket, 'roomError', {
                            'error': 'Phòng đã đầy!'
                        })
                        continue
                    
                    # Cleanup room/game cũ trước khi vào room mới
                    if player_id in player_rooms:
                        old_room_code = player_rooms[player_id]
                        if old_room_code in rooms and old_room_code != room_code:
                            old_room = rooms[old_room_code]
                            old_room.remove_player(player_id)
                            if len(old_room.get_player_ids()) == 0:
                                del rooms[old_room_code]
                                print(f"🗑️ Xóa room cũ: {old_room_code}")
                        del player_rooms[player_id]
                    
                    if player_id in player_games:
                        old_game_id = player_games[player_id]
                        if old_game_id in games:
                            old_game = games[old_game_id]
                            old_game.remove_player(player_id)
                            if len(old_game.get_player_ids()) == 0:
                                del games[old_game_id]
                                print(f"🗑️ Xóa game cũ: {old_game_id}")
                        del player_games[player_id]
                    
                    # Thêm player vào phòng
                    game.add_player(player_id, websocket)
                    game.set_player_name(player_id, player_names[player_id])
                    player_rooms[player_id] = room_code
                    current_room_code = room_code
                    current_game_id = room_code
                    
                    await send_message(websocket, 'roomJoined', {
                        'roomCode': room_code,
                        'playerId': player_id
                    })
                    
                    # Bắt đầu game nếu đủ 2 người
                    if game.ready:
                        player_ids = game.get_player_ids()
                        print(f"🎮 Room {room_code} bắt đầu với: {player_ids}")
                        
                        for pid in player_ids:
                            player_ws = game.get_player_connection(pid)
                            opponent_id = next((p for p in player_ids if p != pid), None)
                            opponent_name = game.get_player_name(opponent_id) if opponent_id else 'Đối thủ'
                            
                            await send_message(player_ws, 'gameStart', {
                                'gameId': room_code,
                                'playerId': pid,
                                'opponentName': opponent_name
                            })
                
                # JOIN GAME (Matchmaking)
                elif msg_type == 'joinGame':
                    name = data.get('playerName', '').strip()
                    if name:
                        player_names[player_id] = name[:20]
                    
                    # Cleanup game cũ nếu player đã ở trong game
                    if player_id in player_games:
                        old_game_id = player_games[player_id]
                        if old_game_id in games:
                            old_game = games[old_game_id]
                            old_game.remove_player(player_id)
                            # Xóa game nếu rỗng
                            if len(old_game.get_player_ids()) == 0:
                                del games[old_game_id]
                                print(f"🗑️ Xóa game cũ: {old_game_id}")
                        del player_games[player_id]
                    
                    # Tìm game đang chờ (không phải game rỗng)
                    available_game = None
                    
                    for gid, game in list(games.items()):
                        # Kiểm tra game có player và chưa đủ 2 người
                        if not game.ready and len(game.get_player_ids()) == 1:
                            available_game = game
                            current_game_id = gid
                            break
                    
                    # Tạo game mới nếu không có
                    if not available_game:
                        current_game_id = game_id_counter
                        game_id_counter += 1
                        available_game = Game(current_game_id)
                        games[current_game_id] = available_game
                        print(f"🎮 Tạo game mới: {current_game_id}")
                    
                    # Thêm player
                    available_game.add_player(player_id, websocket)
                    available_game.set_player_name(player_id, player_names[player_id])
                    player_games[player_id] = current_game_id
                    print(f"👤 Player {player_id} ({player_names[player_id]}) join game {current_game_id}")
                    
                    # Bắt đầu game nếu đủ 2 người
                    if available_game.ready:
                        player_ids = available_game.get_player_ids()
                        print(f"🎮 Game {current_game_id} bắt đầu với: {player_ids}")
                        
                        for pid in player_ids:
                            player_ws = available_game.get_player_connection(pid)
                            opponent_id = next((p for p in player_ids if p != pid), None)
                            opponent_name = available_game.get_player_name(opponent_id) if opponent_id else 'Đối thủ'
                            
                            await send_message(player_ws, 'gameStart', {
                                'gameId': current_game_id,
                                'playerId': pid,
                                'opponentName': opponent_name
                            })
                
                # MAKE MOVE
                elif msg_type == 'makeMove':
                    move = data.get('move')
                    
                    # Tìm game hiện tại (có thể là room hoặc matchmaking game)
                    game = None
                    if current_room_code and current_room_code in rooms:
                        game = rooms[current_room_code]
                    elif current_game_id is not None and current_game_id in games:
                        game = games[current_game_id]
                    
                    if game:
                        game.set_move(player_id, move)
                        print(f"🎯 Player {player_id} chọn: {move}")
                        
                        # Thông báo đối thủ
                        player_ids = game.get_player_ids()
                        opponent_id = next((pid for pid in player_ids if pid != player_id), None)
                        
                        if opponent_id is not None:
                            opponent_ws = game.get_player_connection(opponent_id)
                            await send_message(opponent_ws, 'opponentReady')
                        
                        # Tính kết quả nếu cả hai đã chọn
                        if game.both_players_ready():
                            result = game.get_result()
                            print(f"🏆 Kết quả: {result}")
                            
                            for pid in player_ids:
                                player_ws = game.get_player_connection(pid)
                                opponent_id = next((p for p in player_ids if p != pid), None)
                                
                                if result.get('result') == 'draw':
                                    player_result = 'draw'
                                elif result.get('winner') == pid:
                                    player_result = 'win'
                                else:
                                    player_result = 'lose'
                                
                                await send_message(player_ws, 'gameResult', {
                                    'result': player_result,
                                    'winner': result.get('winner'),
                                    'playerMove': result['moves'][pid],
                                    'opponentMove': result['moves'][opponent_id]
                                })
                            
                            game.reset()
            
            except json.JSONDecodeError:
                print("❌ Lỗi parse JSON")
            except Exception as e:
                print(f"❌ Lỗi xử lý message: {e}")
                import traceback
                traceback.print_exc()
    
    except websockets.exceptions.ConnectionClosed:
        print(f"🔌 Player {player_id} ngắt kết nối")
    except Exception as e:
        print(f"❌ Lỗi trong handle_client: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Cleanup
        if player_id in connected_clients:
            del connected_clients[player_id]
        
        if player_id in player_names:
            del player_names[player_id]
        
        # Cleanup room - GIỮ PHÒNG NẾU CÒN NGƯỜI Ở LẠI
        if current_room_code and current_room_code in rooms:
            game = rooms[current_room_code]
            player_ids = game.get_player_ids()
            opponent_id = next((pid for pid in player_ids if pid != player_id), None)
            
            # Xóa player khỏi game
            game.remove_player(player_id)
            
            if opponent_id is not None and opponent_id in connected_clients:
                opponent_ws = connected_clients[opponent_id]
                try:
                    await send_message(opponent_ws, 'opponentDisconnect')
                    print(f"📢 Thông báo cho Player {opponent_id} về việc đối thủ rời phòng")
                except:
                    pass
                
                # KHÔNG XÓA PHÒNG - giữ lại để người còn lại chờ
                print(f"🏠 Phòng {current_room_code} vẫn hoạt động, chờ người mới...")
            else:
                # Không còn ai trong phòng -> xóa phòng
                del rooms[current_room_code]
                print(f"🗑️ Xóa phòng {current_room_code} (không còn ai)")
        
        # Cleanup matchmaking game
        if current_game_id is not None and current_game_id in games:
            game = games[current_game_id]
            player_ids = game.get_player_ids()
            opponent_id = next((pid for pid in player_ids if pid != player_id), None)
            
            # Xóa player khỏi game
            game.remove_player(player_id)
            
            if opponent_id is not None and opponent_id in connected_clients:
                opponent_ws = connected_clients[opponent_id]
                try:
                    await send_message(opponent_ws, 'opponentDisconnect')
                except:
                    pass
            
            # Xóa game nếu không còn ai
            if len(game.get_player_ids()) == 0 and current_game_id in games:
                del games[current_game_id]
                print(f"🗑️ Xóa game {current_game_id}")
        
        if player_id in player_rooms:
            del player_rooms[player_id]
        
        if player_id in player_games:
            del player_games[player_id]


async def main():
    """Khởi động WebSocket server"""
    print("=" * 50)
    print("🎮 ROCK-PAPER-SCISSORS WEBSOCKET SERVER")
    print("=" * 50)
    print("🚀 Server đang khởi động...")
    print("📋 Tính năng:")
    print("   ✅ Matchmaking (tự động ghép cặp)")
    print("   ✅ Private Rooms (phòng riêng)")
    print("   ✅ Player Names (tên người chơi)")
    print("=" * 50)
    
    # Sử dụng cách mới cho websockets 12.0+
    async with websockets.serve(handle_client, "127.0.0.1", 8080):
        print("✅ Server đã khởi động tại ws://127.0.0.1:8080")
        print("✅ Đang chờ kết nối từ client...\n")
        await asyncio.Future()  # Chạy mãi mãi


if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Server đã dừng bởi người dùng")
    except Exception as e:
        print(f"❌ Lỗi server: {e}")
        import traceback
        traceback.print_exc()