# server/server.py
# WebSocket Server cho Rock-Paper-Scissors Game
# Compatible với websockets 12.0+

import asyncio
import websockets
import json
from game_logic import Game

# Biến toàn cục
games = {}
game_id_counter = 0
player_id_counter = 0
connected_clients = {}

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
    
    connected_clients[player_id] = websocket
    
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
                
                # JOIN GAME
                if msg_type == 'joinGame':
                    # Tìm game đang chờ
                    available_game = None
                    
                    for gid, game in games.items():
                        if not game.ready:
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
                    print(f"👤 Player {player_id} join game {current_game_id}")
                    
                    # Bắt đầu game nếu đủ 2 người
                    if available_game.ready:
                        player_ids = available_game.get_player_ids()
                        print(f"🎮 Game {current_game_id} bắt đầu với: {player_ids}")
                        
                        for pid in player_ids:
                            player_ws = available_game.get_player_connection(pid)
                            await send_message(player_ws, 'gameStart', {
                                'gameId': current_game_id,
                                'playerId': pid
                            })
                
                # MAKE MOVE
                elif msg_type == 'makeMove':
                    move = data.get('move')
                    
                    if current_game_id is not None and current_game_id in games:
                        game = games[current_game_id]
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
        
        if current_game_id is not None and current_game_id in games:
            game = games[current_game_id]
            player_ids = game.get_player_ids()
            opponent_id = next((pid for pid in player_ids if pid != player_id), None)
            
            if opponent_id is not None and opponent_id in connected_clients:
                opponent_ws = connected_clients[opponent_id]
                try:
                    await send_message(opponent_ws, 'opponentDisconnect')
                except:
                    pass
            
            if current_game_id in games:
                del games[current_game_id]
                print(f"🗑️ Xóa game {current_game_id}")

async def main():
    """Khởi động WebSocket server"""
    print("=" * 50)
    print("🎮 ROCK-PAPER-SCISSORS WEBSOCKET SERVER")
    print("=" * 50)
    print("🚀 Server đang khởi động...")
    
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