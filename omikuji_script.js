// DOMが読み込まれたら実行
document.addEventListener('DOMContentLoaded', () => {

    // APIエンドポイントの定義
    const API_BASE_URL = 'https://bakasekai.net/api';
    const JINJYA_LIST_API_URL = `${API_BASE_URL}/jinjya/list`;
    const DRAW_API_URL = `${API_BASE_URL}/draw`;
    const SUBMIT_API_URL = `${API_BASE_URL}/submit`;

    let jinjyaList = []; // 神社リストをキャッシュする変数

    // --- おみくじを引く機能の要素 ---
    const drawJinjyaSelect = document.getElementById('draw-jinjya-select');
    const omikujiButton = document.getElementById('omikuji-button');
    const omikujiResult = document.getElementById('omikuji-result');
    const omikujiStatus = document.getElementById('omikuji-status');
    const resultJinjyaName = document.getElementById('result-jinjya-name');
    const fortuneElement = document.getElementById('omikuji-fortune');
    const messageElement = document.getElementById('omikuji-message');
    const tagsContainer = document.getElementById('omikuji-tags-container');

    // --- おみくじを奉納する機能の要素 ---
    const submitForm = document.getElementById('submit-form');
    const submitJinjyaSelect = document.getElementById('submit-jinjya-select');
    const tagsInputContainer = document.getElementById('tags-input-container');
    const submitButton = document.getElementById('submit-button');
    const submitStatus = document.getElementById('submit-status');

    // --- イベントリスナーの設定 ---
    if (omikujiButton) {
        omikujiButton.addEventListener('click', drawOmikuji);
    }
    if (submitForm) {
        submitForm.addEventListener('submit', handleSubmit);
    }
    if (submitJinjyaSelect) {
        submitJinjyaSelect.addEventListener('change', handleJinjyaSelectionChange);
    }

    /**
     * ページの初期化処理
     */
    async function initializePage() {
        await fetchAndPopulateJinjyaList();
        const existingResult = getTodaysOmikuji();
        if (existingResult) {
            displayOmikuji(existingResult);
            omikujiStatus.textContent = '本日のおみくじは既に引いています。';
            if(omikujiButton) omikujiButton.disabled = true;
        }
        // 奉納フォームの初期状態を生成
        updateSubmitFormTags(null);
    }

    // =================================================
    // 神社リスト関連の機能
    // =================================================

    /**
     * APIから神社リストを取得し、ドロップダウンを生成する
     */
    async function fetchAndPopulateJinjyaList() {
        try {
            const response = await fetch(JINJYA_LIST_API_URL);
            if (!response.ok) {
                throw new Error('神社リストの取得に失敗しました。');
            }
            const data = await response.json();
            if (data.success && Array.isArray(data.jinjya)) {
                jinjyaList = data.jinjya; // 取得したリストをキャッシュ

                // ドロップダウンの選択肢をクリア
                drawJinjyaSelect.innerHTML = '<option value="">すべての神社から</option>';
                submitJinjyaSelect.innerHTML = '<option value="" disabled selected>神社を選択してください</option>';

                jinjyaList.forEach(jinjya => {
                    const option = new Option(`${jinjya.name} (${jinjya.id})`, jinjya.id);
                    drawJinjyaSelect.add(option.cloneNode(true));
                    submitJinjyaSelect.add(option);
                });
            }
        } catch (error) {
            console.error(error);
            omikujiStatus.textContent = 'エラー: 神社リストを読み込めませんでした。';
            submitStatus.textContent = 'エラー: 神社リストを読み込めませんでした。';
        }
    }

    // =================================================
    // おみくじを引く (Draw) 機能
    // =================================================

    function getTodayDateString() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

    function getTodaysOmikuji() {
        try {
            const storedData = localStorage.getItem('omikujiResult');
            if (!storedData) return null;
            const parsedData = JSON.parse(storedData);
            return (parsedData.date === getTodayDateString()) ? parsedData.result : null;
        } catch (e) {
            return null;
        }
    }

    function saveTodaysOmikuji(result) {
        const dataToStore = { date: getTodayDateString(), result: result };
        localStorage.setItem('omikujiResult', JSON.stringify(dataToStore));
    }

    async function drawOmikuji() {
        omikujiButton.disabled = true;
        omikujiStatus.textContent = '運勢を占っています...';
        omikujiStatus.style.color = '#333';

        const selectedJinjyaId = drawJinjyaSelect.value;
        const requestUrl = selectedJinjyaId ? `${DRAW_API_URL}?jinjya=${selectedJinjyaId}` : DRAW_API_URL;

        try {
            const response = await fetch(requestUrl);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: `サーバーエラー (${response.status})` }));
                throw new Error(errorData.error || `サーバーエラー (${response.status})`);
            }
            const result = await response.json();
            
            // APIのレスポンス形式が変更された可能性を考慮
            const omikujiData = result.omikuji || result;

            if (omikujiData && omikujiData.fortune) {
                saveTodaysOmikuji(omikujiData);
                displayOmikuji(omikujiData);
                omikujiStatus.textContent = '本日のおみくじ結果はこちらです。';
            } else {
                throw new Error(result.error || 'おみくじのデータ形式が正しくありません。');
            }
        } catch (error) {
            console.error('おみくじ取得中にエラーが発生:', error);
            omikujiStatus.textContent = `エラー: ${error.message}`;
            omikujiStatus.style.color = 'red';
            omikujiButton.disabled = false;
        }
    }

    function displayOmikuji(data) {
        const fallbackText = '記載なし';
        const jinjyaInfo = jinjyaList.find(j => j.id === data.jinjya);
        resultJinjyaName.textContent = jinjyaInfo ? `【${jinjyaInfo.name}】` : `【${data.jinjya}】`;
        fortuneElement.textContent = data.fortune || fallbackText;
        messageElement.textContent = data.message || fallbackText;
        tagsContainer.innerHTML = '';

        const tags = data.tags || {};
        for (const key in tags) {
            if (Object.prototype.hasOwnProperty.call(tags, key)) {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'omikuji-category';
                categoryDiv.innerHTML = `<strong>${key}:</strong> <span>${tags[key]}</span>`;
                tagsContainer.appendChild(categoryDiv);
            }
        }
        omikujiResult.style.display = 'block';
    }

    // =================================================
    // おみくじを奉納する (Submit) 機能
    // =================================================

    function handleJinjyaSelectionChange() {
        const selectedJinjyaId = submitJinjyaSelect.value;
        const selectedJinjya = jinjyaList.find(j => j.id === selectedJinjyaId);
        updateSubmitFormTags(selectedJinjya);
    }

    function updateSubmitFormTags(jinjya) {
        tagsInputContainer.innerHTML = ''; // コンテナをクリア
        
        // 固定タグが設定されているかチェック
        const hasFixedTags = jinjya && jinjya.tags && Object.keys(jinjya.tags).length > 0;

        const tagsToDisplay = hasFixedTags ? jinjya.tags : {
            '恋愛': '恋愛運について',
            '仕事': '仕事運について',
            '健康': '健康運について',
            '金運': '金運について',
            '学業': '学業運について'
        };

        for (const key in tagsToDisplay) {
            const description = tagsToDisplay[key];
            const formGroup = document.createElement('div');
            formGroup.className = 'form-group';
            
            const label = document.createElement('label');
            label.htmlFor = `tag-input-${key}`;
            label.textContent = key;

            const input = document.createElement('input');
            input.type = 'text';
            input.id = `tag-input-${key}`;
            input.name = key; // フォームデータ収集のためにname属性を設定
            input.placeholder = description; // ヒントとして説明を表示

            formGroup.appendChild(label);
            formGroup.appendChild(input);
            tagsInputContainer.appendChild(formGroup);
        }
    }
    
    async function handleSubmit(event) {
        event.preventDefault();
        submitButton.disabled = true;
        submitStatus.textContent = '奉納しています...';
        submitStatus.style.color = '#333';

        const formData = new FormData(submitForm);
        const payload = {
            jinjya: submitJinjyaSelect.value,
            fortune: document.getElementById('fortune-input').value,
            message: document.getElementById('message-input').value,
            tags: {}
        };

        // 動的に生成されたタグ入力からデータを収集
        const tagInputs = tagsInputContainer.querySelectorAll('input');
        tagInputs.forEach(input => {
            if (input.value) {
                payload.tags[input.name] = input.value;
            }
        });

        try {
            const response = await fetch(SUBMIT_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const responseData = await response.json();

            if (response.ok) {
                submitStatus.textContent = responseData.message || '奉納を受け付けました🙏';
                submitStatus.style.color = 'green';
                submitForm.reset();
                handleJinjyaSelectionChange(); // フォームを初期状態に戻す
            } else {
                throw new Error(responseData.error || `奉納に失敗しました (${response.status})`);
            }
        } catch (error) {
            console.error('奉納中にエラーが発生:', error);
            submitStatus.textContent = `エラー: ${error.message}`;
            submitStatus.style.color = 'red';
        } finally {
            submitButton.disabled = false;
        }
    }

    // --- 初期化処理の実行 ---
    initializePage();
});
