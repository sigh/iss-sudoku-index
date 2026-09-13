// Title: Twinned
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=kPt2l1U4pt0
// Source: https://sudokupad.app/3uz3y611dl

// Normal sudoku rules apply. Two edge dots (black: one double the other;
// white: consecutive) and two edge X marks (sum to 10) sit between grid
// cells, unrelated to the six colour-paired lines below.
//
// TWIN TOTALS: every colour is drawn as exactly two lines, and same-colour
// lines must carry the same total sum, on top of that colour's own line
// rule (German Whisper, Renban, Region Sum, Thermometer, Parity, Nabner).
// Each twin-total pair is encoded as EqualSum over the two lines' cells as
// two segments, which states sum(A) = sum(B) without materialising either
// total.

// Nabner: "no two digits anywhere on the line" is a relation over every
// pair of cells on the line, not just line-adjacent pairs, so it needs
// PairX (all pairs) rather than a line-adjacency class.
const notConsecutiveKey = PairX.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// Twin colour lines, as drawn (bulb cell listed first for thermometers).
const green1 = ['R5C1', 'R5C2', 'R5C3', 'R5C4'];
const green2 = ['R5C6', 'R5C7', 'R5C8', 'R5C9'];
const pink1 = ['R4C1', 'R4C2', 'R4C3', 'R4C4'];
const pink2 = ['R6C6', 'R6C7', 'R6C8', 'R6C9'];
const blue1 = ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R7C5', 'R8C5'];
const blue2 = ['R2C5', 'R3C5', 'R4C5', 'R4C6', 'R4C7', 'R4C8'];
const grey1 = ['R6C1', 'R7C1', 'R8C2', 'R9C3', 'R9C4'];
const grey2 = ['R4C9', 'R3C9', 'R2C8', 'R1C7', 'R1C6'];
const red1 = ['R1C5', 'R1C4', 'R1C3', 'R1C2'];
const red2 = ['R9C5', 'R9C6', 'R9C7', 'R9C8'];
const yellow1 = ['R1C1', 'R2C1', 'R3C1'];
const yellow2 = ['R7C9', 'R8C9', 'R9C9'];

// A twin-total pair: sum(cellsA) === sum(cellsB).
const twinSum = (cellsA, cellsB) => new EqualSum(cellsA, cellsB);

return [
  new Shape('9x9'),

  // Edge dots and X marks (adjacent cells only).
  new BlackDot('R5C2', 'R6C2'),
  new BlackDot('R4C7', 'R5C7'),
  new WhiteDot('R5C3', 'R6C3'),
  new WhiteDot('R4C8', 'R5C8'),
  new X('R9C4', 'R9C5'),
  new X('R1C5', 'R1C6'),

  // Green: German Whisper (difference >= 5; omitted arg defaults to 5).
  new Whisper(...green1),
  new Whisper(...green2),
  twinSum(green1, green2),

  // Pink: Renban (consecutive set, any order).
  new Renban(...pink1),
  new Renban(...pink2),
  twinSum(pink1, pink2),

  // Blue: Region Sum Line (equal sum per box segment; segments derived
  // from the default box regions).
  new RegionSumLine(...blue1),
  new RegionSumLine(...blue2),
  twinSum(blue1, blue2),

  // Grey: Thermometer (strictly increasing away from the bulb).
  new Thermo(...grey1),
  new Thermo(...grey2),
  twinSum(grey1, grey2),

  // Red: Parity line (alternating even/odd = Modular(2)).
  new Modular(2, ...red1),
  new Modular(2, ...red2),
  twinSum(red1, red2),

  // Yellow: Nabner (no two cells anywhere on the line differ by 1).
  new PairX(notConsecutiveKey, 'Nabner', ...yellow1),
  new PairX(notConsecutiveKey, 'Nabner', ...yellow2),
  twinSum(yellow1, yellow2),
];
