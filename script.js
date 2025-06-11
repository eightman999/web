// ページのDOMがすべて読み込まれてから処理を開始します
document.addEventListener('DOMContentLoaded', () => {

    /**
     * quotes.htmlから名言リストを非同期で読み込み、
     * 日替わりで名言を1つ選んで表示します。
     */
    async function setDailyQuote() {
        // 名言を表示するためのボックス要素を取得します
        const quoteBox = document.getElementById('daily-quote-box');
        if (!quoteBox) {
            // 表示する場所がなければ何もしません
            return; 
        }

        try {
            // fetchを使ってquotes.htmlの内容を読み込みます
            const response = await fetch('quotes.html');
            // 読み込みに失敗したらエラーを投げます
            if (!response.ok) {
                throw new Error('quotes.htmlの読み込みに失敗しました。');
            }
            const htmlText = await response.text();

            // 読み込んだHTML文字列をDOMオブジェクトに変換します
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlText, 'text/html');
            
            // class="quote-item"を持つすべての要素を取得します
            const quotes = doc.querySelectorAll('.quote-item');

            // 名言が1つも見つからなかった場合の処理
            if (quotes.length === 0) {
                quoteBox.innerHTML = '<p>名言が見つかりませんでした。</p>';
                return;
            }

            // 今日の日付を元に、日替わりのインデックス（番号）を計算します
            const today = new Date();
            // 「20250611」のような、日付固有の数値を作ります
            const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
            // 名言の総数で割った余りをインデックスとすることで、毎日同じ名言が選ばれます
            const quoteIndex = seed % quotes.length;
            
            // 選ばれた名言のHTMLを取得して、表示用のボックスに挿入します
            const selectedQuoteHtml = quotes[quoteIndex].innerHTML;
            quoteBox.innerHTML = selectedQuoteHtml;

        } catch (error) {
            // もし処理の途中でエラーが発生した場合
            console.error('名言の取得中にエラーが発生しました:', error);
            if(quoteBox) {
                quoteBox.innerHTML = '<p>名言の読み込みに失敗しました…。</p>';
            }
        }
    }

    // 上で定義した関数を実行します
    setDailyQuote();
});
