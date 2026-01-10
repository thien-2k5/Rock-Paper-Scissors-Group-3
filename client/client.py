import socket
import threading

def handle_server_messages(client_socket):
    """Xử lý tin nhắn từ server trong một luồng riêng"""
    while True:
        try:
            message = client_socket.recv(1024).decode('utf-8')
            if message:
                print(f"\n{message}")
                if "Kết thúc trò chơi" in message or "thắng" in message or "thua" in message:
                    print("\nNhập 'exit' để thoát hoặc chờ ván mới...")
        except:
            print("\nMất kết nối với server!")
            break

def main():
    # Cấu hình kết nối
    host = '127.0.0.1'
    port = 5555
    
    print("=== CLIENT TRÒ CHƠI KÉO BÚA BAO ===")
    print(f"Kết nối đến server: {host}:{port}")
    
    try:
        # Tạo socket kết nối đến server
        client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        client.connect((host, port))
        print("Kết nối thành công!\n")
        
        # Nhận thông điệp chào mừng từ server
        welcome_msg = client.recv(1024).decode('utf-8')
        print(welcome_msg)
        
        # Tạo luồng riêng để nhận tin nhắn từ server
        server_thread = threading.Thread(target=handle_server_messages, args=(client,))
        server_thread.daemon = True
        server_thread.start()
        
        # Vòng lặp gửi lựa chọn người chơi
        while True:
            choice = input("\nNhập lựa chọn (rock/paper/scissors) hoặc 'exit' để thoát: ").strip().lower()
            
            if choice == 'exit':
                client.send(choice.encode('utf-8'))
                print("Đang thoát...")
                break
            elif choice in ['rock', 'paper', 'scissors']:
                client.send(choice.encode('utf-8'))
                print(f"Đã gửi: {choice}")
            else:
                print("Lựa chọn không hợp lệ! Vui lòng chọn: rock, paper hoặc scissors")
                
    except ConnectionRefusedError:
        print("Không thể kết nối đến server. Vui lòng kiểm tra địa chỉ và cổng!")
    except Exception as e:
        print(f"Có lỗi xảy ra: {e}")
    finally:
        try:
            client.close()
        except:
            pass
        print("Client đã đóng kết nối.")

if __name__ == "__main__":
    main()