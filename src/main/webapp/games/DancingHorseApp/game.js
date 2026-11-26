// =============================================================================
// Dancing Horse Revolution - HTML5 / JavaScript Edition
// =============================================================================

// --- 楽曲リスト定義 ---
const SONGS = [
    {
        id: 'dance_with_me',
        title: 'Dance With Me',
        artist: 'FL Studio',
        genre: 'Vocal Dance Pop',
        bpm: 120.0,
        duration: 82.0,
        src: 'music.m4a',
        fallbackSrc: 'music.mp3',
        description: 'ボーカルに合わせて仁王立ちダンシング！初心者から楽しめる王道チューン。',
        color: '#ff2d75',
        icon: '💃'
    },
    {
        id: 'what_club_beat',
        title: 'What! (Club Beat)',
        artist: 'FL Studio',
        genre: 'Funky Club EDM',
        bpm: 120.0,
        duration: 132.0,
        src: 'music2.m4a',
        fallbackSrc: 'music2.m4a',
        description: '「What!」のシャウトと重低音キックが炸裂する熱狂の2分超えロングトラック！',
        color: '#00d4ff',
        icon: '💥'
    }
];

// --- 1. サウンドマネージャー ---
class SoundManager {
    constructor() {
        this.audioCtx = null;
        this.bgm = new Audio();
        this.bgm.preload = 'auto';
        this.currentSong = null;
        this.isLoaded = false;

        this.bgm.addEventListener('canplaythrough', () => {
            this.isLoaded = true;
        });

        this.bgm.addEventListener('error', () => {
            if (this.currentSong && this.bgm.src.endsWith(this.currentSong.src) && this.currentSong.fallbackSrc !== this.currentSong.src) {
                console.log('Falling back to:', this.currentSong.fallbackSrc);
                this.bgm.src = this.currentSong.fallbackSrc;
            }
        });
    }

    initAudioContext() {
        if (!this.audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
        }
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }
    }

    loadSong(song) {
        this.currentSong = song;
        this.isLoaded = false;
        this.bgm.src = song.src;
        this.bgm.load();
    }

    playBgm() {
        this.initAudioContext();
        this.bgm.currentTime = 0;
        this.bgm.play().catch(e => console.warn('Autoplay blocked:', e));
    }

    playPreview(song) {
        this.initAudioContext();
        if (this.currentSong !== song) {
            this.loadSong(song);
        }
        // プレビューはサビ（約18秒付近）から少し流す
        this.bgm.currentTime = 18.0;
        this.bgm.play().catch(e => console.warn('Preview blocked:', e));
    }

    pauseBgm() {
        this.bgm.pause();
    }

    resumeBgm() {
        this.initAudioContext();
        this.bgm.play().catch(e => console.warn('Resume blocked:', e));
    }

    stopBgm() {
        this.bgm.pause();
        this.bgm.currentTime = 0;
    }

    get currentTime() {
        return this.bgm.currentTime || 0;
    }

    get duration() {
        return (this.currentSong) ? this.currentSong.duration : (this.bgm.duration || 82.0);
    }

    // 合成タップ音
    playHitSE(rating) {
        if (!this.audioCtx) return;
        try {
            const t = this.audioCtx.currentTime;

            if (rating === 'PERFECT') {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(1800, t);
                osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);

                gain.gain.setValueAtTime(0.4, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.05);

            } else if (rating === 'GREAT') {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, t);
                osc.frequency.exponentialRampToValueAtTime(250, t + 0.045);

                gain.gain.setValueAtTime(0.3, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.045);

            } else if (rating === 'GOOD') {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(700, t);
                osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

                gain.gain.setValueAtTime(0.2, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.04);

            } else if (rating === 'MISS') {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.exponentialRampToValueAtTime(90, t + 0.12);

                gain.gain.setValueAtTime(0.25, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.12);
            }
        } catch (e) { }
    }

    playFeverSE() {
        if (!this.audioCtx) return;
        try {
            const t = this.audioCtx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.5];
            freqs.forEach(f => {
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(f, t);

                gain.gain.setValueAtTime(0.15, t);
                gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.start(t);
                osc.stop(t + 0.28);
            });
        } catch (e) { }
    }
}

// --- 2. ノーツクラス (Note) ---
class Note {
    constructor(dir, targetTime, approachDuration = 1.35) {
        this.direction = dir; // 0=←, 1=↑, 2=↓, 3=→
        this.targetTime = targetTime;
        this.approachDuration = approachDuration;
        this.isHit = false;        // 論理削除フラグ: ヒット済み
        this.isMissed = false;     // 論理削除フラグ: 見逃しMISS確定
        this.isDead = false;       // 物理削除フラグ: 配列から除外可能
        this.hitRating = '';
        this.hitDiffSec = 0.0;
        this.y = -100;
        this.isVisible = false;
    }

    updatePosition(currentTime, targetY, startY) {
        // すでにヒット済みまたは物理削除対象なら非表示
        if (this.isHit || this.isDead) {
            this.isVisible = false;
            return;
        }

        const timeUntilHit = this.targetTime - currentTime;

        // まだ接近前（画面外上部）
        if (timeUntilHit > this.approachDuration) {
            this.isVisible = false;
            this.y = -100;
            return;
        }

        // 判定ラインを通り過ぎた場合のMISS判定（論理削除）
        if (timeUntilHit < -0.18 && !this.isMissed) {
            this.isMissed = true;
            this.hitRating = 'MISS';
            this.isVisible = false;
            return;
        }

        this.isVisible = true;
        const progress = 1.0 - (timeUntilHit / this.approachDuration);
        this.y = startY + progress * (targetY - startY);
    }

    draw(ctx, x, targetY) {
        if (!this.isVisible || this.isHit || this.isDead) return;

        // 画面いっぱいに広がる迫力の大型ノーツ (直径54px)
        const sz = 54;
        const y = this.y;

        let noteColor, glowColor;
        switch (this.direction) {
            case 0: // ← Cyan
                noteColor = 'rgb(0, 225, 255)';
                glowColor = 'rgba(0, 225, 255, 0.5)';
                break;
            case 1: // ↑ Pink/Magenta
                noteColor = 'rgb(255, 45, 120)';
                glowColor = 'rgba(255, 45, 120, 0.5)';
                break;
            case 2: // ↓ Emerald Green
                noteColor = 'rgb(0, 255, 136)';
                glowColor = 'rgba(0, 255, 136, 0.5)';
                break;
            case 3: // → Gold Yellow
                noteColor = 'rgb(255, 200, 20)';
                glowColor = 'rgba(255, 200, 20, 0.5)';
                break;
        }

        ctx.save();

        // 外周グロー（判定ライン接近で拡大）
        const dist = Math.abs(y - targetY);
        const glowSize = dist < 30 ? 36 : 30;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();

        // ノーツ本体のグラデーション円
        const grad = ctx.createLinearGradient(x - sz / 2, y - sz / 2, x + sz / 2, y + sz / 2);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.32, noteColor);
        grad.addColorStop(1, '#0e1220');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, sz / 2, 0, Math.PI * 2);
        ctx.fill();

        // 白い縁取り
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.6;
        ctx.stroke();

        // ノーツ中央の方向矢印 (サイズアップして見やすく)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        if (this.direction === 0) { // ←
            ctx.moveTo(x - 17, y);
            ctx.lineTo(x + 5, y - 16);
            ctx.lineTo(x + 5, y - 7);
            ctx.lineTo(x + 17, y - 7);
            ctx.lineTo(x + 17, y + 7);
            ctx.lineTo(x + 5, y + 7);
            ctx.lineTo(x + 5, y + 16);
        } else if (this.direction === 1) { // ↑
            ctx.moveTo(x, y - 17);
            ctx.lineTo(x + 16, y + 5);
            ctx.lineTo(x + 7, y + 5);
            ctx.lineTo(x + 7, y + 17);
            ctx.lineTo(x - 7, y + 17);
            ctx.lineTo(x - 7, y + 5);
            ctx.lineTo(x - 16, y + 5);
        } else if (this.direction === 2) { // ↓
            ctx.moveTo(x, y + 17);
            ctx.lineTo(x + 16, y - 5);
            ctx.lineTo(x + 7, y - 5);
            ctx.lineTo(x + 7, y - 17);
            ctx.lineTo(x - 7, y - 17);
            ctx.lineTo(x - 7, y - 5);
            ctx.lineTo(x - 16, y - 5);
        } else if (this.direction === 3) { // →
            ctx.moveTo(x + 17, y);
            ctx.lineTo(x - 5, y - 16);
            ctx.lineTo(x - 5, y - 7);
            ctx.lineTo(x - 17, y - 7);
            ctx.lineTo(x - 17, y + 7);
            ctx.lineTo(x - 5, y + 7);
            ctx.lineTo(x - 5, y + 16);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

// --- 3. 譜面データ (Chart) ---
class Chart {
    static loadChart(songId, difficulty = 'NORMAL') {
        if (songId === 'what_club_beat') {
            return this.loadChartWhat(difficulty);
        } else {
            return this.loadChartDanceWithMe(difficulty);
        }
    }

    // Track 1: Dance With Me (82s)
    static loadChartDanceWithMe(difficulty) {
        const isHard = (difficulty === 'HARD');
        const list = [];
        const BarSec = 2.0;

        // 1. INTRO (0.0s ～ 6.0s)
        list.push(new Note(0, 1.0));
        list.push(new Note(3, 1.5));
        list.push(new Note(1, 2.5));
        list.push(new Note(2, 3.0));
        if (isHard) list.push(new Note(3, 3.5));
        list.push(new Note(0, 4.5));
        list.push(new Note(1, 5.0));
        list.push(new Note(3, 5.5));
        if (isHard) list.push(new Note(2, 5.75));

        // 2. FIRST GROOVE (6.0s ～ 14.0s)
        for (let bar = 4; bar <= 7; bar++) {
            const b = bar * BarSec;
            if (bar === 4) {
                list.push(new Note(0, b + 0.0), new Note(3, b + 0.5), new Note(1, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.25), new Note(3, b + 1.25));
            } else if (bar === 5) {
                list.push(new Note(2, b + 0.0), new Note(1, b + 0.5), new Note(0, b + 1.0), new Note(3, b + 1.5));
                if (isHard) list.push(new Note(1, b + 0.75), new Note(2, b + 1.25));
            } else if (bar === 6) {
                list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(2, b + 1.0), new Note(3, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.25), new Note(3, b + 1.75));
            } else if (bar === 7) {
                list.push(new Note(1, b + 0.0), new Note(2, b + 0.5), new Note(3, b + 1.0), new Note(0, b + 1.5));
                if (isHard) list.push(new Note(1, b + 1.25), new Note(2, b + 1.75));
            }
        }

        // 3. DROP 1 (14.0s ～ 26.0s)
        for (let bar = 8; bar <= 13; bar++) {
            const b = bar * BarSec;
            if (bar === 8) {
                list.push(new Note(1, b + 0.0), new Note(0, b + 0.5), new Note(3, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(1, b + 0.75));
            } else if (bar === 9) {
                list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(3, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.25), new Note(1, b + 1.25));
            } else if (bar === 10) {
                list.push(new Note(3, b + 0.0), new Note(0, b + 0.5), new Note(1, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(3, b + 0.25), new Note(2, b + 1.25));
            } else if (bar === 11) {
                list.push(new Note(2, b + 0.0), new Note(2, b + 0.5), new Note(1, b + 1.0), new Note(3, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.75), new Note(1, b + 1.25));
            } else if (bar === 12) {
                list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(2, b + 1.0), new Note(3, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.25), new Note(3, b + 1.25));
            } else if (bar === 13) {
                list.push(new Note(1, b + 0.0), new Note(2, b + 0.5), new Note(0, b + 1.0), new Note(3, b + 1.5));
            }
        }

        // 4. INTERLUDE (26.0s ～ 42.0s)
        for (let bar = 14; bar <= 21; bar++) {
            const b = bar * BarSec;
            let pat = [0, 1, 2, 3];
            if (bar % 2 === 1) pat = [3, 2, 1, 0];
            if (bar % 4 === 2) pat = [0, 3, 1, 2];
            if (bar % 4 === 3) pat = [2, 1, 3, 0];

            list.push(new Note(pat[0], b + 0.0), new Note(pat[1], b + 0.5), new Note(pat[2], b + 1.0), new Note(pat[3], b + 1.5));
            if (isHard) {
                list.push(new Note((pat[0] + 1) % 4, b + 0.25));
                list.push(new Note((pat[2] + 2) % 4, b + 1.25));
            }
        }

        // 5. CHORUS (42.0s ～ 54.0s)
        for (let bar = 22; bar <= 27; bar++) {
            const b = bar * BarSec;
            list.push(new Note(1, b + 0.0), new Note(0, b + 0.375), new Note(3, b + 0.75), new Note(2, b + 1.0), new Note(1, b + 1.5));
            if (isHard) {
                list.push(new Note(2, b + 0.1875), new Note(0, b + 1.25), new Note(3, b + 1.75));
            }
        }

        // 6. BUILD-UP (54.0s ～ 58.0s)
        const b28 = 28 * BarSec;
        list.push(new Note(0, b28 + 0.0), new Note(1, b28 + 0.5), new Note(2, b28 + 1.0), new Note(3, b28 + 1.5));
        const b29 = 29 * BarSec;
        list.push(new Note(0, b29 + 0.0), new Note(1, b29 + 0.25), new Note(2, b29 + 0.5), new Note(3, b29 + 0.75),
            new Note(0, b29 + 1.0), new Note(1, b29 + 1.125), new Note(2, b29 + 1.25), new Note(3, b29 + 1.375),
            new Note(1, b29 + 1.5), new Note(2, b29 + 1.625), new Note(3, b29 + 1.75), new Note(1, b29 + 1.875));

        // 7. MEGA DROP (58.0s ～ 78.0s)
        for (let bar = 30; bar <= 39; bar++) {
            const b = bar * BarSec;
            const mode = (bar - 30) % 4;
            if (mode === 0) {
                list.push(new Note(0, b + 0.0), new Note(3, b + 0.5), new Note(0, b + 1.0), new Note(3, b + 1.5));
                if (isHard) list.push(new Note(1, b + 0.25), new Note(2, b + 0.75), new Note(1, b + 1.25), new Note(2, b + 1.75));
            } else if (mode === 1) {
                list.push(new Note(1, b + 0.0), new Note(2, b + 0.5), new Note(1, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.25), new Note(3, b + 0.75), new Note(0, b + 1.25), new Note(3, b + 1.75));
            } else if (mode === 2) {
                list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(3, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(2, b + 0.25), new Note(3, b + 0.75), new Note(1, b + 1.25), new Note(0, b + 1.75));
            } else if (mode === 3) {
                list.push(new Note(0, b + 0.0), new Note(3, b + 0.25), new Note(1, b + 0.5), new Note(2, b + 0.75),
                    new Note(1, b + 1.0), new Note(2, b + 1.25), new Note(0, b + 1.5), new Note(3, b + 1.75));
            }
        }

        // 8. OUTRO (78.0s ～ 80.5s)
        list.push(new Note(0, 78.0), new Note(1, 78.5), new Note(2, 79.0), new Note(3, 79.5));
        list.push(new Note(1, 80.0));

        list.sort((a, b) => a.targetTime - b.targetTime);
        return list;
    }

    // Track 2: What! (Club Beat) (132s)
    static loadChartWhat(difficulty) {
        const isHard = (difficulty === 'HARD');
        const list = [];
        const BarSec = 2.0;

        // 1. INTRO SCRATCH & BEAT IN (0.0s ～ 18.0s / Bar 1 ～ 9)
        // 「What!」の掛け声が 7.0s, 11.5s, 17.5s
        list.push(new Note(0, 2.0));
        list.push(new Note(3, 3.0));
        list.push(new Note(1, 4.0));
        list.push(new Note(2, 5.0));

        // Bar 3 & 4 (6.0s ～ 10.0s) - 7.0s に「What!」
        list.push(new Note(0, 6.0));
        list.push(new Note(1, 6.5));
        list.push(new Note(1, 7.0)); // ★ What!
        list.push(new Note(2, 7.5));
        list.push(new Note(3, 8.0));
        list.push(new Note(0, 9.0));
        if (isHard) {
            list.push(new Note(3, 6.75), new Note(2, 8.5), new Note(1, 9.5));
        }

        // Bar 5 & 6 (10.0s ～ 14.0s) - 11.5s に「What!」
        list.push(new Note(2, 10.0));
        list.push(new Note(3, 10.5));
        list.push(new Note(0, 11.0));
        list.push(new Note(1, 11.5)); // ★ What!
        list.push(new Note(2, 12.0));
        list.push(new Note(3, 13.0));

        // Bar 7 & 8 (14.0s ～ 18.0s) - ドロップ前のビルドアップ＆ 17.5s「What!」
        list.push(new Note(0, 14.0));
        list.push(new Note(1, 14.5));
        list.push(new Note(2, 15.0));
        list.push(new Note(3, 15.5));
        list.push(new Note(0, 16.0));
        list.push(new Note(1, 16.5));
        list.push(new Note(2, 17.0));
        list.push(new Note(1, 17.5)); // ★ What! ドロップ直前！
        if (isHard) {
            list.push(new Note(3, 17.75));
        }

        // 2. MAIN DROP 1 (18.0s ～ 34.0s / Bar 10 ～ 17)
        // 重低音キック炸裂！25.5s & 33.5s に「What!」
        for (let bar = 10; bar <= 17; bar++) {
            const b = bar * BarSec;
            if (bar === 13) { // 24.0s ～ 26.0s (25.5s What!)
                list.push(new Note(0, b + 0.0), new Note(3, b + 0.5), new Note(2, b + 1.0), new Note(1, b + 1.5));
            } else if (bar === 17) { // 32.0s ～ 34.0s (33.5s What!)
                list.push(new Note(2, b + 0.0), new Note(1, b + 0.5), new Note(0, b + 1.0), new Note(1, b + 1.5));
            } else {
                const p = (bar % 2 === 0) ? [0, 1, 2, 3] : [3, 2, 1, 0];
                list.push(new Note(p[0], b + 0.0), new Note(p[1], b + 0.5), new Note(p[2], b + 1.0), new Note(p[3], b + 1.5));
            }
            if (isHard) {
                list.push(new Note((bar % 4), b + 0.25), new Note(((bar + 2) % 4), b + 1.25));
            }
        }

        // 3. GROOVE & SYNCOPATION (34.0s ～ 50.0s / Bar 18 ～ 25)
        // 42.5s「What!」
        for (let bar = 18; bar <= 25; bar++) {
            const b = bar * BarSec;
            list.push(new Note(1, b + 0.0), new Note(0, b + 0.5), new Note(3, b + 1.0), new Note(2, b + 1.5));
            if (bar === 22) {
                list.push(new Note(1, b + 0.5)); // 42.5s What!
            }
            if (isHard) {
                list.push(new Note(0, b + 0.25), new Note(3, b + 0.75), new Note(2, b + 1.25));
            }
        }

        // 4. VOCAL CLIMAX 1 (50.0s ～ 66.0s / Bar 26 ～ 33)
        // 51.5s, 56.5s, 62.5s, 65.5s「What!」シャウトラッシュ！
        for (let bar = 26; bar <= 33; bar++) {
            const b = bar * BarSec;
            list.push(new Note(1, b + 0.0), new Note(0, b + 0.375), new Note(3, b + 0.75), new Note(2, b + 1.0), new Note(1, b + 1.5));
            if (isHard) {
                list.push(new Note(2, b + 0.1875), new Note(0, b + 1.25), new Note(3, b + 1.75));
            }
        }

        // 5. BREAK & ROLLS (66.0s ～ 74.0s / Bar 34 ～ 37)
        // ドラムロール
        for (let bar = 34; bar <= 36; bar++) {
            const b = bar * BarSec;
            list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(2, b + 1.0), new Note(3, b + 1.5));
            if (isHard || bar === 36) {
                list.push(new Note(1, b + 0.25), new Note(2, b + 0.75), new Note(3, b + 1.25), new Note(0, b + 1.75));
            }
        }
        const b37 = 37 * BarSec; // 72.0s ～ 74.0s
        list.push(new Note(0, b37 + 0.0), new Note(1, b37 + 0.25), new Note(2, b37 + 0.5), new Note(3, b37 + 0.75),
            new Note(0, b37 + 1.0), new Note(1, b37 + 1.125), new Note(2, b37 + 1.25), new Note(3, b37 + 1.375),
            new Note(1, b37 + 1.5), new Note(2, b37 + 1.625), new Note(3, b37 + 1.75), new Note(1, b37 + 1.875));

        // 6. MEGA DROP / CLIMAX FEVER (74.0s ～ 106.0s / Bar 38 ～ 53)
        // 激熱ダンスパート！
        for (let bar = 38; bar <= 53; bar++) {
            const b = bar * BarSec;
            const mode = (bar - 38) % 4;
            if (mode === 0) {
                list.push(new Note(0, b + 0.0), new Note(3, b + 0.5), new Note(0, b + 1.0), new Note(3, b + 1.5));
                if (isHard) list.push(new Note(1, b + 0.25), new Note(2, b + 0.75), new Note(1, b + 1.25), new Note(2, b + 1.75));
            } else if (mode === 1) {
                list.push(new Note(1, b + 0.0), new Note(2, b + 0.5), new Note(1, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(0, b + 0.25), new Note(3, b + 0.75), new Note(0, b + 1.25), new Note(3, b + 1.75));
            } else if (mode === 2) {
                list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(3, b + 1.0), new Note(2, b + 1.5));
                if (isHard) list.push(new Note(2, b + 0.25), new Note(3, b + 0.75), new Note(1, b + 1.25), new Note(0, b + 1.75));
            } else if (mode === 3) {
                list.push(new Note(0, b + 0.0), new Note(3, b + 0.25), new Note(1, b + 0.5), new Note(2, b + 0.75),
                    new Note(1, b + 1.0), new Note(2, b + 1.25), new Note(0, b + 1.5), new Note(3, b + 1.75));
            }
        }

        // 7. EXTENDED OUTRO (106.0s ～ 126.0s / Bar 54 ～ 63)
        for (let bar = 54; bar <= 63; bar++) {
            const b = bar * BarSec;
            list.push(new Note(0, b + 0.0), new Note(1, b + 0.5), new Note(2, b + 1.0), new Note(3, b + 1.5));
            if (isHard && bar % 2 === 1) {
                list.push(new Note(1, b + 0.25), new Note(2, b + 0.75), new Note(3, b + 1.25));
            }
        }

        // 8. FINAL STROKE (126.0s ～ 130.0s / Bar 64 ～ 65)
        list.push(new Note(0, 126.0), new Note(3, 126.5), new Note(1, 127.0), new Note(2, 127.5));
        list.push(new Note(0, 128.0), new Note(1, 128.5), new Note(2, 129.0));
        // ★ FINAL NOTE (天を指すラストキメ！)
        list.push(new Note(1, 129.5));

        list.sort((a, b) => a.targetTime - b.targetTime);
        return list;
    }
}

// --- 4. 馬クラス (Horse) ---
class Horse {
    constructor(x, y, options = {}) {
        this.x = x;
        this.y = y;
        this.scale = options.scale || 1.0;
        this.isStoodUp = options.isStoodUp || false;
        this.standProgress = this.isStoodUp ? 1.0 : 0.0;
        this.danceMove = 'IDLE';
        this.moveTimer = 0;
        this.animTick = 0;
        this.beatBounce = 0.0;

        this.coatColor = options.coatColor || '#a0552d';
        this.darkCoatColor = options.darkCoatColor || '#733719';
        this.maneColor = options.maneColor || '#1e1919';
    }

    toggleStance() {
        this.isStoodUp = !this.isStoodUp;
    }

    setDanceMove(move, duration = 20) {
        this.danceMove = move;
        this.moveTimer = duration;
    }

    update(songBeatProgress = 0.0) {
        this.animTick++;

        const targetStand = this.isStoodUp ? 1.0 : 0.0;
        this.standProgress += (targetStand - this.standProgress) * 0.14;

        this.beatBounce = Math.pow(1.0 - songBeatProgress, 2.0) * 6.0;

        if (this.moveTimer > 0) {
            this.moveTimer--;
            if (this.moveTimer === 0 && this.danceMove !== 'FINISH') {
                this.danceMove = 'IDLE';
            }
        }
    }

    draw(ctx) {
        ctx.save();
        if (this.scale !== 1.0) {
            ctx.translate(this.x, this.y);
            ctx.scale(this.scale, this.scale);
            ctx.translate(-this.x, -this.y);
        }
        const t = this.standProgress;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        const sw = 140.0 - (t * 50.0);
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, sw / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (t < 0.25) {
            this.drawQuadruped(ctx);
        } else {
            this.drawNioStanding(ctx, t);
        }

        ctx.restore();
    }

    drawQuadruped(ctx) {
        const x = this.x;
        const y = this.y;
        const eatBob = Math.sin(this.animTick * 0.08) * 4.0;

        ctx.fillStyle = this.darkCoatColor;
        ctx.fillRect(x - 60, y - 70, 14, 70);
        ctx.fillRect(x + 35, y - 70, 14, 70);

        const bodyGrad = ctx.createLinearGradient(x - 70, y - 110, x - 70, y - 45);
        bodyGrad.addColorStop(0, this.coatColor);
        bodyGrad.addColorStop(1, this.darkCoatColor);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(x, y - 77, 70, 32.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.coatColor;
        ctx.fillRect(x - 45, y - 70, 14, 70);
        ctx.fillRect(x + 50, y - 70, 14, 70);

        ctx.fillStyle = '#141419';
        ctx.fillRect(x - 60, y - 8, 14, 8);
        ctx.fillRect(x - 45, y - 8, 14, 8);
        ctx.fillRect(x + 35, y - 8, 14, 8);
        ctx.fillRect(x + 50, y - 8, 14, 8);

        ctx.fillStyle = this.coatColor;
        ctx.beginPath();
        ctx.moveTo(x + 40, y - 95);
        ctx.lineTo(x + 85, y - 65 + eatBob);
        ctx.lineTo(x + 75, y - 45 + eatBob);
        ctx.lineTo(x + 30, y - 65);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.ellipse(x + 86, y - 64 + eatBob, 16, 11, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#502d19';
        ctx.beginPath();
        ctx.ellipse(x + 99, y - 63 + eatBob, 7, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(x + 82, y - 70 + eatBob, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.maneColor;
        ctx.beginPath();
        ctx.ellipse(x + 49, y - 82, 11, 17.5, 0, 0, Math.PI * 2);
        ctx.fill();

        const tailWag = Math.sin(this.animTick * 0.15) * 6.0;
        ctx.beginPath();
        ctx.ellipse(x - 76 + tailWag, y - 77, 9, 27.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#32cd32';
        ctx.font = 'bold 12px "Meiryo UI", sans-serif';
        ctx.fillText('🌱 ハムハム...', x + 75, y - 95);
    }

    drawNioStanding(ctx, t) {
        const baseH = 195.0 * t;
        const footY = this.y;
        let bodyY = this.y - baseH * 0.72 - this.beatBounce;
        let headY = this.y - baseH - this.beatBounce;

        let danceOffsetX = 0.0;
        let danceOffsetY = 0.0;
        let legSpread = 34.0;
        let isArmsCrossed = true;

        switch (this.danceMove) {
            case 'LEFT':
                danceOffsetX = -28.0 + Math.sin(this.animTick * 0.8) * 8.0;
                danceOffsetY = -8.0;
                isArmsCrossed = true;
                break;
            case 'UP':
                danceOffsetY = -35.0 - this.beatBounce * 2.0;
                isArmsCrossed = false;
                break;
            case 'DOWN':
                danceOffsetY = 18.0;
                legSpread = 50.0;
                isArmsCrossed = true;
                break;
            case 'RIGHT':
                danceOffsetX = 28.0 - Math.sin(this.animTick * 0.8) * 8.0;
                danceOffsetY = -8.0;
                isArmsCrossed = false;
                break;
            case 'FEVER':
                danceOffsetX = Math.sin(this.animTick * 0.9) * 22.0;
                danceOffsetY = -18.0;
                isArmsCrossed = false;
                break;
            case 'FINISH':
                danceOffsetY = -20.0;
                isArmsCrossed = false;
                legSpread = 42.0;
                break;
            case 'MISS':
                danceOffsetX = Math.sin(this.animTick * 1.5) * 12.0;
                danceOffsetY = 15.0;
                isArmsCrossed = true;
                break;
        }

        const curX = this.x + danceOffsetX;
        bodyY += danceOffsetY;
        headY += danceOffsetY;

        if (this.danceMove === 'FINISH') {
            ctx.fillStyle = 'rgba(255, 215, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(curX, headY + 90, 80, 120, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = this.coatColor;
        ctx.fillRect(curX - legSpread, bodyY + 60, 18, footY - (bodyY + 60));
        ctx.fillRect(curX + legSpread - 18, bodyY + 60, 18, footY - (bodyY + 60));

        ctx.fillStyle = '#19191e';
        ctx.fillRect(curX - legSpread - 2, footY - 12, 22, 12);
        ctx.fillRect(curX + legSpread - 20, footY - 12, 22, 12);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(curX - legSpread - 2, footY - 12);
        ctx.lineTo(curX - legSpread + 20, footY - 12);
        ctx.moveTo(curX + legSpread - 20, footY - 12);
        ctx.lineTo(curX + legSpread + 2, footY - 12);
        ctx.stroke();

        const bodyW = 70.0;
        const bodyH = 88.0;
        const bodyGrad = ctx.createLinearGradient(curX - bodyW / 2, bodyY, curX + bodyW / 2, bodyY + bodyH);
        bodyGrad.addColorStop(0, this.coatColor);
        bodyGrad.addColorStop(1, this.darkCoatColor);
        ctx.fillStyle = bodyGrad;
        ctx.beginPath();
        ctx.ellipse(curX, bodyY + bodyH / 2, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(90, 40, 15, 0.85)';
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.moveTo(curX, bodyY + 15);
        ctx.lineTo(curX, bodyY + 55);
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(curX - 13.5, bodyY + 32, 12.5, 0, Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(curX + 13.5, bodyY + 32, 12.5, 0, Math.PI);
        ctx.stroke();

        ctx.fillStyle = this.maneColor;
        const tailSwing = Math.sin(this.animTick * 0.25) * 16.0;
        ctx.beginPath();
        ctx.moveTo(curX - 12, bodyY + 60);
        ctx.lineTo(curX + 12, bodyY + 60);
        ctx.lineTo(curX + tailSwing + 22, footY - 5);
        ctx.lineTo(curX + tailSwing - 10, footY - 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.coatColor;
        ctx.fillRect(curX - 17, headY + 25, 34, 46);

        const headGrad = ctx.createLinearGradient(curX - 23, headY, curX - 23, headY + 54);
        headGrad.addColorStop(0, this.coatColor);
        headGrad.addColorStop(1, this.darkCoatColor);
        ctx.fillStyle = headGrad;
        ctx.beginPath();
        ctx.ellipse(curX, headY + 27, 23, 27, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5a2d19';
        ctx.beginPath();
        ctx.ellipse(curX, headY + 47.5, 17, 12.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(curX - 7, headY + 48, 3, 0, Math.PI * 2);
        ctx.arc(curX + 7, headY + 48, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.coatColor;
        ctx.beginPath();
        ctx.moveTo(curX - 19, headY + 5);
        ctx.lineTo(curX - 23, headY - 18);
        ctx.lineTo(curX - 7, headY + 2);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(curX + 7, headY + 2);
        ctx.lineTo(curX + 23, headY - 18);
        ctx.lineTo(curX + 19, headY + 5);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(curX - 12, headY + 18.5, 6, 4.5, 0, 0, Math.PI * 2);
        ctx.ellipse(curX + 12, headY + 18.5, 6, 4.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(curX - 12, headY + 18, 3, 0, Math.PI * 2);
        ctx.arc(curX + 11, headY + 18, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.maneColor;
        const maneWhip = Math.sin(this.animTick * 0.35) * 12.0;
        ctx.beginPath();
        ctx.ellipse(curX, headY + 3, 13, 13, 0, 0, Math.PI * 2);
        ctx.ellipse(curX - 17 + maneWhip, headY + 34, 9.5, 24, 0, 0, Math.PI * 2);
        ctx.ellipse(curX + 17 - maneWhip, headY + 34, 9.5, 24, 0, 0, Math.PI * 2);
        ctx.fill();

        this.drawArms(ctx, curX, bodyY, isArmsCrossed);
    }

    drawArms(ctx, curX, bodyY, isArmsCrossed) {
        const armThickness = 15.0;

        if (isArmsCrossed) {
            ctx.fillStyle = this.coatColor;
            ctx.beginPath();
            ctx.ellipse(curX - 11, bodyY + 27, 25, (armThickness + 4) / 2, -0.15, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(curX + 11, bodyY + 31, 25, (armThickness + 4) / 2, 0.15, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#19191e';
            ctx.fillRect(curX + 18, bodyY + 20, 11, 13);
            ctx.fillRect(curX - 28, bodyY + 24, 11, 13);

            ctx.strokeStyle = 'rgba(90, 40, 15, 0.7)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(curX, bodyY + 30, 22, 0, Math.PI);
            ctx.stroke();

        } else {
            ctx.fillStyle = this.coatColor;

            if (this.danceMove === 'UP') {
                ctx.fillRect(curX - 36, bodyY - 22, armThickness, 48);
                ctx.fillRect(curX + 21, bodyY - 22, armThickness, 48);
                ctx.fillStyle = '#19191e';
                ctx.fillRect(curX - 37, bodyY - 30, 17, 10);
                ctx.fillRect(curX + 20, bodyY - 30, 17, 10);

            } else if (this.danceMove === 'RIGHT') {
                ctx.beginPath();
                ctx.ellipse(curX - 20, bodyY + 20, 10, armThickness / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillRect(curX + 10, bodyY + 18, 48, armThickness);
                ctx.fillStyle = '#19191e';
                ctx.fillRect(curX + 54, bodyY + 17, 13, 17);

            } else if (this.danceMove === 'FEVER') {
                ctx.fillRect(curX - 58, bodyY + 15, 116, armThickness);
                ctx.fillStyle = '#19191e';
                ctx.fillRect(curX - 66, bodyY + 14, 11, 17);
                ctx.fillRect(curX + 55, bodyY + 14, 11, 17);

            } else if (this.danceMove === 'FINISH') {
                ctx.fillRect(curX + 18, bodyY - 30, armThickness, 55);
                ctx.beginPath();
                ctx.ellipse(curX - 23, bodyY + 26, 12.5, armThickness / 2, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#19191e';
                ctx.fillRect(curX + 17, bodyY - 40, 17, 12);
                ctx.fillRect(curX - 38, bodyY + 24, 12, 12);
            }
        }
    }
}

// --- 5. メインゲームエンジン (GameEngine) ---
class GameEngine {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.sound = new SoundManager();

        // 画面全体に広がる4レーンのX座標 (中央に馬が踊る幅360pxのステージを確保)
        // [←, ↑, ↓, →]
        this.LaneX = [120, 310, 670, 860];
        this.TargetY = 490;
        this.StartY = -40;

        this.state = 'SELECT'; // 'SELECT', 'PLAYING', 'PAUSED', 'RESULT'
        this.selectedSongIndex = 0;
        this.difficulty = 'NORMAL';

        // キャラクター:
        // 選曲画面時は右側(720)でプレビュー、プレイ中は画面真ん中(490)で主役として仁王立ちダンス！
        this.mainHorse = new Horse(720, 480, { isStoodUp: false, scale: 1.05 });
        this.backDancer1 = new Horse(215, 450, {
            isStoodUp: true,
            coatColor: '#eeeeee',
            darkCoatColor: '#c3c3cd',
            maneColor: '#fcfcff',
            scale: 0.65
        });
        this.backDancer2 = new Horse(765, 450, {
            isStoodUp: true,
            coatColor: '#302d30',
            darkCoatColor: '#1a181a',
            maneColor: '#120f12',
            scale: 0.65
        });

        this.notes = [];
        this.lanePressGlow = [0, 0, 0, 0];

        // スコア
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.countPerfect = 0;
        this.countGreat = 0;
        this.countGood = 0;
        this.countMiss = 0;

        // フィーバー
        this.feverGauge = 0;
        this.isFeverTime = false;
        this.feverTimer = 0;

        // 判定文字演出
        this.judgeText = '';
        this.judgeColor = '#ffd700';
        this.judgeAlpha = 0.0;
        this.judgeScale = 1.0;

        // パーティクル
        this.effects = [];

        this.totalNotesCount = 0;
        this.hasCleared = false;
        this.clearWaitTimer = 0;

        this.setupEventListeners();
        requestAnimationFrame(() => this.gameLoop());
    }

    get currentSong() {
        return SONGS[this.selectedSongIndex];
    }

    setupEventListeners() {
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));

        // クリック / タップ操作
        this.canvas.addEventListener('pointerdown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const clickX = (e.clientX - rect.left) * scaleX;
            const clickY = (e.clientY - rect.top) * scaleY;

            if (this.state === 'SELECT') {
                // 曲カードクリック判定 (x: 40～440, y: 120～245 / 265～390)
                const cardW = 400;
                const cardH = 125;
                const c1X = 40; const c1Y = 120;
                const c2X = 40; const c2Y = 265;

                if (clickX >= c1X && clickX <= c1X + cardW && clickY >= c1Y && clickY <= c1Y + cardH) {
                    if (this.selectedSongIndex === 0) {
                        this.startGame();
                    } else {
                        this.selectedSongIndex = 0;
                        this.sound.playHitSE('GREAT');
                    }
                    return;
                }
                if (clickX >= c2X && clickX <= c2X + cardW && clickY >= c2Y && clickY <= c2Y + cardH) {
                    if (this.selectedSongIndex === 1) {
                        this.startGame();
                    } else {
                        this.selectedSongIndex = 1;
                        this.sound.playHitSE('GREAT');
                    }
                    return;
                }

                // 難易度切り替えボタン領域 (x: 40～440, y: 430～480)
                if (clickX >= 40 && clickX <= 440 && clickY >= 430 && clickY <= 480) {
                    this.difficulty = (this.difficulty === 'NORMAL') ? 'HARD' : 'NORMAL';
                    this.sound.playHitSE('GREAT');
                    return;
                }

                // STARTボタン領域 (x: 40～440, y: 495～545)
                if (clickX >= 40 && clickX <= 440 && clickY >= 495 && clickY <= 545) {
                    this.startGame();
                    return;
                }

            } else if (this.state === 'RESULT') {
                this.startGame();
            } else if (this.state === 'PAUSED') {
                // ポーズメニューのボタンクリック判定 (幅380, 高さ50)
                const bx = 300; const bw = 380; const bh = 50;
                // 1. 再開ボタン (y: 220)
                if (clickX >= bx && clickX <= bx + bw && clickY >= 220 && clickY <= 220 + bh) {
                    this.state = 'PLAYING';
                    this.sound.resumeBgm();
                    return;
                }
                // 2. リトライボタン (y: 290)
                if (clickX >= bx && clickX <= bx + bw && clickY >= 290 && clickY <= 290 + bh) {
                    this.startGame();
                    return;
                }
                // 3. 曲選択に戻るボタン (y: 360)
                if (clickX >= bx && clickX <= bx + bw && clickY >= 360 && clickY <= 360 + bh) {
                    this.returnToSelect();
                    return;
                }

            } else if (this.state === 'PLAYING') {
                // 右上の「一時停止 / ホーム」ボタンクリック (x: 885, y: 12, w: 80, h: 32)
                if (clickX >= 885 && clickX <= 965 && clickY >= 12 && clickY <= 44) {
                    this.state = 'PAUSED';
                    this.sound.pauseBgm();
                    return;
                }

                // 4レーンのタップ判定 (LaneX = [120, 310, 670, 860])
                for (let i = 0; i < 4; i++) {
                    if (Math.abs(clickX - this.LaneX[i]) < 48) {
                        this.lanePressGlow[i] = 1.0;
                        this.checkHit(i);
                        return;
                    }
                }

                // フィーバー発動タップ (中央上部)
                if (clickX >= 360 && clickX <= 620 && clickY <= 65 && this.feverGauge >= 100) {
                    this.startFeverMode();
                }
            }
        });
    }

    handleKeyDown(e) {
        const key = e.key.toUpperCase();

        if (this.state === 'SELECT') {
            if (e.code === 'ArrowUp' || e.code === 'ArrowDown' || key === 'W' || key === 'S') {
                // 曲切り替え
                this.selectedSongIndex = (this.selectedSongIndex === 0) ? 1 : 0;
                this.sound.playHitSE('GREAT');
            } else if (e.code === 'ArrowLeft' || e.code === 'ArrowRight' || key === 'A' || key === 'D') {
                // 難易度切り替え
                this.difficulty = (this.difficulty === 'NORMAL') ? 'HARD' : 'NORMAL';
                this.sound.playHitSE('GREAT');
            } else if (e.code === 'Space' || e.code === 'Enter') {
                this.startGame();
            }
            return;
        }

        if (this.state === 'RESULT') {
            if (e.code === 'Space' || key === 'R' || e.code === 'Enter') {
                this.startGame();
            } else if (e.code === 'Escape') {
                this.returnToSelect();
            }
            return;
        }

        if (this.state === 'PAUSED') {
            if (e.code === 'Space' || key === 'P' || key === '1' || e.code === 'Enter') {
                // 再開
                this.state = 'PLAYING';
                this.sound.resumeBgm();
            } else if (key === 'R' || key === '2') {
                // リトライ
                this.startGame();
            } else if (e.code === 'Escape' || e.code === 'Backspace' || key === 'Q' || key === '3' || key === 'H') {
                // 曲選択（ホーム）に戻る
                this.returnToSelect();
            }
            return;
        }

        if (this.state === 'PLAYING') {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.mainHorse.toggleStance();
                this.backDancer1.isStoodUp = this.mainHorse.isStoodUp;
                this.backDancer2.isStoodUp = this.mainHorse.isStoodUp;
                this.judgeText = this.mainHorse.isStoodUp ? '仁王立ちモード！' : '四足歩行モード（草ハムハム）';
                this.judgeColor = '#00ffff';
                this.judgeAlpha = 1.0;
                this.judgeScale = 1.0;
                return;
            }

            if ((e.code === 'Space' || key === 'F') && this.feverGauge >= 100) {
                e.preventDefault();
                this.startFeverMode();
                return;
            }

            if (key === 'R') {
                this.startGame();
                return;
            }

            if (key === 'P' || e.code === 'Escape') {
                this.state = 'PAUSED';
                this.sound.pauseBgm();
                return;
            }

            let dir = -1;
            if (e.code === 'ArrowLeft' || key === 'A') dir = 0;
            else if (e.code === 'ArrowUp' || key === 'W') dir = 1;
            else if (e.code === 'ArrowDown' || key === 'S') dir = 2;
            else if (e.code === 'ArrowRight' || key === 'D') dir = 3;

            if (dir >= 0) {
                e.preventDefault();
                this.lanePressGlow[dir] = 1.0;
                this.checkHit(dir);
            }
        }
    }

    returnToSelect() {
        this.sound.stopBgm();
        this.mainHorse.isStoodUp = false;
        this.mainHorse.danceMove = 'IDLE';
        // 選曲画面では右側のプレビュー位置(720)に戻す
        this.mainHorse.x = 720;
        this.mainHorse.y = 480;
        this.backDancer1.isStoodUp = false;
        this.backDancer2.isStoodUp = false;
        this.state = 'SELECT';
    }

    startGame() {
        const song = this.currentSong;
        this.sound.stopBgm();
        this.sound.loadSong(song);
        this.sound.playBgm();

        // プレイ開始：画面真ん中(490)で堂々と踊るメインホース！
        this.mainHorse = new Horse(490, 475, { isStoodUp: false, scale: 1.05 });
        this.backDancer1.x = 215;
        this.backDancer1.y = 450;
        this.backDancer2.x = 765;
        this.backDancer2.y = 450;

        this.notes = Chart.loadChart(song.id, this.difficulty);
        this.totalNotesCount = this.notes.length;

        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.countPerfect = 0;
        this.countGreat = 0;
        this.countGood = 0;
        this.countMiss = 0;
        this.feverGauge = 0;
        this.isFeverTime = false;
        this.feverTimer = 0;
        this.effects = [];
        this.hasCleared = false;
        this.clearWaitTimer = 0;

        this.state = 'PLAYING';
        this.judgeText = `🔥 START: ${song.title}!`;
        this.judgeColor = '#ffd700';
        this.judgeAlpha = 1.0;
        this.judgeScale = 1.2;
    }

    checkHit(dir) {
        const curTime = this.sound.currentTime;
        let candidate = null;
        let minDiffAbs = Infinity;
        let bestDiff = 0.0;

        // 論理削除されていない（未ヒット・未ミス・未物理削除フラグ）ノーツのみを探索
        for (let i = 0; i < this.notes.length; i++) {
            const n = this.notes[i];
            if (n.direction === dir && !n.isHit && !n.isMissed && !n.isDead) {
                const diff = curTime - n.targetTime;
                const absDiff = Math.abs(diff);
                if (absDiff <= 0.170 && absDiff < minDiffAbs) {
                    minDiffAbs = absDiff;
                    bestDiff = diff;
                    candidate = n;
                }
            }
        }

        const moves = ['LEFT', 'UP', 'DOWN', 'RIGHT'];
        const moveName = moves[dir];
        this.mainHorse.isStoodUp = true;
        this.mainHorse.setDanceMove(moveName, 22);

        if (this.combo >= 3 || this.isFeverTime || curTime >= 14.0) {
            this.backDancer1.isStoodUp = true;
            this.backDancer2.isStoodUp = true;
            this.backDancer1.setDanceMove(moveName, 22);
            this.backDancer2.setDanceMove(moveName, 22);
        }

        if (candidate) {
            // --- 【論理削除 (Logical Deletion)】 ---
            // ノーツの状態をヒット済みに変更し、判定・描画・当たり判定の全対象から即座に無効化
            candidate.isHit = true;
            candidate.isDead = true; // 次のフレームで物理削除されるフラグ
            candidate.isVisible = false;
            candidate.hitDiffSec = bestDiff;

            if (minDiffAbs <= 0.055) {
                candidate.hitRating = 'PERFECT';
                this.countPerfect++;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                this.score += Math.floor(1000 * (1.0 + this.combo * 0.05));
                this.feverGauge = Math.min(100, this.feverGauge + 6);

                this.judgeText = '🔥 PERFECT!! ヒヒィーーン！';
                this.judgeColor = '#ffd700';
                this.judgeAlpha = 1.0;
                this.judgeScale = 1.35;
                this.sound.playHitSE('PERFECT');
                this.spawnParticles(this.LaneX[dir], this.TargetY, 'PERFECT!', '#ffd700');

            } else if (minDiffAbs <= 0.110) {
                candidate.hitRating = 'GREAT';
                this.countGreat++;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                this.score += Math.floor(600 * (1.0 + this.combo * 0.03));
                this.feverGauge = Math.min(100, this.feverGauge + 4);

                this.judgeText = '✨ GREAT!! 華麗なステップ！';
                this.judgeColor = '#50ff78';
                this.judgeAlpha = 1.0;
                this.judgeScale = 1.2;
                this.sound.playHitSE('GREAT');
                this.spawnParticles(this.LaneX[dir], this.TargetY, 'GREAT!', '#32cd32');

            } else {
                candidate.hitRating = 'GOOD';
                this.countGood++;
                this.combo++;
                if (this.combo > this.maxCombo) this.maxCombo = this.combo;
                this.score += 250;
                this.feverGauge = Math.min(100, this.feverGauge + 2);

                this.judgeText = '👍 GOOD!! ナイスキープ！';
                this.judgeColor = '#00ffff';
                this.judgeAlpha = 1.0;
                this.judgeScale = 1.05;
                this.sound.playHitSE('GOOD');
                this.spawnParticles(this.LaneX[dir], this.TargetY, 'GOOD', '#00ffff');
            }

        } else {
            this.judgeText = '🎵 FREE STEP!!';
            this.judgeColor = '#a0d2ff';
            this.judgeAlpha = 0.7;
            this.judgeScale = 0.9;
            this.spawnParticles(this.LaneX[dir], this.TargetY, 'STEP!', 'rgba(0, 255, 255, 0.7)');
        }
    }

    startFeverMode() {
        this.isFeverTime = true;
        this.feverTimer = 260;
        this.feverGauge = 0;
        this.judgeText = '🕺🌪️ FEVER TIME!! 仁王立ち大旋風！！';
        this.judgeColor = '#ff69b4';
        this.judgeAlpha = 1.0;
        this.judgeScale = 1.4;
        this.sound.playFeverSE();

        this.mainHorse.setDanceMove('FEVER', 60);
        this.backDancer1.setDanceMove('FEVER', 60);
        this.backDancer2.setDanceMove('FEVER', 60);
    }

    spawnParticles(x, y, text, color) {
        const symbols = ['♪', '♫', '★', '✨', '🐴', '🔥'];
        const sym = symbols[Math.floor(Math.random() * symbols.length)];
        this.effects.push({
            x: x + (Math.random() - 0.5) * 16,
            y: y - 22,
            vx: (Math.random() - 0.5) * 6.0,
            vy: -3.5 - Math.random() * 2.0,
            sym: sym,
            color: color,
            life: 38
        });
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        const curTime = this.sound.currentTime;
        const beatProgress = (curTime % 0.5) / 0.5;

        if (this.state === 'SELECT') {
            this.mainHorse.update(0.0);
        } else if (this.state === 'PLAYING') {
            // 曲の序盤ボーカルで仁王立ち
            if (curTime >= 4.5 && !this.mainHorse.isStoodUp) {
                this.mainHorse.isStoodUp = true;
            }

            this.mainHorse.update(beatProgress);
            this.backDancer1.update(beatProgress);
            this.backDancer2.update(beatProgress);

            for (let i = 0; i < 4; i++) {
                if (this.lanePressGlow[i] > 0) this.lanePressGlow[i] -= 0.12;
            }

            // --- 1. ノーツの移動・MISS判定・論理削除 (Logical Update & Deletion) ---
            for (let i = 0; i < this.notes.length; i++) {
                const n = this.notes[i];
                n.updatePosition(curTime, this.TargetY, this.StartY);

                // 見逃しMISS発生時の論理削除
                if (n.isMissed && n.hitRating === 'MISS' && !n.isHit) {
                    n.isHit = true;
                    n.isDead = true; // 物理削除フラグ
                    this.countMiss++;
                    this.combo = 0;
                    this.judgeText = 'MISS... (ズッコケ)';
                    this.judgeColor = '#808080';
                    this.judgeAlpha = 1.0;
                    this.judgeScale = 1.0;
                    this.sound.playHitSE('MISS');
                    this.mainHorse.setDanceMove('MISS', 18);
                    this.backDancer1.setDanceMove('MISS', 18);
                    this.backDancer2.setDanceMove('MISS', 18);
                }
            }

            // --- 2. ノーツの物理削除 (Physical Deletion) ---
            // 不要になったノーツ（ヒット済み・ミス判定済み・通過済み）を配列から物理的に除去してメモリ解放
            for (let i = this.notes.length - 1; i >= 0; i--) {
                const n = this.notes[i];
                if (n.isDead || (curTime - n.targetTime > 0.35)) {
                    this.notes.splice(i, 1);
                }
            }

            if (this.isFeverTime) {
                this.feverTimer--;
                if (this.feverTimer % 7 === 0) {
                    this.spawnParticles(220 + Math.random() * 540, 320 + Math.random() * 60, 'FEVER!!', '#ffd700');
                }
                if (this.feverTimer <= 0) {
                    this.isFeverTime = false;
                    this.mainHorse.setDanceMove('IDLE');
                    this.backDancer1.setDanceMove('IDLE');
                    this.backDancer2.setDanceMove('IDLE');
                }
            }

            // クリア判定 (楽曲終了直前)
            const clearThreshold = this.currentSong.duration - 1.5;
            if (curTime >= clearThreshold && !this.hasCleared) {
                this.hasCleared = true;
                this.clearWaitTimer = 75;
                this.mainHorse.setDanceMove('FINISH', 999);
                this.backDancer1.setDanceMove('FINISH', 999);
                this.backDancer2.setDanceMove('FINISH', 999);
                this.judgeText = '🎉 STAGE CLEAR!! ヒヒィーーン！';
                this.judgeColor = '#ffd700';
                this.judgeAlpha = 1.0;
                this.judgeScale = 1.5;
            }

            if (this.hasCleared) {
                this.clearWaitTimer--;
                if (this.clearWaitTimer <= 0) {
                    this.saveHighScore();
                    this.state = 'RESULT';
                    this.sound.stopBgm();
                    // リザルト画面ではスコアパネルの右側(740)に立たせる
                    this.mainHorse.x = 740;
                    this.mainHorse.y = 480;
                }
            }
        } else if (this.state === 'RESULT') {
            this.mainHorse.update(0.0);
        }

        for (let i = this.effects.length - 1; i >= 0; i--) {
            const eff = this.effects[i];
            eff.x += eff.vx;
            eff.y += eff.vy;
            eff.vx *= 0.98;
            eff.vy += 0.08;
            eff.life--;
            if (eff.life <= 0) {
                this.effects.splice(i, 1);
            }
        }

        if (this.judgeAlpha > 0) this.judgeAlpha -= 0.025;
        if (this.judgeScale > 1.0) this.judgeScale -= 0.02;
    }

    saveHighScore() {
        try {
            const key = `horse_score_${this.currentSong.id}_${this.difficulty}`;
            const prev = parseInt(localStorage.getItem(key) || '0', 10);
            if (this.score > prev) {
                localStorage.setItem(key, this.score.toString());
            }
        } catch (e) { }
    }

    getHighScore(songId, diff) {
        try {
            return parseInt(localStorage.getItem(`horse_score_${songId}_${diff}`) || '0', 10);
        } catch (e) {
            return 0;
        }
    }

    draw() {
        const ctx = this.ctx;
        ctx.clearRect(0, 0, 980, 620);

        this.drawDiscoPaddock(ctx);

        if (this.state === 'SELECT') {
            this.drawSelectScreen(ctx);
        } else if (this.state === 'PLAYING' || this.state === 'PAUSED') {
            // 1. レーンの背景・レール・ターゲット枠を描画（画面いっぱいの4レーン）
            this.drawRhythmTrack(ctx);

            // 2. バックダンサー描画 (両脇レーンの背後で左右対称にダンス)
            const curTime = this.sound.currentTime;
            if (curTime >= 14.0 || this.combo >= 5 || this.isFeverTime) {
                this.backDancer1.draw(ctx);
                this.backDancer2.draw(ctx);
            }

            // 3. 【画面真ん中で踊るメインホース！】(主役として中央360pxの広々ステージでダンス)
            this.mainHorse.draw(ctx);

            // 4. ノーツを描画（画面全体に広がるワイドレーンを流れる大型ノーツ）
            this.drawNotes(ctx);

            // 5. パーティクル演出
            this.drawParticles(ctx);

            // 6. HUD（スコア、コンボ、フィーバーゲージ、中央判定演出、操作案内）
            this.drawHUD(ctx);

            if (this.state === 'PAUSED') {
                this.drawPauseOverlay(ctx);
            }
        } else if (this.state === 'RESULT') {
            this.mainHorse.draw(ctx);
            this.drawResultScreen(ctx);
        }
    }

    drawDiscoPaddock(ctx) {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, 480);
        if (this.isFeverTime) {
            skyGrad.addColorStop(0, '#371241');
            skyGrad.addColorStop(1, '#782364');
        } else {
            skyGrad.addColorStop(0, '#101422');
            skyGrad.addColorStop(1, '#1c2236');
        }
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, 980, 480);

        const sec = (this.state === 'PLAYING') ? this.sound.currentTime : (Date.now() / 1000);
        const l1 = Math.sin(sec * 4.0) * 380.0;
        const l2 = Math.cos(sec * 4.0) * 340.0;

        // 中央ミラーボール(490, 0)から真ん中で踊る馬へ降り注ぐスポットライトビーム
        ctx.lineWidth = 5.0;
        ctx.strokeStyle = this.isFeverTime ? 'rgba(255, 215, 0, 0.45)' : 'rgba(255, 0, 255, 0.32)';
        ctx.beginPath();
        ctx.moveTo(490, 0);
        ctx.lineTo(310 + l1, 480);
        ctx.stroke();

        ctx.strokeStyle = this.isFeverTime ? 'rgba(255, 105, 180, 0.45)' : 'rgba(0, 255, 255, 0.32)';
        ctx.beginPath();
        ctx.moveTo(490, 0);
        ctx.lineTo(670 + l2, 480);
        ctx.stroke();

        // ディスコフロア (床面)
        const floorGrad = ctx.createLinearGradient(0, 480, 0, 620);
        floorGrad.addColorStop(0, '#222634');
        floorGrad.addColorStop(1, '#0e1017');
        ctx.fillStyle = floorGrad;
        ctx.fillRect(0, 480, 980, 140);

        // フロアのパースペクティブグリッド（画面中央 x:490 へ収束）
        ctx.strokeStyle = this.isFeverTime ? 'rgba(255, 215, 0, 0.55)' : 'rgba(0, 255, 255, 0.28)';
        ctx.lineWidth = 1.5;
        for (let x = 0; x <= 980; x += 70) {
            ctx.beginPath();
            ctx.moveTo(x, 480);
            ctx.lineTo(x + (x - 490) * 0.4, 620);
            ctx.stroke();
        }
        ctx.beginPath();
        ctx.moveTo(0, 480); ctx.lineTo(980, 480);
        ctx.moveTo(0, 530); ctx.lineTo(980, 530);
        ctx.moveTo(0, 580); ctx.lineTo(980, 580);
        ctx.stroke();

        // 天井中央のミラーボール (x: 490)
        ctx.strokeStyle = '#c0c0c0';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(490, 0); ctx.lineTo(490, 32);
        ctx.stroke();

        const ballGrad = ctx.createRadialGradient(486, 44, 2, 490, 48, 18);
        ballGrad.addColorStop(0, '#ffffff');
        ballGrad.addColorStop(1, '#888899');
        ctx.fillStyle = ballGrad;
        ctx.beginPath();
        ctx.arc(490, 48, 18, 0, Math.PI * 2);
        ctx.fill();
    }

    drawRhythmTrack(ctx) {
        const dirArrows = ['←', '↑', '↓', '→'];
        const keyGuides = ['A', 'W', 'S', 'D'];
        const laneThemeColors = [
            'rgb(0, 225, 255)',  // 0: ← Cyan
            'rgb(255, 45, 120)',  // 1: ↑ Magenta
            'rgb(0, 255, 136)',  // 2: ↓ Green
            'rgb(255, 200, 20)'   // 3: → Yellow
        ];

        for (let i = 0; i < 4; i++) {
            const lx = this.LaneX[i];
            const laneW = 68;

            // 1. レーン背景（半透明サイバーコラムでフロアや馬の動きが透けて見える）
            ctx.fillStyle = 'rgba(12, 18, 32, 0.45)';
            ctx.fillRect(lx - laneW / 2, 0, laneW, 620);

            // 2. レーン境界線（ネオンレール）
            ctx.strokeStyle = 'rgba(0, 220, 255, 0.16)';
            ctx.lineWidth = 1.0;
            ctx.beginPath();
            ctx.moveTo(lx - laneW / 2, 0); ctx.lineTo(lx - laneW / 2, 620);
            ctx.moveTo(lx + laneW / 2, 0); ctx.lineTo(lx + laneW / 2, 620);
            ctx.stroke();

            // レーン中央ガイドライン
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            ctx.moveTo(lx, 0); ctx.lineTo(lx, this.TargetY);
            ctx.stroke();
            ctx.setLineDash([]);

            // 3. キー入力・タップ時のレーン発光ビーム
            if (this.lanePressGlow[i] > 0.04) {
                const glowGrad = ctx.createLinearGradient(0, 0, 0, this.TargetY);
                glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
                glowGrad.addColorStop(1, laneThemeColors[i].replace('rgb', 'rgba').replace(')', `, ${this.lanePressGlow[i] * 0.45})`));
                ctx.fillStyle = glowGrad;
                ctx.fillRect(lx - laneW / 2, 0, laneW, this.TargetY);
            }

            // 4. ターゲットレセプター（受容枠）
            let tr = 29.0;
            if (this.lanePressGlow[i] > 0.08) tr += this.lanePressGlow[i] * 5.0;

            // 外側グロー
            ctx.fillStyle = this.lanePressGlow[i] > 0.1
                ? laneThemeColors[i].replace('rgb', 'rgba').replace(')', ', 0.35)')
                : 'rgba(255, 255, 255, 0.06)';
            ctx.beginPath();
            ctx.arc(lx, this.TargetY, tr + 8, 0, Math.PI * 2);
            ctx.fill();

            // レセプター円枠
            ctx.strokeStyle = this.lanePressGlow[i] > 0.1 ? '#ffffff' : 'rgba(255, 255, 255, 0.85)';
            ctx.lineWidth = 2.8;
            ctx.beginPath();
            ctx.arc(lx, this.TargetY, tr, 0, Math.PI * 2);
            ctx.stroke();

            // レセプター中央の矢印
            ctx.fillStyle = this.lanePressGlow[i] > 0.1 ? '#ffffff' : 'rgba(255, 255, 255, 0.75)';
            ctx.font = 'bold 20px "Arial Black", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(dirArrows[i], lx, this.TargetY - 1);

            // 下部のキーガイド文字 (A, W, S, D)
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 12px "Meiryo UI", sans-serif';
            ctx.fillText(keyGuides[i], lx, this.TargetY + 36);
        }
    }

    drawNotes(ctx) {
        // 画面全体に広がるノーツを描画
        for (let i = 0; i < this.notes.length; i++) {
            const n = this.notes[i];
            n.draw(ctx, this.LaneX[n.direction], this.TargetY);
        }
    }

    drawHUD(ctx) {
        // 左上: スコア & コンボ
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Arial Black", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${this.score.toLocaleString()}`, 30, 32);

        if (this.combo > 1) {
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 26px "Impact", sans-serif';
            ctx.fillText(`${this.combo} COMBO!!`, 30, 68);
        }

        // 中央上部: フィーバーゲージ & 楽曲プログレスバー (x: 375～605)
        const fRect = { x: 375, y: 14, w: 230, h: 14 };
        ctx.fillStyle = '#222638';
        ctx.fillRect(fRect.x, fRect.y, fRect.w, fRect.h);

        const fRatio = Math.min(1.0, this.feverGauge / 100.0);
        const fGrad = ctx.createLinearGradient(fRect.x, 0, fRect.x + fRect.w, 0);
        fGrad.addColorStop(0, '#ffd700');
        fGrad.addColorStop(1, '#ff1493');
        ctx.fillStyle = fGrad;
        ctx.fillRect(fRect.x, fRect.y, fRect.w * fRatio, fRect.h);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(fRect.x, fRect.y, fRect.w, fRect.h);

        ctx.fillStyle = (this.feverGauge >= 100) ? '#ffd700' : '#ffffff';
        ctx.font = 'bold 10.5px "Meiryo UI", sans-serif';
        ctx.textAlign = 'center';
        const fText = (this.feverGauge >= 100) ? '★ FEVER READY!! [Space/F] ★' : `FEVER GAUGE ${this.feverGauge}%`;
        ctx.fillText(fText, 490, 38);

        // 楽曲演奏時間プログレスバー
        const curTime = this.sound.currentTime;
        const dur = this.currentSong.duration;
        const pRect = { x: 375, y: 44, w: 230, h: 6 };

        ctx.fillStyle = '#1e2230';
        ctx.fillRect(pRect.x, pRect.y, pRect.w, pRect.h);

        const pRatio = Math.min(1.0, Math.max(0.0, curTime / dur));
        ctx.fillStyle = '#00d4ff';
        ctx.fillRect(pRect.x, pRect.y, pRect.w * pRatio, pRect.h);

        ctx.fillStyle = '#b0bcd8';
        ctx.font = '10px "Meiryo UI", sans-serif';
        const curMin = Math.floor(curTime / 60);
        const curSec = Math.floor(curTime % 60).toString().padStart(2, '0');
        const durMin = Math.floor(dur / 60);
        const durSec = Math.floor(dur % 60).toString().padStart(2, '0');
        ctx.fillText(`🎵 ${this.currentSong.title} (${this.difficulty}) [${curMin}:${curSec} / ${durMin}:${durSec}]`, 490, 62);

        // 右上: 「⏸ MENU」ボタン (x: 885, y: 12, w: 80, h: 32)
        ctx.fillStyle = 'rgba(25, 32, 48, 0.85)';
        ctx.fillRect(885, 12, 80, 32);
        ctx.strokeStyle = '#00d4ff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(885, 12, 80, 32);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 12px "Meiryo UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⏸ MENU', 885 + 40, 32);

        // 中央: 判定文字演出 (PERFECT / GREAT / GOOD / MISS)
        if (this.judgeAlpha > 0.05) {
            ctx.save();
            ctx.globalAlpha = this.judgeAlpha;
            ctx.fillStyle = this.judgeColor;
            ctx.font = `bold ${Math.floor(22 * this.judgeScale)}px "Impact", sans-serif`;
            ctx.textAlign = 'center';
            ctx.fillText(this.judgeText, 490, this.TargetY - 45);
            ctx.restore();
        }

        // 下部中央: 操作説明バー
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.font = '10.5px "Meiryo UI", sans-serif';
        ctx.fillText('【操作】 ← ↑ ↓ → / A W S D: ステップ  |  Tab: 仁王立ち ⇔ 四足切替  |  Space: フィーバー  |  Esc: ポーズ・曲選択', 490, 608);
    }

    drawParticles(ctx) {
        for (const eff of this.effects) {
            ctx.fillStyle = eff.color;
            ctx.font = 'bold 18px "Impact", sans-serif';
            ctx.fillText(eff.sym, eff.x, eff.y);
        }
    }

    // --- 曲選択画面 (MUSIC SELECT) ---
    drawSelectScreen(ctx) {
        this.mainHorse.draw(ctx);

        // 左側オーバーレイパネル
        ctx.fillStyle = 'rgba(10, 14, 24, 0.85)';
        ctx.fillRect(0, 0, 480, 620);

        ctx.strokeStyle = 'rgba(0, 220, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(0, 0, 480, 620);

        // ヘッダーロゴ
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 28px "Impact", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('DANCING HORSE REVOLUTION', 40, 50);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 14px "Arial Black", sans-serif';
        ctx.fillText('★ MUSIC SELECT (曲選択) ★', 40, 78);

        ctx.fillStyle = '#a0a8c0';
        ctx.font = '11px "Meiryo UI", sans-serif';
        ctx.fillText('↑ / ↓ キーまたはクリックで曲を選択！', 40, 98);

        // 楽曲カード一覧
        const cardW = 400;
        const cardH = 125;
        const startY = 120;
        const gap = 145;

        for (let i = 0; i < SONGS.length; i++) {
            const song = SONGS[i];
            const isSelected = (i === this.selectedSongIndex);
            const cy = startY + i * gap;

            // カード背景
            ctx.save();
            if (isSelected) {
                // 選択中カードのハイライト枠＆グロー
                ctx.fillStyle = 'rgba(30, 45, 75, 0.9)';
                ctx.fillRect(40, cy, cardW, cardH);

                ctx.strokeStyle = song.color;
                ctx.lineWidth = 3.0;
                ctx.strokeRect(40, cy, cardW, cardH);

                // 左端のアクセントバー
                ctx.fillStyle = song.color;
                ctx.fillRect(40, cy, 8, cardH);
            } else {
                ctx.fillStyle = 'rgba(18, 22, 34, 0.7)';
                ctx.fillRect(40, cy, cardW, cardH);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.lineWidth = 1.0;
                ctx.strokeRect(40, cy, cardW, cardH);
            }

            // 曲アイコン
            ctx.font = '28px sans-serif';
            ctx.fillText(song.icon, 60, cy + 42);

            // トラック番号 & タイトル
            ctx.fillStyle = isSelected ? '#ffd700' : '#c0c8e0';
            ctx.font = 'bold 11px "Arial Black", sans-serif';
            ctx.fillText(`TRACK 0${i + 1}  •  ${song.genre}`, 105, cy + 28);

            ctx.fillStyle = isSelected ? '#ffffff' : '#e0e5f0';
            ctx.font = 'bold 18px "Impact", sans-serif';
            ctx.fillText(song.title, 105, cy + 52);

            // 曲情報 (BPM / 時間 / ハイスコア)
            const hiScore = this.getHighScore(song.id, this.difficulty);
            ctx.fillStyle = '#a0a8c0';
            ctx.font = '10.5px "Meiryo UI", sans-serif';
            const m = Math.floor(song.duration / 60);
            const s = Math.floor(song.duration % 60).toString().padStart(2, '0');
            ctx.fillText(`BPM ${song.bpm}  |  Length: ${m}:${s}`, 105, cy + 72);

            ctx.fillStyle = isSelected ? '#ffd700' : '#808898';
            ctx.fillText(`HI-SCORE (${this.difficulty}): ${hiScore.toLocaleString()} pts`, 105, cy + 88);

            // 説明文
            ctx.fillStyle = isSelected ? '#80e0ff' : '#606878';
            ctx.font = '9.5px "Meiryo UI", sans-serif';
            ctx.fillText(song.description, 60, cy + 112);

            ctx.restore();
        }

        // 難易度切り替えセクション
        const dy = 430;
        ctx.fillStyle = 'rgba(20, 25, 40, 0.8)';
        ctx.fillRect(40, dy, 400, 50);
        ctx.strokeStyle = 'rgba(0, 220, 255, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(40, dy, 400, 50);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px "Arial Black", sans-serif';
        ctx.fillText('DIFFICULTY:', 55, dy + 30);

        ctx.fillStyle = (this.difficulty === 'NORMAL') ? '#32cd32' : '#ff3b30';
        ctx.font = 'bold 15px "Arial Black", sans-serif';
        ctx.fillText(`< ${this.difficulty} >`, 175, dy + 31);

        ctx.fillStyle = '#80a0c0';
        ctx.font = '10px "Meiryo UI", sans-serif';
        ctx.fillText('(← / → キーまたはクリックで変更)', 265, dy + 30);

        // スタートボタン (点滅)
        const by = 495;
        const isBlink = Math.floor(Date.now() / 400) % 2 === 0;
        const startGrad = ctx.createLinearGradient(40, by, 440, by + 50);
        startGrad.addColorStop(0, '#ff9500');
        startGrad.addColorStop(1, '#ff2d75');
        ctx.fillStyle = startGrad;
        ctx.fillRect(40, by, 400, 50);

        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(40, by, 400, 50);

        ctx.fillStyle = isBlink ? '#ffffff' : '#ffd700';
        ctx.font = 'bold 18px "Arial Black", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('▶ GAME START! [SPACE / ENTER]', 240, by + 32);

        // 画面下部ヒント
        ctx.textAlign = 'left';
        ctx.fillStyle = '#808898';
        ctx.font = '10px "Meiryo UI", sans-serif';
        ctx.fillText('※ 画面タップ・クリックでも操作可能です。', 40, 570);
        ctx.fillText('※ プレイ中に [Tab] キーで四足歩行 ⇔ 仁王立ちを手動切替できます。', 40, 588);
    }

    drawPauseOverlay(ctx) {
        // 暗いオーバーレイ
        ctx.fillStyle = 'rgba(6, 10, 18, 0.86)';
        ctx.fillRect(0, 0, 980, 620);

        // タイトル
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 42px "Impact", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', 490, 130);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 15px "Meiryo UI", sans-serif';
        ctx.fillText(`🎵 プレイ中: ${this.currentSong.title} (${this.difficulty})`, 490, 168);

        ctx.fillStyle = '#a0a8b8';
        ctx.font = '12px "Meiryo UI", sans-serif';
        ctx.fillText('曲を選び直したい場合は「曲選択に戻る」を選択してください。', 490, 192);

        // ボタン3つ (x: 300, w: 380, h: 50)
        const bx = 300; const bw = 380; const bh = 50;

        // 1. 再開ボタン (y: 220)
        const g1 = ctx.createLinearGradient(bx, 220, bx + bw, 270);
        g1.addColorStop(0, '#00b074');
        g1.addColorStop(1, '#0072b2');
        ctx.fillStyle = g1;
        ctx.fillRect(bx, 220, bw, bh);
        ctx.strokeStyle = '#00ffc4';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(bx, 220, bw, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Arial Black", sans-serif';
        ctx.fillText('▶ ゲームを再開する (Resume)', 490, 245);
        ctx.fillStyle = '#c0ffe8';
        ctx.font = '11px "Meiryo UI", sans-serif';
        ctx.fillText('[ Space / P / Enter ]', 490, 262);

        // 2. リトライボタン (y: 290)
        const g2 = ctx.createLinearGradient(bx, 290, bx + bw, 340);
        g2.addColorStop(0, '#e69f00');
        g2.addColorStop(1, '#d55e00');
        ctx.fillStyle = g2;
        ctx.fillRect(bx, 290, bw, bh);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.0;
        ctx.strokeRect(bx, 290, bw, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Arial Black", sans-serif';
        ctx.fillText('🔄 最初からやり直す (Restart)', 490, 315);
        ctx.fillStyle = '#ffe0b2';
        ctx.font = '11px "Meiryo UI", sans-serif';
        ctx.fillText('[ R キー ]', 490, 332);

        // 3. 曲選択（ホーム）に戻るボタン (y: 360) ★★★
        const g3 = ctx.createLinearGradient(bx, 360, bx + bw, 410);
        g3.addColorStop(0, '#c71585');
        g3.addColorStop(1, '#4a0e4e');
        ctx.fillStyle = g3;
        ctx.fillRect(bx, 360, bw, bh);
        ctx.strokeStyle = '#ff69b4';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(bx, 360, bw, bh);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Arial Black", sans-serif';
        ctx.fillText('🏠 曲選択（ホーム）に戻る (Back to Select)', 490, 385);
        ctx.fillStyle = '#ffc0cb';
        ctx.font = '11px "Meiryo UI", sans-serif';
        ctx.fillText('[ Esc / Backspace / Q キー ]', 490, 402);

        // 下部ガイド
        ctx.fillStyle = '#808898';
        ctx.font = '11px "Meiryo UI", sans-serif';
        ctx.fillText('※ 各ボタンはマウスクリックや画面タップでも直接選択できます。', 490, 450);
    }

    drawResultScreen(ctx) {
        ctx.fillStyle = 'rgba(12, 16, 26, 0.88)';
        ctx.fillRect(40, 40, 480, 540);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(40, 40, 480, 540);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 34px "Impact", sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('STAGE CLEAR!!', 60, 85);

        ctx.fillStyle = '#00d4ff';
        ctx.font = 'bold 13px "Meiryo UI", sans-serif';
        ctx.fillText(`🎵 ${this.currentSong.title} (${this.difficulty})`, 60, 110);

        const maxScore = this.totalNotesCount * 1000;
        const rate = (maxScore > 0) ? (this.score / maxScore) : 0;
        let rank = 'C';
        let rankCol = '#c0c0c0';

        if (this.countMiss === 0 && this.countGood === 0 && this.countGreat <= 3) {
            rank = 'SSS'; rankCol = '#ffd700';
        } else if (rate >= 0.85) {
            rank = 'SS'; rankCol = '#ff82dc';
        } else if (rate >= 0.70) {
            rank = 'S'; rankCol = '#50f0ff';
        } else if (rate >= 0.55) {
            rank = 'A'; rankCol = '#78ff78';
        } else if (rate >= 0.40) {
            rank = 'B'; rankCol = '#ffd250';
        }

        ctx.fillStyle = '#a0a8b8';
        ctx.font = 'bold 13px "Meiryo UI", sans-serif';
        ctx.fillText('RANK', 360, 75);

        ctx.fillStyle = rankCol;
        ctx.font = 'bold 50px "Impact", sans-serif';
        ctx.fillText(rank, 360, 125);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 17px "Arial Black", sans-serif';
        ctx.fillText(`FINAL SCORE: ${this.score.toLocaleString()}`, 60, 145);
        ctx.fillStyle = '#ffd700';
        ctx.fillText(`MAX COMBO:   ${this.maxCombo} / ${this.totalNotesCount}`, 60, 175);

        const sy = 225;
        ctx.font = 'bold 13.5px "Meiryo UI", sans-serif';
        ctx.fillStyle = '#ffd700'; ctx.fillText(`PERFECT : ${this.countPerfect}`, 80, sy);
        ctx.fillStyle = '#32cd32'; ctx.fillText(`GREAT   : ${this.countGreat}`, 80, sy + 32);
        ctx.fillStyle = '#00ffff'; ctx.fillText(`GOOD    : ${this.countGood}`, 80, sy + 64);
        ctx.fillStyle = '#808080'; ctx.fillText(`MISS    : ${this.countMiss}`, 80, sy + 96);

        ctx.fillStyle = '#b0e0e6';
        let comment = (this.countMiss === 0) ? '🐴「完璧なステップだ！ヒヒィーーーン！！」' :
            (rate >= 0.7) ? '🐴「ナイスな仁王立ちダンスだったぜ！」' : '🐴「次はもっとノリノリで踊ろうぜ！」';
        ctx.fillText(comment, 60, 395);

        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 14px "Arial Black", sans-serif';
        ctx.fillText('PRESS [SPACE] / [R] TO RETRY', 60, 475);
        ctx.fillStyle = '#00d4ff';
        ctx.fillText('PRESS [ESC] TO MUSIC SELECT (曲選択)', 60, 510);
    }
}

// 起動
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
