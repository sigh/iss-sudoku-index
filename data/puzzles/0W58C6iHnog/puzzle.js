// Title: With friends like this...
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=0W58C6iHnog
// Source: https://sudokupad.app/vgpr0pfsqm

// Standard Sudoku, cage digit distinctness, and no consecutive orthogonal
// neighbours within a cage are encoded. The unknown negator placement and the
// resulting signed cage totals are omitted.
const cages = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'],
  ['R3C6', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R7C5'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
  ['R4C7', 'R4C8'],
  ['R2C5', 'R3C5'],
  ['R2C7', 'R2C8', 'R2C9'],
  ['R5C8', 'R5C9'],
  ['R7C2', 'R8C1', 'R8C2', 'R9C2'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R1C1', 'R1C2', 'R2C1'],
]; // Cage cell lists transcribed from the drawn cage data.

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const cageEdges = cage => {
  const cells = new Set(cage);
  return cage.flatMap(cell => graph.neighbours(cell)
    .filter(other => cells.has(other) && cell < other)
    .map(other => [cell, other]));
};
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

const friendly = ['R1C3', 'R2C3', 'R3C6', 'R4C6', 'R5C5', 'R6C4', 'R8C6'];
const friendlyCandidates = friendly.map(cell => {
  const { row, col: column } = parseCellId(cell);
  return new Given(cell, row, column);
}); // Diamonds: each digit equals its row number or column number.

return [
  shape,
  ...cages.map(cage => new AllDifferent(...cage)),
  ...cages.flatMap(cage => cageEdges(cage).map(([a, b]) =>
    new Pair(notConsecutiveKey, 'cage neighbours are not consecutive', a, b))),
  ...friendlyCandidates,
  new AllDifferent(...friendly),
  new WhiteDot('R8C1', 'R9C1'),
];
