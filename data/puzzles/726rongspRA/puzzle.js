// Title: Fog and Phantoms: Raising Sails
// Author: DubiousMobius
// Video: https://www.youtube.com/watch?v=726rongspRA
// Source: https://sudokupad.app/t6465th9zv

// Rules encoded here:
//   * 6x6 sudoku: 1-6 once each per row, column and 2x3 box. One given, R2C3=3.
//   * Nurikabe: every cell is sea or island. The sea is a single orthogonally
//     connected set. Every 2x2 block of the grid holds at least one island cell.
//   * Each group of orthogonally connected island cells holds at least one cell
//     whose digit equals the number of cells in that group, and every cell of
//     which that is true carries a circle. Six circles are drawn.
//   * Arrows: the digits along an arrow sum to the digit in the circle the arrow
//     is attached to. The cell at an arrow's tip is sea, and its digit counts the
//     island cells among the (up to) 8 cells surrounding it.
// Read literally, the circle rule only says that every "digit equals its own
// island's size" cell is circled. The converse is what makes the drawn circles
// clues, and it is what is encoded: a circled cell is an island cell whose digit
// is its island's size. A sea cell belongs to no island, so no circled cell may
// be sea; the rules mark sea-ness explicitly where they mean it ("the cell at
// the tip of an arrow will always be part of the sea").
// The fog of war, the phantom clues that surface only as cells are shaded, and
// the pen-tool note are solving UI: they hide drawn clues and place no condition
// on the finished grid, so they are not encoded.
// "Arrows only move orthogonally, and cannot branch, except at a circle"
// describes the drawn arrows, which are transcribed below; R5C5 is the circle
// two arrows leave.
// Nothing is omitted.

// The six drawn circles, in reading order. Four are grey rings; R5C5 carries a
// grey ring and a white one (one per attached arrow); R1C2's is white only.
const CIRCLES = ['R1C2', 'R1C5', 'R3C2', 'R3C6', 'R5C5', 'R6C2'];

// The six drawn arrows: circle cell first, then the line cells in drawn order,
// ending at the arrowhead. Five are grey; the sixth, R5C5 -> R5C6 -> R6C6, is
// drawn in white with the same bulb, line and arrowhead shapes.
const ARROWS = [
  ['R1C5', 'R2C5', 'R2C4'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R3C6', 'R4C6', 'R4C5'],
  ['R5C5', 'R5C4', 'R5C3'],
  ['R5C5', 'R5C6', 'R6C6'],
  ['R6C2', 'R6C1', 'R5C1', 'R5C2'],
];

const DIGITS = [1, 2, 3, 4, 5, 6];
const MAX_DIGIT = 6;   // also the largest island any circled digit can name
const SEA = 1;         // shading-layer value for a sea cell
const LABEL = 2;       // island labels run LABEL .. LABEL + CIRCLES.length - 1
const LABELS = CIRCLES.map((_, i) => LABEL + i);
const UNUSED = LABEL + CIRCLES.length;  // inert filler on the layer's spare rows

// Values 1-8 exist only for the shading layer; the grid keeps 1-6 (below).
const shape = new Shape('6x6', UNUSED);
const graph = cellGraph(shape);
const gridCells = graph.cells();

// The shading layer is 8 rows of 6: rows 1-6 shadow the grid and hold SEA or an
// island label, row 7 is an inert buffer, and row 8 parks the labels of islands
// that do not exist. ConnectedValues rejects a value that no cell holds, so each
// label needs somewhere to sit when its circle turns out to share an island with
// an earlier circle's; the buffer row keeps a parked label from touching the
// grid and so from joining a real island's region.
const BUFFER_ROW = 7;
const PARK_ROW = 8;
const layerGraph = cellGraph(cellGeometry(PARK_ROW, 6));
const layer = layerGraph.makeOverlay('VL');
const shading = layer.toVar('nurikabe-shading');

const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

const layerDomain = [
  ...gridCells.map(cell => new Given(layer.at(cell), SEA, ...LABELS)),
  ...graph.row(1).map(
    (_, i) => new Given(shading.cell(BUFFER_ROW, i + 1), UNUSED)),
  ...CIRCLES.map(
    (_, i) => new Given(shading.cell(PARK_ROW, i + 1), LABELS[i], UNUSED)),
];

// A circled cell is an island cell (see the header). Its label is that of the
// island it sits in, and an island is labelled for the first of its circles in
// reading order -- a canonical choice among the CIRCLES.length! ways to name the
// islands, which the rules do not name and which would otherwise multiply
// solutions. Together with the parking pairs below it makes the labelling of any
// legal shading unique.
const circleLabels = CIRCLES.map(
  (cell, i) => new Given(layer.at(cell), ...LABELS.slice(0, i + 1)));

// Label i names an island exactly when circle i is the one that island is named
// for; otherwise it is parked off the grid.
const parking = CIRCLES.map((cell, i) => new Pair(
  Pair.fnToKey((a, b) => (a === LABELS[i]) === (b !== LABELS[i]), shape),
  `label-${i + 1}-parked-when-unused`,
  layer.at(cell), shading.cell(PARK_ROW, i + 1)));

// Two island cells that touch are in the same island, so they carry one label.
const oneLabelPerIsland = (() => {
  const isLabel = (v) => v >= LABEL && v < UNUSED;
  const key = Pair.fnToKey(
    (a, b) => !(isLabel(a) && isLabel(b) && a !== b), shape);
  return gridCells.flatMap(cell => graph.neighbours(cell)
    .filter(other => other > cell)
    .map(other => new Pair(key, 'touching-island-cells-are-one-island',
      ...layer.at([cell, other]))));
})();

// The sea is one connected set; each island label names one connected group.
const connectivity = [
  new ConnectedValues('VL', SEA),
  ...LABELS.map(label => new ConnectedValues('VL', label)),
];

// Every 2x2 block of the grid holds at least one island cell.
const noSeaBlock = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(block => block !== null)
  .map(block => new Or(layer.at(block).map(
    varCell => new Given(varCell, ...LABELS))));

// One machine per island label, scanning (label, digit) for every grid cell:
// the circled cells first, then the rest. `target` is the digit of the first
// circled cell found in this island -- its island's size -- and `count` is how
// many cells the island turned out to have. A further circled cell in the same
// island must repeat that digit, and an uncircled one must not hold it, since
// the drawn circles are exactly the cells whose digit is their island's size.
// A label with cells but no circle is rejected on the spot: every island holds
// at least one circle.
const circleSet = new Set(CIRCLES);
const otherCells = gridCells.filter(cell => !circleSet.has(cell));
const scan = (cells) => cells.flatMap(cell => [layer.at(cell), cell]);
const islandSizes = LABELS.map(label => {
  const machine = NFA.encodeSpec({
    startState: { phase: 0, reading: false, inIsland: false, count: 0, target: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return { ...state, phase: 1 };
      if (!state.reading) {
        return { ...state, reading: true, inIsland: value === label };
      }
      if (!state.inIsland) return { ...state, reading: false, inIsland: false };
      if (value > MAX_DIGIT) return undefined;  // the grid holds only 1-6
      const count = state.count + 1;
      if (count > MAX_DIGIT) return undefined;  // no digit can name a bigger island
      const rest = { reading: false, inIsland: false, count };
      if (state.phase === 0) {
        const target = state.target === 0 ? value : state.target;
        if (value !== target) return undefined;
        return { ...rest, phase: 0, target };
      }
      if (state.target === 0) return undefined;  // an island with no circle
      if (value === state.target) return undefined;  // would have to be circled
      return { ...rest, phase: 1, target: state.target };
    },
    accept: (state) => !state.reading && state.count === state.target,
    maxDepth: 2 * gridCells.length + 1,  // one symbol per scanned cell, plus the break
  }, shape, { multiSegment: true });
  return new NFA(machine, `island-${label - LABEL + 1}-size`,
    scan(CIRCLES), scan(otherCells));
});

// An arrow's line sums to its circle, its tip is sea, and the tip's digit counts
// the island cells among the cells surrounding it.
const arrows = ARROWS.map(cells => new Arrow(...cells));
const tips = ARROWS.map(cells => cells[cells.length - 1]);
const tipsAreSea = tips.map(tip => new Given(layer.at(tip), SEA));
const tipCounts = tips.map(tip => {
  const around = graph.kingNeighbours(tip);
  const machine = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) return state;
      if (state.target === null) return { target: value, count: 0 };
      const hit = value >= LABEL && value < UNUSED ? 1 : 0;
      // target + 1 is a sink meaning "already too many".
      return {
        target: state.target,
        count: Math.min(state.count + hit, state.target + 1),
      };
    },
    accept: (state) => state.target !== null && state.count === state.target,
    maxDepth: around.length + 2,  // the tip's digit, the break, then its neighbours
  }, shape, { multiSegment: true });
  return new NFA(machine, `tip-${tip}-counts-island-neighbours`,
    [tip], layer.at(around));
});

return [
  shape,
  shading,
  digitDomain,
  new Given('R2C3', 3),
  ...layerDomain,
  ...circleLabels,
  ...parking,
  ...oneLabelPerIsland,
  ...connectivity,
  ...noSeaBlock,
  ...islandSizes,
  ...arrows,
  ...tipsAreSea,
  ...tipCounts,
];
