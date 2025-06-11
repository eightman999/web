// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {

    // ▼▼▼▼▼ ここに、Google Apps Scriptで取得したウェブアプリのURLを貼り付けてください ▼▼▼▼▼
    const GAS_URL = 'https://script.google.com/macros/s/AKfycby_0z4JJhxYARt6NR0BCdUTsGR-PuH4zZKmTfRxPsbc85JxsOmM4I0QwQCHe3hTXVw/exec';
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const omikujiButton = document.getElementById('omikuji-button');
    const omikujiResult = document.getElementById('omikuji-result');
    const omikujiStatus = document.getElementById('omikuji-status');

    // 各要素のDOM参照
    const fortuneElement = document.getElementById('omikuji-fortune');
    const messageElement = document.getElementById('omikuji-message');
    const loveElement = document.getElementById('omikuji-love');
    const workElement = document.getElementById('omikuji-work');
    const healthElement = document.getElementById('omikuji-health');
    const moneyElement = document.getElementById('omikuji-money');
    const studyElement = document.getElementById('omikuji-study');

    if (omikujiButton) {
        omikujiButton.addEventListener('click', drawOmikuji);
    }

    // 今日の日付を取得（YYYY-MM-DD形式）
    function getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // ローカルストレージから今日のおみくじ結果を取得
    function getTodaysOmikuji() {
        const todayString = getTodayString();
        const storedData = localStorage.getItem('omikuji_' + todayString);
        return storedData ? JSON.parse(storedData) : null;
    }

    // ローカルストレージに今日のおみくじ結果を保存
    function saveTodaysOmikuji(data) {
        const todayString = getTodayString();
        localStorage.setItem('omikuji_' + todayString, JSON.stringify(data));
    }

    // おみくじを引く処理
    async function drawOmikuji() {
        // 既に今日のおみくじを引いているかチェック
        const existingResult = getTodaysOmikuji();
        if (existingResult) {
            displayOmikuji(existingResult);
            omikujiStatus.textContent = '今日はもう引いています！明日またお越しください。';
            omikujiStatus.style.color = '#666';
            return;
        }

        omikujiButton.disabled = true;
        omikujiStatus.textContent = 'おみくじを引いています...';
        omikujiStatus.style.color = '#333';

        try {
            // GASからおみくじデータを取得
            const response = await fetch(GAS_URL + '?action=omikuji');
            
            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                // 今日の日付をシードとして使用し、決定論的におみくじを選択
                const todayString = getTodayString();
                const seed = parseInt(todayString.replace(/-/g, '')); // YYYYMMDD形式に変換
                const index = seed % result.data.length;
                const selectedOmikuji = result.data[index];
                                
                // 結果を保存して表示
                saveTodaysOmikuji(selectedOmikuji);
                displayOmikuji(selectedOmikuji);
                omikujiStatus.textContent = '';
            } else {
                throw new Error(result.message || 'おみくじデータの取得に失敗しました。');
            }
        } catch (error) {
            console.error('おみくじ取得中にエラーが発生:', error);
            
            // エラー時はローカルのフォールバックおみくじを使用
            omikujiStatus.textContent = 'サーバーに接続できませんでした。開発者にご連絡ください。';
            omikujiStatus.style.color = 'orange';
        }
        omikujiButton.disabled = false;
    }

    // おみくじ結果を表示
    function displayOmikuji(data) {
        fortuneElement.textContent = data.fortune || '';
        messageElement.textContent = data.message || '';
        loveElement.textContent = data.love || '';
        workElement.textContent = data.work || '';
        healthElement.textContent = data.health || '';
        moneyElement.textContent = data.money || '';
        studyElement.textContent = data.study || '';
        
        omikujiResult.style.display = 'block';
    }

    // ページ読み込み時に今日のおみくじがあるかチェック
    const existingResult = getTodaysOmikuji();
    if (existingResult) {
        displayOmikuji(existingResult);
        omikujiStatus.textContent = '今日のおみくじ結果です。明日また新しいおみくじを引けます。';
        omikujiStatus.style.color = '#666';
    }
});
