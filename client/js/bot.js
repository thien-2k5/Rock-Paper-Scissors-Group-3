// bot.js - AI Bot cho chế độ chơi đơn

class BotPlayer {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty; // 'easy', 'medium', 'hard'
        this.name = this.getBotName();
        this.moveHistory = [];
        this.playerMoveHistory = [];
    }

    // Tên bot ngẫu nhiên
    getBotName() {
        const names = [
            '🤖 Bot Alpha',
            '🤖 Bot Beta',
            '🤖 Bot Gamma',
            '🤖 RoboPlayer',
            '🤖 AI Master',
            '🤖 DeepRPS',
            '🤖 SmartBot'
        ];
        return names[Math.floor(Math.random() * names.length)];
    }

    // Lấy nước đi của bot
    getMove() {
        switch (this.difficulty) {
            case 'easy':
                return this.getEasyMove();
            case 'hard':
                return this.getHardMove();
            default:
                return this.getMediumMove();
        }
    }

    // Easy: Random thuần túy
    getEasyMove() {
        const moves = ['Rock', 'Paper', 'Scissors'];
        const move = moves[Math.floor(Math.random() * moves.length)];
        this.moveHistory.push(move);
        return move;
    }

    // Medium: Random với một chút pattern
    getMediumMove() {
        const moves = ['Rock', 'Paper', 'Scissors'];

        // 70% random, 30% counter last player move
        if (this.playerMoveHistory.length > 0 && Math.random() < 0.3) {
            const lastPlayerMove = this.playerMoveHistory[this.playerMoveHistory.length - 1];
            const move = this.getCounterMove(lastPlayerMove);
            this.moveHistory.push(move);
            return move;
        }

        const move = moves[Math.floor(Math.random() * moves.length)];
        this.moveHistory.push(move);
        return move;
    }

    // Hard: Phân tích pattern của người chơi
    getHardMove() {
        const moves = ['Rock', 'Paper', 'Scissors'];

        // Nếu chưa có đủ data, random
        if (this.playerMoveHistory.length < 3) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            this.moveHistory.push(move);
            return move;
        }

        // Phân tích pattern
        const pattern = this.analyzePlayerPattern();

        if (pattern.confidence > 0.5) {
            // Dự đoán nước tiếp theo và counter
            const predictedMove = pattern.prediction;
            const move = this.getCounterMove(predictedMove);
            this.moveHistory.push(move);
            return move;
        }

        // Fallback: counter nước chơi nhiều nhất
        const mostPlayed = this.getMostPlayedMove();
        const move = this.getCounterMove(mostPlayed);
        this.moveHistory.push(move);
        return move;
    }

    // Phân tích pattern người chơi
    analyzePlayerPattern() {
        const history = this.playerMoveHistory;
        const len = history.length;

        // Kiểm tra pattern lặp lại
        // Pattern 1: Người chơi hay lặp lại nước vừa chơi
        const lastMove = history[len - 1];
        let repeatCount = 0;
        for (let i = len - 2; i >= Math.max(0, len - 5); i--) {
            if (history[i] === lastMove) repeatCount++;
        }

        if (repeatCount >= 2) {
            return {
                prediction: lastMove,
                confidence: 0.7
            };
        }

        // Pattern 2: Sequence Rock -> Paper -> Scissors
        if (len >= 2) {
            const seq = history.slice(-2);
            if (seq[0] === 'Rock' && seq[1] === 'Paper') {
                return { prediction: 'Scissors', confidence: 0.6 };
            }
            if (seq[0] === 'Paper' && seq[1] === 'Scissors') {
                return { prediction: 'Rock', confidence: 0.6 };
            }
            if (seq[0] === 'Scissors' && seq[1] === 'Rock') {
                return { prediction: 'Paper', confidence: 0.6 };
            }
        }

        // Không tìm thấy pattern rõ ràng
        return {
            prediction: this.getMostPlayedMove(),
            confidence: 0.4
        };
    }

    // Lấy nước counter
    getCounterMove(move) {
        const counters = {
            'Rock': 'Paper',
            'Paper': 'Scissors',
            'Scissors': 'Rock'
        };
        return counters[move] || 'Rock';
    }

    // Lấy nước người chơi hay chơi nhất
    getMostPlayedMove() {
        const counts = { 'Rock': 0, 'Paper': 0, 'Scissors': 0 };
        this.playerMoveHistory.forEach(move => {
            counts[move]++;
        });

        let maxMove = 'Rock';
        let maxCount = 0;
        for (const [move, count] of Object.entries(counts)) {
            if (count > maxCount) {
                maxCount = count;
                maxMove = move;
            }
        }
        return maxMove;
    }

    // Ghi nhận nước đi của người chơi
    recordPlayerMove(move) {
        this.playerMoveHistory.push(move);
        // Giới hạn lịch sử
        if (this.playerMoveHistory.length > 50) {
            this.playerMoveHistory.shift();
        }
    }

    // Reset bot
    reset() {
        this.moveHistory = [];
        this.playerMoveHistory = [];
        this.name = this.getBotName();
    }

    // Đổi độ khó
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.reset();
    }

    // Tính kết quả
    static calculateResult(playerMove, botMove) {
        if (playerMove === botMove) return 'draw';

        const wins = {
            'Rock': 'Scissors',
            'Paper': 'Rock',
            'Scissors': 'Paper'
        };

        return wins[playerMove] === botMove ? 'win' : 'lose';
    }
}

// Export
window.BotPlayer = BotPlayer;
