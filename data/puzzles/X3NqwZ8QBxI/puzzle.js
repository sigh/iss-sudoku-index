// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=X3NqwZ8QBxI
// Source: https://cracking-the-cryptic.web.app/sudoku/nn468RjnbB

// Normal Sudoku rules apply: 1-9 in every row, column and 3x3 box (the nine
// drawn regions are the default boxes, so the engine's baseline covers them).
//
// Grey cell: "put a digit in the grey cell: 1 if you are capable, 2 if you are
// advanced, 3 if you are expert." The shaded cell is R5C5. Which of 1, 2 or 3
// belongs there is a claim the solver makes about the solver, so only its
// range is encodable: it is written as a multi-value Given, and the choice
// among the three is left unencoded.
//
// The source payload carries no rules text; the rules above are the video
// description's, which links this exact source URL.

// Givens as drawn in the grid, row by row ('.' is an empty cell).
const givenRows = [
  '2.1.7.8..',
  '.4.....3.',
  '8..2....5',
  '47..65.93',
  '6.5......',
  '.........',
  '...34.6..',
  '..47...1.',
  '79..5...8',
];

const givens = givenRows.flatMap((row, r) => [...row].flatMap(
  (ch, c) => ch === '.' ? [] : [new Given(makeCellId(r + 1, c + 1), +ch)]));

return [
  new Shape('9x9'),
  ...givens,
  // The grey cell holds one of the three grades.
  new Given('R5C5', 1, 2, 3),
];
