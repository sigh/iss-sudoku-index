// Title: Happy Birthday Simon!
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=PsqJMx_L5Ho
// Source: https://sudokupad.app/czke3g17fr

// Rules encoded here:
//  - Normal sudoku on a 7x7 grid (digits 1-7); 7 has no even factor pair, so
//    no boxes are drawn or implied.
//  - A-Puzzle-A-Day placement: the grid is tiled by 8 polyominoes -- one each
//    of the L, N, P, U, V, Y, Z pentominoes and one 2x3 rectangle, any
//    rotation/reflection -- covering every cell except the 8 cells printed in
//    grey ("8", "Jun", six "x"s), which must stay uncovered. Each of the 8
//    drawn single-cell cage totals lies inside a different polyomino and
//    equals the sum of every digit in that whole polyomino (digits distinct
//    within it); no polyomino holds more than one cage.
//  - Little killer: the main diagonal R1C1-R7C7 sums to 45; digits may repeat
//    there (ordinary row/column sudoku does not already force the diagonal to
//    be a permutation, since diagonal cells share no row or column with each
//    other).
//  - Odd cells R1C4, R2C7, R7C6 hold an odd digit.
//  - Omitted: the flavour text ("intentional 3 in the corner", "a secret ...
//    hidden") names no checkable condition and is not a rule.

// Var cells share the grid's value range, so the label/type overlays below
// (which need domain 1-8, one value per polyomino) force a widened Shape;
// the main grid is then restricted back to 1-7 with one Replicate.
const shape = new Shape('7x7', 8);
const graph = cellGraph(shape);
const allCells = graph.cells();

// The 8 given single-cell cage clues (cell -> total), one drawn corner total
// per cell.
const cages = [
  ['R1C1', 21],
  ['R2C1', 25],
  ['R3C1', 15],
  ['R4C5', 25],
  ['R5C5', 25],
  ['R6C3', 25],
  ['R7C3', 22],
  ['R4C7', 20],
];

// The 8 cells printed in grey ("8", "Jun", six "x"s) that must stay
// uncovered so the grid spells "8 Jun".
const greyCells = new Set([
  'R4C1', 'R1C6', 'R1C7', 'R2C7', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
]);

// The 8 named shapes, as row/col offset lists (0-indexed, unnormalized is
// fine -- orientations() normalizes). Standard pentomino shapes plus the
// 2x3 rectangle named in the rules.
const baseShapes = {
  L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
  P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
  U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
  RECT2X3: [[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2]],
};
const shapeNames = Object.keys(baseShapes);

const normalize = (cells) => {
  const minR = Math.min(...cells.map(([r]) => r));
  const minC = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
};
const key = (cells) => cells.map(([r, c]) => `${r},${c}`).join(';');

// Every orientation of a shape distinct under rotation/reflection (the rules
// allow both), deduped -- a shape with its own symmetry (e.g. the rectangle)
// naturally yields fewer than 8.
const orientations = (base) => {
  const seen = new Map();
  let cells = base;
  for (let refl = 0; refl < 2; refl++) {
    let rc = refl ? cells.map(([r, c]) => [r, -c]) : cells;
    for (let rot = 0; rot < 4; rot++) {
      const norm = normalize(rc);
      seen.set(key(norm), norm);
      rc = rc.map(([r, c]) => [c, -r]); // rotate 90 degrees
    }
  }
  return [...seen.values()];
};

// Every placement of one orientation on the 7x7 board, as a cell-id list.
const placementsFor = (cellsOffsets) => {
  const maxR = Math.max(...cellsOffsets.map(([r]) => r));
  const maxC = Math.max(...cellsOffsets.map(([, c]) => c));
  const out = [];
  for (let r = 0; r + maxR < 7; r++) {
    for (let c = 0; c + maxC < 7; c++) {
      out.push(cellsOffsets.map(([dr, dc]) => makeCellId(r + dr + 1, c + dc + 1)));
    }
  }
  return out;
};

// All (shapeName, cells) candidates on the board, across every orientation.
const allPlacements = shapeNames.flatMap(
  name => orientations(baseShapes[name]).flatMap(
    o => placementsFor(o).map(cells => ({ name, cells })))
);

// A candidate is legal for a given cage only if its footprint contains the
// cage's own cell (rules: "each cage is part of a polyomino ... this cage can
// be anywhere in the polyomino") and touches none of the 8 must-stay-blank
// cells (rules: those cells are not covered by any polyomino).
const candidatesFor = (cageCell) => allPlacements.filter(
  ({ cells }) => cells.includes(cageCell) && cells.every(c => !greyCells.has(c)));

// One label per cage/polyomino (1-8), stamped on every cell the chosen
// candidate covers. Two different cages always get a different constant
// label (only 8 cages, well inside the widened 1-8 range, so no label needs
// to be shared) -- so two candidates from different cages can never legally
// cover the same cell: the shared cell's label Var would be Given two
// different values. That alone forces the regions apart; no other
// disjointness bookkeeping is needed.
const labelOverlay = graph.makeOverlay('VL');

// One Var per cage naming which of the 8 shapes (by index into shapeNames)
// its polyomino is. AllDifferent over the 8 forces a bijection: since there
// are exactly 8 cages and 8 named shapes, every shape is used, and used only
// once -- "place 8 polyominoes ... exactly once".
const typeVarGroup = new Var('T', 'ShapeType', cages.length);
const typeVars = typeVarGroup.cells();

const pieceConstraints = cages.map(([cageCell, total], i) => new Or(
  candidatesFor(cageCell).map(({ name, cells }) => new And([
    new Given(typeVars[i], shapeNames.indexOf(name) + 1),
    ...cells.map(cell => new Given(labelOverlay.at(cell), i + 1)),
    new Cage(total, ...cells),
  ]))
));

return [
  shape,
  // Restrict the playable grid back to the true 1-7 alphabet; the widened
  // 8th value exists only for the label/type overlays above.
  graph.makeReplicate(new Given(allCells[0], 1, 2, 3, 4, 5, 6, 7), allCells),

  labelOverlay.toVar('Region'),
  // The 8 grey cells are never a candidate's cell (candidatesFor excludes
  // them), so nothing else pins their label; pin it to an arbitrary fixed
  // value so it does not multiply the solution count for free.
  ...[...greyCells].map(cell => new Given(labelOverlay.at(cell), 1)),
  typeVarGroup,
  new AllDifferent(...typeVars),
  ...pieceConstraints,

  // Little killer: main diagonal sums to 45; repeats allowed (see header).
  new Sum(45, 'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'),

  // Odd cells.
  new Given('R1C4', 1, 3, 5, 7),
  new Given('R2C7', 1, 3, 5, 7),
  new Given('R7C6', 1, 3, 5, 7),
];
