# 🎵 Uzume Language Compiler

[![Python Version](https://img.shields.io/badge/python-3.7%2B-blue.svg)](https://python.org)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Version](https://img.shields.io/badge/version-0.5.0-orange.svg)](VERSION)

**Uzume（ウズメ）** は、楽譜をコードのように記述し、コンパイルすることで高音質なWAV/FLACファイルを生成するドメイン特化型プログラミング言語です。

> **Uzume** - 音楽を言語で奏でる新しいアプローチ

## ✨ 特徴

- 🎼 **直感的な楽譜記法**: `nC4-1, nD4-1, nE4-2` のようなシンプルな記法
- 🎵 **表情記号サポート**: staccato, legato, accent, tenuto
- 🎹 **和音・コード機能**: `[nC4-1, nE4-1]` や `[code(Cmaj7)]`
- 🔄 **繰り返し構造**: `loop 2 { ... }`
- 🎺 **同時演奏**: `read(melody & bass & chords)`
- 🎚️ **多彩な波形**: sine, square, triangle, sawtooth, bit8, pulse, chiptune
- 🎼 **ダイナミクス**: クレッシェンド/デクレッシェンド (`measure.cre`, `measure.dec`)
- 🎵 **音量記号**: 音符ごとの音量指定 (`nC4-1^mf`, `nD4-1^f`)
- 🎛️ **マルチトラック**: 独立したトラック録音とミックス機能
- 🎹 **アルペジオ**: 自動時間調整機能付き分散和音
- 🎼 **連符**: 三連符、五連符等の複雑なリズム表現
- 📊 **高音質出力**: WAV/FLAC形式での出力

## 🚀 クイックスタート

### 必要要件

- Python 3.7+
- NumPy
- (オプション) SciPy

### インストール

```bash
git clone https://github.com/your-username/uzume-compiler.git
cd Uzume
pip install -r requirements.txt
```

### 基本的な使用方法

```python
from uzume_compiler import UzumeCompiler

# Uzumeコードを作成
uzume_code = """
set tempo(120);
set wave(sine);
set volume(80);

melody = measure[nC4-1, nD4-1, nE4-1, nF4-1];
bass = measure[nC3-2, nF3-2];

read(melody & bass);
"""

# コンパイルしてWAVファイルを生成
compiler = UzumeCompiler()
audio_data = compiler.compile(uzume_code)
compiler.save_to_file(audio_data, "output.wav")
```

## 📖 言語仕様

### グローバル設定

```uzume
set tempo(120);        // BPM (beats per minute)
set beat(4/4);         // 拍子 (time signature)
set volume(80);        // 音量 (0-127)
set wave(sine);        // 波形: sine, square, triangle, sawtooth
```

### 小節定義

```uzume
// 基本的な音符
intro = measure[nC4-1, nD4-1, nE4-2];

// 和音
harmony = measure[[nC4-2, nE4-2, nG4-2]];

// コード記法
progression = measure[[code(Cmaj7)], [code(F)], [code(G)], [code(Am)]];

// 休符
rest_measure = measure[nC4-1, R-1, nD4-2];
```

### 音符記法

| 記法 | 説明 | 例 |
|------|------|-----|
| `nC4-1` | n+音名+オクターブ-拍数 | C4の1拍 |
| `nD#3-2` | シャープ付き | D♯3の2拍 |
| `nBb4-0.5` | フラット付き | B♭4の0.5拍 |
| `R-1` | 休符 | 1拍の休符 |

### 表情記号

```uzume
// 直接指定
staccato_measure = measure[stc nC4-1, leg nD4-1];

// 後付け指定
add stc(intro[0]);     // introの1番目の音にスタッカート
add leg(intro[1]);     // introの2番目の音にレガート
add acc(intro[2]);     // introの3番目の音にアクセント
add ten(intro[3]);     // introの4番目の音にテヌート
```

| 記号 | 名称 | 効果 |
|------|------|------|
| `stc` | Staccato | 音を短く切る |
| `leg` | Legato | なめらかに |
| `acc` | Accent | 強調する |
| `ten` | Tenuto | 音価を保持 |

### 同時演奏

```uzume
// 複数の小節を同時に演奏
read(melody & bass);                    // 2声部
read(melody & harmony & bass);          // 3声部
read(lead & rhythm & bass & drums);     // 4声部

// ループ内での同時演奏
loop 4 {
    read(verse & chorus);
}
```

### 繰り返し

```uzume
// 基本的な繰り返し
loop 2 {
    read(intro);
    read(verse);
}

// ネストした繰り返し
loop 3 {
    read(intro);
    loop 2 {
        read(verse & bass);
    }
    read(outro);
}
```

### コード定義

#### 組み込みコード

Uzumeは全12キーにわたって230以上のコード定義をサポートしています：

**基本的なコード (C キー例):**
| コード | 構成音 | 説明 |
|--------|--------|------|
| `C` | C4-E4-G4 | メジャートライアド |
| `Cm` | C4-Eb4-G4 | マイナートライアド |
| `C7` | C4-E4-G4-Bb4 | ドミナント7th |
| `Cmaj7` | C4-E4-G4-B4 | メジャー7th |
| `Cm7` | C4-Eb4-G4-Bb4 | マイナー7th |
| `Cdim` | C4-Eb4-F#4 | ディミニッシュ |
| `Caug` | C4-E4-G#4 | オーギュメント |
| `Csus4` | C4-F4-G4 | サスペンデッド4th |

**拡張コード (C キー例):**
| コード | 構成音 | 説明 |
|--------|--------|------|
| `Cadd9` | C4-E4-G4-D5 | アド9th |
| `C9` | C4-E4-G4-Bb4-D5 | ナインス |
| `C11` | C4-E4-G4-Bb4-D5-F5 | イレブンス |
| `C13` | C4-E4-G4-Bb4-D5-F5-A5 | サーティーンス |
| `Cmaj9` | C4-E4-G4-B4-D5 | メジャー9th |
| `C7-b9` | C4-E4-G4-Bb4-C#5 | 7thフラット9 |
| `C7-#9` | C4-E4-G4-Bb4-Eb5 | 7thシャープ9 |

**省略コード (C キー例):**
| コード | 構成音 | 説明 |
|--------|--------|------|
| `Cno3` | C4-G4 | 3度なし |
| `Cno5` | C4-E4 | 5度なし |
| `Cmaj7-no5` | C4-E4-B4 | メジャー7th 5度なし |

**対応キー:** C, C#, D, Eb, E, F, F#, G, G#, A, Bb, B（全12キー）

**利用可能なコードタイプ:** メジャー、マイナー、7th、maj7、m7、dim、aug、sus4、add9、9、11、13、m9、maj9、7-b9、7-#9、no3、no5、maj7-no5

#### コード使用例

```uzume
// コードチョードの使用（拍数はcode()外で指定）
chord_progression = measure [[code(C)-1], [code(Am)-1], [code(F)-1], [code(G)-1]];
read(chord_progression);
```

## 🎼 サンプルコード

### シンプルなメロディー

```uzume
set tempo(90);
set wave(sine);
set volume(75);

melody = measure[C4-1, D4-1, E4-1, F4-1, G4-2, R-2];
add leg(melody[0]);
add stc(melody[4]);

read(melody);
```

### 和音進行

```uzume
set tempo(120);
set wave(triangle);

progression = measure[
    [code(C)], [code(Am)], 
    [code(F)], [code(G)]
];

loop 2 {
    read(progression);
}
```

### 複雑な楽曲構造

```uzume
set tempo(110);
set beat(4/4);
set wave(sine);
set volume(70);

// メロディーライン
melody = measure[C4-1, D4-1, E4-0.5, F4-0.5, G4-2];
bridge = measure[A4-1, G4-1, F4-1, E4-1];

// ベースライン  
bass = measure[C3-2, F3-1, G3-1];
bass_bridge = measure[A3-1, F3-1, C3-2];

// 和音
chords = measure[[code(C)], [code(F)], [code(G)], [code(C)]];

// 表情記号を追加
add leg(melody[0]);
add stc(bridge[2]);

// 楽曲構造
read(melody & bass);           // イントロ
loop 2 {
    read(melody & bass & chords);  // ヴァース
    read(bridge & bass_bridge);   // ブリッジ
}
read(melody & chords);         // アウトロ
```

## 🎛️ API リファレンス

### UzumeCompiler クラス

#### メソッド

```python
class UzumeCompiler:
    def __init__(self):
        """コンパイラを初期化"""
        
    def compile(self, source: str) -> bytes:
        """Uzumeコードをコンパイルして音声データを生成"""
        
    def save_to_file(self, audio_bytes: bytes, filename: str):
        """音声データをファイルに保存"""
```

#### 設定プロパティ

```python
compiler.settings = {
    'tempo': 120,           # BPM
    'beat': (4, 4),        # 拍子 (分子, 分母)
    'volume': 80,          # 音量 (0-127)
    'wave': 'sine',        # 波形
    'sample_rate': 44100   # サンプリングレート
}
```

### エラーハンドリング

```python
try:
    compiler = UzumeCompiler()
    audio_data = compiler.compile(uzume_code)
    compiler.save_to_file(audio_data, "output.wav")
except SyntaxError as e:
    print(f"構文エラー: {e}")
except Exception as e:
    print(f"コンパイルエラー: {e}")
```

## 🆕 新機能 (v0.5.0+)

### 8bitスタイル波形

Uzumeは、レトロゲーム音楽に特化した8bitスタイルの波形をサポートします：

```uzume
set wave(bit8);      // 8bit量子化矩形波
set wave(pulse);     // 25%デューティサイクルパルス波
set wave(pulse50);   // 50%デューティサイクルパルス波  
set wave(chiptune);  // チップチューン風三角波

melody = measure [C4-1, D4-1, E4-1, F4-1];
read(melody);
```

### ダイナミック効果

#### クレッシェンド・デクレッシェンド

```uzume
// だんだん大きく (crescendo)
crescendo = measure.cre [C4-1, D4-1, E4-1, F4-1];

// だんだん小さく (decrescendo)  
decrescendo = measure.dec [C5-1, B4-1, A4-1, G4-1];

read(crescendo);
read(decrescendo);
```

#### 音符ごとの音量記号

```uzume
// 個別の音符に音量記号を指定
dynamics = measure [C4-1^pp, D4-1^p, E4-1^mf, F4-1^f, G4-1^ff];
read(dynamics);
```

**サポートされる音量記号:**
- `pp` - pianissimo (最弱音)
- `p` - piano (弱音)
- `mp` - mezzo-piano (中弱音)
- `mf` - mezzo-forte (中強音)  
- `f` - forte (強音)
- `ff` - fortissimo (最強音)

## 🎵 高度な機能 (v0.4.0+)

### カスタムコード定義

独自のコード進行を定義して使用できます：

```uzume
// カスタムコードを定義
C7sus4add9 = chord [C4, F4, G4, Bb4, D5];
FmMaj7 = chord [F4, Ab4, C5, E5];
Gsus2 = chord [G4, A4, D5];

// 定義したコードを使用 (コード内で拍数指定)
progression = measure [[code(C7sus4add9)-2], [code(FmMaj7)-2], [code(Gsus2)-2]];
read(progression);
```

### アルペジオ効果

コードをアルペジオで演奏できます：

```uzume
// アルペジオ効果付きの小節
arpeggio_measure = measure.arpeggio [[code(Cmaj)-2], [code(Am)-2]];

// 他のパートと同時演奏すると自動的に時間調整される
melody = measure [C5-1, D5-1, E5-1, F5-1];
read(melody & arpeggio_measure);  // アルペジオが自動的にメロディーの長さに合わせられる
```

**重要:** アルペジオ使用時は、同時演奏される他のパートの長さに自動的に調整されます。

### マルチトラック録音

複数のトラックを独立して作成し、個別のWAVファイルとして出力できます：

```uzume
// グローバル設定
set tempo(120);

// トラック1: メロディー
track melody {
    set wave(sine);
    set volume(80);
    
    theme = measure [C4-1, D4-1, E4-1, F4-1];
    read(theme);
}

// トラック2: ベース
track bass {
    set wave(sawtooth);
    set volume(70);
    
    bassline = measure [C3-2, F3-1, G3-1];
    read(bassline);
}

// トラック3: ドラム
track drums {
    set wave(bit8);
    set volume(60);
    
    kick = measure [C2-0.5, R-0.5, C2-0.5, R-0.5];
    snare = measure [R-1, E3-0.25, R-0.75];
    read(kick & snare);
}
```

**出力ファイル:**
- `output_melody.wav` - メロディートラックのみ
- `output_bass.wav` - ベーストラックのみ
- `output_drums.wav` - ドラムトラックのみ
- `output.wav` - 全トラックをミックスした完全版

**特徴:**
- 各トラックが独立した設定（波形、音量等）を持てる
- トラック内でのみ有効な小節定義
- 自動的な個別ファイル出力
- 従来の単一トラック記法と完全互換

### 連符 (Tuplets)

様々な連符を定義して使用できます：

```uzume
// 三連符 (3つの音を2拍の時間で演奏)
triplet = tuplet 3 in 2 [C4-1, D4-1, E4-1];

// 五連符 (5つの音を4拍の時間で演奏)  
quintuplet = tuplet 5 in 4 [C4-0.5, D4-0.5, E4-0.5, F4-0.5, G4-0.5];

// 定義した連符を使用
tuplet_measure = measure [tuplet(triplet), tuplet(quintuplet)];
read(tuplet_measure);
```

### スケール機能

音階を設定して自動的に音程を調整できます：

```uzume
// スケールを設定
set scale(major);  // Cメジャースケール
set scale(C, minor);  // Cマイナースケール

// スケール内の音程で演奏 (1_4は第1音4オクターブ)
scale_melody = measure [1_4-1, 2_4-1, 3_4-1, 4_4-1, 5_4-1];
read(scale_melody);
```

**サポートされるスケール:**
- `major` - メジャースケール
- `minor` - ナチュラルマイナースケール  
- `dorian` - ドリアンモード
- `phrygian` - フリジアンモード
- `lydian` - リディアンモード
- `mixolydian` - ミクソリディアンモード
- `locrian` - ロクリアンモード
- `harmonic_minor` - ハーモニックマイナー
- `melodic_minor` - メロディックマイナー
- `pentatonic` - ペンタトニックスケール
- `blues` - ブルーススケール

## 🔧 高度な機能

### カスタム波形

```python
# カスタム波形関数を定義
def custom_wave(frequency, duration, sample_rate=44100):
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    return np.sin(2 * np.pi * frequency * t) * np.sin(10 * np.pi * frequency * t)

# コンパイラに登録
compiler.register_wave('custom', custom_wave)
```

### ADSR エンベロープ

```python
# 高度なコンパイラを使用
from uzume_compiler import UzumeAdvancedCompiler

advanced_compiler = UzumeAdvancedCompiler()
# ADSR設定が利用可能
```

## 🐛 トラブルシューティング

### よくある問題

#### 1. 構文エラー

```
SyntaxError: Expected ';' after set statement at line 1, column 15
```

**解決方法**: 文の終わりにセミコロン `;` を付けてください。

#### 2. 未定義の小節

```
KeyError: 'unknown_measure'
```

**解決方法**: `read()` で使用する前に小節を定義してください。

#### 3. 音が出ない

**確認事項**:
- 音量設定が0以上になっているか
- 音符の長さが0以上になっているか
- ファイルが正しく保存されているか

### デバッグ方法

```python
# デバッグ情報を表示
compiler = UzumeCompiler()
audio_data = compiler.compile(uzume_code)

print(f"設定: {compiler.settings}")
print(f"定義された小節: {list(compiler.measures.keys())}")
print(f"生成されたデータサイズ: {len(audio_data)} bytes")
```

## 📈 パフォーマンス

### 推奨事項

- 長い楽曲の場合、小節を小さく分割する
- 同時演奏は4声部まで推奨
- サンプリングレートは44.1kHzが標準

### メモリ使用量

| 楽曲長 | 概算メモリ |
|--------|------------|
| 1分 | ~10MB |
| 5分 | ~50MB |
| 10分 | ~100MB |

## 🗺️ ロードマップ

### v0.5.0 (実装済み)
- [x] マルチトラック録音
- [x] カスタムコード定義
- [x] アルペジオ効果
- [x] 連符 (Tuplets)
- [x] スケール機能
- [x] 8bit風波形
- [x] ダイナミクス効果

### v0.6.0 (予定)
- [ ] MIDI出力サポート
- [ ] 楽器音色指定 `instrument(piano)`
- [ ] FLAC直接出力

### v0.7.0 (予定)
- [ ] エフェクト機能（リバーブ、ディストーション等）
- [ ] 音量エンベロープ（ADSR）
- [ ] ステレオパンニング

### v1.0.0 (予定)
- [ ] GUI エディタ
- [ ] リアルタイム再生
- [ ] プラグインシステム

## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

### 開発環境のセットアップ

```bash
git clone https://github.com/eightman999/Uzume.git
cd Uzume
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt
```

### テストの実行

```bash
python -m pytest tests/
```

### コントリビューションガイドライン

1. フォークしてブランチを作成
2. 機能を実装・テストを追加
3. プルリクエストを作成

## 📄 ライセンス

このプロジェクトは [MIT License](LICENSE) の下で公開されています。

## 🙏 謝辞

- **Uzume（天宇受売命）**: 日本神話の芸能の神様
- **NumPy**: 音声処理のベース
- **Python**: 素晴らしい言語

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/your-username/uzume-compiler/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/uzume-compiler/discussions)
- **Email**: your-email@example.com

---

**Made with ❤️ by eightman999*

*音楽とコードの境界を超えて*