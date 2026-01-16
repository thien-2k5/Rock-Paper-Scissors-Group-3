# -*- coding: utf-8 -*-
import pygame
import socket
import pickle
pygame.font.init()

# Lớp Network chịu trách nhiệm kết nối với server với thông tin cần thiết cho mỗi trò chơi.
# Nó gửi và nhận thông tin từ server ở mỗi giai đoạn của mỗi trò chơi.
class Network:
    # Khởi tạo instance với server và port.
    """
    self.server lưu địa chỉ IPv4 của hệ thống.
    Bạn cần cập nhật dòng này khi clone repository từ GitHub.
    """
    def __init__(self):
        self.client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server = "127.0.0.1"
        self.port = 5555
        self.addr = (self.server, self.port)
        self.p = self.connect()

    # Hàm này xác định người chơi nào đang gửi yêu cầu đến server.
    def getPlayer(self):
        return self.p

    # Hàm này kết nối với server và trả về phiên bản giải mã cỡa dữ liệu nhận được.
    def connect(self):
        try:
            self.client.connect(self.addr)
            return self.client.recv(2048).decode()

        except:
            pass
        
    # Hàm này chịu trách nhiệm gửi yêu cầu của mỗi người chơi sau mỗi nước đi hoặc sau khi hoàn thành trò chơi.
    # Điều này rất quan trọng vì chúng ta biết được trạng thái của mỗi trò chơi tại một thời điểm cụ thể.
    def send(self, data):
        try:
            self.client.send(str.encode(data))
            return pickle.loads(self.client.recv(4096))

        except socket.error as e:
            print(e)


# Đây là chiều rộng và chiều cao của cửa sổ pygame, cửa sổ được gọi là "win"
WIDTH =  400
HEIGHT = 400
win = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("🎮 Kéo Búa Bao - Client")

# Lớp Button đại diện cho các nút xuất hiện trong cửa sổ pygame sau khi trò chơi bắt đầu (các nút Rock Paper và Scissors).
# Lớp này có các phương thức để vẽ nút trong cửa sổ pygame và mỗi instance lưu các thuộc tính của nút như toạ độ x, y, màu sắc, văn bản trên nút, v.v.
class Button:
    # Khởi tạo các thuộc tính của nút
    def __init__(self, text, x, y, color, icon_path=None):
        self.text = text
        self.icon_path = icon_path
        self.x = x
        self.y = y
        self.color = color
        self.width = 100
        self.height = 90
        # Tải icon nếu có đường dẫn
        if icon_path:
            try:
                self.icon = pygame.image.load(icon_path)
                self.icon = pygame.transform.smoothscale(self.icon, (70, 70))
            except:
                self.icon = None
        else:
            self.icon = None

    # Hàm này cho phép vẽ nút với các thuộc tính của instance hiện tại lên cửa sổ pygame
    def draw(self, win):
        pygame.draw.rect(win, self.color, (self.x, self.y, self.width, self.height), border_radius=10)
        # Vẽ icon nếu có
        if self.icon:
            icon_x = self.x + (self.width - 70) // 2
            icon_y = self.y + 5
            win.blit(self.icon, (icon_x, icon_y))
        # Vẽ văn bản
        font = pygame.font.SysFont("segoeui,arial,microsoftyahei", 13, bold=True)
        text = font.render(self.text, 1, (255, 255, 255))
        win.blit(text, (self.x+round(self.width/2)-round(text.get_width()/2), self.y + 78))
    
    # Hàm này kiểm tra xem chuột có nhấp vào nút hay không.
    def click(self, pos):
        x1 = pos[0] 
        y1 = pos[1]
        if self.x <= x1 <= self.x + self.width and self.y <= y1 <=self.y + self.height:
            return True
        else:
            return False


# Hàm này chịu trách nhiệm cập nhật điểm của người chơi được lưu trong danh sách "scores" cho mỗi người chơi trong trò chơi "game"
def scoreUpdate(game, p, scores):
    if game.findWinner() == -1:  # Trò chơi hòa nếu hàm findWinner() trả về -1
        scores[2] += 1
    else:
        if game.findWinner() == p:  # Người chơi hiện tại đã thắng trận đấu
            scores[0] += 1
        else:  # Người chơi hiện tại đã thua trận đấu
            scores[1] += 1

    

# Hàm này vẽ cửa sổ pygame "win" cho một trò chơi "game" cụ thể và một người chơi "p" cụ thể
def redrawWindow(win, game, p, scores):  
    win.fill((255, 255, 255))

    if not(game.isConnected()): # Nếu hàm .isConnected() trả về false, chỉ có một người chơi tham gia.
        # Hiển thị thông báo trong lobby cho đến khi đối thủ đến.
        font = pygame.font.SysFont("segoeui,arial,microsoftyahei", 24, bold=True)
        text = font.render("Đang chờ đối thủ...", 1, (0, 0, 0))
        win.blit(text, (WIDTH/2 - text.get_width()/2, HEIGHT/2 - text.get_height()/2))
    
    else:
        # Hiển thị nước đi của cả hai người chơi và trạng thái lựa chọn của họ
        font = pygame.font.SysFont("segoeui,arial,microsoftyahei", 18, bold=True)
        text = font.render("Bạn chọn", 1, (0, 100, 255))
        win.blit(text, (30, 50))

        text = font.render("Đối thủ", 1, (255, 100, 0))
        win.blit(text, (220, 50))

        move1 = game.getPlayerMove(0)
        move2 = game.getPlayerMove(1)

        if game.bothGone():
            text1 = font.render(move1, 1, (0, 0, 0))
            text2 = font.render(move2, 1, (0, 0, 0))

        else:
            if game.p1Gone and p == 0:
                text1 = font.render(move1, 1, (0, 0, 0))
            elif game.p1Gone:
                text1 = font.render("Đã chọn", 1, (0, 150, 0))
            else:
                text1 = font.render("Đang chờ...", 1, (150, 150, 150))


            if game.p2Gone and p == 1:
                text2 = font.render(move2, 1, (0, 0, 0))
            elif game.p2Gone:
                text2 = font.render("Đã chọn", 1, (0, 150, 0))
            else:
                text2 = font.render("Đang chờ...", 1, (150, 150, 150))

        # Đảm bảo đối thủ không thể thấy nước đi của chúng ta nhưng chúng ta có thể thấy nước đi của mình.
        # Với đối thủ, trạng thái nước đi của chúng ta hiển thị là "đang chờ" hoặc "đã chọn" tùy thuộc vào việc chúng ta đã chọn hay chưa.
        if p == 1: 
            win.blit(text2, (30, 120))
            win.blit(text1, (200, 120))
        else:
            win.blit(text1, (30, 120))
            win.blit(text2, (200, 120))

        # Hiển thị số lần thắng, thua và hòa của mỗi người chơi
        f = pygame.font.SysFont("segoeui,arial,microsoftyahei", 16, bold=True)
        w1 = f.render("Thắng: " + str(scores[0]), 1, (0, 200, 0))
        l1 = f.render("Thua: " + str(scores[1]), 1, (200, 0, 0))
        t1 = f.render("Hòa: " + str(scores[2]), 1, (100, 100, 100))

        w2 = f.render("Thắng: " + str(scores[0]), 1, (0, 200, 0))
        l2 = f.render("Thua: " + str(scores[1]), 1, (200, 0, 0))
        t2 = f.render("Hòa: " + str(scores[2]), 1, (100, 100, 100))

        if p == 0:
            win.blit(w1, (20, 350))
            win.blit(t1, (150, 350))
            win.blit(l1, (270, 350))
        else:
            win.blit(w2, (20, 350))
            win.blit(t2, (150, 350))
            win.blit(l2, (270, 350))

        # Vẽ tất cả các nút đã được khởi tạo trong cửa sổ "win"
        for btn in btns:
            btn.draw(win)

    # Cập nhật cửa sổ pygame sau khi thay đổi.
    pygame.display.update()

# btns là danh sách chứa các instance của lớp "Button" với thuộc tính cụ thể của mỗi nút được truyền dưới dạng tham số
btns = [
    Button("Rock", 25, 200, (150, 50, 50), "images/búa.png"), 
    Button("Paper", 150, 200, (50, 100, 200), "images/bao.png"), 
    Button("Scissors", 275, 200, (50, 150, 50), "images/kéo.png")
]


# Hàm "main" được gọi khi người chơi đã vào trò chơi và logic chính bắt đầu tại đây.
def main():
    run = True
    clock = pygame.time.Clock()

    n = Network()
    player = int(n.getPlayer())  # Lấy người chơi từ server. player = 0 cho Player1 và = 1 cho Player2
    print("Bạn là Player ", player)

    # Danh sách lưu kết quả của mỗi trò chơi (cho một người chơi cụ thể) giữa hai người chơi.
    # Lưu thông tin dưới dạng [thắng, thua, hòa] trong trò chơi.
    scores = [0, 0, 0]

    while run:
        clock.tick(60)
        try:
            game = n.send("get")  # Gửi yêu cầu "get" đến server. Server trả về trò chơi bằng phương thức connection.sendall().
        except:
            run = False
            print("Không thể lấy trò chơi")
            break

        if game.bothGone():
            scoreUpdate(game, player, scores)  # Nếu cả hai người chơi đã đánh, tính điểm và cập nhật trong danh sách "scores"
            redrawWindow(win, game, player, scores)  # Vẽ lại cửa sổ đã cập nhật
            pygame.time.delay(500)

            try:
                game = n.send("reset")  # Yêu cầu này được gửi để về điểm khởi đầu của trò chơi để bắt đầu trò chơi mới.
            except:
                run = False
                print("Không thể lấy trò chơi")
                break

            # Hiển thị kết quả ở giữa màn hình sau 1 giây.
            font = pygame.font.SysFont("segoeui,arial,microsoftyahei", 48, bold=True)
            if (game.findWinner() == 1 and player == 1) or (game.findWinner() == 0 and player == 0):
                text = font.render("BẠN THẮNG!", 1, (0, 200, 0))
            elif game.findWinner() == -1:
                text = font.render("HÒA!", 1, (100, 100, 100))
            else:
                text = font.render("BẠN THUA!", 1, (200, 0, 0))
            
            win.blit(text, (WIDTH/2 -text.get_width()/2, HEIGHT/2 - text.get_height()/2))
            pygame.display.update()
            pygame.time.delay(1000)    # Chờ 1000ms


        for event in pygame.event.get():
            if event.type == pygame.QUIT:  # Đóng cửa sổ pygame nếu được thoát.
                run = False
                pygame.quit()

            if event.type == pygame.MOUSEBUTTONDOWN:
                pos = pygame.mouse.get_pos()  # Lấy vị trí nhấp chuột
                for btn in btns:
                    if btn.click(pos) and game.isConnected():  # Kiểm tra xem chuột có nhấp vào nút và trò chơi đã kết nối
                        # Nếu điều kiện trên được thỏa mãn, gửi văn bản của nút lên server để thực hiện nước đi của người chơi.
                        if player == 0:
                            if not game.p1Gone:  
                                n.send(btn.text) 
                        
                        else:
                            if not game.p2Gone:
                                n.send(btn.text)
        
        # Vẽ lại cửa sổ pygame với điểm đã cập nhật
        redrawWindow(win, game, player, scores) 


# Hàm Menu là trang chủ khi khởi động client. Người dùng được yêu cầu nhấp chuột vào cửa sổ để vào trò chơi.
def menu():
    run = True
    clock = pygame.time.Clock()

    while run:
        clock.tick(60)
        win.fill((100, 150, 255))
        font1 = pygame.font.SysFont("segoeui,arial,microsoftyahei", 40, bold=True)
        text1 = font1.render("KÉO BÚA BAO", 1, (255, 255, 255))
        text2 = font1.render("ONLINE", 1, (255, 255, 255))
        win.blit(text1, (WIDTH/2 -text1.get_width()/2, HEIGHT/2 - text1.get_height()/2 - 80))
        win.blit(text2, (WIDTH/2 - text2.get_width()/2, HEIGHT/2 - text2.get_height()/2 - 30))

        font = pygame.font.SysFont("segoeui,arial,microsoftyahei", 28, bold=True)
        text = font.render("Nhấn chuột để chơi!", 1, (255, 255, 0))
        win.blit(text, (WIDTH/2 - text.get_width()/2, HEIGHT/2 - text.get_height()/2 + 60))
        pygame.display.update()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:  # Đóng cửa sổ pygame nếu sự kiện thoát.
                pygame.quit()
                run = False

            # Nếu nút chuột được nhấn, người chơi vào trò chơi hoặc sẽ chờ đối thủ. Từ đó có tính năng "Nhấp để chơi"
            if event.type == pygame.MOUSEBUTTONDOWN:
                run = False

    # Khi người chơi vào trò chơi, bắt đầu trò chơi bằng cách gọi hàm main()
    main()


while True:  # Chuyển hướng đến menu-screen nếu đối thủ thoát trò chơi.
    menu()                      