// Title: Holographic Principle
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=m_0g-IZKwxA
// Source: https://sudokupad.app/e27trjd6zv

// Normal sudoku on rows/columns; the 9 boxes are replaced by 9 deduced
// orthogonally-connected regions of 9 cells (Chaos Construction), so boxes
// are dropped and region membership is solver state (`CC` overlay).
// A digit in a cell with arrow(s) gives the total number of cells sharing
// its region across all of that cell's indicated directions combined,
// counting the arrow cell itself once; a different-region cell blocks
// vision along that direction. ARROW_DEFS lists, for each arrow cell, the
// direction(s) read from its drawn mark(s): a straight mark on one edge of
// the cell is a single orthogonal direction, and a mark tucked into one
// corner of the cell is a single diagonal direction (its own ray of
// diagonal steps, not the two orthogonal directions meeting at that
// corner) -- an orthogonal-pair reading is infeasible at R5C9, whose two
// corner marks would combine with the straight "up"/"down"/"left" arms
// covering every orthogonal neighbour, forcing a run length of at least 2,
// but R5C9's digit is 1.
const ARROW_DEFS = [
  { origin: 'R1C1', dirs: ['down-right'] },
  { origin: 'R1C2', dirs: ['down-left'] },
  { origin: 'R1C5', dirs: ['down-left', 'down-right'] },
  { origin: 'R1C8', dirs: ['down-right'] },
  { origin: 'R1C9', dirs: ['down-left'] },
  { origin: 'R2C1', dirs: ['up-right'] },
  { origin: 'R2C9', dirs: ['up-left', 'down-left'] },
  { origin: 'R3C1', dirs: ['up-right', 'down-right'] },
  { origin: 'R3C9', dirs: ['up-left', 'down-left'] },
  { origin: 'R5C1', dirs: ['up-right', 'down-right'] },
  { origin: 'R5C9', dirs: ['up-left', 'down-left'] },
  { origin: 'R8C1', dirs: ['up-right'] },
  { origin: 'R8C9', dirs: ['left'] },
  { origin: 'R9C1', dirs: ['right', 'up'] },
  { origin: 'R9C2', dirs: ['up'] },
  { origin: 'R9C8', dirs: ['up'] },
  { origin: 'R9C9', dirs: ['left', 'up'] },
];

// dR/dC step per direction, for cellGraph().ray() (diagonal steps included).
const STEP = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
  'up-left': [-1, -1], 'up-right': [-1, 1],
  'down-left': [1, -1], 'down-right': [1, 1],
};

const graph = cellGraph('9x9');
// The region-label cell paired with each grid cell.
const cc = graph.makeOverlay('CC');

// Each arm is the run of region-label cells from the arrow cell to the grid
// edge in one direction, inclusive of the arrow cell itself (the shared
// start every arm of a ChaosArrow must carry). offset 0: the control digit
// counts the run length including that shared start cell, matching "this
// count includes the arrow cell itself".
const chaosArrows = ARROW_DEFS.map(({ origin, dirs }) => new ChaosArrow(
  origin, 0,
  ...dirs.map(dir => cc.at(graph.ray(origin, ...STEP[dir]))),
));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  new Given('R5C3', 9),
  new Given('R5C5', 7),
  new Given('R5C7', 8),
  ...chaosArrows,
];
