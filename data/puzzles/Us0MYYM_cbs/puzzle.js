// Title: Antimatter
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=Us0MYYM_cbs
// Source: https://app.crackingthecryptic.com/sudoku/TF7PptMHnJ

// Normal sudoku rules apply on a 9x9 grid with standard 3x3 boxes.
// Digits may not repeat on either main diagonal (marked in blue): Diagonal.
// Digits on each purple line form a set of non-repeating consecutive digits,
// in any order: Renban.
// Neighbouring digits on a green line have a difference of at least 5, or a
// sum of at most 5: a custom Pair predicate.
//
// A sixth green-coloured line was drawn in the source but its cell path
// could not be recovered; that instance of the green-line rule is omitted
// here.

// Predicate for the green-line rule, shared by every green line.
const greenKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5 || (a + b) <= 5, 9);

// Purple Renban lines, cells transcribed from the drawn line paths.
const renbanLines = [
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R1C6', 'R1C5', 'R1C4'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R9C4', 'R9C5', 'R9C6'],
];

// Green difference/sum lines, cells transcribed from the drawn line paths.
// One of the drawn lines is closed (its waypoints repeat the start cell), so
// its cell list here repeats the first cell to cover the wrap-around edge.
const greenLines = [
  ['R7C2', 'R6C2', 'R7C3', 'R8C4', 'R8C3'],
  ['R2C7', 'R2C6', 'R3C7', 'R4C8', 'R3C8'],
  ['R5C3', 'R4C4', 'R5C4', 'R5C3'],
  ['R4C4', 'R4C5', 'R5C6', 'R6C6', 'R6C5', 'R5C4'],
  ['R6C5', 'R7C5', 'R6C6', 'R5C7', 'R5C6'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...greenLines.map(cells => new Pair(greenKey, 'green line', ...cells)),
];
