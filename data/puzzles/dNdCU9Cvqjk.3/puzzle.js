// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=dNdCU9Cvqjk
// Source: https://cracking-the-cryptic.web.app/sudoku/bRjPNJ3B6q

// Normal sudoku rules: each row, column and 3x3 box holds 1-9 once. The
// source draws the nine standard 3x3 boxes and carries no other clue
// geometry and no rules text, so the default Sudoku baseline is the whole
// ruleset and only the givens are added.

// The 44 drawn givens, row by row; '.' is an empty cell.
const givens = [
  '87569....',
  '6..5.79.8',
  '..9..8567',
  '78.9...56',
  '9...5678.',
  '.5.78...9',
  '56.87..9.',
  '.98..567.',
  '..7.698.5',
];

return [
  new Shape('9x9'),
  ...givens.flatMap((row, r) => [...row].flatMap((ch, c) =>
    ch === '.' ? [] : [new Given(makeCellId(r + 1, c + 1), Number(ch))])),
];
