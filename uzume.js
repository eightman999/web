/**
 * Uzume Language Compiler - JavaScript Edition
 * 楽譜をコードのように記述し、Web Audio APIで音声生成
 */

// ========================================
// AST Node Classes
// ========================================

class ASTNode {
    constructor() {}
}

class Program extends ASTNode {
    constructor(statements) {
        super();
        this.statements = statements;
    }
}

class SetStatement extends ASTNode {
    constructor(setting, value) {
        super();
        this.setting = setting;
        this.value = value;
    }
}

class MeasureDefinition extends ASTNode {
    constructor(name, notes, dynamic = null, dynamicsCover = null) {
        super();
        this.name = name;
        this.notes = notes;
        this.dynamic = dynamic;
        this.dynamicsCover = dynamicsCover;
    }
}

class Note extends ASTNode {
    constructor(pitch, duration, articulation = null, dynamic = null) {
        super();
        this.pitch = pitch;
        this.duration = duration;
        this.articulation = articulation;
        this.dynamic = dynamic;
    }
}

class Rest extends ASTNode {
    constructor(duration) {
        super();
        this.duration = duration;
    }
}

class Chord extends ASTNode {
    constructor(notes) {
        super();
        this.notes = notes;
    }
}

class CodeChord extends ASTNode {
    constructor(chordName, duration = 1.0) {
        super();
        this.chordName = chordName;
        this.duration = duration;
    }
}

class LoopStatement extends ASTNode {
    constructor(count, body) {
        super();
        this.count = count;
        this.body = body;
    }
}

class ReadStatement extends ASTNode {
    constructor(measureNames) {
        super();
        this.measureNames = measureNames;
    }
}

class TrackDefinition extends ASTNode {
    constructor(name, settings, statements) {
        super();
        this.name = name;
        this.settings = settings;
        this.statements = statements;
    }
}

class MeasureReference extends ASTNode {
    constructor(measureName) {
        super();
        this.measureName = measureName;
    }
}

// ========================================
// Chord Definitions
// ========================================

const CHORD_DEFINITIONS = {
    // C chords
    'C': ['C4', 'E4', 'G4'],
    'Cm': ['C4', 'Eb4', 'G4'],
    'C7': ['C4', 'E4', 'G4', 'Bb4'],
    'Cmaj7': ['C4', 'E4', 'G4', 'B4'],
    'Cm7': ['C4', 'Eb4', 'G4', 'Bb4'],
    'Cdim': ['C4', 'Eb4', 'F#4'],
    'Caug': ['C4', 'E4', 'G#4'],
    'Csus4': ['C4', 'F4', 'G4'],
    'Cadd9': ['C4', 'E4', 'G4', 'D5'],
    'C9': ['C4', 'E4', 'G4', 'Bb4', 'D5'],
    'C11': ['C4', 'E4', 'G4', 'Bb4', 'D5', 'F5'],
    'C13': ['C4', 'E4', 'G4', 'Bb4', 'D5', 'F5', 'A5'],
    'Cm9': ['C4', 'Eb4', 'G4', 'Bb4', 'D5'],
    'Cmaj9': ['C4', 'E4', 'G4', 'B4', 'D5'],
    'C7-b9': ['C4', 'E4', 'G4', 'Bb4', 'C#5'],
    'C7-#9': ['C4', 'E4', 'G4', 'Bb4', 'Eb5'],
    'Cno3': ['C4', 'G4'],
    'Cno5': ['C4', 'E4'],
    'Cmaj7-no5': ['C4', 'E4', 'B4'],

    // C# chords
    'C#': ['C#4', 'F4', 'G#4'],
    'C#m': ['C#4', 'E4', 'G#4'],
    'C#7': ['C#4', 'F4', 'G#4', 'B4'],
    'C#maj7': ['C#4', 'F4', 'G#4', 'C5'],
    'C#m7': ['C#4', 'E4', 'G#4', 'B4'],
    'C#dim': ['C#4', 'E4', 'G4'],
    'C#aug': ['C#4', 'F4', 'A4'],
    'C#sus4': ['C#4', 'F#4', 'G#4'],
    'C#add9': ['C#4', 'F4', 'G#4', 'Eb5'],
    'C#9': ['C#4', 'F4', 'G#4', 'B4', 'Eb5'],
    'C#11': ['C#4', 'F4', 'G#4', 'B4', 'Eb5', 'F#5'],
    'C#13': ['C#4', 'F4', 'G#4', 'B4', 'Eb5', 'F#5', 'Bb5'],
    'C#m9': ['C#4', 'E4', 'G#4', 'B4', 'Eb5'],
    'C#maj9': ['C#4', 'F4', 'G#4', 'C5', 'Eb5'],
    'C#7-b9': ['C#4', 'F4', 'G#4', 'B4', 'D5'],
    'C#7-#9': ['C#4', 'F4', 'G#4', 'B4', 'E5'],
    'C#no3': ['C#4', 'G#4'],
    'C#no5': ['C#4', 'F4'],
    'C#maj7-no5': ['C#4', 'F4', 'C5'],

    // D chords
    'D': ['D4', 'F#4', 'A4'],
    'Dm': ['D4', 'F4', 'A4'],
    'D7': ['D4', 'F#4', 'A4', 'C5'],
    'Dmaj7': ['D4', 'F#4', 'A4', 'C#5'],
    'Dm7': ['D4', 'F4', 'A4', 'C5'],
    'Ddim': ['D4', 'F4', 'G#4'],
    'Daug': ['D4', 'F#4', 'Bb4'],
    'Dsus4': ['D4', 'G4', 'A4'],
    'Dadd9': ['D4', 'F#4', 'A4', 'E5'],
    'D9': ['D4', 'F#4', 'A4', 'C5', 'E5'],
    'D11': ['D4', 'F#4', 'A4', 'C5', 'E5', 'G5'],
    'D13': ['D4', 'F#4', 'A4', 'C5', 'E5', 'G5', 'B5'],
    'Dm9': ['D4', 'F4', 'A4', 'C5', 'E5'],
    'Dmaj9': ['D4', 'F#4', 'A4', 'C#5', 'E5'],
    'D7-b9': ['D4', 'F#4', 'A4', 'C5', 'Eb5'],
    'D7-#9': ['D4', 'F#4', 'A4', 'C5', 'F5'],
    'Dno3': ['D4', 'A4'],
    'Dno5': ['D4', 'F#4'],
    'Dmaj7-no5': ['D4', 'F#4', 'C#5'],

    // Eb chords
    'Eb': ['Eb4', 'G4', 'Bb4'],
    'Ebm': ['Eb4', 'F#4', 'Bb4'],
    'Eb7': ['Eb4', 'G4', 'Bb4', 'C#5'],
    'Ebmaj7': ['Eb4', 'G4', 'Bb4', 'D5'],
    'Ebm7': ['Eb4', 'F#4', 'Bb4', 'C#5'],
    'Ebdim': ['Eb4', 'F#4', 'A4'],
    'Ebaug': ['Eb4', 'G4', 'B4'],
    'Ebsus4': ['Eb4', 'G#4', 'Bb4'],
    'Ebadd9': ['Eb4', 'G4', 'Bb4', 'F5'],
    'Eb9': ['Eb4', 'G4', 'Bb4', 'C#5', 'F5'],
    'Eb11': ['Eb4', 'G4', 'Bb4', 'C#5', 'F5', 'G#5'],
    'Eb13': ['Eb4', 'G4', 'Bb4', 'C#5', 'F5', 'G#5', 'C6'],
    'Ebm9': ['Eb4', 'F#4', 'Bb4', 'C#5', 'F5'],
    'Ebmaj9': ['Eb4', 'G4', 'Bb4', 'D5', 'F5'],
    'Eb7-b9': ['Eb4', 'G4', 'Bb4', 'C#5', 'E5'],
    'Eb7-#9': ['Eb4', 'G4', 'Bb4', 'C#5', 'F#5'],
    'Ebno3': ['Eb4', 'Bb4'],
    'Ebno5': ['Eb4', 'G4'],
    'Ebmaj7-no5': ['Eb4', 'G4', 'D5'],

    // E chords
    'E': ['E4', 'G#4', 'B4'],
    'Em': ['E4', 'G4', 'B4'],
    'E7': ['E4', 'G#4', 'B4', 'D5'],
    'Emaj7': ['E4', 'G#4', 'B4', 'Eb5'],
    'Em7': ['E4', 'G4', 'B4', 'D5'],
    'Edim': ['E4', 'G4', 'Bb4'],
    'Eaug': ['E4', 'G#4', 'C5'],
    'Esus4': ['E4', 'A4', 'B4'],
    'Eadd9': ['E4', 'G#4', 'B4', 'F#5'],
    'E9': ['E4', 'G#4', 'B4', 'D5', 'F#5'],
    'E11': ['E4', 'G#4', 'B4', 'D5', 'F#5', 'A5'],
    'E13': ['E4', 'G#4', 'B4', 'D5', 'F#5', 'A5', 'C#6'],
    'Em9': ['E4', 'G4', 'B4', 'D5', 'F#5'],
    'Emaj9': ['E4', 'G#4', 'B4', 'Eb5', 'F#5'],
    'E7-b9': ['E4', 'G#4', 'B4', 'D5', 'F5'],
    'E7-#9': ['E4', 'G#4', 'B4', 'D5', 'G5'],
    'Eno3': ['E4', 'B4'],
    'Eno5': ['E4', 'G#4'],
    'Emaj7-no5': ['E4', 'G#4', 'Eb5'],

    // F chords
    'F': ['F4', 'A4', 'C5'],
    'Fm': ['F4', 'G#4', 'C5'],
    'F7': ['F4', 'A4', 'C5', 'Eb5'],
    'Fmaj7': ['F4', 'A4', 'C5', 'E5'],
    'Fm7': ['F4', 'G#4', 'C5', 'Eb5'],
    'Fdim': ['F4', 'G#4', 'B4'],
    'Faug': ['F4', 'A4', 'C#5'],
    'Fsus4': ['F4', 'Bb4', 'C5'],
    'Fadd9': ['F4', 'A4', 'C5', 'G5'],
    'F9': ['F4', 'A4', 'C5', 'Eb5', 'G5'],
    'F11': ['F4', 'A4', 'C5', 'Eb5', 'G5', 'Bb5'],
    'F13': ['F4', 'A4', 'C5', 'Eb5', 'G5', 'Bb5', 'D6'],
    'Fm9': ['F4', 'G#4', 'C5', 'Eb5', 'G5'],
    'Fmaj9': ['F4', 'A4', 'C5', 'E5', 'G5'],
    'F7-b9': ['F4', 'A4', 'C5', 'Eb5', 'F#5'],
    'F7-#9': ['F4', 'A4', 'C5', 'Eb5', 'G#5'],
    'Fno3': ['F4', 'C5'],
    'Fno5': ['F4', 'A4'],
    'Fmaj7-no5': ['F4', 'A4', 'E5'],

    // F# chords
    'F#': ['F#4', 'Bb4', 'C#5'],
    'F#m': ['F#4', 'A4', 'C#5'],
    'F#7': ['F#4', 'Bb4', 'C#5', 'E5'],
    'F#maj7': ['F#4', 'Bb4', 'C#5', 'F5'],
    'F#m7': ['F#4', 'A4', 'C#5', 'E5'],
    'F#dim': ['F#4', 'A4', 'C5'],
    'F#aug': ['F#4', 'Bb4', 'D5'],
    'F#sus4': ['F#4', 'B4', 'C#5'],
    'F#add9': ['F#4', 'Bb4', 'C#5', 'G#5'],
    'F#9': ['F#4', 'Bb4', 'C#5', 'E5', 'G#5'],
    'F#11': ['F#4', 'Bb4', 'C#5', 'E5', 'G#5', 'B5'],
    'F#13': ['F#4', 'Bb4', 'C#5', 'E5', 'G#5', 'B5', 'Eb6'],
    'F#m9': ['F#4', 'A4', 'C#5', 'E5', 'G#5'],
    'F#maj9': ['F#4', 'Bb4', 'C#5', 'F5', 'G#5'],
    'F#7-b9': ['F#4', 'Bb4', 'C#5', 'E5', 'G5'],
    'F#7-#9': ['F#4', 'Bb4', 'C#5', 'E5', 'A5'],
    'F#no3': ['F#4', 'C#5'],
    'F#no5': ['F#4', 'Bb4'],
    'F#maj7-no5': ['F#4', 'Bb4', 'F5'],

    // G chords
    'G': ['G4', 'B4', 'D5'],
    'Gm': ['G4', 'Bb4', 'D5'],
    'G7': ['G4', 'B4', 'D5', 'F5'],
    'Gmaj7': ['G4', 'B4', 'D5', 'F#5'],
    'Gm7': ['G4', 'Bb4', 'D5', 'F5'],
    'Gdim': ['G4', 'Bb4', 'C#5'],
    'Gaug': ['G4', 'B4', 'Eb5'],
    'Gsus4': ['G4', 'C5', 'D5'],
    'Gadd9': ['G4', 'B4', 'D5', 'A5'],
    'G9': ['G4', 'B4', 'D5', 'F5', 'A5'],
    'G11': ['G4', 'B4', 'D5', 'F5', 'A5', 'C6'],
    'G13': ['G4', 'B4', 'D5', 'F5', 'A5', 'C6', 'E6'],
    'Gm9': ['G4', 'Bb4', 'D5', 'F5', 'A5'],
    'Gmaj9': ['G4', 'B4', 'D5', 'F#5', 'A5'],
    'G7-b9': ['G4', 'B4', 'D5', 'F5', 'G#5'],
    'G7-#9': ['G4', 'B4', 'D5', 'F5', 'Bb5'],
    'Gno3': ['G4', 'D5'],
    'Gno5': ['G4', 'B4'],
    'Gmaj7-no5': ['G4', 'B4', 'F#5'],

    // G# chords
    'G#': ['G#4', 'C5', 'Eb5'],
    'G#m': ['G#4', 'B4', 'Eb5'],
    'G#7': ['G#4', 'C5', 'Eb5', 'F#5'],
    'G#maj7': ['G#4', 'C5', 'Eb5', 'G5'],
    'G#m7': ['G#4', 'B4', 'Eb5', 'F#5'],
    'G#dim': ['G#4', 'B4', 'D5'],
    'G#aug': ['G#4', 'C5', 'E5'],
    'G#sus4': ['G#4', 'C#5', 'Eb5'],
    'G#add9': ['G#4', 'C5', 'Eb5', 'Bb5'],
    'G#9': ['G#4', 'C5', 'Eb5', 'F#5', 'Bb5'],
    'G#11': ['G#4', 'C5', 'Eb5', 'F#5', 'Bb5', 'C#6'],
    'G#13': ['G#4', 'C5', 'Eb5', 'F#5', 'Bb5', 'C#6', 'F6'],
    'G#m9': ['G#4', 'B4', 'Eb5', 'F#5', 'Bb5'],
    'G#maj9': ['G#4', 'C5', 'Eb5', 'G5', 'Bb5'],
    'G#7-b9': ['G#4', 'C5', 'Eb5', 'F#5', 'A5'],
    'G#7-#9': ['G#4', 'C5', 'Eb5', 'F#5', 'B5'],
    'G#no3': ['G#4', 'Eb5'],
    'G#no5': ['G#4', 'C5'],
    'G#maj7-no5': ['G#4', 'C5', 'G5'],

    // A chords
    'A': ['A4', 'C#5', 'E5'],
    'Am': ['A4', 'C5', 'E5'],
    'A7': ['A4', 'C#5', 'E5', 'G5'],
    'Amaj7': ['A4', 'C#5', 'E5', 'G#5'],
    'Am7': ['A4', 'C5', 'E5', 'G5'],
    'Adim': ['A4', 'C5', 'Eb5'],
    'Aaug': ['A4', 'C#5', 'F5'],
    'Asus4': ['A4', 'D5', 'E5'],
    'Aadd9': ['A4', 'C#5', 'E5', 'B5'],
    'A9': ['A4', 'C#5', 'E5', 'G5', 'B5'],
    'A11': ['A4', 'C#5', 'E5', 'G5', 'B5', 'D6'],
    'A13': ['A4', 'C#5', 'E5', 'G5', 'B5', 'D6', 'F#6'],
    'Am9': ['A4', 'C5', 'E5', 'G5', 'B5'],
    'Amaj9': ['A4', 'C#5', 'E5', 'G#5', 'B5'],
    'A7-b9': ['A4', 'C#5', 'E5', 'G5', 'Bb5'],
    'A7-#9': ['A4', 'C#5', 'E5', 'G5', 'C6'],
    'Ano3': ['A4', 'E5'],
    'Ano5': ['A4', 'C#5'],
    'Amaj7-no5': ['A4', 'C#5', 'G#5'],

    // Bb chords
    'Bb': ['Bb4', 'D5', 'F5'],
    'Bbm': ['Bb4', 'C#5', 'F5'],
    'Bb7': ['Bb4', 'D5', 'F5', 'G#5'],
    'Bbmaj7': ['Bb4', 'D5', 'F5', 'A5'],
    'Bbm7': ['Bb4', 'C#5', 'F5', 'G#5'],
    'Bbdim': ['Bb4', 'C#5', 'E5'],
    'Bbaug': ['Bb4', 'D5', 'F#5'],
    'Bbsus4': ['Bb4', 'Eb5', 'F5'],
    'Bbadd9': ['Bb4', 'D5', 'F5', 'C6'],
    'Bb9': ['Bb4', 'D5', 'F5', 'G#5', 'C6'],
    'Bb11': ['Bb4', 'D5', 'F5', 'G#5', 'C6', 'Eb6'],
    'Bb13': ['Bb4', 'D5', 'F5', 'G#5', 'C6', 'Eb6', 'G6'],
    'Bbm9': ['Bb4', 'C#5', 'F5', 'G#5', 'C6'],
    'Bbmaj9': ['Bb4', 'D5', 'F5', 'A5', 'C6'],
    'Bb7-b9': ['Bb4', 'D5', 'F5', 'G#5', 'B5'],
    'Bb7-#9': ['Bb4', 'D5', 'F5', 'G#5', 'C#6'],
    'Bbno3': ['Bb4', 'F5'],
    'Bbno5': ['Bb4', 'D5'],
    'Bbmaj7-no5': ['Bb4', 'D5', 'A5'],

    // B chords
    'B': ['B4', 'Eb5', 'F#5'],
    'Bm': ['B4', 'D5', 'F#5'],
    'B7': ['B4', 'Eb5', 'F#5', 'A5'],
    'Bmaj7': ['B4', 'Eb5', 'F#5', 'Bb5'],
    'Bm7': ['B4', 'D5', 'F#5', 'A5'],
    'Bdim': ['B4', 'D5', 'F5'],
    'Baug': ['B4', 'Eb5', 'G5'],
    'Bsus4': ['B4', 'E5', 'F#5'],
    'Badd9': ['B4', 'Eb5', 'F#5', 'C#6'],
    'B9': ['B4', 'Eb5', 'F#5', 'A5', 'C#6'],
    'B11': ['B4', 'Eb5', 'F#5', 'A5', 'C#6', 'E6'],
    'B13': ['B4', 'Eb5', 'F#5', 'A5', 'C#6', 'E6', 'G#6'],
    'Bm9': ['B4', 'D5', 'F#5', 'A5', 'C#6'],
    'Bmaj9': ['B4', 'Eb5', 'F#5', 'Bb5', 'C#6'],
    'B7-b9': ['B4', 'Eb5', 'F#5', 'A5', 'C6'],
    'B7-#9': ['B4', 'Eb5', 'F#5', 'A5', 'D6'],
    'Bno3': ['B4', 'F#5'],
    'Bno5': ['B4', 'Eb5'],
    'Bmaj7-no5': ['B4', 'Eb5', 'Bb5']
};

// ========================================
// Lexer
// ========================================

class UzumeLexer {
    constructor() {
        this.tokens = [];
        this.current = 0;
    }

    tokenize(source) {
        this.tokens = [];
        this.current = 0;

        const patterns = [
            // Comments - Match '//' followed by any characters until the end of the line.
            // Newlines are handled by the WHITESPACE pattern. This replaces the old regex.
            { type: 'COMMENT', regex: /\/\/.*/g },
            // N_NOTE (must come first)
            { type: 'N_NOTE', regex: /n[A-G][#b]?[0-9]/g },
            // Keywords
            { type: 'SET', regex: /set(?![a-zA-Z0-9_])/g },
            { type: 'MEASURE', regex: /measure(?![a-zA-Z0-9_])/g },
            { type: 'CHORD', regex: /chord(?![a-zA-Z0-9_])/g },
            { type: 'CODE', regex: /code(?![a-zA-Z0-9_])/g },
            { type: 'TUPLET', regex: /tuplet(?![a-zA-Z0-9_])/g },
            { type: 'TRACK', regex: /track(?![a-zA-Z0-9_])/g },
            { type: 'LOOP', regex: /loop(?![a-zA-Z0-9_])/g },
            { type: 'READ', regex: /read(?![a-zA-Z0-9_])/g },
            { type: 'ADD', regex: /add(?![a-zA-Z0-9_])/g },
            { type: 'IN', regex: /in(?![a-zA-Z0-9_])/g },
            // Articulations
            { type: 'ARTICULATION', regex: /(stc|leg|acc|ten)(?![a-zA-Z0-9_])/g },
            // Dynamics
            { type: 'DYNAMIC', regex: /(pp|p|mp|mf|f|ff)(?![a-zA-Z0-9_])/g },
            // Dynamic modifiers
            { type: 'DOT_CRE', regex: /\.cre(?![a-zA-Z0-9_])/g },
            { type: 'DOT_DEC', regex: /\.dec(?![a-zA-Z0-9_])/g },
            { type: 'DOT_COVER', regex: /\.cover(?![a-zA-Z0-9_])/g },
            { type: 'DOT_ARPEGGIO', regex: /\.arpeggio(?![a-zA-Z0-9_])/g },
            // Fractions must come before individual numbers and slash
            { type: 'FRACTION', regex: /\d+\/\d+/g },
            // Numbers (must come after FRACTION)
            { type: 'NUMBER', regex: /\d+(?:\.\d+)?/g },
            // Notes (must come before CHORD_NAME)
            { type: 'NOTE', regex: /[A-G][#b]?[0-9]/g },
            // Rest
            { type: 'REST', regex: /R(?![a-zA-Z0-9_])/g },
            // Scale degree
            { type: 'SCALE_DEGREE', regex: /[0-9]+_[0-9]+/g },
            // Chord names (must come after NOTE)
            { type: 'CHORD_NAME', regex: /[A-G][#b]?[a-zA-Z0-9\-#]*/g },
            // Identifiers (must come last)
            { type: 'IDENTIFIER', regex: /(?!n[A-G][#b]?[0-9])[a-zA-Z_][a-zA-Z0-9_]*/g },
            // Operators
            { type: 'ASSIGN', regex: /=/g },
            { type: 'AMPERSAND', regex: /&/g },
            { type: 'CARET', regex: /\^/g },
            { type: 'MINUS', regex: /-/g },
            { type: 'SLASH', regex: /\//g },
            // Punctuation
            { type: 'SEMICOLON', regex: /;/g },
            { type: 'COMMA', regex: /,/g },
            { type: 'LPAR', regex: /\(/g },
            { type: 'RPAR', regex: /\)/g },
            { type: 'LBRACE', regex: /\{/g },
            { type: 'RBRACE', regex: /\}/g },
            { type: 'LSQB', regex: /\[/g },
            { type: 'RSQB', regex: /\]/g },
            // Whitespace (ignored)
            { type: 'WHITESPACE', regex: /\s+/g }
        ];

        let position = 0;

        while (position < source.length) {
            let matched = false;
            const remaining = source.slice(position);

            for (const pattern of patterns) {
                const regex = new RegExp('^' + pattern.regex.source);
                const match = regex.exec(remaining);

                if (match) {
                    if (pattern.type !== 'WHITESPACE' && pattern.type !== 'COMMENT') {
                        this.tokens.push({
                            type: pattern.type,
                            value: match[0],
                            position: position
                        });
                        // Debug logging can be enabled for development
                        if (['FRACTION', 'NUMBER', 'SLASH', 'IDENTIFIER', 'SET', 'BEAT'].includes(pattern.type)) {
                            // console.log(`Tokenized '${match[0]}' as ${pattern.type} at position ${position}`);
                        }
                    }
                    position += match[0].length;
                    matched = true;
                    break;
                }
            }

            if (!matched) {
                throw new Error(`Unexpected character at position ${position}: ${source[position]}`);
            }
        }

        return this.tokens;
    }

    peek() {
        return this.current < this.tokens.length ? this.tokens[this.current] : null;
    }

    consume(expectedType = null) {
        const token = this.tokens[this.current++];
        if (expectedType && token && token.type !== expectedType) {
            throw new Error(`Expected ${expectedType}, got ${token.type}`);
        }
        return token;
    }

    match(...types) {
        const token = this.peek();
        return token && types.includes(token.type);
    }
}

// ========================================
// Parser
// ========================================

class UzumeParser {
    constructor() {
        this.lexer = new UzumeLexer();
    }

    parse(source) {
        this.tokens = this.lexer.tokenize(source);
        this.lexer.current = 0;

        const statements = [];
        while (this.lexer.peek()) {
            statements.push(this.parseStatement());
        }

        return new Program(statements);
    }

    parseStatement() {
        const token = this.lexer.peek();
        if (!token) return null;

        // console.log(`Parsing statement, current token: ${token.type} = '${token.value}'`);

        switch (token.type) {
            case 'SET':
                return this.parseSetStatement();
            case 'TRACK':
                return this.parseTrackDefinition();
            case 'LOOP':
                return this.parseLoopStatement();
            case 'READ':
                return this.parseReadStatement();
            case 'ADD':
                return this.parseAddStatement();
            case 'IDENTIFIER':
                return this.parseMeasureDefinition();
            default:
                // Show more context for debugging
                const nextTokens = [];
                for (let i = 0; i < 5 && (this.lexer.current + i) < this.lexer.tokens.length; i++) {
                    const t = this.lexer.tokens[this.lexer.current + i];
                    nextTokens.push(`${t.type}='${t.value}'`);
                }
                throw new Error(`Unexpected token: ${token.type} = '${token.value}'. Next tokens: [${nextTokens.join(', ')}]`);
        }
    }

    parseSetStatement() {
        this.lexer.consume('SET');
        const setting = this.lexer.consume('IDENTIFIER').value;
        // console.log(`Parsing set statement: ${setting}`);
        this.lexer.consume('LPAR');

        let value;
        const currentToken = this.lexer.peek();
        // console.log(`Current token after LPAR: ${currentToken?.type} = '${currentToken?.value}'`);

        if (this.lexer.match('FRACTION')) {
            // Handle fraction like 4/4
            const fractionStr = this.lexer.consume('FRACTION').value;
            // console.log(`Found fraction: ${fractionStr}`);
            const parts = fractionStr.split('/');
            value = [parseInt(parts[0]), parseInt(parts[1])];
        } else if (this.lexer.match('NUMBER')) {
            value = parseFloat(this.lexer.consume('NUMBER').value);
            // console.log(`Found number: ${value}`);
            if (this.lexer.match('SLASH')) {
                // console.log('Found SLASH after number');
                this.lexer.consume('SLASH');
                const denominator = parseFloat(this.lexer.consume('NUMBER').value);
                // console.log(`Denominator: ${denominator}`);
                value = [value, denominator]; // fraction like 4 / 4 (with spaces)
            }
        } else if (this.lexer.match('IDENTIFIER')) {
            value = this.lexer.consume('IDENTIFIER').value;
            // console.log(`Found identifier: ${value}`);
            if (this.lexer.match('COMMA')) {
                this.lexer.consume('COMMA');
                const secondValue = this.lexer.match('IDENTIFIER') ?
                    this.lexer.consume('IDENTIFIER').value :
                    this.lexer.consume('NUMBER').value;
                value = [value, secondValue];
            }
        } else {
            const nextTokens = [];
            for (let i = 0; i < 3 && (this.lexer.current + i) < this.lexer.tokens.length; i++) {
                const t = this.lexer.tokens[this.lexer.current + i];
                nextTokens.push(`${t.type}='${t.value}'`);
            }
            throw new Error(`Expected FRACTION, NUMBER, or IDENTIFIER in set statement, found: [${nextTokens.join(', ')}]`);
        }

        // console.log(`Parsed value:`, value);
        this.lexer.consume('RPAR');
        this.lexer.consume('SEMICOLON');

        return new SetStatement(setting, value);
    }

    parseTrackDefinition() {
        this.lexer.consume('TRACK');
        const name = this.lexer.consume('IDENTIFIER').value;
        this.lexer.consume('LBRACE');

        const settings = {};
        const statements = [];

        while (!this.lexer.match('RBRACE')) {
            if (this.lexer.match('SET')) {
                const stmt = this.parseSetStatement();
                settings[stmt.setting] = stmt.value;
            } else {
                statements.push(this.parseStatement());
            }
        }

        this.lexer.consume('RBRACE');
        return new TrackDefinition(name, settings, statements);
    }

    parseMeasureDefinition() {
        const name = this.lexer.consume('IDENTIFIER').value;
        this.lexer.consume('ASSIGN');
        this.lexer.consume('MEASURE');

        let dynamic = null;
        if (this.lexer.match('DOT_CRE', 'DOT_DEC', 'DOT_COVER', 'DOT_ARPEGGIO')) {
            dynamic = this.lexer.consume().value;
        }

        this.lexer.consume('LSQB');
        const notes = this.parseNoteList();
        this.lexer.consume('RSQB');
        this.lexer.consume('SEMICOLON');

        return new MeasureDefinition(name, notes, dynamic);
    }

    parseNoteList() {
        const notes = [];

        while (!this.lexer.match('RSQB')) {
            notes.push(this.parseNoteExpression());
            if (this.lexer.match('COMMA')) {
                this.lexer.consume('COMMA');
            }
        }

        return notes;
    }

    parseNoteExpression() {
        if (this.lexer.match('ARTICULATION')) {
            const articulation = this.lexer.consume('ARTICULATION').value;
            const note = this.parseNoteExpression();
            if (note instanceof Note) {
                note.articulation = articulation;
            }
            return note;
        }

        if (this.lexer.match('N_NOTE')) {
            return this.parseNote();
        }

        if (this.lexer.match('REST')) {
            return this.parseRest();
        }

        if (this.lexer.match('LSQB')) {
            return this.parseChord();
        }

        if (this.lexer.match('IDENTIFIER')) {
            return new MeasureReference(this.lexer.consume('IDENTIFIER').value);
        }

        throw new Error(`Unexpected token in note expression: ${this.lexer.peek()?.type}`);
    }

    parseNote() {
        const noteToken = this.lexer.consume('N_NOTE').value;
        const pitch = noteToken.slice(1); // Remove 'n' prefix

        this.lexer.consume('MINUS');
        const duration = parseFloat(this.lexer.consume('NUMBER').value);

        let dynamic = null;
        if (this.lexer.match('CARET')) {
            this.lexer.consume('CARET');
            dynamic = this.lexer.consume('DYNAMIC').value;
        }

        return new Note(pitch, duration, null, dynamic);
    }

    parseRest() {
        this.lexer.consume('REST');
        this.lexer.consume('MINUS');
        const duration = parseFloat(this.lexer.consume('NUMBER').value);
        return new Rest(duration);
    }

    parseChord() {
        this.lexer.consume('LSQB');

        if (this.lexer.match('CODE')) {
            const codeChord = this.parseCodeChord();
            this.lexer.consume('RSQB');
            return codeChord;
        }

        const notes = this.parseNoteList();
        this.lexer.consume('RSQB');
        return new Chord(notes);
    }

    parseCodeChord() {
        this.lexer.consume('CODE');
        this.lexer.consume('LPAR');

        // Accept either CHORD_NAME or simple chord names that might be tokenized as NOTE/IDENTIFIER
        let chordName;
        if (this.lexer.match('CHORD_NAME')) {
            chordName = this.lexer.consume('CHORD_NAME').value;
        } else if (this.lexer.match('IDENTIFIER')) {
            chordName = this.lexer.consume('IDENTIFIER').value;
        } else {
            // Fallback: try to construct chord name from available tokens
            const token = this.lexer.peek();
            chordName = token ? token.value : 'C';
            this.lexer.consume();
        }

        this.lexer.consume('RPAR');

        let duration = 1.0;
        if (this.lexer.match('MINUS')) {
            this.lexer.consume('MINUS');
            duration = parseFloat(this.lexer.consume('NUMBER').value);
        }

        return new CodeChord(chordName, duration);
    }

    parseLoopStatement() {
        this.lexer.consume('LOOP');
        const count = parseInt(this.lexer.consume('NUMBER').value);
        this.lexer.consume('LBRACE');

        const body = [];
        while (!this.lexer.match('RBRACE')) {
            body.push(this.parseStatement());
        }

        this.lexer.consume('RBRACE');
        return new LoopStatement(count, body);
    }

    parseReadStatement() {
        this.lexer.consume('READ');
        this.lexer.consume('LPAR');

        const measureNames = [];
        measureNames.push(this.lexer.consume('IDENTIFIER').value);

        while (this.lexer.match('AMPERSAND')) {
            this.lexer.consume('AMPERSAND');
            measureNames.push(this.lexer.consume('IDENTIFIER').value);
        }

        this.lexer.consume('RPAR');
        this.lexer.consume('SEMICOLON');

        return new ReadStatement(measureNames);
    }

    parseAddStatement() {
        this.lexer.consume('ADD');
        const articulation = this.lexer.consume('ARTICULATION').value;
        this.lexer.consume('LPAR');
        const target = this.lexer.consume('IDENTIFIER').value;

        let index = null;
        if (this.lexer.match('LSQB')) {
            this.lexer.consume('LSQB');
            index = parseInt(this.lexer.consume('NUMBER').value);
            this.lexer.consume('RSQB');
        }

        this.lexer.consume('RPAR');
        this.lexer.consume('SEMICOLON');

        return { articulation, target, index };
    }
}

// ========================================
// Audio Engine
// ========================================

class UzumeAudioEngine {
    constructor() {
        this.audioContext = null;
        this.sampleRate = 44100;
        this.masterGain = null;
        this.masterVolume = 0.5; // Default 50%
        this.activeSources = []; // 再生中のオーディオソースを管理
        this.initAudio();
    }

    async initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Create master gain node for volume control
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.setMasterVolume(this.masterVolume);
        } catch (e) {
            console.error('Web Audio API not supported:', e);
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume)); // Clamp between 0 and 1
        if (this.masterGain) {
            // Use exponential scaling for more natural volume perception
            const gainValue = this.masterVolume * this.masterVolume;
            this.masterGain.gain.setValueAtTime(gainValue, this.audioContext.currentTime);
        }
    }

    noteToFrequency(note) {
        const noteMap = {
            'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
            'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
            'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11
        };

        const match = note.match(/([A-G][#b]?)([0-9])/);
        if (!match) return 440; // Default A4

        const noteName = match[1];
        const octave = parseInt(match[2]);

        const semitone = noteMap[noteName];
        const midi = (octave + 1) * 12 + semitone;

        return 440 * Math.pow(2, (midi - 69) / 12);
    }

    /**
     * @param {number} frequency - The frequency of the note in Hz.
     * @param {number} durationInSeconds - The duration of the note in seconds.
     * @param {string} waveType - The type of waveform (e.g., 'sine', 'square').
     * @param {number} volume - The volume of the note (0 to 1).
     * @returns {Float32Array} The generated audio buffer.
     */
    generateWaveform(frequency, durationInSeconds, waveType = 'sine', volume = 0.5) {
        // durationInSeconds を使用してサンプル数を計算
        const samples = Math.floor(durationInSeconds * this.sampleRate);
        const buffer = new Float32Array(samples);

        for (let i = 0; i < samples; i++) {
            const t = i / this.sampleRate;
            let sample = 0;

            switch (waveType) {
                case 'sine':
                    sample = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    sample = Math.sign(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'triangle':
                    sample = (2 / Math.PI) * Math.asin(Math.sin(2 * Math.PI * frequency * t));
                    break;
                case 'sawtooth':
                    sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                    break;
                case 'pulse':
                    sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'bit8':
                case 'chiptune':
                    sample = Math.round(Math.sin(2 * Math.PI * frequency * t) * 15) / 15;
                    break;
                default:
                    sample = Math.sin(2 * Math.PI * frequency * t);
            }

            buffer[i] = sample * volume * this.applyEnvelope(i, samples);
        }

        return buffer;
    }

    applyEnvelope(sample, totalSamples) {
        const attack = Math.min(totalSamples * 0.1, 1000);
        const release = Math.min(totalSamples * 0.3, 3000);

        if (sample < attack) {
            return sample / attack;
        } else if (sample > totalSamples - release) {
            return (totalSamples - sample) / release;
        }
        return 1;
    }

    async playBuffer(buffer) {
        if (!this.audioContext) {
            await this.initAudio();
        }

        // Resume audio context if suspended (required by some browsers)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        const audioBuffer = this.audioContext.createBuffer(1, buffer.length, this.sampleRate);
        audioBuffer.copyToChannel(buffer, 0);

        const source = this.audioContext.createBufferSource();
        source.buffer = audioBuffer;

        // Connect to master gain instead of directly to destination
        source.connect(this.masterGain);

        // Track active source for stopping
        this.activeSources.push(source);
        source.onended = () => {
            const index = this.activeSources.indexOf(source);
            if (index > -1) {
                this.activeSources.splice(index, 1);
            }
        };

        source.start();

        return new Promise(resolve => {
            const originalOnended = source.onended;
            source.onended = () => {
                if (originalOnended) originalOnended();
                resolve();
            };
        });
    }

    stopAllSources() {
        // Stop all active audio sources
        this.activeSources.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Source might already be stopped
            }
        });
        this.activeSources = []; // Clear the array after stopping
    }
}

// ========================================
// Compiler
// ========================================

class UzumeCompiler {
    constructor() {
        this.settings = {
            tempo: 120,
            beat: [4, 4],
            volume: 80,
            wave: 'sine'
        };
        this.measures = new Map();
        this.measureSettings = new Map();
        this.tracks = new Map();
        this.audioEngine = new UzumeAudioEngine();
    }

    async compile(source) {
        const parser = new UzumeParser();
        const ast = parser.parse(source);

        // Check if this is a multitrack composition
        const hasTrackcs = ast.statements.some(stmt => stmt instanceof TrackDefinition);

        if (hasTrackcs) {
            return await this.compileMultitrack(ast);
        } else {
            return await this.compileSingleTrack(ast);
        }
    }

    async compileSingleTrack(ast) {
        // First pass: collect settings and definitions
        for (const stmt of ast.statements) {
            if (stmt instanceof SetStatement) {
                this.settings[stmt.setting] = stmt.value;
            } else if (stmt instanceof MeasureDefinition) {
                this.measures.set(stmt.name, stmt.notes);
                this.measureSettings.set(stmt.name, {
                    ...this.settings,
                    dynamic: stmt.dynamic
                });
            }
        }

        // Second pass: generate audio
        const audioBuffers = [];
        for (const stmt of ast.statements) {
            if (stmt instanceof ReadStatement) {
                const buffer = await this.renderMeasures(stmt.measureNames);
                audioBuffers.push(buffer);
            } else if (stmt instanceof LoopStatement) {
                for (let i = 0; i < stmt.count; i++) {
                    for (const bodyStmt of stmt.body) {
                        if (bodyStmt instanceof ReadStatement) {
                            const buffer = await this.renderMeasures(bodyStmt.measureNames);
                            audioBuffers.push(buffer);
                        }
                    }
                }
            }
        }

        return this.combineBuffers(audioBuffers);
    }

    async compileMultitrack(ast) {
        const tracks = {};

        // Process each track
        for (const stmt of ast.statements) {
            if (stmt instanceof SetStatement) {
                this.settings[stmt.setting] = stmt.value;
            } else if (stmt instanceof TrackDefinition) {
                const trackCompiler = new UzumeCompiler();
                trackCompiler.settings = { ...this.settings, ...stmt.settings };

                const trackProgram = new Program(stmt.statements);
                const trackBuffer = await trackCompiler.compileSingleTrack(trackProgram);
                tracks[stmt.name] = trackBuffer;
            }
        }

        return tracks;
    }

    async renderMeasures(measureNames) {
        if (measureNames.length === 1) {
            return await this.renderSingleMeasure(measureNames[0]);
        } else {
            // Concurrent playback
            const buffers = await Promise.all(
                measureNames.map(name => this.renderSingleMeasure(name))
            );
            return this.mixBuffers(buffers);
        }
    }

    async renderSingleMeasure(measureName) {
        if (!this.measures.has(measureName)) {
            console.warn(`Measure ${measureName} not found`);
            return new Float32Array(0);
        }

        const notes = this.measures.get(measureName);
        const settings = this.measureSettings.get(measureName) || this.settings;

        const buffers = [];
        for (const note of notes) {
            if (note instanceof Note) {
                buffers.push(await this.renderNote(note, settings));
            } else if (note instanceof Rest) {
                buffers.push(await this.renderRest(note, settings));
            } else if (note instanceof CodeChord) {
                buffers.push(await this.renderCodeChord(note, settings));
            } else if (note instanceof Chord) {
                buffers.push(await this.renderChord(note, settings));
            } else if (note instanceof MeasureReference) {
                buffers.push(await this.renderSingleMeasure(note.measureName));
            }
        }

        return this.combineBuffers(buffers);
    }

    async renderNote(note, settings) {
        const frequency = this.audioEngine.noteToFrequency(note.pitch);
        const volume = (settings.volume || 80) / 127;

        // **FIX**: Calculate duration in seconds based on tempo
        const tempo = settings.tempo || 120;
        const beatDuration = 60 / tempo; // Duration of one beat (quarter note) in seconds
        const durationInSeconds = note.duration * beatDuration;

        return this.audioEngine.generateWaveform(
            frequency,
            durationInSeconds, // Pass duration in seconds
            settings.wave || 'sine',
            volume
        );
    }

    async renderRest(rest, settings) {
        // **FIX**: Calculate rest duration in seconds based on tempo
        const tempo = settings.tempo || 120;
        const beatDuration = 60 / tempo;
        const durationInSeconds = rest.duration * beatDuration;
        const samples = Math.floor(durationInSeconds * this.audioEngine.sampleRate);
        return new Float32Array(samples);
    }

    async renderCodeChord(codeChord, settings) {
        const chordNotes = CHORD_DEFINITIONS[codeChord.chordName];
        if (!chordNotes) {
            console.warn(`Chord ${codeChord.chordName} not found`);
            return new Float32Array(0);
        }

        const noteObjects = chordNotes.map(pitch =>
            new Note(pitch, codeChord.duration)
        );

        const chord = new Chord(noteObjects);
        return await this.renderChord(chord, settings);
    }

    async renderChord(chord, settings) {
        const buffers = await Promise.all(
            chord.notes.map(note => this.renderNote(note, settings))
        );
        return this.mixBuffers(buffers);
    }

    combineBuffers(buffers) {
        if (buffers.length === 0) return new Float32Array(0);

        const totalLength = buffers.reduce((sum, buffer) => sum + buffer.length, 0);
        const result = new Float32Array(totalLength);

        let offset = 0;
        for (const buffer of buffers) {
            result.set(buffer, offset);
            offset += buffer.length;
        }

        return result;
    }

    mixBuffers(buffers) {
        if (buffers.length === 0) return new Float32Array(0);

        const maxLength = Math.max(...buffers.map(b => b.length));
        const result = new Float32Array(maxLength);

        for (const buffer of buffers) {
            for (let i = 0; i < buffer.length; i++) {
                result[i] += buffer[i] / buffers.length; // Average to prevent clipping
            }
        }

        return result;
    }

    async play(audioData) {
        // 再生前に現在の再生を停止する
        this.stop();

        if (typeof audioData === 'object' && !(audioData instanceof Float32Array)) {
            // Multitrack - play all tracks simultaneously
            const promises = Object.values(audioData).map(buffer =>
                this.audioEngine.playBuffer(buffer)
            );
            await Promise.all(promises);
        } else {
            // Single track
            await this.audioEngine.playBuffer(audioData);
        }
    }

    stop() {
        this.audioEngine.stopAllSources();
    }
}

// ========================================
// Browser Integration
// ========================================

if (typeof window !== 'undefined') {
    window.UzumeCompiler = UzumeCompiler;
    window.UzumeParser = UzumeParser;
    window.UzumeAudioEngine = UzumeAudioEngine;
}

// Node.js export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        UzumeCompiler,
        UzumeParser,
        UzumeAudioEngine
    };
}
