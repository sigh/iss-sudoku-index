// Title: Litt Whisper Nightmares!
// Author: Sayori
// Video: https://www.youtube.com/watch?v=dNikd4iw3lQ
// Source: https://app.crackingthecryptic.com/sudoku/34PNbHhptN

// Normal sudoku rules: standard 9x9, default row/column/box all-different
// (regions are the default 3x3 boxes; the payload's `regions` field draws
// nothing irregular).
// Grey line rule: adjacent digits on a grey line must NOT differ by 5 or
// more, i.e. abs(a-b) <= 4. The rule is inherently pairwise (adjacent digits
// on the line), so each drawn stroke is encoded as its own Pair over the
// stroke's own cell sequence -- this needs no resolution of which strokes
// join into "one" line, including the branch point at R1C5 where three
// strokes meet.
// White/black dots: WhiteDot (consecutive), BlackDot (ratio 1:2) -- both
// grid-adjacent, matching the drawn dot positions.
// Killer cages: distinct digits summing to the printed total (Cage).
// Two cages print an inequality ("> 11", "> 8") instead of an exact total;
// Cage only takes an exact sum, so those two are a custom Pair enforcing
// distinct cells whose sum exceeds the printed threshold -- the same "digits
// may not repeat and must sum to the number indicated" rule, read against an
// inequality label instead of a numeric one.

const notFive = Pair.fnToKey((a, b) => Math.abs(a - b) <= 4, 9);

// One entry per drawn grey stroke, in source draw order, as its own cell
// sequence.
const greyLineStrokes = [
  ['R1C6', 'R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C3',
   'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C7'],
  ['R1C6', 'R2C7'],
  ['R3C3', 'R4C4', 'R4C3'],
  ['R3C3', 'R4C3'],
  ['R3C7', 'R4C7'],
  ['R4C6', 'R3C7'],
  ['R4C6', 'R4C7'],
  ['R2C8', 'R2C9', 'R1C9'],
  ['R2C2', 'R2C1', 'R1C1'],
  ['R6C4', 'R7C5', 'R6C6'],
  ['R1C7', 'R1C8'],
  ['R1C2', 'R1C3'],
  ['R8C5', 'R7C6'],
  ['R2C4', 'R1C5'],
  ['R1C3', 'R2C4'],
  ['R5C5', 'R6C5'],
];

const greyLines = greyLineStrokes.map(
  cells => new Pair(notFive, 'grey line', ...cells));

const whiteDots = [
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R3C2', 'R3C3'),
  new WhiteDot('R9C4', 'R9C5'),
  new WhiteDot('R5C6', 'R6C6'),
];

const blackDots = [
  new BlackDot('R6C9', 'R7C9'),
];

const cages = [
  new Cage(10, 'R1C7', 'R1C8'),
  new Cage(10, 'R4C8', 'R5C8'),
  new Cage(10, 'R2C6', 'R2C7'),
  new Cage(12, 'R8C9', 'R9C9'),
  new Cage(7, 'R7C7', 'R7C8'),
  new Cage(7, 'R2C1', 'R3C1'),
  new Cage(10, 'R2C2', 'R3C2'),
  new Cage(11, 'R3C3', 'R3C4'),
  new Cage(20, 'R6C2', 'R6C3', 'R7C3'),
  new Cage(13, 'R8C5', 'R9C5', 'R9C6'),
];

// ">11" / ">8" printed cage totals: distinct pair, sum strictly greater than
// the printed threshold.
const gt11 = Pair.fnToKey((a, b) => a !== b && a + b > 11, 9);
const gt8 = Pair.fnToKey((a, b) => a !== b && a + b > 8, 9);
const inequalityCages = [
  new Pair(gt11, 'cage sum > 11', 'R6C4', 'R7C4'),
  new Pair(gt8, 'cage sum > 8', 'R6C6', 'R6C7'),
];

return [
  new Shape('9x9'),
  ...greyLines,
  ...whiteDots,
  ...blackDots,
  ...cages,
  ...inequalityCages,
];
