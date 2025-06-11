// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {

    // ▼▼▼▼▼ ここに、Google Apps Scriptで取得したウェブアプリのURLを貼り付けてください ▼▼▼▼▼
    const GAS_URL = 'https://script.google.com/macros/s/AKfycby_0z4JJhxYARt6NR0BCdUTsGR-PuH4zZKmTfRxPsbc85JxsOmM4I0QwQCHe3hTXVw/exec';
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    const poemList = document.getElementById('poem-list');
    const poemStatus = document.getElementById('poem-status');

    if (poemList) {
        fetchPoems();
    }

    async function fetchPoems() {
        poemList.innerHTML = '<p style="text-align: center; padding: 20px;">読み込み中...</p>';
        
        try {
            const response = await fetch(GAS_URL + '?action=poems');
            
            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success' && result.data) {
                renderPoems(result.data);
            } else {
                throw new Error('ポエムデータの取得に失敗しました。');
            }

        } catch (error) {
            console.error('ポエム取得中にエラーが発生:', error);
            
            // エラー時はローカルのサンプルポエムを表示
            const samplePoems = getSamplePoems();
            renderPoems(samplePoems);
            poemStatus.textContent = 'サーバーに接続できませんでした。サンプルを表示しています。';
            poemStatus.style.color = 'orange';
        }
    }

    function renderPoems(poems) {
        poemList.innerHTML = '';
        
        if (poems.length === 0) {
            poemList.innerHTML = '<p style="text-align: center; padding: 20px;">まだポエムはありません。</p>';
            return;
        }

        poems.forEach(poem => {
            const escapeHTML = (str) => {
                if(typeof str !== 'string') return '';
                return str.replace(/[&<>"']/g, (match) => {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
                });
            };

            const escapedTitle = escapeHTML(poem.title);
            const escapedContent = escapeHTML(poem.content);
            const escapedDate = escapeHTML(poem.date);

            const poemItem = document.createElement('div');
            poemItem.className = 'poem-item';
            poemItem.innerHTML = `
                <div class="poem-title">${escapedTitle}</div>
                <div class="poem-content">${escapedContent}</div>
                <div class="poem-date">作成日: ${escapedDate}</div>
            `;
            
            poemList.appendChild(poemItem);
        });
    }

    // サンプルポエムデータ（GASが利用できない場合のフォールバック）
    function getSamplePoems() {
        return [
            {
                title: "夜空の向こう",
                content: `星が瞬く夜空の下で
私は小さな存在だと知る
けれども心の中には
無限の可能性が宿っている

今日という日は二度と来ない
だからこそ大切にしたい
一瞬一瞬を
丁寧に歩んでいこう`,
                date: "2025-06-01"
            },
            {
                title: "雨の日の思い",
                content: `雨粒が窓を叩く音
静かな部屋で本を読む
ページをめくる音だけが
時の流れを教えてくれる

雨の日は心も静かになる
普段気づかないことに
目を向けられる貴重な時間
感謝の気持ちで過ごしたい`,
                date: "2025-05-28"
            },
            {
                title: "新しい朝",
                content: `朝日が昇り新しい一日が始まる
昨日の失敗も悲しみも
今日という白いキャンバスに
新しい色を塗っていこう

可能性は無限にある
小さな一歩でも構わない
前に向かって歩き続ければ
きっと素晴らしい景色が見える`,
                date: "2025-05-20"
            },
            {
                title: "友達への想い",
                content: `遠く離れた友への手紙
言葉にできない想いを込めて
時間と距離を超えて
心は繋がっていると信じてる

笑顔で過ごしているだろうか
元気でいてくれるだろうか
いつかまた会える日まで
お互い頑張って生きていこう`,
                date: "2025-05-15"
            },
            {
                title: "季節の移ろい",
                content: `春の花が散り
夏の緑が深くなり
秋の葉が色づいて
冬の雪が静寂を運ぶ

季節は巡り続ける
私たちの人生のように
変化を恐れずに
自然のリズムに身を任せよう`,
                date: "2025-05-10"
            }
        ];
    }
});