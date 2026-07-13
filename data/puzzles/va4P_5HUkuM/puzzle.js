// Title: Something for Simon
// Author: Knightemaire
// Video: https://www.youtube.com/watch?v=va4P_5HUkuM
// Source: https://sudokupad.app/6uqtssso3q

// Normal sudoku rules apply (standard rows/cols/boxes).
//
// Fog of War: solving-UI only (progressive reveal); not a final-grid rule, omitted.
//
// Arrow Sums: a single two-digit pill spans R2C2 (tens) and R2C3 (units); two
// separate arrows each grow from one of the two pill cells, and each arm's
// digits must sum to that shared two-digit pill value.
const arrows = [
  new PillArrow(2, 'R2C2', 'R2C3', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),
  new PillArrow(2, 'R2C2', 'R2C3', 'R3C3', 'R3C2', 'R3C1'),
];

// German Whispers: adjacent cells on the green line differ by at least 5.
const germanWhispers = new Whisper(5, 'R6C4', 'R5C4', 'R4C4', 'R5C5', 'R4C6', 'R5C6', 'R6C6');

// Dutch Whispers: adjacent cells on the orange line differ by at least 4. The
// drawn line branches (R1C8 and R3C8 each connect to three neighbours), so it
// is encoded as its three drawn strokes; together they cover every drawn edge.
const dutchWhispers = [
  new Whisper(4, 'R1C7', 'R1C8', 'R1C9'),
  new Whisper(4, 'R1C8', 'R2C8', 'R3C8', 'R3C9'),
  new Whisper(4, 'R3C8', 'R3C7'),
];

// Parity Lines: every pair of consecutive cells on the red line contains one
// odd and one even digit. The drawn line is the closed perimeter of box 7
// (rows 7-9, cols 1-3), skipping the box's centre cell; the repeated first
// cell closes the loop so the wrap-around edge is also covered.
const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLine = new Pair(
  parityKey, 'Parity',
  'R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1');

// Renban Lines: digits on the pink line form a consecutive set in any order.
const renban = new Renban('R9C7', 'R8C7', 'R7C7', 'R8C8', 'R9C9', 'R8C9', 'R7C9');

// Killer Cages: digits in a cage sum to the number in its top-left corner
// (and, per SudokuMaker's cage data, do not repeat within the cage).
const cages = [
  new Cage(14, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(12, 'R4C1', 'R5C1', 'R6C1'),
  new Cage(19, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(14, 'R9C4', 'R9C5', 'R9C6'),
];

// Ratio Kropki: cells joined by a black dot have one digit double the other.
const blackDots = [
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R5C2', 'R5C3'),
  new BlackDot('R8C5', 'R9C5'),
  new BlackDot('R4C8', 'R4C9'),
];

// Difference Kropki: cells joined by a white dot are consecutive.
const whiteDots = [
  new WhiteDot('R1C5', 'R2C5'),
  new WhiteDot('R6C8', 'R7C8'),
  new WhiteDot('R1C3', 'R1C4'),
  new WhiteDot('R7C5', 'R8C5'),
  new WhiteDot('R5C5', 'R6C5'),
];

return [
  new Shape('9x9'),
  new Given('R5C2', 2),
  new Given('R5C8', 3),
  new Given('R8C5', 2),
  new Given('R8C6', 6),
  ...arrows,
  germanWhispers,
  ...dutchWhispers,
  parityLine,
  renban,
  ...cages,
  ...blackDots,
  ...whiteDots,
];
