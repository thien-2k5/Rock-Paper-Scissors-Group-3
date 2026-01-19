// network.js - Kết nối Socket với Python Server

class NetworkManager {
    constructor() {
        this.socket = null;
        this.playerId = null;
        this.isConnected = false;
        this.messageHandlers = {};
        this.messageQueue = '';
    }

    // Kết nối tới Python Socket Server
    connect(host = '127.0.0.1', port = 8080) {
        return new Promise((resolve, reject) => {
            try {
                // Sử dụng WebSocket để kết nối tới Python server
                // CHÚ Ý: Bạn cần cài thêm thư viện websockets cho Python
                // HOẶC dùng proxy (khuyến nghị dùng Flask-SocketIO)
                this.socket = new WebSocket(`ws://${host}:${port}`);

                this.socket.onopen = () => {
                    console.log('✅ Đã kết nối tới server');
                    this.isConnected = true;
                    resolve();
                };

                this.socket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.socket.onerror = (error) => {
                    console.error('❌ Lỗi kết nối:', error);
                    reject(error);
                };

                this.socket.onclose = () => {
                    console.log('🔌 Ngắt kết nối server');
                    this.isConnected = false;
                    if (window.gameManager) {
                        window.gameManager.showScreen('menu');
                    }
                };

            } catch (error) {
                console.error('❌ Không thể kết nối:', error);
                reject(error);
            }
        });
    }

    // Xử lý message từ server
    handleMessage(data) {
        try {
            const message = JSON.parse(data);
            console.log('📨 Nhận từ server:', message);

            if (this.messageHandlers[message.type]) {
                this.messageHandlers[message.type](message);
            }

        } catch (error) {
            console.error('❌ Lỗi xử lý message:', error);
        }
    }

    // Đăng ký handler
    on(messageType, handler) {
        this.messageHandlers[messageType] = handler;
    }

    // Gửi message tới server
    send(messageType, data = {}) {
        if (!this.isConnected || !this.socket) {
            console.error('❌ Chưa kết nối tới server');
            return;
        }

        const message = {
            type: messageType,
            playerId: this.playerId,
            ...data
        };

        console.log('📤 Gửi tới server:', message);
        this.socket.send(JSON.stringify(message));
    }

    // Ngắt kết nối
    disconnect() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }
}

window.NetworkManager = NetworkManager;