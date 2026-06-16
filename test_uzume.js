/**
 * test_uzume.js - Uzume コンパイラのNode.js テスト
 * 実行: node web/test_uzume.js
 */

'use strict';

const { UzumeCompiler, UzumeParser, CHORD_DEFINITIONS, SCALE_DEFINITIONS } = require('./uzume.js');

let passed = 0;
let failed = 0;

function assert(condition, name, detail) {
    if (condition) {
        console.log('  PASS: ' + name);
        passed++;
    } else {
        console.log('  FAIL: ' + name + (detail ? ' — ' + detail : ''));
        failed++;
    }
}

async function runTest(name, fn) {
    console.log('\n[' + name + ']');
    try {
        await fn();
    } catch (e) {
        console.log('  ERROR: ' + e.message);
        failed++;
    }
}

// ----- 検証ヘルパー -----
const SR = 44100;

// バッファのピーク振幅
function peakAmplitude(buf) {
    let peak = 0;
    for (let i = 0; i < buf.length; i++) {
        const a = Math.abs(buf[i]);
        if (a > peak) peak = a;
    }
    return peak;
}

// 非ゼロサンプルの割合 (アーティキュレーションによる音価短縮の検証用)
function nonzeroRatio(buf) {
    if (buf.length === 0) return 0;
    let nz = 0;
    for (let i = 0; i < buf.length; i++) if (buf[i] !== 0) nz++;
    return nz / buf.length;
}

// 波形のデューティ比 (正サンプルの割合)
function dutyRatio(buf) {
    let pos = 0, neg = 0;
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] > 0) pos++;
        else if (buf[i] < 0) neg++;
    }
    return (pos + neg) > 0 ? pos / (pos + neg) : 0;
}

// ゼロ交差数 (音高の推定用 — 周波数に比例する)
function zeroCrossings(buf) {
    let z = 0;
    for (let i = 1; i < buf.length; i++) {
        if ((buf[i] >= 0) !== (buf[i - 1] >= 0)) z++;
    }
    return z;
}

// 1拍あたりのサンプル数 (tempo はデフォルト 120)
function beatsToSamples(beats, tempo) {
    tempo = tempo || 120;
    return Math.floor(beats * (60 / tempo) * SR);
}

async function main() {

// ================================================================
// P1-1: n接頭辞なし音名記法
// ================================================================
await runTest('P1-1: 接頭辞なし音名 C4-1', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'set wave(sine);',
        'melody = measure[C4-1, D4-1, E4-1];',
        'read(melody);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer', 'length=' + buf.length);
});

await runTest('P1-1: 後方互換 nC4-1 記法', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'melody = measure[nC4-1, nD4-1, nE4-1];',
        'read(melody);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('P1-1: 混在記法 (n有り/無し)', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'melody = measure[C4-1, nD4-1, E4-2, nF4-0.5];',
        'read(melody);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('P1-1: A始まり識別子 bass が小節名として機能する', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'bass = measure[C3-2, F3-1, G3-1];',
        'read(bass);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('P1-1: F始まり識別子 Fsection が小節名として機能する', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'Fsection = measure[F4-1, G4-1, A4-1];',
        'read(Fsection);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

// ================================================================
// P1-2: pulse50 波形
// ================================================================
await runTest('P1-2: pulse50 波形 (50%デューティ検証)', async function() {
    const { UzumeAudioEngine } = require('./uzume.js');
    const engine = new UzumeAudioEngine();
    // エンベロープなし・音量1.0 で素波形を直接生成してデューティを検証
    const p50 = engine.generateWaveform(220, 0.2, 'pulse50', 1.0, null, null);
    const p25 = engine.generateWaveform(220, 0.2, 'pulse', 1.0, null, null);
    const r50 = dutyRatio(p50);
    const r25 = dutyRatio(p25);
    assert(Math.abs(r50 - 0.5) < 0.02, 'pulse50 duty ≈ 0.5', 'actual=' + r50.toFixed(3));
    assert(Math.abs(r25 - 0.25) < 0.02, 'pulse(25%) duty ≈ 0.25', 'actual=' + r25.toFixed(3));
    assert(Math.abs(r50 - r25) > 0.2, 'pulse50 と pulse(25%) は明確に異なる',
        'r50=' + r50.toFixed(3) + ' r25=' + r25.toFixed(3));

    // コンパイル経路でも有効であることを確認
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'set wave(pulse50);',
        'melody = measure[C4-1, G4-1];',
        'read(melody);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array && buf.length > 0, 'compile 経路で非空バッファ');
});

// ================================================================
// P2-3: DYNAMIC 音量記号
// ================================================================
await runTest('P2-3: DYNAMIC ^pp..^ff が音量に単調反映される', async function() {
    const peaks = {};
    for (const d of ['pp', 'p', 'mp', 'mf', 'f', 'ff']) {
        const compiler = new UzumeCompiler();
        const buf = await compiler.compile(
            'set tempo(120);\nset wave(square);\nm = measure[C4-1^' + d + '];\nread(m);');
        peaks[d] = peakAmplitude(buf);
    }
    // square 波形なのでピーク ≈ DYNAMIC_VOLUME_MAP の値そのもの
    assert(peaks.pp < peaks.p && peaks.p < peaks.mp && peaks.mp < peaks.mf &&
           peaks.mf < peaks.f && peaks.f < peaks.ff,
        'peak ordering pp<p<mp<mf<f<ff',
        JSON.stringify(peaks));
    assert(Math.abs(peaks.ff - 1.0) < 0.01 && Math.abs(peaks.pp - 0.2) < 0.01,
        'ff≈1.0, pp≈0.2', JSON.stringify(peaks));
});

await runTest('P2-3: 接頭辞なし音名 + DYNAMIC', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'dynamics = measure[C4-1^mf, D4-1^f];',
        'read(dynamics);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ');
});

// ================================================================
// P2-4: articulation (stc/leg/acc/ten)
// ================================================================
await runTest('P2-4: staccato (stc) は音価を実際に短縮する', async function() {
    const normal = new UzumeCompiler();
    const normalBuf = await normal.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[C4-1];\nread(m);');
    const stcC = new UzumeCompiler();
    const stcBuf = await stcC.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[stc C4-1];\nread(m);');
    // stc は sustainEnd=50% なので後半が無音 → 非ゼロ率が通常より大幅に低い
    const rNormal = nonzeroRatio(normalBuf);
    const rStc = nonzeroRatio(stcBuf);
    assert(rStc < 0.6, 'stc の非ゼロ率 < 0.6 (音価短縮)', 'actual=' + rStc.toFixed(3));
    assert(rNormal - rStc > 0.3, '通常音より stc は大幅に短い',
        'normal=' + rNormal.toFixed(3) + ' stc=' + rStc.toFixed(3));
    assert(stcBuf.length === normalBuf.length, 'バッファ長は同一(無音で詰める)',
        'stc=' + stcBuf.length + ' normal=' + normalBuf.length);
});

await runTest('P2-4: accent (acc) は音量を上げ、tenuto (ten) は通常と異なる包絡線', async function() {
    const normal = new UzumeCompiler();
    const normalBuf = await normal.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[C4-1];\nread(m);');
    const accC = new UzumeCompiler();
    const accBuf = await accC.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[acc C4-1];\nread(m);');
    const tenC = new UzumeCompiler();
    const tenBuf = await tenC.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[ten C4-1];\nread(m);');
    // acc は音量 *1.3 → ピークが通常より高い
    assert(peakAmplitude(accBuf) > peakAmplitude(normalBuf) * 1.1,
        'acc のピーク > 通常*1.1',
        'acc=' + peakAmplitude(accBuf).toFixed(3) + ' normal=' + peakAmplitude(normalBuf).toFixed(3));
    // ten はエンベロープ(attack/release)が変わるので通常と一致しない
    const tenSameAsNormal = tenBuf.length === normalBuf.length &&
        tenBuf.every((v, i) => v === normalBuf[i]);
    assert(!tenSameAsNormal, 'tenuto は通常音と異なる包絡線を持つ');
});

await runTest('P2-4: legato (leg) はエンベロープを変化させる', async function() {
    const normal = new UzumeCompiler();
    const normalBuf = await normal.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[C4-1];\nread(m);');
    const legC = new UzumeCompiler();
    const legBuf = await legC.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[leg C4-1];\nread(m);');
    const same = legBuf.length === normalBuf.length &&
        legBuf.every((v, i) => v === normalBuf[i]);
    assert(!same, 'legato は通常音と異なる包絡線を持つ');
    assert(legBuf.length > 0, '非空バッファ');
});

await runTest('P2-4: add stc/leg 後付け指定が実際に反映される (修正検証)', async function() {
    // add なし
    const noAdd = new UzumeCompiler();
    const noAddBuf = await noAdd.compile(
        'set tempo(120);\nset wave(sine);\nm = measure[C4-1, D4-1];\nread(m);');
    // add stc(m[0]) あり → 1音目が短縮されるはず
    const withAdd = new UzumeCompiler();
    const withAddBuf = await withAdd.compile([
        'set tempo(120);',
        'set wave(sine);',
        'm = measure[C4-1, D4-1];',
        'add stc(m[0]);',
        'read(m);'
    ].join('\n'));
    assert(withAddBuf.length > 0, '非空バッファ');
    const identical = withAddBuf.length === noAddBuf.length &&
        withAddBuf.every((v, i) => v === noAddBuf[i]);
    assert(!identical, 'add stc(m[0]) が音響に反映されている(旧実装は no-op だった)',
        identical ? 'add が無視されたまま' : 'OK');
    // 1音目(前半)の非ゼロ率が add なしより下がっているか
    const half = Math.floor(noAddBuf.length / 2);
    let nzAdd = 0, nzNo = 0;
    for (let i = 0; i < half; i++) { if (withAddBuf[i] !== 0) nzAdd++; if (noAddBuf[i] !== 0) nzNo++; }
    assert(nzAdd < nzNo, '1音目の非ゼロサンプルが add stc で減少',
        'add=' + nzAdd + ' noAdd=' + nzNo);
});

// ================================================================
// P2-5: .arpeggio / .cre / .dec
// ================================================================
await runTest('P2-5: .arpeggio は時間差発音でバッファが延長される', async function() {
    const arp = new UzumeCompiler();
    const arpBuf = await arp.compile([
        'set tempo(120);',
        'arp = measure.arpeggio [[code(Cmaj7)-2]];',
        'read(arp);'
    ].join('\n'));
    const plain = new UzumeCompiler();
    const plainBuf = await plain.compile([
        'set tempo(120);',
        'pl = measure [[code(Cmaj7)-2]];',
        'read(pl);'
    ].join('\n'));
    assert(arpBuf.length > 0 && plainBuf.length > 0, '両者非空');
    // アルペジオは各構成音を 0.05s ずつずらすのでバッファが長くなる
    assert(arpBuf.length > plainBuf.length,
        'arpeggio バッファ > 通常和音バッファ',
        'arp=' + arpBuf.length + ' plain=' + plainBuf.length);
});

await runTest('P2-5: .cre (crescendo) は音量を漸増させる', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'set wave(square);',
        'cresc = measure.cre [C4-1, D4-1, E4-1, F4-1];',
        'read(cresc);'
    ].join('\n'));
    // 各音符は 1 拍 = beatsToSamples(1,120) サンプル
    const per = beatsToSamples(1, 120);
    const peaks = [];
    for (let n = 0; n < 4; n++) {
        let pk = 0;
        for (let i = n * per; i < (n + 1) * per; i++) {
            const a = Math.abs(buf[i]); if (a > pk) pk = a;
        }
        peaks.push(pk);
    }
    assert(peaks[0] < peaks[1] && peaks[1] < peaks[2] && peaks[2] < peaks[3],
        'crescendo: 音量が単調増加', JSON.stringify(peaks.map(p => +p.toFixed(3))));
});

await runTest('P2-5: .dec (decrescendo) は音量を漸減させる', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'set wave(square);',
        'decresc = measure.dec [C4-1, D4-1, E4-1, F4-1];',
        'read(decresc);'
    ].join('\n'));
    const per = beatsToSamples(1, 120);
    const peaks = [];
    for (let n = 0; n < 4; n++) {
        let pk = 0;
        for (let i = n * per; i < (n + 1) * per; i++) {
            const a = Math.abs(buf[i]); if (a > pk) pk = a;
        }
        peaks.push(pk);
    }
    assert(peaks[0] > peaks[1] && peaks[1] > peaks[2] && peaks[2] > peaks[3],
        'decrescendo: 音量が単調減少', JSON.stringify(peaks.map(p => +p.toFixed(3))));
});

// ================================================================
// P3-6: tuplet 連符
// ================================================================
await runTest('P3-6: tuplet 3 in 2 が実際にレンダリングされる (タイミング圧縮)', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'triplet = tuplet 3 in 2 [C4-1, D4-1, E4-1];',
        'read(triplet);'
    ].join('\n'));
    assert(compiler.tuplets.has('triplet'), 'tuplet "triplet" registered');
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ(旧実装は 0 だった)');
    // 3音符(書き込み音価合計3拍)を 2 拍に圧縮 → 全体で 2 拍分のサンプル
    const expected = beatsToSamples(2, 120);
    assert(buf.length === expected, 'tuplet 全体 == 2拍分',
        'actual=' + buf.length + ' expected=' + expected);
});

await runTest('P3-6: measure[tuplet(name)] インライン参照 (README 記法)', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'triplet = tuplet 3 in 2 [C4-1, D4-1, E4-1];',
        'm = measure[tuplet(triplet), C4-2];',
        'read(m);'
    ].join('\n'));
    assert(buf.length > 0, '非空バッファ');
    // tuplet(2拍) + C4-2(2拍) = 4拍
    const expected = beatsToSamples(4, 120);
    assert(buf.length === expected, 'tuplet(2拍) + 音符(2拍) = 4拍',
        'actual=' + buf.length + ' expected=' + expected);
});

await runTest('P3-6: 匿名インライン連符 tuplet N in M [...]', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'm = measure[tuplet 3 in 2 [C4-1, D4-1, E4-1]];',
        'read(m);'
    ].join('\n'));
    assert(buf.length === beatsToSamples(2, 120), '匿名連符も 2拍に圧縮',
        'actual=' + buf.length);
});

// ================================================================
// P3-7: scale degree 1_4 記法
// ================================================================
await runTest('P3-7: set scale(major) + 度数が正しい音高になる', async function() {
    // Cメジャー: 1=C 2=D 3=E 4=F 5=G 6=A 7=B
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'set scale(major);',
        'scale_melody = measure[1_4-1, 2_4-1, 3_4-1, 4_4-1, 5_4-1];',
        'read(scale_melody);'
    ].join('\n'));
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ');
    // 参照: 各音名を単独で生成(各1拍)。scale 側も各音1拍ずつなので長さが一致する。
    const refs = {};
    for (const n of ['C4', 'D4', 'E4', 'F4', 'G4']) {
        const c = new UzumeCompiler();
        const b = await c.compile('set tempo(120);\nm = measure[' + n + '-1];\nread(m);');
        refs[n] = zeroCrossings(b);
    }
    const per = beatsToSamples(1, 120);
    const degNames = ['C4', 'D4', 'E4', 'F4', 'G4'];
    const degZcr = [];
    for (let i = 0; i < 5; i++) {
        // 各音は1拍ずつ結合されているので [i*per, (i+1)*per) が1音分(参照と同長)
        const seg = buf.subarray(i * per, (i + 1) * per);
        degZcr.push(zeroCrossings(seg));
    }
    // 1) 度数 1→5 で音高が単調上昇
    let ascending = true;
    for (let i = 1; i < 5; i++) if (degZcr[i] <= degZcr[i - 1]) ascending = false;
    assert(ascending, 'メジャースケール度数 1→5 で音高が上昇(ゼロ交差増加)',
        'zcr=' + JSON.stringify(degZcr));
    // 2) 各度数の音高が参照音名と一致(同長セグメントで直接比較)
    let mismatch = null;
    for (let i = 0; i < 5; i++) {
        if (Math.abs(degZcr[i] - refs[degNames[i]]) > 2) mismatch = degNames[i];
    }
    assert(!mismatch, '各度数が期待音名と一致 (1=C4,2=D4,3=E4,4=F4,5=G4)',
        mismatch ? (mismatch + ' 不一致: deg/refs=' + JSON.stringify({ deg: degZcr, refs })) : 'OK');
});

await runTest('P3-7: set scale(C, minor) の第3度は短3度(Eb4)', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'set scale(C, minor);',
        'm = measure[3_4-1];',
        'read(m);'
    ].join('\n'));
    // Cマイナーの第3度 = Eb4。E4(長3度)より低いはず。
    const e4c = new UzumeCompiler();
    const e4buf = await e4c.compile('set tempo(120);\nm = measure[E4-1];\nread(m);');
    const ebPer = buf.length;
    const zMinor = zeroCrossings(buf);
    const zE4 = zeroCrossings(e4buf);
    assert(zMinor < zE4, 'マイナー3度 < E4(長3度) の音高',
        'minor3=' + zMinor + ' E4=' + zE4);
});

// ================================================================
// P3-8: カスタムコード定義
// ================================================================
await runTest('P3-8: カスタムコード定義と使用', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'MyChord = chord [C4, E4, G4, B4];',
        'prog = measure [[code(MyChord)-2]];',
        'read(prog);'
    ].join('\n'));
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ');
    assert(JSON.stringify(compiler.lookupChord('MyChord')) === '["C4","E4","G4","B4"]',
        'カスタムコードが解決される');
});

await runTest('P3-8: カスタムコードはビルトインを上書きし、グローバルは汚染しない (修正検証)', async function() {
    const builtinBefore = JSON.stringify(CHORD_DEFINITIONS['Gsus2']);
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'Gsus2 = chord [G4, A4, D5, C5];',
        'prog = measure [[code(Gsus2)-2]];',
        'read(prog);'
    ].join('\n'));
    assert(buf.length > 0, '非空バッファ');
    const builtinAfter = JSON.stringify(CHORD_DEFINITIONS['Gsus2']);
    assert(builtinBefore === builtinAfter, 'グローバル CHORD_DEFINITIONS 不変(旧実装は破壊的だった)',
        'before=' + builtinBefore + ' after=' + builtinAfter);
    // カスタム定義(C5追加)がビルトインより優先されている
    assert(compiler.lookupChord('Gsus2').includes('C5'),
        'カスタム定義がビルトインより優先される',
        JSON.stringify(compiler.lookupChord('Gsus2')));
});

await runTest('P3-8: 複数カスタムコード定義', async function() {
    const compiler = new UzumeCompiler();
    const buf = await compiler.compile([
        'set tempo(120);',
        'C7sus4add9 = chord [C4, F4, G4, Bb4, D5];',
        'Gsus2 = chord [G4, A4, D5];',
        'prog = measure [[code(C7sus4add9)-2], [code(Gsus2)-2]];',
        'read(prog);'
    ].join('\n'));
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ');
});

// ================================================================
// P4-9: CHORD_DEFINITIONS が 230 以上
// ================================================================
await runTest('P4-9: CHORD_DEFINITIONS が 230 以上', async function() {
    const count = Object.keys(CHORD_DEFINITIONS).length;
    assert(count >= 230, 'chord count >= 230', 'actual=' + count);
});

await runTest('P4-9: 拡張コード 7-b9 / 7-#9 が code() で参照できる (修正検証)', async function() {
    // これらは README の「利用可能なコードタイプ」に列挙されているが、
    // 旧実装は NOTE が 'C7' を貪欲に捕食して '#' で字句エラーになっていた。
    for (const name of ['C7-b9', 'C7-#9']) {
        const compiler = new UzumeCompiler();
        const buf = await compiler.compile(
            'set tempo(120);\nm = measure[[code(' + name + ')-1]];\nread(m);');
        assert(buf.length > 0, name + ' がレンダリングされる', 'len=' + buf.length);
        assert(CHORD_DEFINITIONS[name] && CHORD_DEFINITIONS[name].length === 5,
            name + ' は5音構成', JSON.stringify(CHORD_DEFINITIONS[name]));
    }
});

// ================================================================
// 既存サンプル: リグレッションテスト
// ================================================================
await runTest('REGRESSION: simple melody (nC4-1 記法)', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(90);',
        'set wave(sine);',
        'set volume(75);',
        'melody = measure[nC4-1, nD4-1, nE4-2];',
        'read(melody);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('REGRESSION: chord progression [code(Cmaj7)]', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'set wave(triangle);',
        'progression = measure[[code(Cmaj7)-1], [code(Am)-1], [code(F)-1], [code(G)-1]];',
        'loop 2 {',
        '    read(progression);',
        '}'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('REGRESSION: multitrack', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'track melody {',
        '    set wave(sine);',
        '    theme = measure[C4-1, D4-1, E4-1, F4-1];',
        '    read(theme);',
        '}',
        'track bass {',
        '    set wave(sawtooth);',
        '    bassline = measure[C3-2, G3-2];',
        '    read(bassline);',
        '}'
    ].join('\n');
    const result = await compiler.compile(source);
    assert(typeof result === 'object' && !(result instanceof Float32Array), 'multitrack object returned');
    assert('melody' in result && 'bass' in result, 'tracks present');
    assert(result.melody.length > 0 && result.bass.length > 0, 'tracks non-empty');
});

await runTest('REGRESSION: track 内の add leg(...) が反映される (プレイヤー hotaru 風)', async function() {
    const compiler = new UzumeCompiler();
    const result = await compiler.compile([
        'set tempo(120);',
        'track melody {',
        '    set wave(sine);',
        '    m0 = measure[C4-1];',
        '    add leg(m0[0]);',
        '    read(m0);',
        '}',
        'track plain {',
        '    set wave(sine);',
        '    m0 = measure[C4-1];',
        '    read(m0);',
        '}'
    ].join('\n'));
    assert(result && result.melody && result.plain, '両トラック生成');
    const same = result.melody.length === result.plain.length &&
        result.melody.every((v, i) => v === result.plain[i]);
    assert(!same, 'add leg が track 内で音響に反映されている');
});

await runTest('REGRESSION: read(melody & bass) 同時演奏 (ミックス長検証)', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'set wave(sine);',
        'melody = measure[C4-1, D4-1, E4-1, F4-1];',
        'bass = measure[C3-2, F3-2];',
        'read(melody & bass);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ');
    // 両パートとも4拍 → ミックス長も4拍
    assert(buf.length === beatsToSamples(4, 120), '同時演奏の長さ == 4拍',
        'actual=' + buf.length);
});

await runTest('REGRESSION: loop (繰り返し回数分の長さ)', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'phrase = measure[C4-1, G4-1];',
        'loop 3 {',
        '    read(phrase);',
        '}'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array && buf.length > 0, '非空バッファ');
    // phrase=2拍 × 3回 = 6拍
    assert(buf.length === beatsToSamples(6, 120), 'loop 3 → 6拍分',
        'actual=' + buf.length);
});

await runTest('REGRESSION: 休符 R-1', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'm = measure[C4-1, R-1, D4-2];',
        'read(m);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('REGRESSION: README 複雑な楽曲構造サンプル', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(110);',
        'set beat(4/4);',
        'set wave(sine);',
        'set volume(70);',
        'melody = measure[C4-1, D4-1, E4-0.5, F4-0.5, G4-2];',
        'bridge = measure[A4-1, G4-1, F4-1, E4-1];',
        'bass = measure[C3-2, F3-1, G3-1];',
        'bass_bridge = measure[A3-1, F3-1, C3-2];',
        'chords = measure[[code(C)-1], [code(F)-1], [code(G)-1], [code(C)-1]];',
        'add leg(melody[0]);',
        'add stc(bridge[2]);',
        'read(melody & bass);',
        'loop 2 {',
        '    read(melody & bass & chords);',
        '    read(bridge & bass_bridge);',
        '}',
        'read(melody & chords);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('REGRESSION: 8bit波形 (bit8/chiptune)', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(140);',
        'set wave(bit8);',
        'm = measure[C4-0.5, E4-0.5, G4-0.5, C5-0.5];',
        'read(m);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('REGRESSION: F#m7 コードが正しく機能する', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'm = measure[[code(F#m7)-2], [code(Bm)-2]];',
        'read(m);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

await runTest('REGRESSION: 接頭辞なし音名 + 和音 + 休符', async function() {
    const compiler = new UzumeCompiler();
    const source = [
        'set tempo(120);',
        'set wave(sine);',
        'set volume(75);',
        'melody = measure[C4-1, D4-1, E4-1, F4-1, G4-2, R-2];',
        'add leg(melody[0]);',
        'add stc(melody[4]);',
        'read(melody);'
    ].join('\n');
    const buf = await compiler.compile(source);
    assert(buf instanceof Float32Array, 'Float32Array returned');
    assert(buf.length > 0, 'Non-empty buffer');
});

// ================================================================
// 結果サマリ
// ================================================================
console.log('\n========================================');
console.log('テスト結果: ' + passed + ' passed, ' + failed + ' failed');
console.log('========================================');

if (failed > 0) {
    process.exit(1);
} else {
    console.log('全テストグリーン!');
}

} // end main

main().catch(function(e) {
    console.error('Fatal error:', e);
    process.exit(1);
});
