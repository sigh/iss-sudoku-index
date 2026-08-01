// Title: Extragalactic
// Author: ZegreS
// Video: https://www.youtube.com/watch?v=RibOCs_eQWo
// Source: https://sudokupad.app/hrQdLRJG82

// Standard Sudoku applies. The red dot at R5C5 is the centre of one
// orthogonally connected, 180-degree rotationally symmetric galaxy. Each
// drawn cage is wholly in that galaxy, or wholly outside it and has its shown sum.

const GALAXY = 1;
const OUTSIDE = 2;
const graph = cellGraph('9x9');
const galaxy = graph.makeOverlay('VG');

// The red centre dot is drawn at R5C5.
const centre = new Given(galaxy.at('R5C5'), GALAXY);
const domain = galaxy.makeReplicate(
  new Given(galaxy.cells()[0], GALAXY, OUTSIDE));

// A cell and its 180-degree image have the same galaxy membership.
const rotationalPairs = graph.cells().flatMap(cell => {
  const { row, col } = parseCellId(cell);
  const rotated = makeCellId(10 - row, 10 - col);
  return cell < rotated
    ? [new SameValues(2, galaxy.at(cell), galaxy.at(rotated))]
    : [];
});

// Cage cells and totals transcribed from the drawn cage boundaries and labels.
const cages = [
  [4, ['R5C6', 'R6C6']], [3, ['R4C4', 'R5C4']],
  [5, ['R4C5', 'R4C6']], [6, ['R6C4', 'R6C5']],
  [7, ['R4C8', 'R4C9']], [7, ['R6C8', 'R6C9']],
  [16, ['R7C6', 'R8C6', 'R9C6']], [16, ['R1C4', 'R2C4', 'R3C4']],
  [6, ['R1C6', 'R2C6']], [6, ['R8C4', 'R9C4']],
  [8, ['R4C3', 'R5C2', 'R5C3', 'R6C3']],
  [7, ['R4C7', 'R5C7', 'R5C8', 'R6C7']],
  [17, ['R7C5', 'R8C5', 'R9C5']], [7, ['R1C5', 'R2C5', 'R3C5']],
  [7, ['R4C1', 'R4C2']], [7, ['R6C1', 'R6C2']],
  [7, ['R2C9', 'R3C9']], [6, ['R7C7', 'R7C8', 'R8C8']],
  [8, ['R2C2', 'R3C2', 'R3C3']], [9, ['R7C9', 'R8C9']],
  [3, ['R2C1', 'R3C1']], [14, ['R8C2', 'R9C1', 'R9C2']],
  [7, ['R1C8', 'R1C9', 'R2C8']], [8, ['R7C1', 'R8C1']],
  [0, ['R5C5']],
];

const cageRules = cages.map(([total, cells]) => new Or([
  new And(galaxy.at(cells).map(cell => new Given(cell, GALAXY))),
  new And([
    ...galaxy.at(cells).map(cell => new Given(cell, OUTSIDE)),
    new Cage(total, ...cells),
  ]),
]));

return [
  new Shape('9x9'),
  galaxy.toVar('galaxy membership'),
  domain,
  centre,
  new ConnectedValues('VG', GALAXY),
  ...rotationalPairs,
  ...cageRules,
];
