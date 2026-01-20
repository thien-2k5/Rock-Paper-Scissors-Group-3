# 🎮 Rock-Paper-Scissors Online - Group 3

Game Kéo Búa Bao Online sử dụng kỹ thuật lập trình Socket theo mô hình Multi Client-Server.

## ✨ Tính năng

| Tính năng | Mô tả |
|-----------|-------|
| 🌐 **Chơi Online** | Tự động ghép cặp với người chơi khác |
| 🤖 **Chơi với Bot** | 3 độ khó: Dễ, Trung bình, Khó |
| 🏠 **Phòng riêng** | Tạo phòng và mời bạn bè bằng mã 6 ký tự |
| 🔊 **Âm thanh** | Hiệu ứng âm thanh cho thắng/thua/hòa |
| 📜 **Lịch sử** | Lưu và xem lại các trận đấu |
| 👤 **Tên người chơi** | Nhập tên để hiển thị trong game |
| 🔄 **Auto Reconnect** | Tự động kết nối lại khi mất mạng |
| ⏱️ **Auto Continue** | Tự động chơi ván mới trong phòng |

## 📋 Yêu cầu hệ thống

- Python 3.7 trở lên
- Trình duyệt web hiện đại (Chrome, Firefox, Edge...)
- Thư viện Python: websockets

## 🚀 Cài đặt và chạy

### 1. Clone repository
```bash
git clone https://github.com/thien-2k5/Rock-Paper-Scissors-Group-3.git
cd Rock-Paper-Scissors-Group-3
```

### 2. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 3. Chạy Server
```bash
python server/server.py
```

### 4. Mở Client

**Cách 1: Mở trực tiếp**
- Mở file `client/index.html` bằng trình duyệt

**Cách 2: Dùng HTTP Server**
```bash
cd client
python -m http.server 8000
```
Sau đó truy cập: `http://localhost:8000`

**Cách 3: Dùng Live Server (VS Code)**
- Click chuột phải vào `index.html` → Open With Live Server

## 🎯 Hướng dẫn chơi

### Chế độ Online 🌐
1. Nhập tên của bạn
2. Click **"Chơi Online"**
3. Đợi hệ thống ghép cặp với người chơi khác
4. Chọn Rock/Paper/Scissors và đợi kết quả

### Chế độ Bot 🤖
1. Chọn độ khó (Dễ/Trung bình/Khó)
2. Click **"Chơi với Bot"**
3. Chơi offline không cần server

### Phòng riêng 🏠
1. **Tạo phòng**: Click "Tạo phòng" → Nhận mã 6 ký tự
2. **Chia sẻ mã** cho bạn bè
3. **Vào phòng**: Nhập mã → Click "Vào"
4. Tự động chơi tiếp sau mỗi ván

## 🏗️ Kiến trúc

```
Rock-Paper-Scissors-Group-3/
├── client/
│   ├── index.html          # Giao diện chính
│   ├── css/
│   │   └── style.css       # Styles & animations
│   ├── js/
│   │   ├── game.js         # Logic game chính
│   │   ├── network.js      # WebSocket + Auto reconnect
│   │   ├── sounds.js       # Web Audio API sounds
│   │   ├── history.js      # Lịch sử trận đấu
│   │   └── bot.js          # AI Bot
│   └── assets/
│       └── images/         # Hình ảnh game
├── server/
│   ├── server.py           # WebSocket Server
│   └── game_logic.py       # Logic xử lý game
├── requirements.txt
└── README.md
```

### Công nghệ sử dụng:
- **Backend**: Python + WebSockets (asyncio)
- **Frontend**: HTML5 + CSS3 + Vanilla JavaScript
- **Audio**: Web Audio API
- **Storage**: localStorage
- **Protocol**: WebSocket

## 🎨 Screenshots

### Menu chính
- Nhập tên người chơi
- Chọn chế độ chơi: Online / Bot / Phòng riêng
- Chọn độ khó cho Bot
- Xem lịch sử trận đấu

### Màn hình chơi
- Hiển thị điểm số: Thắng / Hòa / Thua
- Hiển thị tên người chơi
- 3 nút chọn: Rock / Paper / Scissors
- Kết quả với hiệu ứng animation

## 👥 Nhóm phát triển

**Group 3**

## 📝 Ghi chú

- Server chạy tại: `ws://127.0.0.1:8080`
- Mỗi phòng tối đa 2 người chơi
- Hỗ trợ nhiều phòng/game đồng thời
- Âm thanh sử dụng Web Audio API (không cần file mp3)
- Lịch sử lưu 20 trận gần nhất

## 📄 License

MIT License