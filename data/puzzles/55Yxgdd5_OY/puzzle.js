// Title: What's the Sequency, Kenneth? (Colorblind-friendly version)
// Author: WEBthe3rd
// Video: https://www.youtube.com/watch?v=55Yxgdd5_OY
// Source: https://sudokupad.app/7fvnto2d90

// Normal sudoku rules apply; standard 3x3 boxes (default Shape regions).
// Dynamic fog is solving UI only and has no effect on the finished grid, so
// it is not encoded.

// Sequence lines (S): consecutive cells share one constant, but otherwise
// unconstrained, difference (may be zero or negative). There is no native
// class for "arithmetic run with a self-determined common difference", so
// this is a scanning NFA: the first cell just records a value, the second
// cell fixes the difference from the first pair, and every later cell must
// continue that exact difference. All three drawn sequence lines share the
// same rule and are scanned as separate segments of one NFA.
const sequenceSpec = NFA.encodeSpec({
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (value === SEGMENT_BREAK) return { prev: null, diff: null };
    if (prev === null) return { prev: value, diff: null };
    if (diff === null) return { prev: value, diff: value - prev };
    if (value - prev !== diff) return undefined;
    return { prev: value, diff };
  },
  accept: () => true,
}, 9, { multiSegment: true });

const sequenceLines = new NFA(
  sequenceSpec, 'Sequence',
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
);

// Palindromes (P).
const palindromes = [
  new Palindrome('R6C9', 'R7C8', 'R8C7'),
  new Palindrome('R4C1', 'R3C2', 'R2C3'),
];

// German whispers: each green square marks one isolated edge (not a
// connected line), so each is its own two-cell Whisper(5, ...).
const germanWhisperEdges = [
  ['R1C5', 'R2C5'],
  ['R1C7', 'R2C7'],
  ['R8C3', 'R9C3'],
  ['R8C5', 'R9C5'],
];
const germanWhispers = germanWhisperEdges.map(cells => new Whisper(5, ...cells));

// Parity: each red diamond marks one isolated edge whose two digits must
// differ in parity (even/odd).
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityEdges = [
  ['R8C1', 'R9C1'], ['R7C2', 'R8C2'], ['R7C4', 'R8C4'], ['R7C6', 'R8C6'],
  ['R8C7', 'R9C7'], ['R8C7', 'R8C8'], ['R8C8', 'R8C9'], ['R7C8', 'R8C8'],
  ['R7C9', 'R8C9'],
  ['R2C1', 'R3C1'], ['R2C1', 'R2C2'], ['R2C2', 'R3C2'], ['R2C2', 'R2C3'],
  ['R1C3', 'R2C3'], ['R2C4', 'R3C4'], ['R2C6', 'R3C6'], ['R2C8', 'R3C8'],
  ['R1C9', 'R2C9'],
];
const parityPairs = parityEdges.map(cells => new Pair(parityKey, 'Parity', ...cells));

// Kropki white dots (consecutive digits); not all dots are given, so no
// global negative constraint applies to non-dotted edges.
const kropkiDots = [
  new WhiteDot('R6C7', 'R7C7'),
  new WhiteDot('R3C3', 'R4C3'),
];

// 3-modular line (3M): every run of three consecutive cells contains one
// digit each from {1,4,7}, {2,5,8}, {3,6,9} -- exactly Modular(3, ...).
const modularLine = new Modular(3, 'R4C1', 'R4C2', 'R4C3', 'R4C4');

// Region sum line (RS): equal sum per box segment.
const regionSumLine = new RegionSumLine('R6C6', 'R6C7', 'R6C8', 'R6C9');

return [
  new Shape('9x9'),
  sequenceLines,
  ...palindromes,
  ...germanWhispers,
  ...parityPairs,
  ...kropkiDots,
  modularLine,
  regionSumLine,
];
