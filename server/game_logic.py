# server/game_logic.py
# Logic xử lý game Rock-Paper-Scissors

class Game:
    def __init__(self, game_id):
        self.game_id = game_id
        self.players = {}  # {player_id: connection}
        self.moves = {}    # {player_id: move}
        self.ready = False
        
    def add_player(self, player_id, connection):
        """Thêm người chơi vào game"""
        self.players[player_id] = connection
        # Nếu đủ 2 người, game sẵn sàng
        if len(self.players) == 2:
            self.ready = True
    
    def remove_player(self, player_id):
        """Xóa người chơi khỏi game"""
        if player_id in self.players:
            del self.players[player_id]
        if player_id in self.moves:
            del self.moves[player_id]
        self.ready = False
    
    def set_move(self, player_id, move):
        """Lưu nước đi của người chơi"""
        self.moves[player_id] = move
    
    def both_players_ready(self):
        """Kiểm tra cả hai người chơi đã chọn nước đi chưa"""
        return len(self.moves) == 2
    
    def get_result(self):
        """Tính toán kết quả game"""
        player_ids = list(self.moves.keys())
        move1 = self.moves[player_ids[0]]
        move2 = self.moves[player_ids[1]]
        
        # Kiểm tra hòa
        if move1 == move2:
            return {
                'winner': None,
                'result': 'draw',
                'moves': {player_ids[0]: move1, player_ids[1]: move2}
            }
        
        # Điều kiện thắng
        win_conditions = {
            'Rock': 'Scissors',
            'Scissors': 'Paper',
            'Paper': 'Rock'
        }
        
        winner = player_ids[0] if win_conditions[move1] == move2 else player_ids[1]
        
        return {
            'winner': winner,
            'moves': {player_ids[0]: move1, player_ids[1]: move2}
        }
    
    def reset(self):
        """Reset game để chơi ván mới"""
        self.moves = {}
    
    def get_player_ids(self):
        """Lấy danh sách player IDs"""
        return list(self.players.keys())
    
    def get_player_connection(self, player_id):
        """Lấy connection của player"""
        return self.players.get(player_id)