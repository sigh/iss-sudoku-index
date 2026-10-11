// Title: Drifting
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=NF0hF3h2uu0
// Source: https://sudokupad.app/nddzpwcbbp

// Normal sudoku rules apply. Adjacent digits along a line differ by 4 or 5.
const shape = new Shape('9x9');
// The nine yellow lines drawn on the grid, in path order.
const lines = [["R2C6", "R3C6", "R4C6", "R5C6", "R6C5", "R6C4", "R6C3", "R6C2", "R5C2"], ["R6C6", "R6C7"], ["R4C7", "R4C8", "R4C9"], ["R4C1", "R5C1", "R6C1"], ["R5C9", "R6C9", "R7C9", "R8C9", "R8C8", "R8C7", "R8C6"], ["R9C6", "R9C5", "R9C4"], ["R2C9", "R3C9", "R3C8"], ["R8C1", "R9C1"], ["R1C1", "R1C2", "R1C3"]];
// The predicate allows exactly the two stated absolute differences.
const key = Pair.fnToKey((a, b) => Math.abs(a - b) === 4 || Math.abs(a - b) === 5, shape);
const driftingLines = lines.map(cells => new Pair(key, 'Drifting', ...cells));
return [
  shape,
  // The two printed givens.
  new Given('R2C4', 5),
  new Given('R7C5', 7),
  ...driftingLines,
];
