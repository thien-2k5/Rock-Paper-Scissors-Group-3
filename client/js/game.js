// game.js - Logic game chính với đầy đủ tính năng

class GameManager {
    constructor() {
        this.network = new NetworkManager();
        this.bot = null;
        this.playerId = null;
        this.playerName = this.loadPlayerName();
        this.opponentName = 'Đối thủ';
        this.gameId = null;
        this.roomCode = null;
        this.playerMove = null;
        this.opponentMove = null;
        this.scores = { wins: 0, losses: 0, draws: 0 };
        this.gameMode = 'online'; // 'online', 'bot', 'room'
        this.botDifficulty = 'medium';

        this.initializeElements();
        this.setupEventListeners();
        this.setupNetworkHandlers();
        this.updatePlayerNameDisplay();
    }

    // Load tên người chơi từ localStorage
    loadPlayerName() {
        return localStorage.getItem('rps_player_name') || '';
    }

    // Lưu tên người chơi
    savePlayerName(name) {
        this.playerName = name;
        localStorage.setItem('rps_player_name', name);
    }

    // Lấy các element HTML
    initializeElements() {
        this.screens = {
            menu: document.getElementById('menuScreen'),
            waiting: document.getElementById('waitingScreen'),
            game: document.getElementById('gameScreen'),
            history: document.getElementById('historyScreen')
        };

        this.elements = {
            // Menu elements
            playerNameInput: document.getElementById('playerNameInput'),
            playOnlineBtn: document.getElementById('playOnlineBtn'),
            playBotBtn: document.getElementById('playBotBtn'),
            createRoomBtn: document.getElementById('createRoomBtn'),
            roomCodeInput: document.getElementById('roomCodeInput'),
            joinRoomBtn: document.getElementById('joinRoomBtn'),
            historyBtn: document.getElementById('historyBtn'),
            botDifficulty: document.getElementById('botDifficulty'),

            // Waiting elements
            playerId: document.getElementById('playerId'),
            waitingText: document.getElementById('waitingText'),
            roomCodeDisplay: document.getElementById('roomCodeDisplay'),
            copyRoomCodeBtn: document.getElementById('copyRoomCodeBtn'),
            cancelWaitBtn: document.getElementById('cancelWaitBtn'),

            // Game elements
            playerMove: document.getElementById('playerMove'),
            opponentMove: document.getElementById('opponentMove'),
            playerStatus: document.getElementById('playerStatus'),
            opponentStatus: document.getElementById('opponentStatus'),
            playerNameDisplay: document.getElementById('playerNameDisplay'),
            opponentNameDisplay: document.getElementById('opponentNameDisplay'),
            resultBox: document.getElementById('resultBox'),
            resultText: document.getElementById('resultText'),
            playAgainBtn: document.getElementById('playAgainBtn'),
            backToMenuBtn: document.getElementById('backToMenuBtn'),
            wins: document.getElementById('wins'),
            draws: document.getElementById('draws'),
            losses: document.getElementById('losses'),
            moveButtons: document.querySelectorAll('.move-btn'),
            gameModeIndicator: document.getElementById('gameModeIndicator'),

            // Sound toggle
            soundToggle: document.getElementById('soundToggle'),

            // Reconnect overlay
            reconnectOverlay: document.getElementById('reconnectOverlay'),
            reconnectText: document.getElementById('reconnectText'),
            reconnectCancel: document.getElementById('reconnectCancel'),

            // History elements
            historyList: document.getElementById('historyList'),
            historyStats: document.getElementById('historyStats'),
            clearHistoryBtn: document.getElementById('clearHistoryBtn'),
            closeHistoryBtn: document.getElementById('closeHistoryBtn')
        };
    }

    // Setup các sự kiện click
    setupEventListeners() {
        // Player name input
        if (this.elements.playerNameInput) {
            this.elements.playerNameInput.value = this.playerName;
            this.elements.playerNameInput.addEventListener('input', (e) => {
                this.savePlayerName(e.target.value.trim());
            });
        }

        // Play Online
        if (this.elements.playOnlineBtn) {
            this.elements.playOnlineBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.startOnlineGame();
            });
        }

        // Play vs Bot
        if (this.elements.playBotBtn) {
            this.elements.playBotBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.startBotGame();
            });
        }

        // Create Room
        if (this.elements.createRoomBtn) {
            this.elements.createRoomBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.createRoom();
            });
        }

        // Join Room
        if (this.elements.joinRoomBtn) {
            this.elements.joinRoomBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.joinRoom();
            });
        }

        // History button
        if (this.elements.historyBtn) {
            this.elements.historyBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.showHistory();
            });
        }

        // Bot difficulty
        if (this.elements.botDifficulty) {
            this.elements.botDifficulty.addEventListener('change', (e) => {
                this.botDifficulty = e.target.value;
            });
        }

        // Copy room code
        if (this.elements.copyRoomCodeBtn) {
            this.elements.copyRoomCodeBtn.addEventListener('click', () => {
                this.copyRoomCode();
            });
        }

        // Cancel waiting
        if (this.elements.cancelWaitBtn) {
            this.elements.cancelWaitBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.cancelWaiting();
            });
        }

        // Play Again
        if (this.elements.playAgainBtn) {
            this.elements.playAgainBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.resetRound();
            });
        }

        // Back to Menu
        if (this.elements.backToMenuBtn) {
            this.elements.backToMenuBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.backToMenu();
            });
        }

        // Move buttons
        this.elements.moveButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundManager?.playMoveSelect();
                const move = btn.dataset.move;
                this.makeMove(move);
            });

            btn.addEventListener('mouseenter', () => {
                window.soundManager?.playHover();
            });
        });

        // Sound toggle
        if (this.elements.soundToggle) {
            this.elements.soundToggle.addEventListener('click', () => {
                this.toggleSound();
            });
            this.updateSoundToggle();
        }

        // Reconnect cancel
        if (this.elements.reconnectCancel) {
            this.elements.reconnectCancel.addEventListener('click', () => {
                this.network.shouldReconnect = false;
                this.hideReconnectOverlay();
                this.showScreen('menu');
            });
        }

        // History controls
        if (this.elements.clearHistoryBtn) {
            this.elements.clearHistoryBtn.addEventListener('click', () => {
                if (confirm('Bạn có chắc muốn xóa lịch sử?')) {
                    window.matchHistory?.clearHistory();
                    this.renderHistory();
                }
            });
        }

        if (this.elements.closeHistoryBtn) {
            this.elements.closeHistoryBtn.addEventListener('click', () => {
                window.soundManager?.playClick();
                this.showScreen('menu');
            });
        }
    }

    // Setup các handler nhận message từ server
    setupNetworkHandlers() {
        // Player ID
        this.network.on('playerId', (message) => {
            this.playerId = message.playerId;
            console.log(`🎮 Bạn là Player ${this.playerId}`);
            if (this.elements.playerId) {
                this.elements.playerId.textContent = `ID: ${this.playerId}`;
            }
        });

        // Room created
        this.network.on('roomCreated', (message) => {
            this.roomCode = message.roomCode;
            this.showRoomCode(message.roomCode);
            console.log(`🏠 Phòng đã tạo: ${message.roomCode}`);
        });

        // Room joined
        this.network.on('roomJoined', (message) => {
            this.roomCode = message.roomCode;
            this.opponentName = message.opponentName || 'Đối thủ';
            console.log(`🚪 Đã vào phòng: ${message.roomCode}`);
        });

        // Room error
        this.network.on('roomError', (message) => {
            alert(message.error || 'Không thể vào phòng');
            this.showScreen('menu');
        });

        // Game start
        this.network.on('gameStart', (message) => {
            this.gameId = message.gameId;
            this.opponentName = message.opponentName || 'Đối thủ';
            console.log('🎮 Game bắt đầu!');
            window.soundManager?.playGameStart();
            this.showScreen('game');
            this.updateGameModeIndicator();
            this.updateOpponentNameDisplay();
        });

        // Opponent ready
        this.network.on('opponentReady', () => {
            this.updateOpponentStatus('Đã chọn ✓');
        });

        // Game result
        this.network.on('gameResult', (message) => {
            this.showResult(message);
        });

        // Opponent disconnect
        this.network.on('opponentDisconnect', () => {
            window.soundManager?.playPlayerLeave();

            if (this.gameMode === 'room' && this.roomCode) {
                // Trong room mode: ở lại phòng chờ người mới
                alert('Đối thủ đã rời phòng. Đang chờ người chơi mới...');
                this.resetRoundOnly();
                this.showScreen('waiting');
                this.showRoomCode(this.roomCode);
                this.updateWaitingText('Đối thủ đã rời. Đang chờ người mới...');
            } else {
                // Online mode: về menu
                alert('Đối thủ đã thoát game!');
                this.resetGame();
                this.showScreen('menu');
            }
        });

        // Reconnecting
        this.network.on('reconnecting', (data) => {
            this.showReconnectOverlay(data.attempt, data.maxAttempts);
        });

        // Reconnected
        this.network.on('reconnected', () => {
            this.hideReconnectOverlay();
            window.soundManager?.playPlayerJoin();
        });

        // Reconnect failed
        this.network.on('reconnectFailed', () => {
            this.hideReconnectOverlay();
            alert('Không thể kết nối lại server!');
            this.showScreen('menu');
        });

        // Connection lost
        this.network.on('connectionLost', () => {
            if (this.gameMode === 'online' || this.gameMode === 'room') {
                this.showReconnectOverlay(0, this.network.maxReconnectAttempts);
            }
        });
    }

    // === GAME MODES ===

    // Chơi Online
    async startOnlineGame() {
        this.gameMode = 'online';
        try {
            await this.network.connect('127.0.0.1', 8080);
            this.network.setPlayerName(this.playerName || 'Player');
            this.showScreen('waiting');
            this.updateWaitingText('Đang tìm đối thủ...');
            this.hideRoomCode();
            this.network.send('joinGame', { playerName: this.playerName });
        } catch (error) {
            console.error('❌ Không thể kết nối server:', error);
            alert('Không thể kết nối tới server!\n\nVui lòng kiểm tra:\n1. Server Python đã chạy chưa?\n2. Địa chỉ và port có đúng không?');
        }
    }

    // Chơi với Bot
    startBotGame() {
        this.gameMode = 'bot';
        this.bot = new BotPlayer(this.botDifficulty);
        this.opponentName = this.bot.name;
        this.gameId = 'bot-' + Date.now();

        window.soundManager?.playGameStart();
        this.showScreen('game');
        this.updateGameModeIndicator();
        this.updateOpponentNameDisplay();
    }

    // Tạo phòng
    async createRoom() {
        this.gameMode = 'room';
        try {
            await this.network.connect('127.0.0.1', 8080);
            this.network.setPlayerName(this.playerName || 'Player');
            this.showScreen('waiting');
            this.updateWaitingText('Đang tạo phòng...');
            this.network.send('createRoom', { playerName: this.playerName });
        } catch (error) {
            console.error('❌ Không thể kết nối server:', error);
            alert('Không thể kết nối tới server!');
        }
    }

    // Vào phòng
    async joinRoom() {
        const roomCode = this.elements.roomCodeInput?.value.trim().toUpperCase();
        if (!roomCode) {
            alert('Vui lòng nhập mã phòng!');
            return;
        }

        // Validate room code length
        if (roomCode.length !== 6) {
            alert('Mã phòng phải có đúng 6 ký tự!\nVí dụ: ABC123');
            return;
        }

        this.gameMode = 'room';
        try {
            await this.network.connect('127.0.0.1', 8080);
            this.network.setPlayerName(this.playerName || 'Player');
            this.network.lastRoomCode = roomCode;
            this.showScreen('waiting');
            this.updateWaitingText('Đang vào phòng...');
            this.network.send('joinRoom', {
                roomCode,
                playerName: this.playerName
            });
        } catch (error) {
            console.error('❌ Không thể kết nối server:', error);
            alert('Không thể kết nối tới server!');
        }
    }

    // Hủy chờ
    cancelWaiting() {
        this.network.disconnect();
        this.showScreen('menu');
    }

    // Quay lại menu
    backToMenu() {
        if (this.gameMode !== 'bot') {
            this.network.disconnect();
        }
        this.resetGame();
        this.showScreen('menu');
    }

    // === GAME LOGIC ===

    // Thực hiện nước đi
    makeMove(move) {
        if (this.playerMove) return;

        this.playerMove = move;
        this.updatePlayerMove(move);
        this.disableMoveButtons();

        if (this.gameMode === 'bot') {
            // Chế độ bot
            this.bot.recordPlayerMove(move);
            this.updateOpponentStatus('Đang suy nghĩ...');

            // Delay để tạo cảm giác bot đang nghĩ
            setTimeout(() => {
                const botMove = this.bot.getMove();
                const result = BotPlayer.calculateResult(move, botMove);

                this.showResult({
                    playerMove: move,
                    opponentMove: botMove,
                    result: result
                });
            }, 500 + Math.random() * 1000);
        } else {
            // Chế độ online
            this.network.send('makeMove', { move });
        }
    }

    // Hiển thị kết quả
    showResult(message) {
        const { playerMove, opponentMove, result } = message;

        this.opponentMove = opponentMove;
        this.updateOpponentMove(opponentMove);

        // Play sound
        if (result === 'win') {
            window.soundManager?.playWin();
            this.scores.wins++;
        } else if (result === 'lose') {
            window.soundManager?.playLose();
            this.scores.losses++;
        } else {
            window.soundManager?.playDraw();
            this.scores.draws++;
        }
        this.updateScores();

        // Lưu lịch sử
        window.matchHistory?.addMatch({
            playerName: this.playerName || 'Bạn',
            opponentName: this.opponentName,
            playerMove: playerMove,
            opponentMove: opponentMove,
            result: result,
            gameMode: this.gameMode,
            roomCode: this.roomCode
        });

        // Hiển thị kết quả
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

            // Trong room mode hoặc online: tự động chơi tiếp sau 2 giây
            if (this.gameMode === 'room' || this.gameMode === 'online') {
                // Ẩn nút "Chơi tiếp", chỉ hiện nút "Rời phòng/Menu"
                if (this.elements.playAgainBtn) {
                    this.elements.playAgainBtn.style.display = 'none';
                }

                // Hiện countdown
                let countdown = 2;
                const countdownInterval = setInterval(() => {
                    if (countdown > 0) {
                        this.elements.resultText.textContent += `\n⏱️ Ván mới trong ${countdown}s...`;
                        countdown--;
                    } else {
                        clearInterval(countdownInterval);
                        this.resetRound();
                    }
                }, 1000);
            } else {
                // Bot mode: hiện nút chơi tiếp
                if (this.elements.playAgainBtn) {
                    this.elements.playAgainBtn.style.display = 'inline-block';
                }
            }
        }, 500);
    }

    // Reset ván chơi
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

    // Reset chỉ ván chơi (giữ điểm số và room code)
    resetRoundOnly() {
        this.playerMove = null;
        this.opponentMove = null;
        this.opponentName = 'Đối thủ';

        if (this.elements.resultBox) {
            this.elements.resultBox.classList.add('hidden');
        }
        if (this.elements.playerMove) {
            this.elements.playerMove.querySelector('.move-icon').textContent = '❓';
        }
        if (this.elements.opponentMove) {
            this.elements.opponentMove.querySelector('.move-icon').textContent = '❓';
        }
        if (this.elements.playerStatus) {
            this.elements.playerStatus.textContent = 'Đang chờ...';
        }
        if (this.elements.opponentStatus) {
            this.elements.opponentStatus.textContent = 'Đang chờ...';
        }

        this.enableMoveButtons();
    }

    // Reset toàn bộ game
    resetGame() {
        this.playerMove = null;
        this.opponentMove = null;
        this.scores = { wins: 0, losses: 0, draws: 0 };
        this.roomCode = null;
        this.bot = null;
        this.updateScores();
        this.resetRound();
    }

    // === UI UPDATES ===

    updatePlayerMove(move) {
        const icon = this.getMoveIcon(move);
        this.elements.playerMove.querySelector('.move-icon').innerHTML = icon;
        this.elements.playerStatus.textContent = move;
    }

    updateOpponentMove(move) {
        const icon = this.getMoveIcon(move);
        this.elements.opponentMove.querySelector('.move-icon').innerHTML = icon;
        this.elements.opponentStatus.textContent = move;
    }

    updateOpponentStatus(status) {
        this.elements.opponentMove.querySelector('.move-icon').textContent = '✅';
        this.elements.opponentStatus.textContent = status;
    }

    getMoveIcon(move) {
        const icons = {
            'Rock': '<img src="assets/images/rock.png" alt="Rock" class="move-image">',
            'Paper': '<img src="assets/images/paper.png" alt="Paper" class="move-image">',
            'Scissors': '<img src="assets/images/scissors.png" alt="Scissors" class="move-image">'
        };
        return icons[move] || '❓';
    }

    updateScores() {
        this.elements.wins.textContent = this.scores.wins;
        this.elements.draws.textContent = this.scores.draws;
        this.elements.losses.textContent = this.scores.losses;
    }

    updatePlayerNameDisplay() {
        if (this.elements.playerNameDisplay) {
            this.elements.playerNameDisplay.textContent = this.playerName || 'Bạn';
        }
    }

    updateOpponentNameDisplay() {
        if (this.elements.opponentNameDisplay) {
            this.elements.opponentNameDisplay.textContent = this.opponentName;
        }
    }

    updateGameModeIndicator() {
        if (this.elements.gameModeIndicator) {
            const modeText = {
                'online': '🌐 Online',
                'bot': '🤖 vs Bot',
                'room': '🏠 Phòng: ' + (this.roomCode || '')
            };
            this.elements.gameModeIndicator.textContent = modeText[this.gameMode] || '';
        }
    }

    updateWaitingText(text) {
        if (this.elements.waitingText) {
            this.elements.waitingText.textContent = text;
        }
    }

    showRoomCode(code) {
        console.log('📋 Hiển thị mã phòng:', code);
        if (this.elements.roomCodeDisplay) {
            this.elements.roomCodeDisplay.textContent = code;
            // Tìm container cha có class room-code-container
            const container = this.elements.roomCodeDisplay.closest('.room-code-container');
            if (container) {
                container.classList.remove('hidden');
            }
        }
        this.updateWaitingText('Đang chờ đối thủ vào phòng...');
    }

    hideRoomCode() {
        if (this.elements.roomCodeDisplay) {
            this.elements.roomCodeDisplay.parentElement.classList.add('hidden');
        }
    }

    copyRoomCode() {
        if (this.roomCode) {
            navigator.clipboard.writeText(this.roomCode).then(() => {
                alert('Đã copy mã phòng: ' + this.roomCode);
            });
        }
    }

    disableMoveButtons() {
        this.elements.moveButtons.forEach(btn => btn.disabled = true);
    }

    enableMoveButtons() {
        this.elements.moveButtons.forEach(btn => btn.disabled = false);
    }

    // === SOUND ===

    toggleSound() {
        const isMuted = window.soundManager?.toggleMute();
        this.updateSoundToggle();
        if (!isMuted) {
            window.soundManager?.playClick();
        }
    }

    updateSoundToggle() {
        if (this.elements.soundToggle) {
            const isMuted = window.soundManager?.isMuted;
            this.elements.soundToggle.textContent = isMuted ? '🔇' : '🔊';
            this.elements.soundToggle.classList.toggle('muted', isMuted);
        }
    }

    // === RECONNECT OVERLAY ===

    showReconnectOverlay(attempt, max) {
        if (this.elements.reconnectOverlay) {
            this.elements.reconnectOverlay.classList.remove('hidden');
            if (this.elements.reconnectText) {
                this.elements.reconnectText.textContent =
                    `Đang kết nối lại... (${attempt}/${max})`;
            }
        }
    }

    hideReconnectOverlay() {
        if (this.elements.reconnectOverlay) {
            this.elements.reconnectOverlay.classList.add('hidden');
        }
    }

    // === HISTORY ===

    showHistory() {
        this.renderHistory();
        this.showScreen('history');
    }

    renderHistory() {
        if (this.elements.historyStats) {
            this.elements.historyStats.innerHTML = window.matchHistory?.renderStats() || '';
        }

        if (this.elements.historyList) {
            const matches = window.matchHistory?.getRecentMatches(10) || [];
            if (matches.length === 0) {
                this.elements.historyList.innerHTML = '<p class="no-history">Chưa có trận đấu nào</p>';
            } else {
                this.elements.historyList.innerHTML = matches
                    .map(m => window.matchHistory.renderMatchCard(m))
                    .join('');
            }
        }
    }

    // === SCREEN MANAGEMENT ===

    showScreen(screenName) {
        Object.values(this.screens).forEach(screen => {
            if (screen) screen.classList.remove('active');
        });
        if (this.screens[screenName]) {
            this.screens[screenName].classList.add('active');
        }
    }
}

// Khởi tạo game khi trang load
window.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
    console.log('🎮 Game đã sẵn sàng!');
});