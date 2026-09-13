// Title: Dutch Thermos Tell No Tales
// Author: The Bard
// Video: https://www.youtube.com/watch?v=f4jR6RtQlGc
// Source: https://sudokupad.app/casiq3outn

// Normal sudoku rules (default rows/cols/boxes, no drawn cages).
// V pairs (sum to 5) and white dots (consecutive) at the drawn edge marks.
//
// Dutch Thermos (orange lines): cells alternate between two sets along the
// line (1st, 3rd, 5th, ... one set; 2nd, 4th, 6th, ... the other). Each set
// increases in value from the bulb end, independently of the other set. Every
// adjacent pair along the whole line -- of either set -- differs by at least
// four. Encoded per line as: a Thermo over the odd-position cells (strictly
// increasing), a Thermo over the even-position cells (strictly increasing),
// and one Whisper(4, ...) over the full ordered line for the adjacent-
// difference-of-at-least-4 clause.

// Thermo lines, bulb first; transcribed from the drawn orange `lines`.
const thermos = [
  ['R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R8C4', 'R7C3', 'R6C2', 'R5C1'],
  ['R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8'],
  ['R4C2', 'R3C3', 'R2C4', 'R1C5'],
];

// One alternating-set Thermo pair per line: odd positions (0, 2, 4, ...) and
// even positions (1, 3, 5, ...), each independently increasing from the bulb.
const alternatingSetThermos = thermos.flatMap(line => [
  new Thermo(...line.filter((_, i) => i % 2 === 0)),
  new Thermo(...line.filter((_, i) => i % 2 === 1)),
]);
const wholeLineWhispers = thermos.map(line => new Whisper(4, ...line));

// V-marked edges, transcribed from the drawn `overlays` with text "V".
const vPairs = [
  ['R1C1', 'R1C2'],
  ['R3C8', 'R3C9'],
  ['R3C2', 'R4C2'],
  ['R7C7', 'R7C8'],
  ['R8C5', 'R9C5'],
  ['R8C1', 'R9C1'],
  ['R7C3', 'R8C3'],
  ['R6C5', 'R7C5'],
  ['R1C9', 'R2C9'],
  ['R4C6', 'R4C7'],
];

// White-dot-marked edges, transcribed from the drawn `overlays` with an empty
// text label, white fill and black border.
const whiteDots = [
  ['R3C5', 'R3C6'],
  ['R6C8', 'R6C9'],
  ['R4C3', 'R5C3'],
  ['R6C4', 'R7C4'],
  ['R6C9', 'R7C9'],
  ['R1C8', 'R2C8'],
];

return [
  new Shape('9x9'),
  ...alternatingSetThermos,
  ...wholeLineWhispers,
  ...vPairs.map(cells => new V(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
