document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('search-form');
    const results = document.getElementById('results');

    form.addEventListener('submit', e => {
        e.preventDefault();
        const query = document.getElementById('query').value.trim();
        results.innerHTML = '';
        if (!query) return;

        // シンプルなダミー検索結果を生成
        for (let i = 1; i <= 5; i++) {
            const item = document.createElement('div');
            item.className = 'result-item';
            item.innerHTML = `
                <a href="#">${query} に関する結果 ${i}</a>
                <p>${query} に関連する説明文のサンプルです。</p>
            `;
            results.appendChild(item);
        }
    });
});
