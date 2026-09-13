// Title: Center focus
// Author: DedaKosta
// Video: https://www.youtube.com/watch?v=r1a2WOj-ewQ
// Source: https://sudokupad.app/56zxkbfy2u

// Normal sudoku rules apply. Six Kropki dots (black: one digit double the
// other; white: consecutive) -- not all such pairs are dotted, so no negative
// StrictKropki is implied. Two green lines require adjacent digits to differ
// by at least 5 (Whisper). Two arrows: digits on the arm sum to the digit in
// the circle (the bulb cell). Two thermometers: digits increase away from the
// bulb. Both board diagonals forbid repeated digits (Diagonal); the payload
// also carries matching hidden `unique` cages over the same two diagonals,
// confirming the reading independently of the drawn stroke.

// Black dots (ratio 1:2), transcribed from the payload's dot-sized edge
// overlays by fill colour (solid black background).
const blackDots = [
  ['R7C5', 'R7C6'],
  ['R3C4', 'R3C5'],
  ['R5C6', 'R5C7'],
];

// White dots (consecutive), transcribed the same way (white background,
// black border).
const whiteDots = [
  ['R5C5', 'R5C6'],
  ['R2C2', 'R2C3'],
  ['R2C3', 'R3C3'],
];

// Green difference-at-least-5 lines, transcribed from the drawn springgreen
// strokes.
const greenLines = [
  ['R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R9C4'],
  ['R1C6', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9'],
];

// Arrows, circle (bulb) cell first, transcribed from the drawn arrow paths
// and their matching white/light-border circle overlays.
const arrows = [
  ['R4C5', 'R4C4', 'R3C4'],
  ['R6C5', 'R6C6', 'R7C6'],
];

// Thermometers, bulb-first, transcribed from the drawn thick lines and their
// bulb-cell underlay circles.
const thermos = [
  ['R5C2', 'R5C3', 'R5C4', 'R6C4', 'R7C4'],
  ['R5C8', 'R5C7', 'R5C6', 'R4C6', 'R3C6'],
];

return [
  new Shape('9x9'),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...thermos.map(cells => new Thermo(...cells)),
  new Diagonal(-1),
  new Diagonal(1),
];
