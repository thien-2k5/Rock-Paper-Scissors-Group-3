// network.js - Kết nối Socket với Python Server
// Với tính năng Auto Reconnect

class NetworkManager {
    constructor() {
        this.socket = null;
        this.playerId = null;
        this.playerName = null;
        this.isConnected = false;
        this.messageHandlers = {};
        this.messageQueue = '';

        // Reconnect settings
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000; // Start với 1 giây
        this.maxReconnectDelay = 30000; // Max 30 giây
        this.isReconnecting = false;
        this.shouldReconnect = true;

        // Connection info for reconnect
        this.lastHost = '127.0.0.1';
        this.lastPort = 8080;
        this.lastRoomCode = null;
    }

    // Kết nối tới Python Socket Server
    connect(host = '127.0.0.1', port = 8080, roomCode = null) {
        return new Promise((resolve, reject) => {
            try {
                this.lastHost = host;
                this.lastPort = port;
                this.lastRoomCode = roomCode;
                this.shouldReconnect = true;

                // Đóng connection cũ nếu có
                if (this.socket) {
                    this.socket.close();
                }

                // Tạo WebSocket connection
                this.socket = new WebSocket(`ws://${host}:${port}`);

                // Connection timeout
                const connectionTimeout = setTimeout(() => {
                    if (!this.isConnected) {
                        this.socket.close();
                        reject(new Error('Connection timeout'));
                    }
                }, 10000);

                this.socket.onopen = () => {
                    clearTimeout(connectionTimeout);
                    console.log('✅ Đã kết nối tới server');
                    this.isConnected = true;
                    this.isReconnecting = false;
                    this.reconnectAttempts = 0;
                    this.reconnectDelay = 1000;

                    // Trigger reconnected event nếu đang reconnect
                    if (this.messageHandlers['reconnected']) {
                        this.messageHandlers['reconnected']();
                    }

                    resolve();
                };

                this.socket.onmessage = (event) => {
                    this.handleMessage(event.data);
                };

                this.socket.onerror = (error) => {
                    clearTimeout(connectionTimeout);
                    console.error('❌ Lỗi kết nối:', error);
                    if (!this.isConnected) {
                        reject(error);
                    }
                };

                this.socket.onclose = (event) => {
                    clearTimeout(connectionTimeout);
                    console.log('🔌 Ngắt kết nối server', event.code, event.reason);
                    this.isConnected = false;

                    // Trigger disconnect event
                    if (this.messageHandlers['connectionLost']) {
                        this.messageHandlers['connectionLost']();
                    }

                    // Auto reconnect nếu không phải disconnect chủ động
                    if (this.shouldReconnect && !this.isReconnecting) {
                        this.attemptReconnect();
                    }
                };

            } catch (error) {
                console.error('❌ Không thể kết nối:', error);
                reject(error);
            }
        });
    }

    // Auto reconnect với exponential backoff
    async attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ Đã hết số lần thử kết nối lại');
            if (this.messageHandlers['reconnectFailed']) {
                this.messageHandlers['reconnectFailed']();
            }
            return;
        }

        this.isReconnecting = true;
        this.reconnectAttempts++;

        console.log(`🔄 Đang kết nối lại... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

        // Trigger reconnecting event
        if (this.messageHandlers['reconnecting']) {
            this.messageHandlers['reconnecting']({
                attempt: this.reconnectAttempts,
                maxAttempts: this.maxReconnectAttempts,
                delay: this.reconnectDelay
            });
        }

        // Wait trước khi reconnect
        await this.sleep(this.reconnectDelay);

        // Exponential backoff
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);

        try {
            await this.connect(this.lastHost, this.lastPort, this.lastRoomCode);

            // Rejoin game nếu có room code
            if (this.lastRoomCode) {
                this.send('joinRoom', {
                    roomCode: this.lastRoomCode,
                    playerName: this.playerName
                });
            }
        } catch (error) {
            console.error('Reconnect failed:', error);
            // Sẽ tự động retry từ onclose handler
        }
    }

    // Helper function sleep
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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

    // Hủy đăng ký handler
    off(messageType) {
        delete this.messageHandlers[messageType];
    }

    // Gửi message tới server
    send(messageType, data = {}) {
        if (!this.isConnected || !this.socket) {
            console.error('❌ Chưa kết nối tới server');
            return false;
        }

        const message = {
            type: messageType,
            playerId: this.playerId,
            playerName: this.playerName,
            ...data
        };

        console.log('📤 Gửi tới server:', message);
        this.socket.send(JSON.stringify(message));
        return true;
    }

    // Set player name
    setPlayerName(name) {
        this.playerName = name;
        if (this.isConnected) {
            this.send('setName', { name });
        }
    }

    // Ngắt kết nối (chủ động)
    disconnect() {
        this.shouldReconnect = false;
        this.isReconnecting = false;

        if (this.socket) {
            this.socket.close();
            this.socket = null;
            this.isConnected = false;
        }
    }

    // Reset reconnect state
    resetReconnect() {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.isReconnecting = false;
    }

    // Kiểm tra trạng thái
    getStatus() {
        return {
            isConnected: this.isConnected,
            isReconnecting: this.isReconnecting,
            reconnectAttempts: this.reconnectAttempts,
            playerId: this.playerId,
            playerName: this.playerName
        };
    }
}

window.NetworkManager = NetworkManager;