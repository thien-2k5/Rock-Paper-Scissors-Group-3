// history.js - Quản lý lịch sử trận đấu

class MatchHistory {
    constructor() {
        this.maxMatches = 20;
        this.storageKey = 'rps_match_history';
        this.matches = this.loadHistory();
    }

    // Load lịch sử từ localStorage
    loadHistory() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Error loading match history:', e);
            return [];
        }
    }

    // Lưu lịch sử vào localStorage
    saveHistory() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.matches));
        } catch (e) {
            console.error('Error saving match history:', e);
        }
    }

    // Thêm trận đấu mới
    addMatch(matchData) {
        const match = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            playerName: matchData.playerName || 'Bạn',
            opponentName: matchData.opponentName || 'Đối thủ',
            playerMove: matchData.playerMove,
            opponentMove: matchData.opponentMove,
            result: matchData.result, // 'win', 'lose', 'draw'
            gameMode: matchData.gameMode || 'online', // 'online', 'bot'
            roomCode: matchData.roomCode || null
        };

        this.matches.unshift(match); // Thêm vào đầu mảng

        // Giới hạn số lượng trận
        if (this.matches.length > this.maxMatches) {
            this.matches = this.matches.slice(0, this.maxMatches);
        }

        this.saveHistory();
        return match;
    }

    // Lấy tất cả trận đấu
    getAllMatches() {
        return this.matches;
    }

    // Lấy n trận gần nhất
    getRecentMatches(n = 10) {
        return this.matches.slice(0, n);
    }

    // Thống kê
    getStats() {
        const stats = {
            total: this.matches.length,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
            onlineGames: 0,
            botGames: 0
        };

        this.matches.forEach(match => {
            if (match.result === 'win') stats.wins++;
            else if (match.result === 'lose') stats.losses++;
            else stats.draws++;

            if (match.gameMode === 'online') stats.onlineGames++;
            else stats.botGames++;
        });

        if (stats.total > 0) {
            stats.winRate = Math.round((stats.wins / stats.total) * 100);
        }

        return stats;
    }

    // Xóa lịch sử
    clearHistory() {
        this.matches = [];
        this.saveHistory();
    }

    // Format thời gian hiển thị
    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diff = now - date;

        // Trong vòng 1 phút
        if (diff < 60000) {
            return 'Vừa xong';
        }
        // Trong vòng 1 giờ
        if (diff < 3600000) {
            const mins = Math.floor(diff / 60000);
            return `${mins} phút trước`;
        }
        // Trong vòng 24 giờ
        if (diff < 86400000) {
            const hours = Math.floor(diff / 3600000);
            return `${hours} giờ trước`;
        }
        // Khác
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Lấy emoji cho move
    getMoveEmoji(move) {
        const emojis = {
            'Rock': '🪨',
            'Paper': '📄',
            'Scissors': '✂️'
        };
        return emojis[move] || '❓';
    }

    // Lấy emoji cho kết quả
    getResultEmoji(result) {
        const emojis = {
            'win': '🏆',
            'lose': '😢',
            'draw': '🤝'
        };
        return emojis[result] || '';
    }

    // Render HTML cho một trận đấu
    renderMatchCard(match) {
        const resultClass = match.result;
        const resultText = match.result === 'win' ? 'Thắng' :
            match.result === 'lose' ? 'Thua' : 'Hòa';
        const modeIcon = match.gameMode === 'bot' ? '🤖' : '🌐';

        return `
            <div class="match-card ${resultClass}">
                <div class="match-header">
                    <span class="match-mode">${modeIcon}</span>
                    <span class="match-time">${this.formatTime(match.timestamp)}</span>
                </div>
                <div class="match-content">
                    <div class="match-player">
                        <span class="player-name">${match.playerName}</span>
                        <span class="player-move">${this.getMoveEmoji(match.playerMove)}</span>
                    </div>
                    <div class="match-vs">VS</div>
                    <div class="match-player opponent">
                        <span class="player-move">${this.getMoveEmoji(match.opponentMove)}</span>
                        <span class="player-name">${match.opponentName}</span>
                    </div>
                </div>
                <div class="match-result ${resultClass}">
                    ${this.getResultEmoji(match.result)} ${resultText}
                </div>
            </div>
        `;
    }

    // Render HTML cho stats
    renderStats() {
        const stats = this.getStats();
        return `
            <div class="history-stats">
                <div class="stat-item">
                    <span class="stat-value">${stats.total}</span>
                    <span class="stat-label">Tổng</span>
                </div>
                <div class="stat-item wins">
                    <span class="stat-value">${stats.wins}</span>
                    <span class="stat-label">Thắng</span>
                </div>
                <div class="stat-item draws">
                    <span class="stat-value">${stats.draws}</span>
                    <span class="stat-label">Hòa</span>
                </div>
                <div class="stat-item losses">
                    <span class="stat-value">${stats.losses}</span>
                    <span class="stat-label">Thua</span>
                </div>
                <div class="stat-item winrate">
                    <span class="stat-value">${stats.winRate}%</span>
                    <span class="stat-label">Tỉ lệ thắng</span>
                </div>
            </div>
        `;
    }
}

// Export global instance
window.matchHistory = new MatchHistory();
