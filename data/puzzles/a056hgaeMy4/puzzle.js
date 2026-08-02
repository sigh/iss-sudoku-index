// Title: There are 3s in the Corners
// Author: Bruce Svare
// Video: https://www.youtube.com/watch?v=a056hgaeMy4
// Source: https://app.crackingthecryptic.com/QMtbDHH9mL

// Normal Sudoku rules apply. Each outside clue is the sum of the digits on its
// indicated up-right diagonal; diagonal digits may repeat.
const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);
const diagonalClues = [
  // Drawn outside-clue arrows and labels, read from their grid-entry corners.
  [3, 'R1C1'], [3, 'R2C1'],
  [33, 'R4C1'], [33, 'R5C1'], [33, 'R6C1'], [33, 'R7C1'], [33, 'R8C1'], [33, 'R9C1'],
  [33, 'R9C2'], [33, 'R9C3'], [33, 'R9C4'], [33, 'R9C5'], [33, 'R9C6'],
  [3, 'R9C8'], [3, 'R9C9'],
];
const singleCellDiagonalClues = diagonalClues.filter(([, start]) =>
  graph.ray(start, -1, 1).length === 1);
const multiCellDiagonalClues = diagonalClues.filter(([, start]) =>
  graph.ray(start, -1, 1).length > 1);

return [
  shape,
  new Given('R2C5', 8),
  new Given('R4C4', 7), new Given('R4C6', 2),
  new Given('R5C2', 4), new Given('R5C5', 5), new Given('R5C8', 9),
  new Given('R6C4', 1), new Given('R6C6', 9),
  new Given('R8C5', 3),
  // A length-one diagonal clue is its cell's given value.
  ...singleCellDiagonalClues.map(([sum, start]) => new Given(start, sum)),
  ...multiCellDiagonalClues.map(([sum, start]) =>
    LittleKiller.fromCells(sum, graph.ray(start, -1, 1), geometry)),
];
