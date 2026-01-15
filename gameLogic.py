# -*- coding: utf-8 -*-
# File Python này chứa lớp "Game" được import vào file client.py.
# Lớp Game này rất quan trọng vì cần tạo một instance riêng cho mỗi trò chơi và lớp này phục vụ mục đích đó.

class Game:
    def __init__(self, id):
        # Khởi tạo các biến khi tạo instance với một gameId cụ thể.
        self.p1Gone = False
        self.p2Gone = False
        self.ready = False
        self.id = id
        self.moves = [None, None]

    # Hàm này trả về liệu cả hai người chơi còn kết nối với server hay không
    def isConnected(self):
        return self.ready
    
    # Hàm này kiểm tra liệu cả hai người chơi đã chọn xong lựa chọn của mình hay chưa.
    def bothGone(self):
        return self.p1Gone and self.p2Gone

    # Mục đích của hàm này là lấy nước đi của người chơi "p" cụ thể
    def getPlayerMove(self, p):
        return self.moves[p]

    # Hàm này ghi nhận nước đi của người chơi. Mỗi nước đi được truyền dưới dạng tham số
    def play(self, player, move):
        self.moves[player] = move

        if player == 0:
            self.p1Gone = True
        else:
            self.p2Gone = True
        
    
    # Hàm này xác định người thắng bằng cách so sánh các nước đi được gửi từ các Button trong client.py lên server.
    # Trả về -1 nếu trò chơi hòa, 0 nếu người chơi 1 thắng và 1 nếu người chơi 2 thắng trò chơi hiện tại.
    def findWinner(self):
        p1 = self.moves[0].upper()[0]
        p2 = self.moves[1].upper()[0]

        winner = -1

        if p1 == "R" and p2 == "P":
            winner = 1
        elif p1 == "R" and p2 == "S":
            winner = 0
        elif p1 =="P" and p2 == "R":
            winner = 0
        elif p1 == "P" and p2 == "S":
            winner = 1
        elif p1 == "S" and p2 == "R":
            winner = 1
        elif p1 == "S" and p2 == "P":
            winner = 0

        return winner

    # Hàm dưới đây được gọi để reset trò chơi khi một ván chơi hoàn thành. Hàm này reset các biến p1Gone và p2Gone,
    # chúng sẽ được thay đổi lại nếu một trong số họ thực hiện nước đi.
    def resetGame(self):
        self.p1Gone = False
        self.p2Gone = False
    