// Title: Augen auf beim Rat(t)enkauf!
// Author: olima
// Video: https://www.youtube.com/watch?v=xJ-8Cc0kckQ
// Source: https://sudokupad.app/jfpmjqq6pw

// Normal sudoku rules apply (rows, columns, 3x3 boxes -- drawn regions match
// the default boxes).
// Dutch whisper (orange line): adjacent digits differ by >= 4.
// German whisper (green line): adjacent digits differ by >= 5.
// Renban (purple lines): each line holds a set of distinct, consecutive
// digits in any order.
// Thermometer (grey line, bulb marked by the filled circle underlay at
// R5C2): digits increase away from the bulb. Three separate grey strokes
// were drawn from that one shared bulb cell, so each arm is its own Thermo
// starting at R5C2.
// Parity line (red line): adjacent digits on the line differ in parity (one
// odd, one even). Two strokes share cell R7C2; both get the same pairwise
// relation.
// Kropki pairs: white dot = adjacent digits consecutive, black dot =
// adjacent digits in a 1:2 ratio. Not all dots are shown, so a missing dot
// carries no information -- no negative constraint is added.

const dutchWhisper = new Whisper(
  4, 'R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3');
const germanWhisper = new Whisper(5, 'R4C1', 'R3C1', 'R2C2', 'R3C3', 'R4C3');

const renbans = [
  new Renban('R5C1', 'R4C1', 'R3C2', 'R4C3', 'R4C2', 'R5C3'),
  new Renban('R9C8', 'R9C7', 'R8C7', 'R8C6', 'R9C5', 'R9C6'),
];

const thermos = [
  new Thermo('R5C2', 'R5C3'),
  new Thermo('R5C2', 'R5C1'),
  new Thermo('R5C2', 'R6C2', 'R7C2'),
];

// Custom pairwise relation: adjacent cells on the line must have opposite
// parity.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLines = [
  new Pair(parityKey, 'Parity', 'R6C1', 'R7C2', 'R8C2'),
  new Pair(parityKey, 'Parity', 'R7C2', 'R6C3'),
];

// White dots (Kropki consecutive), one per drawn edge mark.
const whiteDots = [
  ['R1C7', 'R2C7'],
  ['R2C7', 'R3C7'],
  ['R3C7', 'R3C8'],
  ['R3C8', 'R3C9'],
  ['R5C7', 'R5C8'],
  ['R8C6', 'R9C6'],
].map(cells => new WhiteDot(...cells));

// Black dots (Kropki 1:2 ratio), one per drawn edge mark.
const blackDots = [
  ['R3C3', 'R3C4'],
  ['R4C3', 'R4C4'],
  ['R5C3', 'R5C4'],
  ['R6C3', 'R6C4'],
  ['R7C3', 'R7C4'],
  ['R1C8', 'R1C9'],
  ['R1C9', 'R2C9'],
  ['R8C9', 'R9C9'],
  ['R9C8', 'R9C9'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  dutchWhisper,
  germanWhisper,
  ...renbans,
  ...thermos,
  ...parityLines,
  ...whiteDots,
  ...blackDots,
];
