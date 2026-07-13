// Title: Lines of Time
// Author: RandyDan
// Video: https://www.youtube.com/watch?v=8H98gtZSEVA
// Source: https://sudokupad.app/60j7k2y8yv

// X-Sudoku: digits cannot repeat along either main diagonal.
const diagonals = [
  new Diagonal(1),
  new Diagonal(-1),
];

// Dutch Whispers (orange): adjacent digits differ by at least 4. Drawn as two
// line entries that both touch the shared cells R3C3 and R5C5 (an hourglass
// shape); each is encoded as its own line since only consecutive-pair
// adjacency matters for Whisper.
const dutchWhisperLines = [
  ['R3C3', 'R4C4', 'R5C5', 'R6C4', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C6', 'R5C5'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C6', 'R5C5'],
];

// German Whispers (green): adjacent digits differ by at least 5.
const germanWhisperLines = [
  ['R2C1', 'R1C2', 'R1C3', 'R2C3'],
];

// Renban Lines (purple): a non-repeating set of consecutive digits, any order.
const renbanLines = [
  ['R8C1', 'R9C2', 'R9C3', 'R8C3'],
];

// Parity Lines (red): adjacent digits alternate odd/even.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLines = [
  ['R2C7', 'R1C7', 'R1C8', 'R2C9'],
];

// Entropic Lines (peach): every run of 3 adjacent digits has one low (1-3),
// one medium (4-6), one high (7-9).
const entropicLines = [
  ['R8C7', 'R9C7', 'R9C8', 'R8C9'],
];

// Kropki dots (not all possible dots are given, so no global negative
// implication). White: consecutive. Black: one double the other.
const whiteDots = [
  ['R3C2', 'R4C2'],
];
const blackDots = [
  ['R6C2', 'R7C2'],
  ['R3C9', 'R4C9'],
];

return [
  new Shape('9x9'),

  ...diagonals,

  ...dutchWhisperLines.map(cells => new Whisper(4, ...cells)),
  ...germanWhisperLines.map(cells => new Whisper(5, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...parityLines.map(cells => new Pair(parityKey, 'Parity', ...cells)),
  ...entropicLines.map(cells => new Entropic(...cells)),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
