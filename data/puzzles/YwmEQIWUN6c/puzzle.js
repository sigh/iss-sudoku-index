// Title: Odd Pentominoes On The Loose
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=YwmEQIWUN6c
// Source: https://app.crackingthecryptic.com/sudoku/tbdnBm9fJp

// Rules encoded here:
//   Normal sudoku rules apply. A pentomino is a set of 5 orthogonally
//   connected cells. There are exactly 12 different possible pentomino shapes
//   (treating reflections/rotations as equivalent). Arrange all 12 pentominoes
//   in the grid so that 9 of them contain only odd digits. Digits CAN repeat
//   inside a pentomino. Pairs of cells connected by an X or V sum to 10 or 5
//   respectively AND belong to two separate pentominoes. Not every X and V is
//   given. Along the thermometer, digits increase from the bulb end.
//
// "Not every X and V is given" switches off the usual negative constraint, so
// only the drawn X/V pairs are constrained (no StrictXV).
//
// The 12 pentominoes are placed disjointly and need not cover the grid: 12 x 5
// = 60 of the 81 cells are in a pentomino.

const PENTOMINO_SIZE = 5;
const NUM_PENTOMINOES = 12;

// Pentomino membership is a Var label per grid cell: 1..12 name which of the
// 12 free pentominoes the cell belongs to, and 13 means "in no pentomino".
// The digit alphabet is widened to 13 values to carry those labels, so the
// grid cells are restricted back to 1-9 below.
const UNUSED = NUM_PENTOMINOES + 1;
const MIXED = 1;   // odd-flag values, held in the VF cells
const ALL_ODD = 2;

const shape = new Shape('9x9', `1-${UNUSED}`);
const graph = cellGraph(shape);
const gridCells = graph.cells();
const pent = graph.makeOverlay('VP');

// One flag cell per pentomino, MIXED or ALL_ODD.
const oddFlags = new Var('F', 'oddFlag', NUM_PENTOMINOES);
const flagCells = oddFlags.cells();

// --- The 12 pentomino shapes, and where each one can sit on the grid. ---
// Derived from the rules' own definition (5 orthogonally connected cells,
// rotations and reflections equivalent) rather than transcribed, by growing
// polyominoes cell by cell and keeping one representative per free shape.
// The sort makes the shape list, and so the label each shape gets, canonical.

const normalize = (cells) => {
  const minRow = Math.min(...cells.map(([r]) => r));
  const minCol = Math.min(...cells.map(([, c]) => c));
  return cells.map(([r, c]) => [r - minRow, c - minCol])
    .sort(([r1, c1], [r2, c2]) => r1 - r2 || c1 - c2);
};
const formKey = (cells) => JSON.stringify(cells);
const rotate = (cells) => normalize(cells.map(([r, c]) => [c, -r]));
const reflect = (cells) => normalize(cells.map(([r, c]) => [r, -c]));

const orientations = (cells) => {
  const seen = new Map();
  let current = normalize(cells);
  for (let i = 0; i < 4; i++) {
    seen.set(formKey(current), current);
    const mirrored = reflect(current);
    seen.set(formKey(mirrored), mirrored);
    current = rotate(current);
  }
  return [...seen.values()];
};

const grow = (forms) => {
  const grown = new Map();
  for (const cells of forms) {
    for (const [r, c] of cells) {
      for (const [dRow, dCol] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const [newRow, newCol] = [r + dRow, c + dCol];
        if (cells.some(([r2, c2]) => r2 === newRow && c2 === newCol)) continue;
        const form = normalize([...cells, [newRow, newCol]]);
        grown.set(formKey(form), form);
      }
    }
  }
  return [...grown.values()];
};

const freePentominoes = () => {
  let forms = [[[0, 0]]];
  for (let i = 1; i < PENTOMINO_SIZE; i++) forms = grow(forms);
  const free = new Map();
  for (const form of forms) {
    const canonical = orientations(form).map(formKey).sort()[0];
    if (!free.has(canonical)) free.set(canonical, JSON.parse(canonical));
  }
  return [...free.keys()].sort().map(key => free.get(key));
};

// Every position of every orientation that fits inside the 9x9 grid, as a
// list of cell ids. 3139 placements over the 12 shapes.
const placements = (form) => orientations(form).flatMap((orientation) => {
  const height = Math.max(...orientation.map(([r]) => r)) + 1;
  const width = Math.max(...orientation.map(([, c]) => c)) + 1;
  const positions = [];
  for (let row = 1; row + height - 1 <= graph.gridGeometry().numRows; row++) {
    for (let col = 1; col + width - 1 <= graph.gridGeometry().numCols; col++) {
      positions.push(orientation.map(
        ([dRow, dCol]) => makeCellId(row + dRow, col + dCol)));
    }
  }
  return positions;
});

const pentominoes = freePentominoes();

// --- Odd-flag state machine ---
// Reads one pentomino's flag cell, then the whole board as
// (label, digit) pairs, and ties the flag to that pentomino's digits:
// ALL_ODD exactly when no cell carrying this label holds an even digit.
// `pending` is null while the next symbol is a label, and otherwise records
// whether the label just read was this pentomino's.
const oddFlagMachine = (label) => NFA.encodeSpec({
  startState: { flag: null, pending: null, sawEven: false },
  transition: ({ flag, pending, sawEven }, value) => {
    if (flag === null) return { flag: value, pending: null, sawEven: false };
    if (pending === null) return { flag, pending: value === label, sawEven };
    const seen = sawEven || (pending && value % 2 === 0);
    if (flag === ALL_ODD && seen) return undefined;
    return { flag, pending: null, sawEven: seen };
  },
  accept: ({ flag, pending, sawEven }) =>
    pending === null && (flag === ALL_ODD ? !sawEven : sawEven),
}, shape);

const boardScan = gridCells.flatMap(cell => [pent.at(cell), cell]);

const digits = Array.from({ length: 9 }, (_, i) => i + 1);

// --- Drawn clues, transcribed from the X/V symbols and the thermometer. ---
const xPairs = [
  ['R1C3', 'R2C3'],
  ['R2C5', 'R3C5'],
  ['R4C1', 'R5C1'],
  ['R4C4', 'R5C4'],
  ['R6C1', 'R7C1'],
  ['R6C5', 'R7C5'],
  ['R8C5', 'R9C5'],
];
const vPairs = [
  ['R1C7', 'R2C7'],
  ['R3C5', 'R3C6'],
  ['R3C8', 'R3C9'],
  ['R5C3', 'R6C3'],
  ['R6C5', 'R6C6'],
  ['R8C4', 'R8C5'],
];
const thermo = ['R7C8', 'R8C9', 'R9C8'];   // bulb (circle) at R7C8

// Both cells of an X or V are in a pentomino, and in different ones.
const separatePentominoes = Pair.fnToKey(
  (a, b) => a !== UNUSED && b !== UNUSED && a !== b, shape);

return [
  shape,
  pent.toVar('pentomino'),
  oddFlags,

  // Grid cells hold real digits; flag cells hold only the two flag values.
  graph.makeReplicate(new Given(gridCells[0], ...digits)),
  ...flagCells.map(cell => new Given(cell, MIXED, ALL_ODD)),

  // Each label marks exactly one connected 5-cell region, and that region is
  // the placement chosen by the matching Or below.
  ...pentominoes.map((_, i) =>
    new ConnectedValues('VP', i + 1, PENTOMINO_SIZE)),
  ...pentominoes.map((form, i) => new Or(
    placements(form).map(cells => new And(
      pent.at(cells).map(labelCell => new Given(labelCell, i + 1)))))),

  // Exactly 9 of the 12 flags are ALL_ODD (= 2), the other 3 MIXED (= 1).
  new Sum(9 * ALL_ODD + 3 * MIXED, ...flagCells),
  ...pentominoes.map((_, i) => new NFA(
    oddFlagMachine(i + 1), `oddFlag${i + 1}`, flagCells[i], ...boardScan)),

  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
  ...[...xPairs, ...vPairs].map((cells, i) => new Pair(
    separatePentominoes, `xv${i + 1}`, ...pent.at(cells))),

  new Thermo(...thermo),
];
