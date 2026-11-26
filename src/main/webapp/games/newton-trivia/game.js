/**
 * ニュートン卿の真理探究クイズ
 * ゲームメインロジック & 破砕パーティクル & Web Audioシンセサイザー
 */

// ==========================================
// 1. Web Audio API サウンドシステム
// ==========================================
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = now + i * 0.08;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  playThrow() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1600, now + 0.25);
    filter.Q.setValueAtTime(3, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.2);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.4);
  }

  playBreak() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // 低音インパクト
    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = "sine";
    bassOsc.frequency.setValueAtTime(140, now);
    bassOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);

    bassGain.gain.setValueAtTime(0.5, now);
    bassGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    bassOsc.connect(bassGain);
    bassGain.connect(this.ctx.destination);
    bassOsc.start(now);
    bassOsc.stop(now + 0.35);

    // ガラス・破砕ノイズ
    const bufferSize = this.ctx.sampleRate * 0.5;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(2000, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.5);
  }

  playWrong() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.setValueAtTime(130, now + 0.18);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);
  }

  playPartialWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chord = [392.0, 523.25, 659.25, 783.99, 1046.5]; // G4, C5, E5, G5, C6
    chord.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + idx * 0.12;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.6);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 1.6);
    });
  }

  playFinalWin() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // 壮麗なファンファーレ旋律
    const fanfare = [
      { f: 523.25, t: 0.0, d: 0.25 }, // C5
      { f: 659.25, t: 0.25, d: 0.25 }, // E5
      { f: 783.99, t: 0.5, d: 0.35 }, // G5
      { f: 1046.5, t: 0.85, d: 0.8 }, // C6
      { f: 1318.51, t: 1.3, d: 1.8 }  // E6
    ];

    fanfare.forEach(item => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = now + item.t;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(item.f, start);

      gain.gain.setValueAtTime(0.01, start);
      gain.gain.linearRampToValueAtTime(0.3, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + item.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + item.d);
    });
  }
}

// ==========================================
// 2. 破砕（シャッター）パーティクルエンジン
// ==========================================
class BreakParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.particles = [];
    this.animId = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  // 問題カードを粉々に割るエフェクト起動
  shatter(rect) {
    this.particles = [];
    if (this.animId) cancelAnimationFrame(this.animId);

    const cols = 6;
    const rows = 5;
    const pieceW = rect.width / cols;
    const pieceH = rect.height / rows;
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // カードのガラス風破片
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const px = rect.left + c * pieceW + pieceW / 2;
        const py = rect.top + r * pieceH + pieceH / 2;

        const dx = px - centerX;
        const dy = py - centerY;
        const dist = Math.hypot(dx, dy) || 1;
        const angle = Math.atan2(dy, dx);
        const speed = Math.random() * 8 + 6;

        this.particles.push({
          type: "shard",
          x: px,
          y: py,
          w: pieceW * (0.8 + Math.random() * 0.4),
          h: pieceH * (0.8 + Math.random() * 0.4),
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 4,
          vy: Math.sin(angle) * speed - (Math.random() * 5 + 2),
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: 1,
          color: (c + r) % 2 === 0 ? "rgba(40, 60, 110, 0.9)" : "rgba(212, 175, 55, 0.8)",
          borderColor: "rgba(255, 235, 150, 0.9)"
        });
      }
    }

    // リンゴの赤い果汁・光の火花パーティクル
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.particles.push({
        type: "spark",
        x: centerX,
        y: centerY,
        r: Math.random() * 4 + 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (Math.random() * 6 + 2),
        alpha: 1,
        color: Math.random() > 0.4 ? "#ff3344" : "#ffd700"
      });
    }

    this.animate();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    let activeCount = 0;
    const gravity = 0.45;

    for (let p of this.particles) {
      if (p.alpha <= 0.01) continue;
      activeCount++;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += gravity;
      p.alpha -= 0.018;

      if (p.type === "shard") {
        p.rot += p.vRot;
        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.rot);
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.strokeStyle = p.borderColor;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.rect(-p.w / 2, -p.h / 2, p.w, p.h);
        this.ctx.fill();
        this.ctx.stroke();
        this.ctx.restore();
      } else {
        // spark
        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowColor = p.color;
        this.ctx.shadowBlur = 8;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    if (activeCount > 0) {
      this.animId = requestAnimationFrame(() => this.animate());
    } else {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

// ==========================================
// 3. ゲームマネージャー
// ==========================================
class NewtonTriviaGame {
  constructor() {
    this.STORAGE_KEY = "newton_trivia_stock_ids_v1";
    this.sound = new SoundEngine();
    this.particleSys = null;

    // ゲーム状態
    this.stockIds = []; // 残り問題ID一覧
    this.currentQuizSet = []; // 現在の10問
    this.currentIdx = 0; // 現在何問目か（0〜9）
    this.history = []; // 今回の回答履歴 {q, isCorrect, chosen}
    this.isAnswering = false; // 連打防止フラグ
    this.maxLives = 2; // 最大ライフ（2機）
    this.lives = 2; // 現在ライフ

    // DOM要素
    this.dom = {
      soundBtn: document.getElementById("sound-btn"),
      screenTitle: document.getElementById("screen-title"),
      screenQuiz: document.getElementById("screen-quiz"),
      screenResult: document.getElementById("screen-result"),
      screenFail: document.getElementById("screen-fail"),
      stockCountTitle: document.getElementById("title-stock-count"),
      stockBarTitle: document.getElementById("title-stock-bar"),
      quizStockStatus: document.getElementById("quiz-stock-status"),
      quizProgressText: document.getElementById("quiz-progress-text"),
      quizProgressFill: document.getElementById("quiz-progress-fill"),
      lastStageAlert: document.getElementById("last-stage-alert"),
      newtonDialogue: document.getElementById("newton-dialogue"),
      questionCard: document.getElementById("question-card"),
      qNumberTag: document.getElementById("q-number-tag"),
      qText: document.getElementById("q-text"),
      optionsContainer: document.getElementById("options-container"),
      flyingApple: document.getElementById("flying-apple"),
      newtonFigure: document.getElementById("newton-svg-elem"),
      life1: document.getElementById("life-1"),
      life2: document.getElementById("life-2"),
      // リザルト画面
      resultDivineLight: document.getElementById("result-divine-light"),
      resultBadge: document.getElementById("result-badge"),
      resultTitle: document.getElementById("result-title"),
      resultDesc: document.getElementById("result-desc"),
      stockBurnedNotice: document.getElementById("stock-burned-notice"),
      burnedCountText: document.getElementById("burned-count-text"),
      btnNextTen: document.getElementById("btn-next-ten"),
      btnResultTitle: document.getElementById("btn-result-title"),
      btnResultRestartAll: document.getElementById("btn-result-restart-all"),
      historyToggleBtn: document.getElementById("history-toggle-btn"),
      historyList: document.getElementById("history-list"),
      // 失敗画面
      failQText: document.getElementById("fail-q-text"),
      failExpText: document.getElementById("fail-exp-text"),
      btnRetryFail: document.getElementById("btn-retry-fail"),
      btnTitleFail: document.getElementById("btn-title-fail"),
      // スタートボタン
      btnStart: document.getElementById("btn-start-game"),
      btnResetStock: document.getElementById("btn-reset-stock"),
      // ホームへ戻るボタン
      btnHome: document.getElementById("btn-home"),
      btnQuizHome: document.getElementById("btn-quiz-home")
    };

    this.init();
  }

  init() {
    const canvas = document.getElementById("break-canvas");
    this.particleSys = new BreakParticleSystem(canvas);

    // 背景星空の生成
    this.createCosmicStars();

    // ストック初期化（ローカルストレージから復元、または100問すべて）
    this.loadStock();

    // イベントリスナーの登録
    this.bindEvents();

    // タイトル画面表示更新
    this.showScreen("title");
    this.updateStockUI();
  }

  createCosmicStars() {
    const container = document.getElementById("cosmos-bg");
    if (!container) return;
    for (let i = 0; i < 70; i++) {
      const star = document.createElement("div");
      star.className = "star";
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      const size = Math.random() * 2.5 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.setProperty("--duration", `${Math.random() * 3 + 2}s`);
      star.style.animationDelay = `${Math.random() * 3}s`;
      container.appendChild(star);
    }
  }

  loadStock() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const ids = JSON.parse(saved);
        if (Array.isArray(ids) && ids.length > 0) {
          // 有効なIDのみフィルタ
          const validIds = ids.filter(id => ALL_QUESTIONS.some(q => q.id === id));
          if (validIds.length > 0) {
            this.stockIds = validIds;
            return;
          }
        }
      }
    } catch (e) {
      console.warn("localStorage load failed", e);
    }
    // 初期値: 全100問のID
    this.stockIds = ALL_QUESTIONS.map(q => q.id);
    this.saveStock();
  }

  saveStock() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.stockIds));
    } catch (e) {
      console.warn("localStorage save failed", e);
    }
  }

  resetStock() {
    if (confirm("真理ストックを全100問に戻しますか？")) {
      this.stockIds = ALL_QUESTIONS.map(q => q.id);
      this.saveStock();
      this.updateStockUI();
      this.sound.playClick();
      this.speakNewton("すべての真理を再びストックに戻したぞ。刮目して挑むがよい！");
    }
  }

  bindEvents() {
    this.dom.soundBtn.addEventListener("click", () => {
      const muted = this.sound.toggleMute();
      this.dom.soundBtn.innerHTML = muted ? "🔇 音声: OFF" : "🔊 音声: ON";
    });

    this.dom.btnStart.addEventListener("click", () => {
      this.sound.playClick();
      this.startNewGame();
    });

    this.dom.btnResetStock.addEventListener("click", () => {
      this.resetStock();
    });

    this.dom.btnNextTen.addEventListener("click", () => {
      this.sound.playClick();
      this.startNewGame();
    });

    this.dom.btnResultTitle.addEventListener("click", () => {
      this.sound.playClick();
      this.showScreen("title");
      this.updateStockUI();
    });

    this.dom.btnResultRestartAll.addEventListener("click", () => {
      this.resetStock();
      this.startNewGame();
    });

    this.dom.btnRetryFail.addEventListener("click", () => {
      this.sound.playClick();
      this.startNewGame();
    });

    this.dom.btnTitleFail.addEventListener("click", () => {
      this.sound.playClick();
      this.showScreen("title");
      this.updateStockUI();
    });

    this.dom.historyToggleBtn.addEventListener("click", () => {
      this.dom.historyList.classList.toggle("open");
    });

    // クイズ途中でのホーム戻る処理
    const returnHomeHandler = () => {
      this.sound.playClick();
      if (confirm("現在の挑戦を中断して、タイトル（ホーム）に戻りますか？\n※現在の10問の挑戦データはリセットされます。")) {
        this.isAnswering = false;
        this.showScreen("title");
        this.updateStockUI();
      }
    };
    if (this.dom.btnHome) {
      this.dom.btnHome.addEventListener("click", returnHomeHandler);
    }
    if (this.dom.btnQuizHome) {
      this.dom.btnQuizHome.addEventListener("click", returnHomeHandler);
    }
  }

  speakNewton(text) {
    if (!this.dom.newtonDialogue) return;
    this.dom.newtonDialogue.style.opacity = "0";
    setTimeout(() => {
      this.dom.newtonDialogue.textContent = text;
      this.dom.newtonDialogue.style.opacity = "1";
    }, 150);
  }

  updateStockUI() {
    const count = this.stockIds.length;
    this.dom.stockCountTitle.textContent = `${count} / 100 問`;
    this.dom.stockBarTitle.style.width = `${(count / 100) * 100}%`;
    this.dom.quizStockStatus.textContent = `残りストック: ${count}問`;

    if (count === 10) {
      this.dom.lastStageAlert.style.display = "block";
    } else {
      this.dom.lastStageAlert.style.display = "none";
    }
  }

  // ライフ表示の更新
  updateLifeUI(damagedIdx = null) {
    const lifeElements = [this.dom.life1, this.dom.life2];
    lifeElements.forEach((el, idx) => {
      if (!el) return;
      if (idx < this.lives) {
        el.textContent = "🍎";
        el.classList.remove("lost");
      } else {
        el.textContent = "🍏";
        el.classList.add("lost");
      }
      if (damagedIdx === idx) {
        el.classList.remove("damage-shake");
        void el.offsetWidth;
        el.classList.add("damage-shake");
      }
    });
  }

  showScreen(screenName) {
    [this.dom.screenTitle, this.dom.screenQuiz, this.dom.screenResult, this.dom.screenFail].forEach(s => {
      s.classList.remove("active");
    });

    if (screenName === "title") {
      this.dom.screenTitle.classList.add("active");
      this.speakNewton("万有引力の理を超え、授かりし翼とともに100の真理を解き明かしてみせよ！");
    } else if (screenName === "quiz") {
      this.dom.screenQuiz.classList.add("active");
    } else if (screenName === "result") {
      this.dom.screenResult.classList.add("active");
    } else if (screenName === "fail") {
      this.dom.screenFail.classList.add("active");
    }

    // 左上のホームへ戻るボタンの表示制御（クイズ画面の時のみ表示）
    if (this.dom.btnHome) {
      this.dom.btnHome.style.display = (screenName === "quiz") ? "flex" : "none";
    }
  }

  // ==========================================
  // ゲーム開始（ストックからランダム10問抽出）
  // ==========================================
  startNewGame() {
    if (this.stockIds.length === 0) {
      alert("すでに全ての真理を解き明かしました！リセットして最初から挑戦してください。");
      return;
    }

    // ストックから最大10問をランダム抽出
    const pool = [...this.stockIds];
    // シャッフル
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const countToPick = Math.min(10, pool.length);
    const selectedIds = pool.slice(0, countToPick);

    // 抽出したIDに対応する問題データを取得
    this.currentQuizSet = selectedIds.map(id => {
      const q = ALL_QUESTIONS.find(item => item.id === id);
      // 選択肢のシャッフルコピーを作成
      const originalOptions = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.answer }));
      for (let i = originalOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [originalOptions[i], originalOptions[j]] = [originalOptions[j], originalOptions[i]];
      }
      return {
        id: q.id,
        question: q.question,
        options: originalOptions.map(o => o.text),
        answer: originalOptions.findIndex(o => o.isCorrect),
        explanation: q.explanation
      };
    });

    this.currentIdx = 0;
    this.history = [];
    this.isAnswering = false;
    this.lives = this.maxLives; // ライフを2つに全回復

    this.showScreen("quiz");
    this.updateStockUI();
    this.updateLifeUI();

    // ラスト10問突入時の特別演出
    if (this.stockIds.length === 10) {
      this.speakNewton("⚠️ 残り10問… これぞ究極の真理への最後の試練！全問正解してみせよ！");
    } else {
      this.speakNewton("さあ、知の重力を感じながら10問に挑むのだ！");
    }

    this.renderQuestion();
  }

  // 問題描画
  renderQuestion() {
    this.isAnswering = false;
    const q = this.currentQuizSet[this.currentIdx];
    const qNumber = this.currentIdx + 1;

    // ヘッダー進行状況
    this.dom.quizProgressText.textContent = `第 ${qNumber} 問 / 10問`;
    this.dom.quizProgressFill.style.width = `${((qNumber - 1) / 10) * 100}%`;
    this.dom.qNumberTag.textContent = `QUESTION 0${qNumber}`;
    this.dom.qText.textContent = q.question;

    // 問題カードのドロップインアニメーション
    this.dom.questionCard.classList.remove("drop-in");
    void this.dom.questionCard.offsetWidth; // リフロー
    this.dom.questionCard.classList.add("drop-in");

    // 選択肢の生成
    this.dom.optionsContainer.innerHTML = "";
    const badges = ["A", "B", "C", "D"];

    q.options.forEach((optText, optIdx) => {
      const btn = document.createElement("button");
      btn.className = "option-btn";
      btn.innerHTML = `
        <span class="option-badge">${badges[optIdx]}</span>
        <span class="option-label">${optText}</span>
      `;
      btn.addEventListener("click", () => this.handleAnswer(optIdx, btn));
      this.dom.optionsContainer.appendChild(btn);
    });
  }

  // 回答処理
  handleAnswer(chosenIdx, clickedBtn) {
    if (this.isAnswering) return;
    this.isAnswering = true;

    // すべての選択肢ボタンを無効化
    const allBtns = this.dom.optionsContainer.querySelectorAll(".option-btn");
    allBtns.forEach(b => (b.disabled = true));

    const q = this.currentQuizSet[this.currentIdx];
    const isCorrect = chosenIdx === q.answer;

    this.history.push({
      q: q.question,
      chosen: q.options[chosenIdx],
      correct: q.options[q.answer],
      isCorrect: isCorrect,
      explanation: q.explanation
    });

    if (isCorrect) {
      // ==========================================
      // 正解の演出：リンゴ自動投擲 ➔ 問題を割る！
      // ==========================================
      clickedBtn.classList.add("correct");
      this.sound.playCorrect();

      const compliments = [
        "見事だ！真理への第一歩だな！",
        "フッ…素晴らしい！我が背の翼も歓喜しておるぞ！",
        "その通り！知の翼を広げ、真理へ羽ばたくのだ！",
        "刮目したぞ！リンゴよ、問題を砕け！",
        "天晴れ！光り輝く翼とともにリンゴを放とう！"
      ];
      this.speakNewton(compliments[this.currentIdx % compliments.length]);

      // 0.25秒後にリンゴ投擲アニメーション開始
      setTimeout(() => {
        this.triggerAppleSmash();
      }, 250);
    } else {
      // ==========================================
      // 不正解の演出：ライフ減少＆判定
      // ==========================================
      clickedBtn.classList.add("wrong");
      if (allBtns[q.answer]) {
        allBtns[q.answer].classList.add("correct");
      }
      this.sound.playWrong();

      // ライフを1つ減らす
      this.lives--;
      const damagedIndex = this.lives; // 失われたライフのインデックス
      this.updateLifeUI(damagedIndex);

      if (this.lives > 0) {
        // ★ まだライフが残っている！（1ミス目セーフ）
        this.speakNewton("耐えたぞ！まだライフが1つ残っておる！気持ちを切り替えて次へ進むのだ！");
        document.body.classList.add("screen-shake");
        setTimeout(() => document.body.classList.remove("screen-shake"), 300);

        // 1.4秒後に正解確認を終えて次の問題へ
        setTimeout(() => {
          this.currentIdx++;
          if (this.currentIdx < this.currentQuizSet.length) {
            this.renderQuestion();
          } else {
            // 10問目到達（ライフ1残しでクリア！）
            this.handleFullClear();
          }
        }, 1400);
      } else {
        // ★ ライフ全損（2ミス目ゲームオーバー）
        this.speakNewton("ぬぅ…！ライフが尽きてしまったか。真理への道は甘くはないのだ。");
        setTimeout(() => {
          this.showFailureScreen(q, chosenIdx);
        }, 1400);
      }
    }
  }

  // リンゴを投げて問題を割る大迫力演出
  triggerAppleSmash() {
    // 1. 風切り音
    this.sound.playThrow();

    // 2. リンゴ発射
    const apple = this.dom.flyingApple;
    apple.classList.remove("shoot");
    void apple.offsetWidth; // リフロー
    apple.classList.add("shoot");

    // 3. リンゴ激突（0.5秒後）
    setTimeout(() => {
      // 激突破砕音
      this.sound.playBreak();

      // 画面激震
      document.body.classList.add("screen-shake");
      setTimeout(() => document.body.classList.remove("screen-shake"), 400);

      // 問題カードの位置を取得して破砕パーティクル発射
      const rect = this.dom.questionCard.getBoundingClientRect();
      this.particleSys.shatter(rect);

      // 問題カードを一瞬非表示に
      this.dom.questionCard.style.opacity = "0";

      // リンゴ非表示
      apple.classList.remove("shoot");

      // 4. 次の問題、または全問正解リザルトへ（0.65秒後）
      setTimeout(() => {
        this.dom.questionCard.style.opacity = "1";
        this.currentIdx++;

        if (this.currentIdx < this.currentQuizSet.length) {
          this.renderQuestion();
        } else {
          // 10問全問正解！
          this.handleFullClear();
        }
      }, 650);
    }, 500);
  }

  // 10問全問正解時の処理
  handleFullClear() {
    // 今回クリアした10問のIDをストックから破棄！
    const clearedIds = this.currentQuizSet.map(q => q.id);
    this.stockIds = this.stockIds.filter(id => !clearedIds.includes(id));
    this.saveStock();

    const remainingCount = this.stockIds.length;
    this.updateStockUI();

    // リザルト画面の生成
    this.renderResultScreen(remainingCount, clearedIds.length);
  }

  renderResultScreen(remainingCount, clearedCount) {
    this.showScreen("result");

    // 解説リストの生成
    this.dom.historyList.innerHTML = "";
    this.history.forEach((h, i) => {
      const item = document.createElement("div");
      item.className = "history-item";
      const statusIcon = h.isCorrect ? "⭕ 正解" : "❌ 不正解";
      item.innerHTML = `
        <div class="history-item-q">Q${i + 1}. [${statusIcon}] ${h.q}</div>
        <div class="history-item-exp">
          ${h.isCorrect ? "" : `あなたの回答: <b>${h.chosen}</b><br>`}
          💡 <b>正解:</b> ${h.correct}<br>${h.explanation}
        </div>
      `;
      this.dom.historyList.appendChild(item);
    });

    if (remainingCount === 0) {
      // ==========================================
      // 【完全クリア！】全ストック完答（問題がなくなった）
      // 「この世の心理に気づいた」
      // ==========================================
      this.sound.playFinalWin();
      this.speakNewton("おお…！ すべての真理を解き明かしたか！ 君こそが新たな知の巨人だ！");

      this.dom.resultBadge.textContent = "★ ALL TRIVIA CONQUERED ★";
      this.dom.resultTitle.className = "result-title complete";
      this.dom.resultTitle.textContent = "この世の心理に気づいた";

      this.dom.resultDesc.innerHTML = `
        信じられん…！ 100問すべての真理ストックを完全に制覇した！<br>
        万有引力、宇宙の神秘、生命と歴史の全てを巡り、<br>
        <strong>君はこの世の真の心理に到達したのだ！</strong>
      `;

      this.dom.stockBurnedNotice.innerHTML = `
        🍎 <strong>全100問の真理ストックが完全に解き明かされました！</strong>
      `;

      this.dom.btnNextTen.style.display = "none";
      this.dom.btnResultRestartAll.style.display = "flex";
      this.dom.resultDivineLight.style.display = "block";
    } else {
      // ==========================================
      // 【10問全問正解】（まだストックあり）
      // 「この世の心理の一部に気づいた」
      // ==========================================
      this.sound.playPartialWin();
      this.speakNewton("素晴らしい！10問全問正解だ！着実に真理へと近づいているぞ！");

      this.dom.resultBadge.textContent = "STAGE CLEAR";
      this.dom.resultTitle.className = "result-title partial";
      this.dom.resultTitle.textContent = "この世の心理の一部に気づいた";

      this.dom.resultDesc.innerHTML = `
        見事な洞察力だ。今回の10問をすべて看破した！<br>
        だが、世界の真理はまだ広大だ。<br>
        <strong>残りの真理ストック: あと ${remainingCount} 問</strong>
      `;

      this.dom.stockBurnedNotice.innerHTML = `
        🔥 <strong>今回正解した${clearedCount}問はストックから破棄されました。</strong><br>
        （次回の挑戦では、残りの未知の問題から出題されます）
      `;

      this.dom.btnNextTen.style.display = "flex";
      this.dom.btnResultRestartAll.style.display = "none";
      this.dom.resultDivineLight.style.display = "none";
    }
  }

  // 失敗画面
  showFailureScreen(failedQ, chosenIdx) {
    this.showScreen("fail");
    this.dom.failQText.textContent = `Q. ${failedQ.question}`;
    this.dom.failExpText.innerHTML = `
      ❌ あなたの回答: <b>${failedQ.options[chosenIdx]}</b><br>
      ⭕ 正解: <b>${failedQ.options[failedQ.answer]}</b><br><br>
      💡 <b>解説:</b> ${failedQ.explanation}
    `;
    this.speakNewton("失敗を恐れるな。私も無数の仮説と失敗の肩の上に立っているのだから。");
  }
}

// ページ読み込み完了時にゲーム起動
window.addEventListener("DOMContentLoaded", () => {
  window.game = new NewtonTriviaGame();
});

