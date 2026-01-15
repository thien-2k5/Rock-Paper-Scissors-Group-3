# -*- coding: utf-8 -*-
import socket
from threading import Thread
from threading import Lock
import pickle
from gameLogic import Game

"""
SERVER lưu địa chỉ IPv4 của hệ thống.
Bạn cần cập nhật dòng này khi clone repository từ GitHub.
"""
SERVER = "127.0.0.1"
PORT = 5555

# Khởi tạo socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    s.bind((SERVER, PORT))
except socket.error as e:
    str(e)

# Server lắng nghe 2 kết nối
s.listen(2)
print("Server đã khởi động... Đang chờ người chơi tham gia..")

games = {}
idCount = 0
# Khởi tạo Mutex Lock từ thư viện threading của Python
lock = Lock()

def handleConnection(lock, con, p, gameId):
    # Kích hoạt Mutex lock tại đây..
    with lock:
        global idCount
        con.send(str.encode(str(p)))
        while True:
            try:
                # Server nhận dữ liệu từ client ở mỗi giai đoạn của trò chơi bằng hàm recv() và giải mã bằng hàm decode()
                data = con.recv(4096).decode()
                
                if gameId in games:
                    game = games[gameId]

                    if not data:
                        if lock.locked():
                            lock.release()
                        break
                    else:
                        if data == "reset":
                            # Yêu cầu reset trò chơi về vị trí ban đầu để nhận nước đi của người chơi lại
                            game.resetGame()
                        elif data != "get":
                            # Đảm bảo nước đi của mỗi người chơi được ghi nhận.
                            # Hàm này thực hiện nước đi được gửi từ client dưới dạng "data" và cập nhật p1Gone hoặc p2Gone
                            game.play(p, data)

                        # Instance "game" đã thay đổi sau đó được gửi đến client bằng hàm sendall() và sử dụng thư viện pickle
                        con.sendall(pickle.dumps(game))
                        if lock.locked():
                            lock.release()
                else:
                    if lock.locked():
                        lock.release()
                    break
            
            except:
                if lock.locked():
                    lock.release()
                break

        
        print("Mất kết nối")

        try:
            del games[gameId]
            print("Đóng trò chơi", gameId)
        except:
            pass

        idCount -= 1
        """
        Có thể thấy rằng, khối lệnh:
            if lock.locked():
                lock.release()

        được sử dụng nhiều lần trong hàm này. Điều này là vì ở mỗi giai đoạn của trò chơi, 
        luồng hiện tại phải chờ luồng tiếp theo. Vì nó chứa trò chơi của người chơi khác.
        Vì vậy việc giải phóng Mutex Lock khi cần thiết là rất quan trọng.
        """
        if lock.locked():
            lock.release()
        # Kết nối được đóng khi trò chơi dừng
        con.close()

    
while True:
    con, addr = s.accept()
    print("Server đã kết nối đến: ", addr)

    idCount += 1
    p = 0
    # gameId lưu id cho mỗi trò chơi. Nó là duy nhất cho mỗi cặp người chơi.
    gameId = (idCount - 1) // 2

    if idCount % 2 == 1:
        # Nếu idCount là số lẻ, chỉ có 1 trong 2 người chơi đã tham gia và đang chờ đối thủ.
        # Bước này cũng yêu cầu tạo một instance mới của Game với gameId làm tham số
        games[gameId] = Game(gameId)
        print("Đang tạo trò chơi mới...")
        
    else:
        # Nếu idCount là số chẵn, người chơi thứ hai đã đến lobby.
        games[gameId].ready = True
        p = 1

    # Tạo một luồng mới cho mỗi người chơi sử dụng thư viện threading.
    Thread(target = handleConnection, args = (lock, con, p, gameId)).start()
