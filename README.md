# 🎮 Rock-Paper-Scissors Online - Group 3

Game Kéo Búa Bao Online sử dụng kỹ thuật lập trình Socket theo mô hình Multi Client-Server.

## 📋 Yêu cầu hệ thống

- Python 3.7 trở lên
- Trình duyệt web hiện đại (Chrome, Firefox, Edge...)
- Thư viện Python: websockets

## 🚀 Cài đặt và chạy

### 1. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 2. Chạy Server
```bash
python server/server.py
```

### 3. Mở Client

**Cách 1: Mở trực tiếp**
- Mở file `client/index.html` bằng trình duyệt

**Cách 2: Dùng HTTP Server (Khuyến nghị)**
```bash
cd client
python -m http.server 8000
```
Sau đó truy cập: `http://localhost:8000`

**Cách 3: Dùng Live Server (Khuyến nghị)**
- Trong file index.html click chuột phải vào vùng bất kì chọn Open With Live Server

### 4. Chơi game

- Mở 2 tab/cửa sổ trình duyệt
- Nhấn "Nhấn để chơi!" ở cả 2 tab
- Khi đủ 2 người chơi, game tự động bắt đầu!

## 🎯 Cách chơi

1. Chọn Rock (🪨), Paper (📄), hoặc Scissors (✂️)
2. Đợi đối thủ chọn
3. Xem kết quả:
   - Rock đánh bại Scissors
   - Scissors đánh bại Paper
   - Paper đánh bại Rock
4. Nhấn "Chơi tiếp" để chơi ván mới

## 🏗️ Kiến trúc

- **Backend**: Python WebSocket Server (Multi-threaded)
- **Frontend**: HTML + CSS + JavaScript
- **Communication**: WebSocket Protocol
- **Design Pattern**: Client-Server Architecture

## 👥 Nhóm phát triển

Group 3

## 📝 Ghi chú

- Server chạy tại: `ws://127.0.0.1:8080`
- Tối đa 2 người chơi mỗi game
- Hỗ trợ nhiều game đồng thời