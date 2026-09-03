// Title: Fire and Water
// Author: Mad-Tyas
// Video: https://www.youtube.com/watch?v=HCeC3df8Lvk
// Source: https://sudokupad.app/kglg9thtij

// Rules encoded here:
//  - Normal sudoku on a 9x9 grid with the standard 3x3 boxes; no givens.
//  - Nine Fire cells: exactly one per row, per column and per box, holding a
//    complete set of the digits 1-9. Nine Water cells under the same rules.
//    A cell may be Fire and Water at once.
//  - The value of a Fire or Water cell is its digit times the minimum number of
//    orthogonal steps between its box's Fire cell and Water cell, measured
//    inside that 3x3 box; a cell that is both has value 0. Every other cell's
//    value is its digit.
//  - Killer cages: digits do not repeat, and the values sum to the printed total.
// Nothing is omitted. The one addition is the symmetry pin at the bottom, for
// the Fire/Water label swap the rules explicitly leave undetermined.

// The board carries 1-9 but the overlays need a spare symbol for "unmarked", so
// the alphabet is widened to 0-9 and the board is pinned back to 1-9 below.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Transcribed from the drawn dashed cages: total, then the cage's cells.
const CAGES = [
  [45, ['R1C3', 'R1C4', 'R2C3']],
  [41, ['R1C5', 'R2C4', 'R2C5']],
  [43, ['R8C7', 'R9C6', 'R9C7']],
  [41, ['R8C5', 'R8C6', 'R9C5']],
  [15, ['R3C1', 'R3C2', 'R4C2']],
  [17, ['R6C8', 'R7C8', 'R7C9']],
  [10, ['R3C6', 'R3C7', 'R4C6']],
  [10, ['R6C4', 'R7C3', 'R7C4']],
  [12, ['R1C7', 'R1C8', 'R2C8']],
  [12, ['R8C2', 'R9C2', 'R9C3']],
];

// Each overlay cell holds the digit of the cell when it carries that mark, and
// 0 when it does not, so the placement rules are counting rules on the overlay
// and the "complete set of 1-9" rule is a count of each digit across it.
const fire = graph.makeOverlay('VF');
const water = graph.makeOverlay('VW');

const boxes = graph.boxes();
const boxIndexOf = cell => boxes.findIndex(box => box.includes(cell));

// Position of a box's marked cell, 1..9 in the box's reading order.
const firePos = new Var('FP', 'fire cell position within its box', 9);
const waterPos = new Var('WP', 'water cell position within its box', 9);
// The per-box multiplier: the in-box step count between the two marked cells.
const boxSteps = new Var('D', 'fire-to-water step count per box', 9);

// Only cage cells need a materialised multiplier; the rest are never read.
const cageCells = [...new Set(CAGES.flatMap(([, cells]) => cells))];
const mult = graph.makeOverlay('VM', cageCells);

const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
// A box position is 1..9 in reading order.
const positionValues = digits;
// A 3x3 box has diameter 4, so the step count and every multiplier is 0..4.
const stepValues = [0, 1, 2, 3, 4];

// An overlay cell either sits out (0) or repeats its board cell's digit.
const markedIsDigit = Pair.fnToKey((mark, digit) => mark === 0 || mark === digit, shape);

// Exactly eight unmarked cells in a house is exactly one marked cell in it.
const houses = graph.rowsColumnsBoxes();
const oneMarkPerHouse = layer => houses.map(
  cells => new ContainExact('0_0_0_0_0_0_0_0', ...layer.at(cells)));

// [position, ...the box's nine overlay cells]: the marked cell is the one at
// the stated position. State is the position read first plus how many box cells
// have been consumed.
const posSpec = NFA.encodeSpec({
  startState: null,
  transition: (state, value) => {
    if (state === null) {
      return positionValues.includes(value) ? { p: value, i: 0 } : undefined;
    }
    const i = state.i + 1;
    if ((value !== 0) !== (i === state.p)) return undefined;
    return { p: state.p, i };
  },
  accept: state => state !== null && state.i === 9,
  maxDepth: 10,
}, shape);

// Row/column of a box position, 1..3 each.
const posRow = p => Math.ceil(p / 3);
const posCol = p => (p - 1) % 3 + 1;

// [firePos, waterPos, steps]: the step count is the in-box Manhattan distance
// between the two positions. A 3x3 box is convex, so no shortest orthogonal
// path between two of its cells leaves the box.
const stepsSpec = NFA.encodeSpec({
  startState: 'awaiting fire',
  transition: (state, value) => {
    if (state === 'awaiting fire') {
      return positionValues.includes(value) ? { fp: value } : undefined;
    }
    if (state.wp === undefined) {
      return positionValues.includes(value) ? { fp: state.fp, wp: value } : undefined;
    }
    const steps = Math.abs(posRow(state.fp) - posRow(state.wp))
      + Math.abs(posCol(state.fp) - posCol(state.wp));
    return steps === value ? 'done' : undefined;
  },
  accept: state => state === 'done',
  maxDepth: 3,
}, shape);

// [fire, water, boxSteps, mult] for one cell: a marked cell is multiplied by
// its box's step count, an unmarked one by 1. A cell that is both Fire and
// Water is in a box whose two marks coincide, so its step count is already 0.
const multSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, marked: value !== 0 };
    if (state.step === 1) return { step: 2, marked: state.marked || value !== 0 };
    if (state.step === 2) return { step: 3, m: state.marked ? value : 1 };
    return state.m === value ? { step: 4 } : undefined;
  },
  accept: state => state.step === 4,
  maxDepth: 4,
}, shape);

// [digit, mult, digit, mult, ...] over a cage: the products must reach the
// total. State carries the running total and the digit still awaiting its
// multiplier; the total only grows, so overshooting it is a dead branch.
const cageSpec = total => NFA.encodeSpec({
  startState: { sum: 0, d: null },
  transition: (state, value) => {
    if (state.d === null) return { sum: state.sum, d: value };
    const sum = state.sum + state.d * value;
    return sum > total ? undefined : { sum, d: null };
  },
  accept: state => state.d === null && state.sum === total,
  maxDepth: 6,
}, shape);

// Swapping the two sets leaves every value unchanged, and the rules say the
// sets cannot be told apart, so exactly one representative of each swapped pair
// is kept: the fire positions must not exceed the water positions
// lexicographically. Scans [FP1, WP1, FP2, WP2, ...]; once a box has a strictly
// smaller fire position the rest is free.
const labelPinSpec = NFA.encodeSpec({
  startState: { settled: false, p: null },
  transition: (state, value) => {
    if (state.settled) return state;
    if (state.p === null) return { settled: false, p: value };
    if (value > state.p) return { settled: true, p: null };
    if (value === state.p) return { settled: false, p: null };
    return undefined;
  },
  accept: state => state.p === null,
  maxDepth: 18,
}, shape);

return [
  shape,
  fire.toVar('fire digit (0 = not a fire cell)'),
  water.toVar('water digit (0 = not a water cell)'),
  mult.toVar('cage cell value multiplier'),
  firePos,
  waterPos,
  boxSteps,

  graph.makeReplicate(new Given(graph.cells()[0], ...digits)),
  ...firePos.cells().map(cell => new Given(cell, ...positionValues)),
  ...waterPos.cells().map(cell => new Given(cell, ...positionValues)),
  ...boxSteps.cells().map(cell => new Given(cell, ...stepValues)),
  ...mult.cells().map(cell => new Given(cell, ...stepValues)),

  ...graph.cells().map(
    cell => new Pair(markedIsDigit, 'fire digit', fire.at(cell), cell)),
  ...graph.cells().map(
    cell => new Pair(markedIsDigit, 'water digit', water.at(cell), cell)),
  ...oneMarkPerHouse(fire),
  ...oneMarkPerHouse(water),
  new ContainExact('1_2_3_4_5_6_7_8_9', ...fire.cells()),
  new ContainExact('1_2_3_4_5_6_7_8_9', ...water.cells()),

  ...boxes.map((cells, i) => new NFA(
    posSpec, 'fire position', firePos.cell(i + 1), ...fire.at(cells))),
  ...boxes.map((cells, i) => new NFA(
    posSpec, 'water position', waterPos.cell(i + 1), ...water.at(cells))),
  ...boxes.map((cells, i) => new NFA(
    stepsSpec, 'box step count',
    firePos.cell(i + 1), waterPos.cell(i + 1), boxSteps.cell(i + 1))),

  ...cageCells.map(cell => new NFA(
    multSpec, 'cell multiplier',
    fire.at(cell), water.at(cell),
    boxSteps.cell(boxIndexOf(cell) + 1), mult.at(cell))),

  // "digits must not repeat"; the cage total is the value NFA below.
  ...CAGES.map(([, cells]) => new AllDifferent(...cells)),
  ...CAGES.map(([total, cells]) => new NFA(
    cageSpec(total), `cage ${total}`,
    ...cells.flatMap(cell => [cell, mult.at(cell)]))),

  new NFA(labelPinSpec, 'fire/water label pin',
    ...boxes.flatMap((_, i) => [firePos.cell(i + 1), waterPos.cell(i + 1)])),
];
