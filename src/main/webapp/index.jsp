<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>卒業制作 - ミニゲームコレクション</title>
<style>
    /* 画面全体の背景とレイアウト */
    body {
        font-family: 'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', 'Hiragino Sans', Meiryo, sans-serif;
        /* 爽やかでゲームらしいグラデーション背景 */
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: #333;
        margin: 0;
        padding: 0;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    /* 上部のヘッダーエリア */
    header {
        background-color: rgba(0, 0, 0, 0.25);
        color: #ffffff;
        text-align: center;
        padding: 40px 20px;
        backdrop-filter: blur(5px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    header h1 {
        margin: 0;
        font-size: 2.2rem;
        letter-spacing: 2px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    header p {
        margin: 10px 0 0;
        font-size: 1rem;
        color: #d0e1f9;
    }

    /* メインコンテンツエリア（4枚が2×2で綺麗に並ぶよう幅を調整） */
    main {
        flex: 1;
        max-width: 1000px;
        width: 100%;
        margin: 40px auto;
        padding: 0 20px;
        box-sizing: border-box;
    }

    /* ゲームカードを並べるグリッド（画面幅に合わせて自動で並ぶ） */
    .game-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 25px;
    }

    /* ゲームカード本体 */
    .game-card {
        background-color: #ffffff;
        border-radius: 16px;
        overflow: hidden;
        text-decoration: none;
        color: #333;
        box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        transition: transform 0.25s ease, box-shadow 0.25s ease;
        display: flex;
        flex-direction: column;
    }

    .game-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 30px rgba(0, 0, 0, 0.35);
    }

    /* カード上部のアイコン・イメージエリア */
    .card-banner {
        height: 130px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 4rem;
    }

    /* ゲームごとのテーマカラー */
    .theme-horse { background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%); }
    .theme-monkey { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); }
    .theme-newton { background: linear-gradient(135deg, #fccb90 0%, #d57eeb 100%); }
    .theme-smash { background: linear-gradient(135deg, #f6d365 0%, #fda085 100%); }

    /* カード下部のテキストエリア */
    .card-body {
        padding: 20px;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .genre-tag {
        display: inline-block;
        background-color: #eef2f7;
        color: #2a5298;
        font-size: 0.75rem;
        font-weight: bold;
        padding: 4px 10px;
        border-radius: 20px;
        margin-bottom: 10px;
        align-self: flex-start;
    }

    .card-title {
        font-size: 1.25rem;
        font-weight: bold;
        margin: 0 0 8px;
        color: #1e3c72;
    }

    .card-desc {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.5;
        margin: 0 0 20px;
        flex: 1;
    }

    .play-btn {
        display: block;
        text-align: center;
        background-color: #2a5298;
        color: #ffffff;
        font-weight: bold;
        padding: 10px;
        border-radius: 8px;
        transition: background-color 0.2s;
    }

    .game-card:hover .play-btn {
        background-color: #ff6b6b;
    }

    /* 下部のフッターエリア */
    footer {
        text-align: center;
        padding: 20px;
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.85rem;
    }
</style>
</head>
<body>

    <header>
        <h1>🎮 ミニゲーム一覧</h1>
        <p>遊びたいゲームを選んでスタートしよう！</p>
    </header>

    <main>
        <div class="game-grid">
            <!-- ゲーム1 -->
            <a href="games/DancingHorseApp/index.html" class="game-card">
                <div class="card-banner theme-horse">🕺🐴</div>
                <div class="card-body">
                    <span class="genre-tag">リズム / アクション</span>
                    <h2 class="card-title">ダンシングホース</h2>
                    <p class="card-desc">リズムに乗って華麗にステップ！高スコアを目指そう。</p>
                    <span class="play-btn">PLAY ▶</span>
                </div>
            </a>

            <!-- ゲーム2 -->
            <a href="games/MonkeyClimber_Web/index.html" class="game-card">
                <div class="card-banner theme-monkey">🐒🦀</div>
                <div class="card-body">
                    <span class="genre-tag">クライミング</span>
                    <h2 class="card-title">猿蟹クライミング</h2>
                    <p class="card-desc">障害物を避けながら頂上を目指して登りきれ！</p>
                    <span class="play-btn">PLAY ▶</span>
                </div>
            </a>

            <!-- ゲーム3 -->
            <a href="games/newton-trivia/index.html" class="game-card">
                <div class="card-banner theme-newton">🍎💡</div>
                <div class="card-body">
                    <span class="genre-tag">クイズ</span>
                    <h2 class="card-title">ニュートンの真理探究クイズ</h2>
                    <p class="card-desc">ひらめきと知識が試される！全問正解できるか挑戦しよう。</p>
                    <span class="play-btn">PLAY ▶</span>
                </div>
            </a>

            <!-- ゲーム4 -->
            <a href="games/Smash/index.html" class="game-card">
                <div class="card-banner theme-smash">💥🔨</div>
                <div class="card-body">
                    <span class="genre-tag">アクション</span>
                    <h2 class="card-title">Smash</h2>
                    <p class="card-desc">最大4人で格闘ゲーム</p>
                    <span class="play-btn">PLAY ▶</span>
                </div>
            </a>
        </div>
    </main>

    <footer>
        &copy; 2026 卒業制作プロジェクト
    </footer>

</body>
</html>