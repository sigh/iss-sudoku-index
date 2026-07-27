// Title: The Polar(ity) Express!
// Author: Jaxar
// Video: https://www.youtube.com/watch?v=5-kczlKR0m0
// Source: https://sudokupad.app/84pjrcn67b

// Standard sudoku with default 3x3 boxes (the puzzle's own 9 regions are
// exactly those boxes). Six lines, one per rule: German whisper (green),
// Dutch whisper (orange), renban (pink), two region-sum lines (blue), and
// the tree trunk (brown), which reads as an ordering constraint: values
// strictly increase from the bottom cell up. Four killer cages ("the
// presents") each carry an explicit total and an all-different flag; the
// "sum to the total in the top left cell" clause is read as flavour text
// for where a cage's total is conventionally displayed, not an added rule
// tying it to grid cell R1C1 -- the totals below (13/17/13/20) all exceed 9,
// so they cannot be a single grid digit either way. Five edge marks read
// "X" (pair sums to 10) and one reads "V" (pair sums to 5), per the XV
// convention the rules text names directly. Five red-filled circles ("red
// baubles") restrict their cells to odd digits.

const germanWhisperCells = [
  'R7C3', 'R7C2', 'R7C1', 'R6C2', 'R5C3', 'R5C2', 'R4C3', 'R3C4', 'R3C3',
  'R2C4', 'R1C5', 'R2C6', 'R3C7', 'R3C6', 'R4C7', 'R5C8', 'R5C7', 'R6C8',
  'R7C9', 'R7C8', 'R7C7',
];
const renbanCells = ['R4C3', 'R5C4', 'R5C5', 'R5C6', 'R4C7'];
const dutchWhisperCells = ['R3C4', 'R3C5', 'R4C6', 'R3C6'];
const regionSumLineACells = ['R6C2', 'R6C3', 'R7C4', 'R7C5'];
const regionSumLineBCells = ['R6C5', 'R6C6', 'R6C7', 'R5C7'];

// Trunk cells listed top-to-bottom so GreaterThan's "earlier cell is greater
// than later ones" reads as "increases from the bottom": R9C5 < R8C5 < R7C5.
const trunkTopToBottom = ['R7C5', 'R8C5', 'R9C5'];

const oddCells = ['R1C5', 'R5C2', 'R7C6', 'R3C7', 'R4C5'];

return [
  new Shape('9x9'),

  new Whisper(5, ...germanWhisperCells),   // German whisper: difference >= 5
  new Whisper(4, ...dutchWhisperCells),    // Dutch whisper: difference >= 4
  new Renban(...renbanCells),
  new RegionSumLine(...regionSumLineACells),
  new RegionSumLine(...regionSumLineBCells),
  new GreaterThan(...trunkTopToBottom),

  new Cage(13, 'R8C7', 'R9C7'),
  new Cage(17, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(13, 'R8C3', 'R9C3'),
  new Cage(20, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),

  // XV pairs: X = sum to 10, V = sum to 5, each on one drawn edge mark.
  new X('R7C8', 'R8C8'),
  new X('R7C7', 'R8C7'),
  new X('R7C3', 'R8C3'),
  new X('R7C1', 'R8C1'),
  new V('R8C5', 'R9C5'),

  // Red baubles: odd cells, encoded as the multi-value Given ISS uses for
  // parity clues (there is no dedicated Odd class).
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
