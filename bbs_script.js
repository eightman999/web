// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {

    // ▼▼▼▼▼ ここに、Google Apps Scriptで取得したウェブアプリのURLを貼り付けてください ▼▼▼▼▼
    const GAS_URL = 'https://script.google.com/macros/s/AKfycbyC9QkRE_-ZUFP5f5bui9wCfcsh8YreJWx_N9dnoEpVjd6Sl8P7Z1Zv8qfxBzGxOrzt/exec';
    // ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲

    // --- 投稿表示処理 (bbs.html) ---
    const postsTableBody = document.getElementById('posts-table-body');
    if (postsTableBody) {
        fetchPosts();
    }
    
    // --- フォーム送信処理 (bbs_form.html) ---
    const postForm = document.getElementById('post-form');
    if (postForm) {
        postForm.addEventListener('submit', handleFormSubmit);
    }

    async function fetchPosts() {
        postsTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">読み込み中...</td></tr>';
        try {
            const response = await fetch(GAS_URL);
            if (!response.ok) {
                throw new Error(`データの取得に失敗しました。ステータス: ${response.status}`);
            }
            
            const posts = await response.json();
            renderPosts(posts);

        } catch (error) {
            console.error('投稿データの取得中にエラーが発生:', error);
            postsTableBody.innerHTML = `<tr><td colspan="3" style="text-align:center; padding: 20px;">エラーが発生しました。時間をおいて再読み込みしてください。(詳細: ${error.message})</td></tr>`;
        }
    }

    function renderPosts(posts) {
        postsTableBody.innerHTML = ''; 
        if (posts.length === 0) {
            postsTableBody.innerHTML = '<tr><td colspan="3" style="text-align:center; padding: 20px;">まだ投稿はありません。</td></tr>';
            return;
        }

        posts.forEach(post => {
            const escapeHTML = (str) => {
                if(typeof str !== 'string') return '';
                return str.replace(/[&<>"']/g, (match) => {
                    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[match];
                });
            };

            const escapedSubject = escapeHTML(post.subject);
            const escapedName = escapeHTML(post.name);
            const escapedMessage = escapeHTML(post.message).replace(/\n/g, '<br>');
            const escapedDate = escapeHTML(post.date);

            const row = `
                <tr>
                    <td><b>${escapedSubject}</b></td>
                    <td>${escapedName}</td>
                    <td>${escapedDate}</td>
                </tr>
                <tr>
                    <td colspan="3" style="padding: 10px 10px 20px 20px;">
                        <p>${escapedMessage}</p>
                    </td>
                </tr>
            `;
            postsTableBody.innerHTML += row;
        });
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('input[type="submit"]');
        const statusMessage = document.getElementById('status-message');
        const formData = new FormData(form);
        
        const urlEncodedData = new URLSearchParams(formData).toString();

        submitButton.disabled = true;
        statusMessage.textContent = '投稿中...';
        statusMessage.style.color = '#333';

        try {
            const response = await fetch(GAS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: urlEncodedData,
            });
            
            if (!response.ok) {
                throw new Error(`サーバーエラー: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.status === 'success') {
                statusMessage.textContent = '投稿しました！3秒後にBBSに戻ります。';
                statusMessage.style.color = 'green';
                form.reset();
                setTimeout(() => {
                    window.location.href = 'bbs.html';
                }, 3000);
            } else {
                // GAS側でエラーが起きた場合 (例: スプレッドシートが見つからない)
                throw new Error(result.message || '投稿に失敗しました。');
            }

        } catch (error) {
            console.error('フォーム送信中にエラーが発生:', error);
            statusMessage.textContent = `エラーが発生しました。もう一度お試しください。(詳細: ${error.message})`;
            statusMessage.style.color = 'red';
            submitButton.disabled = false;
        }
    }
});
