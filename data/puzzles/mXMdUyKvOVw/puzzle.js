// Title: Strange Boxes
// Author: Abraham Rosenschein
// Video: https://www.youtube.com/watch?v=mXMdUyKvOVw
// Source: https://sudokupad.app/bhvl8agbtg

// Standard sudoku (default 3x3 boxes).
//
// Four green lines are German Whisper lines (adjacent cells differ by >= 5):
// two small closed loops, plus a pair of strokes that share endpoints
// R3C3 and R5C5 and together trace one continuous figure-eight shape,
// drawn as two strokes because the shape crosses itself at R5C5.
// Two pink lines are Renban lines (closed loops of consecutive,
// non-repeating digits in any order).
// R5C5/R5C6 are joined by a V: they sum to 5.
//
// "For each line type, all cells that change direction and all cells that
// go straight have the same parity, although a yellow cell is exempt from
// this rule. The solver must determine which parity applies to which cells
// in which line type." The yellow cell is R5C5 -- the only cell where the
// green figure-eight crosses itself, so it has no single well-defined
// turn/straight classification and the rule explicitly excuses it. Every
// other cell's turn/straight status is unambiguous, read off the shape of
// the continuous drawn path (the two green strokes meeting at R3C3 form one
// uninterrupted bend there, not two separate line ends). For each line type
// independently, the turn cells all share one parity (even or odd) and the
// straight cells all share one parity -- the rule does not say which, and
// the two parities need not differ.

const EVEN = [2, 4, 6, 8];
const ODD = [1, 3, 5, 7, 9];

// One Or(all-even / all-odd) per pooled turn/straight group: the puzzle only
// fixes that each group is internally uniform, not which parity it picks.
const sameParity = (cells) => new Or([
  new And(cells.map(c => new Given(c, ...EVEN))),
  new And(cells.map(c => new Given(c, ...ODD))),
]);

// Green (Whisper) line cells, classified by the shape of the continuous
// drawn path at each cell (R5C5 excluded -- see rule note above).
const greenTurn = [
  'R8C6', 'R8C9', 'R9C8', 'R9C7',
  'R2C4', 'R2C7', 'R1C6', 'R1C5',
  'R3C3', 'R6C6', 'R6C7', 'R5C8', 'R4C7', 'R4C6', 'R7C3', 'R6C2', 'R4C2',
];
const greenStraight = [
  'R8C7', 'R8C8',
  'R2C5', 'R2C6',
  'R4C4', 'R6C4', 'R5C2',
];

// Pink (Renban) line cells, classified the same way.
const pinkTurn = ['R8C1', 'R9C1', 'R9C4', 'R8C4', 'R1C8', 'R4C8', 'R4C9', 'R1C9'];
const pinkStraight = ['R9C2', 'R9C3', 'R8C3', 'R8C2', 'R2C8', 'R3C8', 'R3C9', 'R2C9'];

return [
  new Shape('9x9'),

  // Green German Whisper lines (difference >= 5 between adjacent cells).
  // Closed loops repeat their first cell to cover the wrap-around edge.
  new Whisper(5, 'R8C6', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C7', 'R8C6'),
  new Whisper(5, 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R1C6', 'R1C5', 'R2C4'),
  new Whisper(5, 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R6C7', 'R5C8', 'R4C7', 'R4C6', 'R5C5'),
  new Whisper(5, 'R3C3', 'R4C2', 'R5C2', 'R6C2', 'R7C3', 'R6C4', 'R5C5'),

  // Pink Renban lines (consecutive digits, non-repeating, any order).
  new Renban('R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4', 'R8C3', 'R8C2'),
  new Renban('R1C8', 'R2C8', 'R3C8', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R1C9'),

  // V: R5C5 + R5C6 sum to 5.
  new V('R5C5', 'R5C6'),

  // Turn/straight parity rule, pooled per line type; R5C5 (yellow) excluded.
  sameParity(greenTurn),
  sameParity(greenStraight),
  sameParity(pinkTurn),
  sameParity(pinkStraight),
];
