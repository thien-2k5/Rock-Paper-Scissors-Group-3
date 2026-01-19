// game.js - Logic game chính

class GameManager {
    constructor() {
        this.network = new NetworkManager();
        this.playerId = null;
        this.gameId = null;
        this.playerMove = null;
        this.opponentMove = null;
        this.scores = { wins: 0, losses: 0, draws: 0 };
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupNetworkHandlers();
    }

    // Lấy các element HTML
    initializeElements() {
        this.screens = {
            menu: document.getElementById('menuScreen'),
            waiting: document.getElementById('waitingScreen'),
            game: document.getElementById('gameScreen')
        };

        this.elements = {
            playBtn: document.getElementById('playBtn'),
            playerId: document.getElementById('playerId'),
            playerMove: document.getElementById('playerMove'),
            opponentMove: document.getElementById('opponentMove'),
            playerStatus: document.getElementById('playerStatus'),
            opponentStatus: document.getElementById('opponentStatus'),
            resultBox: document.getElementById('resultBox'),
            resultText: document.getElementById('resultText'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            wins: document.getElementById('wins'),
            draws: document.getElementById('draws'),
            losses: document.getElementById('losses'),
            moveButtons: document.querySelectorAll('.move-btn')
        };
    }

    // Setup các sự kiện click
    setupEventListeners() {
        // Nút Play trong menu
        this.elements.playBtn.addEventListener('click', () => {
            this.startGame();
        });

        // Nút Play Again
        this.elements.playAgainBtn.addEventListener('click', () => {
            this.resetRound();
        });

        // Các nút Rock, Paper, Scissors
        this.elements.moveButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const move = btn.dataset.move;
                this.makeMove(move);
            });
        });
    }

    // Setup các handler nhận message từ server
    setupNetworkHandlers() {
        // Khi được gán Player ID
        this.network.on('playerId', (message) => {
            this.playerId = message.playerId;
            console.log(`🎮 Bạn là Player ${this.playerId}`);
            this.elements.playerId.textContent = `Bạn là Player ${this.playerId}`;
        });

        // Khi game bắt đầu (đủ 2 người chơi)
        this.network.on('gameStart', (message) => {
            this.gameId = message.gameId;
            console.log('🎮 Game bắt đầu!');
            this.showScreen('game');
        });

        // Khi đối thủ đã chọn nước đi
        this.network.on('opponentReady', () => {
            this.updateOpponentStatus('Đã chọn ✓');
        });

        // Khi cả hai đã chọn - nhận kết quả
        this.network.on('gameResult', (message) => {
            this.showResult(message);
        });

        // Khi đối thủ disconnect
        this.network.on('opponentDisconnect', () => {
            alert('Đối thủ đã thoát game!');
            this.resetGame();
            this.showScreen('menu');
        });
    }

    // Bắt đầu game
    async startGame() {
        try {
            // Kết nối tới server
            await this.network.connect('127.0.0.1', 8080);
            
            // Chuyển sang màn hình chờ
            this.showScreen('waiting');
            
            // Gửi yêu cầu join game
            this.network.send('joinGame');

        } catch (error) {
            console.error('❌ Không thể kết nối server:', error);
            alert('Không thể kết nối tới server!\n\nVui lòng kiểm tra:\n1. Server Python đã chạy chưa?\n2. Địa chỉ và port có đúng không?');
            this.showScreen('menu');
        }
    }

    // Thực hiện nước đi
    makeMove(move) {
        if (this.playerMove) return; // Đã chọn rồi

        this.playerMove = move;
        this.updatePlayerMove(move);
        this.disableMoveButtons();

        // Gửi nước đi tới server
        this.network.send('makeMove', { move });
    }

    // Hiển thị kết quả
    showResult(message) {
        const { playerMove, opponentMove, result } = message;

        // Hiển thị nước đi của đối thủ
        this.opponentMove = opponentMove;
        this.updateOpponentMove(opponentMove);

        // Cập nhật điểm
        if (result === 'win') {
            this.scores.wins++;
        } else if (result === 'lose') {
            this.scores.losses++;
        } else {
            this.scores.draws++;
        }
        this.updateScores();

        // Hiển thị kết quả sau 500ms
        setTimeout(() => {
            this.elements.resultBox.classList.remove('hidden');
            this.elements.resultText.className = result;

            if (result === 'win') {
                this.elements.resultText.textContent = '🎉 BẠN THẮNG! 🎉';
            } else if (result === 'lose') {
                this.elements.resultText.textContent = '😢 BẠN THUA! 😢';
            } else {
                this.elements.resultText.textContent = '🤝 HÒA! 🤝';
            }
        }, 500);
    }

    // Reset để chơi ván mới
    resetRound() {
        this.playerMove = null;
        this.opponentMove = null;

        this.elements.resultBox.classList.add('hidden');
        this.elements.playerMove.querySelector('.move-icon').textContent = '❓';
        this.elements.opponentMove.querySelector('.move-icon').textContent = '❓';
        this.elements.playerStatus.textContent = 'Đang chờ...';
        this.elements.opponentStatus.textContent = 'Đang chờ...';

        this.enableMoveButtons();
    }

    // Reset toàn bộ game
    resetGame() {
        this.playerMove = null;
        this.opponentMove = null;
        this.scores = { wins: 0, losses: 0, draws: 0 };
        this.updateScores();
        this.resetRound();
    }

    // Cập nhật nước đi của player
    updatePlayerMove(move) {
        const icon = this.getMoveIcon(move);
        this.elements.playerMove.querySelector('.move-icon').innerHTML = icon;
        this.elements.playerStatus.textContent = move;
    }

    // Cập nhật nước đi của opponent
    updateOpponentMove(move) {
        const icon = this.getMoveIcon(move);
        this.elements.opponentMove.querySelector('.move-icon').innerHTML = icon;
        this.elements.opponentStatus.textContent = move;
    }

    // Cập nhật trạng thái opponent
    updateOpponentStatus(status) {
        this.elements.opponentMove.querySelector('.move-icon').textContent = '✅';
        this.elements.opponentStatus.textContent = status;
    }

    // Lấy icon cho move (sử dụng hình ảnh)
    getMoveIcon(move) {
        const icons = {
            'Rock': '<img src="assets/images/rock.png" alt="Rock" class="move-image">',
            'Paper': '<img src="assets/images/paper.png" alt="Paper" class="move-image">',
            'Scissors': '<img src="assets/images/scissors.png" alt="Scissors" class="move-image">'
        };
        return icons[move] || '❓';
    }

    // Cập nhật điểm số
    updateScores() {
        this.elements.wins.textContent = this.scores.wins;
        this.elements.draws.textContent = this.scores.draws;
        this.elements.losses.textContent = this.scores.losses;
    }

    // Vô hiệu hóa các nút move
    disableMoveButtons() {
        this.elements.moveButtons.forEach(btn => {
            btn.disabled = true;
        });
    }

    // Kích hoạt các nút move
    enableMoveButtons() {
        this.elements.moveButtons.forEach(btn => {
            btn.disabled = false;
        });
    }

    // Chuyển đổi màn hình
    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        this.screens[screenName].classList.add('active');
    }
}

// Khởi tạo game khi trang load xong
window.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
    console.log('🎮 Game đã sẵn sàng!');
});