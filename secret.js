// 秘密ページのJavaScript機能

// 幽霊カウンター
let ghostCounter = Math.floor(Math.random() * 999) + 1;
document.addEventListener('DOMContentLoaded', function() {
    updateGhostCounter();
    initializeSecretFeatures();
});

function updateGhostCounter() {
    const counter = document.getElementById('ghost-counter');
    if (counter) {
        // ランダムに変動する不気味なカウンター
        setInterval(() => {
            ghostCounter += Math.floor(Math.random() * 3) - 1; // -1, 0, 1のランダム
            if (ghostCounter < 1) ghostCounter = 1;
            if (ghostCounter > 999) ghostCounter = 999;
            counter.textContent = ghostCounter.toString().padStart(3, '0');
        }, 3000);
    }
}

// 秘密の答えを表示する関数
function revealSecret(secretNumber) {
    const secretDiv = document.getElementById('secret-' + secretNumber);
    if (secretDiv) {
        secretDiv.style.display = secretDiv.style.display === 'none' ? 'block' : 'none';
        
        // 秘密が明かされた時の効果音（Web Audio API使用）
        playMysterySound();
    }
}

// 最終秘密を表示
function revealFinalSecret() {
    const finalSecret = document.getElementById('final-secret');
    if (finalSecret) {
        finalSecret.style.display = finalSecret.style.display === 'none' ? 'block' : 'none';
        
        if (finalSecret.style.display === 'block') {
            // 特別な効果音
            playVictorySound();
            // 紙吹雪効果（簡易版）
            createConfetti();
        }
    }
}

// 幽霊メッセージを追加
function addGhostMessage() {
    const message = prompt('あなたのメッセージを残してください（50文字以内）:');
    if (message && message.length <= 50) {
        const ghostBoard = document.getElementById('ghost-board');
        const now = new Date();
        const h24 = now.getHours();
        const timestamp = now.getFullYear() + '.' +
                         (now.getMonth() + 1).toString().padStart(2, '0') + '.' +
                         now.getDate().toString().padStart(2, '0') + ' ' +
                         (h24 < 12 ? '午前' : '午後') +
                         ((h24 % 12) || 12).toString().padStart(2, '0') + ':' +
                         now.getMinutes().toString().padStart(2, '0');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'whisper';
        messageDiv.style.cssText = 'margin: 10px 0; padding: 10px; border-left: 2px solid #9400d3; animation: fadeIn 2s;';
        messageDiv.innerHTML = `
            <em>"${message}"</em>
            <span style="float: right;">- ${timestamp}</span>
        `;
        
        // 既存のメッセージの前に挿入
        const addButton = ghostBoard.querySelector('.hidden-message');
        ghostBoard.insertBefore(messageDiv, addButton);
        
        // フェードイン効果を追加
        const style = document.createElement('style');
        style.textContent = '@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }';
        document.head.appendChild(style);
    }
}

// Web Audio APIを使った効果音
function playMysterySound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
        oscillator.frequency.exponentialRampToValueAtTime(220, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
        console.log('Audio context not supported');
    }
}

function playVictorySound() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // C - E - G - C の和音
        const frequencies = [261.63, 329.63, 392, 523.25];
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
            }, index * 100);
        });
    } catch (e) {
        console.log('Audio context not supported');
    }
}

// 簡易紙吹雪効果
function createConfetti() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.textContent = ['✨', '⭐', '🌟', '💫'][Math.floor(Math.random() * 4)];
            confetti.style.cssText = `
                position: fixed;
                top: -50px;
                left: ${Math.random() * 100}%;
                font-size: ${Math.random() * 20 + 20}px;
                animation: confettiFall 3s ease-out forwards;
                pointer-events: none;
                z-index: 1000;
            `;
            document.body.appendChild(confetti);
            
            // アニメーション終了後に削除
            setTimeout(() => {
                confetti.remove();
            }, 3000);
        }, i * 100);
    }
    
    // CSSアニメーションを追加
    if (!document.getElementById('confetti-style')) {
        const style = document.createElement('style');
        style.id = 'confetti-style';
        style.textContent = `
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(360deg);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// 初期化とイースターエッグ
function initializeSecretFeatures() {
    // Konamiコード（↑↑↓↓←→←→BA）でスペシャル機能
    let konamiCode = [];
    const konamiSequence = [
        'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
        'KeyB', 'KeyA'
    ];
    
    document.addEventListener('keydown', function(e) {
        konamiCode.push(e.code);
        if (konamiCode.length > konamiSequence.length) {
            konamiCode.shift();
        }
        
        if (konamiCode.join(',') === konamiSequence.join(',')) {
            activateKonamiEasterEgg();
            konamiCode = [];
        }
    });
    
    // ダブルクリックでランダムな霊感メッセージ
    document.addEventListener('dblclick', function(e) {
        if (Math.random() < 0.1) { // 10%の確率
            showRandomSpiritMessage();
        }
    });
}

function activateKonamiEasterEgg() {
    alert('🎊 隠しコマンド発動！ 🎊\nあなたは真の秘密の守り人です！');
    
    // 全ての隠された要素を一時的に表示
    const hiddenElements = document.querySelectorAll('[id^="secret-"], #final-secret');
    hiddenElements.forEach(el => {
        el.style.display = 'block';
        el.style.border = '2px solid gold';
    });
    
    // 背景色を虹色に変更
    document.body.style.animation = 'rainbow 2s infinite';
    const rainbowStyle = document.createElement('style');
    rainbowStyle.textContent = `
        @keyframes rainbow {
            0% { filter: hue-rotate(0deg); }
            100% { filter: hue-rotate(360deg); }
        }
    `;
    document.head.appendChild(rainbowStyle);
    
    // 5秒後に元に戻す
    setTimeout(() => {
        hiddenElements.forEach(el => {
            el.style.display = 'none';
            el.style.border = '';
        });
        document.body.style.animation = '';
    }, 5000);
}

function showRandomSpiritMessage() {
    const messages = [
        "霊感が高まっています...",
        "何かが見守っています...",
        "過去の魂が囁いています...",
        "この場所には秘密があります...",
        "時空の歪みを感じます..."
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.9);
        color: #00ff00;
        padding: 20px;
        border: 2px solid #00ff00;
        text-align: center;
        z-index: 1000;
        animation: spiritFade 3s ease-out forwards;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    // スピリットフェードアニメーション
    const spiritStyle = document.createElement('style');
    spiritStyle.textContent = `
        @keyframes spiritFade {
            0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
            50% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
        }
    `;
    document.head.appendChild(spiritStyle);
    
    // 3秒後に削除
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}