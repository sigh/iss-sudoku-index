// Title: Sunrise, Sunset
// Author: heliopolix
// Video: https://www.youtube.com/watch?v=74OfUoIsWSE
// Source: https://sudokupad.app/h7c252pzkx

// Rules: normal sudoku. Digits on a yellow (sunrise) line sum to 8, 18 or 14;
// digits on a pink (sunset) line sum to 9, 5 or 25. Repeats on a line are
// allowed where other rules permit (Sum, not Cage). Dots are lines too: a
// one-cell yellow dot sums to 8, a one-cell pink dot to 5 or 9 (25 and the
// other totals are out of digit range, so the one-cell cases are Givens).

const SUNRISE = [8, 14, 18];
const SUNSET = [5, 9, 25];

const lineSum = (totals, cells) =>
  new Or(totals.map((t) => new Sum(t, ...cells)));

// Yellow lines, from the yellow stroke layer. Two short strokes stop about a
// quarter-cell short of a cell that a pink line ends in (R8C6, R6C8) and one
// stops short of the pink dot at R9C9; each still reaches well inside that
// cell, so the cell is on the line.
const yellowLines = [
  ['R3C2', 'R3C1', 'R2C2', 'R1C3', 'R2C3'],
  ['R3C4', 'R4C3'],
  ['R3C5', 'R4C4'],
  ['R5C4', 'R6C3'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R3C8', 'R4C8'],
  ['R7C1', 'R8C1'],
  ['R5C8', 'R5C9'],
  ['R8C5', 'R9C5'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R9C7', 'R8C6'],
  ['R7C9', 'R6C8'],
];

// Pink lines, from the pink stroke layer.
const pinkLines = [
  ['R5C7', 'R6C6', 'R7C5'],
  ['R5C6', 'R6C5'],
  ['R6C8', 'R6C7'],
  ['R7C6', 'R8C6'],
  ['R8C7', 'R9C8'],
  ['R7C8', 'R8C9'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R1C7', 'R2C8', 'R3C9', 'R4C9'],
];

// Dots, from the small coloured circle overlays.
const yellowDots = ['R1C4', 'R4C1'];
const pinkDots = ['R3C3', 'R5C5', 'R6C9', 'R9C6', 'R9C9'];

// The yellow ink R2C4 -> R3C3 -> R4C2 is drawn as two strokes, each stopping
// short of the pink dot at R3C3 on either side. The art does not say whether
// this is one line passing through the dot or two lines each ending at it, so
// the encoding accepts either reading.
const r3c3Yellow = new Or([
  lineSum(SUNRISE, ['R2C4', 'R3C3', 'R4C2']),
  new And([
    lineSum(SUNRISE, ['R2C4', 'R3C3']),
    lineSum(SUNRISE, ['R3C3', 'R4C2']),
  ]),
]);

return [
  new Shape('9x9'),
  ...yellowDots.map((c) => new Given(c, 8)),
  ...pinkDots.map((c) => new Given(c, 5, 9)),
  ...yellowLines.map((cells) => lineSum(SUNRISE, cells)),
  ...pinkLines.map((cells) => lineSum(SUNSET, cells)),
  r3c3Yellow,
];
