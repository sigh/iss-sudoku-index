// Title: Border Square Diagonals
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=REUywhgfkRk
// Source: https://sudokupad.app/dLgJ4RDG3j

// Normal sudoku rules apply. Each purple arrow's arm sums to its circle.
// Every 2x2 square crossing a box boundary has equal diagonal sums, except
// the four grey 2x2 squares drawn at the listed top-left cells.
const greySquares = new Set(['1,6', '3,4', '6,8', '7,3']);
const borderSquares = Array.from({length: 8}, (_, row) => row + 1)
  .flatMap(row => Array.from({length: 8}, (_, col) => col + 1)
    .filter(col => (row === 3 || row === 6 || col === 3 || col === 6)
      && !greySquares.has(`${row},${col}`))
    .map(col => [row, col]));

// The grey-square coordinates come from the four grey 2x2 underlays.
const diagonalSums = borderSquares.map(([row, col]) => new EqualSum(
  [makeCellId(row, col), makeCellId(row + 1, col + 1)],
  [makeCellId(row, col + 1), makeCellId(row + 1, col)],
));

return [
  new Shape('9x9'),
  new Arrow('R8C3', 'R7C2', 'R6C2'),
  new Arrow('R3C7', 'R4C6', 'R5C6'),
  ...diagonalSums,
];
