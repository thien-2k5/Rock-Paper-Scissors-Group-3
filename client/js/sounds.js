// sounds.js - Quản lý âm thanh game PREMIUM
// Sử dụng Web Audio API để tạo âm thanh chất lượng cao

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.isMuted = false;
        this.volume = 0.5;
        this.masterGain = null;

        // Load saved preferences
        this.loadPreferences();
    }

    // Khởi tạo AudioContext
    init() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = this.volume;
        }

        // Resume if suspended
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        return this.audioContext;
    }

    // Lưu preferences
    savePreferences() {
        localStorage.setItem('rps_sound_muted', this.isMuted);
        localStorage.setItem('rps_sound_volume', this.volume);
    }

    // Load preferences
    loadPreferences() {
        const muted = localStorage.getItem('rps_sound_muted');
        const volume = localStorage.getItem('rps_sound_volume');

        if (muted !== null) this.isMuted = muted === 'true';
        if (volume !== null) this.volume = parseFloat(volume);
    }

    // Toggle mute
    toggleMute() {
        this.isMuted = !this.isMuted;
        this.savePreferences();
        return this.isMuted;
    }

    // Set volume
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.masterGain) {
            this.masterGain.gain.value = this.volume;
        }
        this.savePreferences();
    }

    // ===================== CORE SOUND ENGINE =====================

    // Tạo note với ADSR envelope
    playNote(frequency, duration, options = {}) {
        if (this.isMuted) return;

        const ctx = this.init();
        if (!ctx) return;

        const {
            type = 'sine',
            gain = 0.3,
            attack = 0.02,
            decay = 0.1,
            sustain = 0.7,
            release = 0.1,
            delay = 0,
            vibrato = 0,
            vibratoSpeed = 5
        } = options;

        const now = ctx.currentTime + delay;

        // Oscillator
        const osc = ctx.createOscillator();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency, now);

        // Vibrato
        if (vibrato > 0) {
            const vibratoOsc = ctx.createOscillator();
            const vibratoGain = ctx.createGain();
            vibratoOsc.frequency.value = vibratoSpeed;
            vibratoGain.gain.value = vibrato;
            vibratoOsc.connect(vibratoGain);
            vibratoGain.connect(osc.frequency);
            vibratoOsc.start(now);
            vibratoOsc.stop(now + duration);
        }

        // Gain envelope (ADSR)
        const gainNode = ctx.createGain();
        const vol = gain * this.volume;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(vol, now + attack);
        gainNode.gain.linearRampToValueAtTime(vol * sustain, now + attack + decay);
        gainNode.gain.setValueAtTime(vol * sustain, now + duration - release);
        gainNode.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration);
    }

    // Tạo chord (hợp âm)
    playChord(frequencies, duration, options = {}) {
        frequencies.forEach((freq, i) => {
            this.playNote(freq, duration, {
                ...options,
                gain: (options.gain || 0.2) / frequencies.length * 1.5,
                delay: (options.delay || 0) + i * 0.01
            });
        });
    }

    // Tạo arpeggio
    playArpeggio(frequencies, noteDuration, options = {}) {
        frequencies.forEach((freq, i) => {
            this.playNote(freq, noteDuration, {
                ...options,
                delay: (options.delay || 0) + i * noteDuration * 0.7
            });
        });
    }

    // ===================== GAME SOUNDS =====================

    // 🎵 Click button - Quick pop sound
    playClick() {
        if (this.isMuted) return;

        // Dual-tone pop
        this.playNote(880, 0.08, { type: 'sine', gain: 0.15, attack: 0.005 });
        this.playNote(1320, 0.06, { type: 'sine', gain: 0.1, attack: 0.005, delay: 0.02 });
    }

    // 🎵 Hover effect
    playHover() {
        if (this.isMuted) return;
        this.playNote(660, 0.05, { type: 'sine', gain: 0.08, attack: 0.005 });
    }

    // 🎵 Move select - Confirmation sound
    playMoveSelect() {
        if (this.isMuted) return;

        // Rising confirmation tone
        this.playNote(440, 0.1, { type: 'triangle', gain: 0.2 });
        this.playNote(554, 0.1, { type: 'triangle', gain: 0.2, delay: 0.08 });
        this.playNote(659, 0.15, { type: 'triangle', gain: 0.25, delay: 0.16 });
    }

    // 🎵 Game start - Epic fanfare
    playGameStart() {
        if (this.isMuted) return;

        // C Major chord arpeggio then full chord
        const notes = [262, 330, 392, 523]; // C4, E4, G4, C5

        // Quick arpeggio
        this.playArpeggio(notes, 0.12, { type: 'triangle', gain: 0.25 });

        // Full chord after arpeggio
        setTimeout(() => {
            this.playChord([262, 330, 392, 523], 0.4, {
                type: 'sine',
                gain: 0.3,
                delay: 0.3
            });
        }, 0);

        // High sparkle
        this.playNote(1047, 0.3, {
            type: 'sine',
            gain: 0.15,
            delay: 0.6,
            vibrato: 3,
            vibratoSpeed: 8
        });
    }

    // 🎉 WIN - Triumphant celebration melody
    playWin() {
        if (this.isMuted) return;

        // Happy victory fanfare in C Major
        const melody = [
            { note: 523, duration: 0.15 },  // C5
            { note: 659, duration: 0.15 },  // E5
            { note: 784, duration: 0.15 },  // G5
            { note: 1047, duration: 0.3 },  // C6
            { note: 784, duration: 0.1 },   // G5
            { note: 1047, duration: 0.5 }   // C6 (held)
        ];

        let time = 0;
        melody.forEach((item) => {
            this.playNote(item.note, item.duration + 0.05, {
                type: 'triangle',
                gain: 0.3,
                delay: time,
                attack: 0.02,
                sustain: 0.8
            });
            time += item.duration;
        });

        // Victory chord
        this.playChord([523, 659, 784, 1047], 0.6, {
            type: 'sine',
            gain: 0.25,
            delay: time + 0.1
        });

        // Sparkle effects
        for (let i = 0; i < 5; i++) {
            this.playNote(1200 + Math.random() * 800, 0.1, {
                type: 'sine',
                gain: 0.1,
                delay: time + 0.2 + i * 0.1
            });
        }
    }

    // 😢 LOSE - Melancholic descending melody
    playLose() {
        if (this.isMuted) return;

        // Sad melody in minor key
        const melody = [
            { note: 392, duration: 0.25 },  // G4
            { note: 349, duration: 0.25 },  // F4
            { note: 330, duration: 0.25 },  // E4
            { note: 262, duration: 0.5 }    // C4 (low, held)
        ];

        let time = 0;
        melody.forEach((item) => {
            this.playNote(item.note, item.duration + 0.1, {
                type: 'triangle',
                gain: 0.25,
                delay: time,
                attack: 0.05,
                sustain: 0.6,
                release: 0.15
            });
            time += item.duration;
        });

        // Minor chord at end (C minor: C-Eb-G)
        this.playChord([262, 311, 392], 0.8, {
            type: 'sine',
            gain: 0.2,
            delay: time + 0.1,
            release: 0.3
        });
    }

    // 🤝 DRAW - Neutral, suspenseful sound
    playDraw() {
        if (this.isMuted) return;

        // Mysterious suspended chord feeling
        const notes = [
            { note: 440, duration: 0.2 },   // A4
            { note: 494, duration: 0.2 },   // B4
            { note: 440, duration: 0.3 }    // A4
        ];

        let time = 0;
        notes.forEach((item) => {
            this.playNote(item.note, item.duration, {
                type: 'triangle',
                gain: 0.25,
                delay: time,
                sustain: 0.7
            });
            time += item.duration * 0.8;
        });

        // Suspended chord (Asus4: A-D-E)
        this.playChord([440, 587, 659], 0.5, {
            type: 'sine',
            gain: 0.2,
            delay: time + 0.1
        });
    }

    // 👤 Player join - Welcoming sound
    playPlayerJoin() {
        if (this.isMuted) return;

        // Bright ascending tones
        this.playNote(523, 0.1, { type: 'sine', gain: 0.2 }); // C5
        this.playNote(659, 0.1, { type: 'sine', gain: 0.2, delay: 0.08 }); // E5
        this.playNote(784, 0.15, { type: 'sine', gain: 0.25, delay: 0.16 }); // G5

        // Sparkle
        this.playNote(1047, 0.2, {
            type: 'sine',
            gain: 0.15,
            delay: 0.24,
            vibrato: 2
        });
    }

    // 👤 Player leave - Sad departure
    playPlayerLeave() {
        if (this.isMuted) return;

        // Descending tones
        this.playNote(784, 0.12, { type: 'sine', gain: 0.2 }); // G5
        this.playNote(659, 0.12, { type: 'sine', gain: 0.18, delay: 0.1 }); // E5
        this.playNote(523, 0.2, { type: 'sine', gain: 0.15, delay: 0.2 }); // C5
        this.playNote(392, 0.3, { type: 'triangle', gain: 0.2, delay: 0.35 }); // G4
    }

    // ⏱️ Countdown tick
    playCountdown() {
        if (this.isMuted) return;
        this.playNote(800, 0.08, { type: 'square', gain: 0.15, attack: 0.005 });
    }

    // ⏱️ Countdown final (last second)
    playCountdownFinal() {
        if (this.isMuted) return;
        this.playNote(1000, 0.15, { type: 'square', gain: 0.2, attack: 0.005 });
        this.playNote(1200, 0.1, { type: 'sine', gain: 0.15, delay: 0.1 });
    }

    // 🏠 Room created
    playRoomCreated() {
        if (this.isMuted) return;

        // Magical creation sound
        this.playArpeggio([392, 494, 587, 784], 0.15, {
            type: 'triangle',
            gain: 0.2
        });

        // Shimmer
        for (let i = 0; i < 3; i++) {
            this.playNote(1000 + i * 200, 0.15, {
                type: 'sine',
                gain: 0.1,
                delay: 0.4 + i * 0.08
            });
        }
    }

    // 📋 Copy success
    playCopySuccess() {
        if (this.isMuted) return;
        this.playNote(880, 0.08, { type: 'sine', gain: 0.15 });
        this.playNote(1100, 0.1, { type: 'sine', gain: 0.15, delay: 0.06 });
    }

    // ❌ Error sound
    playError() {
        if (this.isMuted) return;
        this.playNote(200, 0.15, { type: 'square', gain: 0.2 });
        this.playNote(180, 0.2, { type: 'square', gain: 0.18, delay: 0.12 });
    }

    // 🔄 Reconnecting
    playReconnecting() {
        if (this.isMuted) return;
        this.playNote(440, 0.1, { type: 'sine', gain: 0.12 });
        this.playNote(440, 0.1, { type: 'sine', gain: 0.12, delay: 0.15 });
        this.playNote(440, 0.1, { type: 'sine', gain: 0.12, delay: 0.3 });
    }

    // ✅ Reconnected
    playReconnected() {
        if (this.isMuted) return;
        this.playNote(440, 0.1, { type: 'sine', gain: 0.2 });
        this.playNote(554, 0.1, { type: 'sine', gain: 0.2, delay: 0.08 });
        this.playNote(659, 0.15, { type: 'sine', gain: 0.25, delay: 0.16 });
    }

    // 💫 Special effect - for achievements/special moments
    playSpecial() {
        if (this.isMuted) return;

        // Magical ascending arpeggio with shimmer
        const notes = [523, 659, 784, 1047, 1319, 1568];

        notes.forEach((note, i) => {
            this.playNote(note, 0.2, {
                type: 'sine',
                gain: 0.15 + i * 0.02,
                delay: i * 0.08,
                vibrato: 2 + i * 0.5
            });
        });

        // Final shimmer burst
        for (let i = 0; i < 8; i++) {
            this.playNote(1500 + Math.random() * 1000, 0.15, {
                type: 'sine',
                gain: 0.08,
                delay: 0.5 + i * 0.05
            });
        }
    }
}

// Export global instance
window.soundManager = new SoundManager();
