// Title: How Far I'll Go
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=_M2khM6l3Rs
// Source: https://sudokupad.app/rj53fjf9jo

// Rules encoded here:
//   * Normal 9x9 sudoku, standard boxes, no givens.
//   * Nurikabe: every cell is water or land ("island"). All water cells form a
//     single orthogonally connected group, and water may not fully cover any
//     2x2 area. Land cells form islands: maximal orthogonally connected groups
//     of land.
//   * Digits do not repeat within an island.
//   * Each island contains exactly one numbered clue, and that clue is the
//     product of the island's digit sum and its cell count. A "?" clue stands
//     for an unstated one-, two- or three-digit number.
//   * A cell carrying arrows has a digit equal to the number of island cells in
//     the indicated directions combined, out to the grid edge, excluding
//     itself. The cell itself may be water or land. "Not all arrows are given",
//     so unmarked cells carry no arrow rule.
// Nothing is omitted.
//
// Model: one Var per grid cell holds the label of the island that owns the
// cell, or WATER. The value range is widened to make room for the twelve
// labels; grid cells are restricted back to 1-9. Which cells are water and how
// the land splits into islands is the puzzle's deduction, so it is never
// computed here -- the solver assigns the labels.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The eleven printed island clues, transcribed from the one-cell cages of the
// drawn grid. `value` is null for the "?" clue.
const CLUES = [
  { cell: 'R1C1', value: 45 },
  { cell: 'R2C3', value: 24 },
  { cell: 'R2C8', value: 30 },
  { cell: 'R3C6', value: null },
  { cell: 'R5C6', value: 48 },
  { cell: 'R6C3', value: 30 },
  { cell: 'R6C8', value: 150 },
  { cell: 'R7C1', value: 40 },
  { cell: 'R7C4', value: 34 },
  { cell: 'R9C1', value: 12 },
  { cell: 'R9C4', value: 85 },
];

// The nine arrow cells, transcribed from the drawn stubs as (row, col) steps.
// Three of the nineteen drawn stubs re-draw a direction already on the same
// cell at a thinner stroke and are not listed twice.
const ARROWS = [
  { cell: 'R2C1', dirs: [[0, 1], [1, 1]] },
  { cell: 'R3C3', dirs: [[0, 1], [1, 0]] },
  { cell: 'R4C4', dirs: [[0, 1], [-1, 1]] },
  { cell: 'R4C8', dirs: [[-1, -1]] },
  { cell: 'R6C2', dirs: [[0, 1], [1, 0], [0, -1]] },
  { cell: 'R7C6', dirs: [[-1, 1]] },
  { cell: 'R8C8', dirs: [[0, 1], [0, -1]] },
  { cell: 'R9C8', dirs: [[0, -1]] },
  { cell: 'R9C9', dirs: [[0, -1], [-1, 0]] },
];

// Cell counts an island can have. Its digits are distinct and drawn from 1-9,
// so n cells sum to between 1+..+n and 9+..+(10-n); the clue is size x sum, so
// only the divisors of the clue that land in that window survive. A "?" clue
// restricts nothing: the largest product any island can reach is 9 x 45 = 405,
// which is already a three-digit number.
const possibleSizes = (value) => DIGITS.filter(n =>
  value === null ||
  (value % n === 0 &&
   value / n >= (n * (n + 1)) / 2 &&
   value / n <= (n * (19 - n)) / 2));

const WATER = CLUES.length + 1;
const labelOf = (index) => index + 1;

const shape = new Shape(GRID, WATER);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const island = graph.makeOverlay('VI');

// Which cells an island could reach: a connected group of n cells containing
// the clue cell reaches Manhattan distance at most n-1 from it. The bound is a
// consequence of the rules encoded below, so it only prunes.
const zoneOf = (clue) => {
  const anchor = parseCellId(clue.cell);
  const limit = Math.max(...possibleSizes(clue.value)) - 1;
  return gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    return Math.abs(row - anchor.row) + Math.abs(col - anchor.col) <= limit;
  });
};
const zones = CLUES.map(zoneOf);
const zoneSets = zones.map(zone => new Set(zone));
const clueCells = new Map(CLUES.map((clue, i) => [clue.cell, labelOf(i)]));

// Grid cells hold digits; the widened value range exists only for the labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell carries exactly one label, so the islands and the water partition
// the grid. A clue cell is pinned to its own island's label; every other cell
// may be water or belong to any island whose zone reaches it.
const labelDomain = gridCells.map(cell => new Given(
  island.at(cell),
  ...(clueCells.has(cell)
    ? [clueCells.get(cell)]
    : [WATER, ...CLUES.flatMap((clue, i) =>
        zoneSets[i].has(cell) ? [labelOf(i)] : [])])));

// Two orthogonally adjacent land cells are in the same island by definition, so
// two different island labels may never be adjacent. Without this an island
// could sit against another and the merged land group would hold two clues.
const separated = (() => {
  const key = Pair.fnToKey(
    (a, b) => a === WATER || b === WATER || a === b, geometry);
  const template = (offset) => new Pair(
    key, 'islands-separated',
    ...island.at([gridCells[0], graph.step(gridCells[0], ...offset)]));
  const targets = (offset) => island.at(
    gridCells.filter(cell => graph.step(cell, ...offset)));
  return [[0, 1], [1, 0]].map(offset =>
    island.makeReplicate(template(offset), targets(offset)));
})();

// Water is one connected group; so is each island.
const connectivity = [
  new ConnectedValues('VI', WATER),
  ...CLUES.map((clue, i) => {
    const sizes = possibleSizes(clue.value);
    // Where the clue admits only one cell count, state it here as well.
    return sizes.length === 1
      ? new ConnectedValues('VI', labelOf(i), sizes[0])
      : new ConnectedValues('VI', labelOf(i));
  }),
];

// Water may not fully cover a 2x2 area: at least one of the four labels in each
// 2x2 block is an island label.
const noWater2x2 = (() => {
  const machine = NFA.encodeSpec({
    startState: 0,
    transition: (waterSeen, value) => {
      const next = waterSeen + (value === WATER ? 1 : 0);
      return next === 4 ? undefined : next;
    },
    accept: () => true,
  }, geometry);
  const block = (cell) => graph.block(cell, 2, 2);
  return island.makeReplicate(
    new NFA(machine, 'no-2x2-water', ...island.at(block(gridCells[0]))),
    island.at(gridCells.filter(block)));
})();

// The no-repeat rule and the printed clue are both functions of the set of
// digits an island holds, so one machine per island scans its zone as
// (label, digit) pairs and accumulates that set as a 9-bit mask. Distinct
// digits make the mask's popcount the island's cell count, so the clue check is
// sum x popcount. `reading` is true while the next symbol is the digit
// belonging to the label just read.
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const islandContents = CLUES.map((clue, i) => {
  const label = labelOf(i);
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inIsland: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, inIsland: value === label };
      }
      if (!state.inIsland) {
        return { mask: state.mask, reading: false, inIsland: false };
      }
      // Grid cells never exceed 9; the wider alphabet is only for labels.
      if (value > DIGITS.length) return undefined;
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;  // digits do not repeat
      return { mask: state.mask | bit, reading: false, inIsland: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (!digits.length) return false;  // the clue cell is always on board
      if (clue.value === null) return true;
      const sum = digits.reduce((a, b) => a + b, 0);
      return sum * digits.length === clue.value;
    },
  }, geometry);
  return new NFA(machine, `island-${i + 1}-contents`,
    ...zones[i].flatMap(cell => [island.at(cell), cell]));
});

// One machine per arrow cell: it reads that cell's digit as the target, then
// walks the labels along each indicated ray to the grid edge, counting the
// non-water ones. The arrow cell is not on any ray, so it never counts itself.
const arrowCounts = ARROWS.map(arrow => {
  const machine = NFA.encodeSpec({
    startState: { target: 0, count: 0 },
    transition: (state, value) => {
      // The first symbol is the arrow cell's own digit.
      if (!state.target) {
        return value > DIGITS.length ? undefined : { target: value, count: 0 };
      }
      const count = state.count + (value === WATER ? 0 : 1);
      return count > state.target ? undefined : { target: state.target, count };
    },
    accept: (state) => state.target > 0 && state.count === state.target,
  }, geometry);
  const rays = arrow.dirs.flatMap(
    dir => graph.ray(arrow.cell, ...dir).slice(1));
  return new NFA(machine, `arrow-${arrow.cell}`,
    arrow.cell, ...island.at(rays));
});

return [
  shape,
  island.toVar('island'),
  digitDomain,
  ...labelDomain,
  ...separated,
  ...connectivity,
  noWater2x2,
  ...islandContents,
  ...arrowCounts,
];
