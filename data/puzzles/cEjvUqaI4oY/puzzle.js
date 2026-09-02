// Title: Pentomino Loop Sudoku
// Author: Jeremy Butler
// Video: https://www.youtube.com/watch?v=cEjvUqaI4oY
// Source: https://app.crackingthecryptic.com/webapp/2DTRn7hQqH

// Normal sudoku rules apply.
//
// Ten different pentominoes are placed in the grid. "Different" is up to
// rotation and reflection, so the ten are ten of the twelve free pentominoes.
// They do not overlap and they never cover a given digit.
//
// A pentomino acts as a killer cage: its five digits are all different and add
// up to the number printed in the corner of one of its cells. A letter printed
// in the corner of a cell names the shape of the pentomino covering that cell.
// Every clue speaks about the pentomino covering the clue's own cell; the
// pentominoes are not drawn, so no clue is anchored to a particular cell of its
// pentomino.
//
// NOT ENCODED (the loop):
//   - Each pentomino touches exactly two other pentominoes orthogonally.
//   - Two pentominoes may touch only on one edge of one cell.
//   - The ten pentominoes therefore form a single loop.

// Drawn data, transcribed from the board.
// Given digits (plain numbers printed in cells):
const GIVENS = [
  ['R2C1', 2], ['R2C8', 7], ['R3C5', 4], ['R4C1', 8], ['R4C3', 3],
  ['R4C4', 4], ['R4C6', 7], ['R4C9', 5], ['R5C5', 5], ['R6C5', 9],
  ['R6C9', 7], ['R7C1', 1], ['R7C9', 8], ['R8C3', 8], ['R9C5', 2],
];

// Corner clues, each read as the cell it is drawn inside. Numbers give that
// cell's pentomino's digit sum; letters give that cell's pentomino's shape.
const SUM_CLUES = [
  ['R1C3', 27], ['R2C6', 15], ['R3C1', 28], ['R3C8', 27], ['R5C2', 19],
  ['R5C8', 16], ['R7C5', 27], ['R7C6', 24], ['R8C2', 23], ['R8C8', 18],
];
const LETTER_CLUES = [
  ['R1C2', 'L'], ['R1C6', 'P'], ['R3C9', 'U'], ['R7C3', 'W'], ['R8C7', 'X'],
];

// The twelve free pentominoes, one representative orientation each, as
// [row, col] offsets. Standard naming; the letters the board prints are five of
// these keys.
const PENTOMINOES = {
  F: [[0, 1], [0, 2], [1, 0], [1, 1], [2, 1]],
  I: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]],
  L: [[0, 0], [1, 0], [2, 0], [3, 0], [3, 1]],
  N: [[0, 1], [1, 1], [2, 0], [2, 1], [3, 0]],
  P: [[0, 0], [0, 1], [1, 0], [1, 1], [2, 0]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1], [2, 1]],
  U: [[0, 0], [0, 2], [1, 0], [1, 1], [1, 2]],
  V: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]],
  W: [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2]],
  X: [[0, 1], [1, 0], [1, 1], [1, 2], [2, 1]],
  Y: [[0, 1], [1, 0], [1, 1], [2, 1], [3, 1]],
  Z: [[0, 0], [0, 1], [1, 1], [2, 1], [2, 2]],
};
const SHAPE_NAMES = Object.keys(PENTOMINOES);

// Value range: the widest quantity stored in a Var is the shape index, 1..12.
const NUM_VALUES = SHAPE_NAMES.length;

const rangeI = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const graph = cellGraph('9x9');

// Owner overlay: one Var per grid cell holding UNCOVERED, or 1 + the index of
// the sum clue whose pentomino covers it. Two pentominoes claiming one cell
// would need two different values there, so this layer is what keeps them
// disjoint.
const UNCOVERED = 1;
const owner = graph.makeOverlay('VO');
const ownerLabel = (clueIndex) => UNCOVERED + 1 + clueIndex;

// One Var per sum clue holding its pentomino's shape index into SHAPE_NAMES.
const shapeVar = new Var('S', 'pentomino shape', SUM_CLUES.length);

const givenCells = new Set(GIVENS.map(([cell]) => cell));
const letterAt = new Map(LETTER_CLUES);

// All placements of one free pentomino: the 8 rotations/reflections of its
// representative, at every grid position, dropping any that covers a given.
const placementsOf = (name) => {
  const normalize = (cells) => {
    const minR = Math.min(...cells.map(([r]) => r));
    const minC = Math.min(...cells.map(([, c]) => c));
    return cells.map(([r, c]) => [r - minR, c - minC])
      .sort(([r1, c1], [r2, c2]) => (r1 - r2) || (c1 - c2));
  };
  const orientations = new Map();
  let current = PENTOMINOES[name];
  for (let i = 0; i < 4; i++) {
    current = current.map(([r, c]) => [c, -r]);          // rotate 90 degrees
    for (const variant of [current, current.map(([r, c]) => [r, -c])]) {
      const cells = normalize(variant);
      orientations.set(JSON.stringify(cells), cells);
    }
  }

  const placements = [];
  for (const cells of orientations.values()) {
    const height = Math.max(...cells.map(([r]) => r)) + 1;
    const width = Math.max(...cells.map(([, c]) => c)) + 1;
    for (let r0 = 1; r0 + height - 1 <= 9; r0++) {
      for (let c0 = 1; c0 + width - 1 <= 9; c0++) {
        const ids = cells.map(([r, c]) => makeCellId(r0 + r, c0 + c));
        if (ids.some(id => givenCells.has(id))) continue;
        placements.push(ids);
      }
    }
  }
  return placements;
};

const ALL_PLACEMENTS = SHAPE_NAMES.flatMap(
  name => placementsOf(name).map(cells => ({ name, cells })));

// The candidates for one sum clue: every placement covering that clue's cell
// whose shape agrees with any letter clue it also covers.
const candidatesFor = (clueCell) => ALL_PLACEMENTS.filter(
  ({ name, cells }) => cells.includes(clueCell)
    && cells.every(cell => !letterAt.has(cell) || letterAt.get(cell) === name));

// Coverage total. The ten pentominoes pin 50 owner cells, five to each label
// 2..11, contributing 5 * (2 + ... + 11) = 325. Every other owner cell is at
// least UNCOVERED = 1, so the 81 cells total at least 325 + 31 = 356, with
// equality only when each unclaimed cell is exactly UNCOVERED. Fixing the total
// is what makes "this cell is covered" (below) mean something.
const COVERAGE_TOTAL = 325 + (81 - 5 * SUM_CLUES.length) * UNCOVERED;

return [
  new Shape('9x9', NUM_VALUES),
  // The grid is a 1-9 sudoku; only the Var layers use the wider range.
  graph.makeReplicate(new Given(graph.cells()[0], ...rangeI(1, 9))),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),

  owner.toVar('pentomino owner'),
  shapeVar,
  // Ten different pentominoes.
  new AllDifferent(...shapeVar.cells()),
  new Sum(COVERAGE_TOTAL, ...owner.cells()),

  // A letter clue describes the pentomino covering its cell, so that cell is
  // covered; which shape it must be is already in every candidate list.
  ...LETTER_CLUES.map(([cell]) =>
    new Given(owner.at(cell), ...rangeI(UNCOVERED + 1, ownerLabel(SUM_CLUES.length - 1)))),

  // One pentomino per sum clue, chosen from that clue's candidates: the killer
  // cage over the placement's cells, the owner label on those cells, and the
  // shape it used.
  ...SUM_CLUES.map(([clueCell, total], i) => new Or(
    candidatesFor(clueCell).map(({ name, cells }) => new And([
      new Cage(total, ...cells),
      ...cells.map(cell => new Given(owner.at(cell), ownerLabel(i))),
      new Given(shapeVar.cell(i + 1), SHAPE_NAMES.indexOf(name) + 1),
    ]))
  )),
];
