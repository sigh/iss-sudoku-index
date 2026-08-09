// Title: Overheating
// Author: Christounet
// Video: https://www.youtube.com/watch?v=hg7O30Op6SQ
// Source: https://app.crackingthecryptic.com/sudoku/mGLB4pqJt4

// Rules encoded here:
//   DECONSTRUCTION  nine non-overlapping 3x3 boxes sit somewhere in the 11x11
//                   grid (only "non-overlapping" is stated -- no restriction
//                   against two boxes touching). Each box holds 1-9 once;
//                   digits do not repeat in a row or column. A cell outside
//                   every box holds no digit.
//   THERMOMETERS    15 thermometers; digits strictly increase from the round
//                   bulb end to the tip. Several drawn paths cross cells that
//                   the Deconstruction rule can leave outside every box, and
//                   the rules text states "cells outside regions do not
//                   contain digits" -- a cell with no digit carries nothing
//                   for a rule about digits increasing, so it is skipped:
//                   the check applies to the subsequence of cells the path
//                   actually fills, in path order.
// Nothing is omitted.
//
// Cells outside every box are blank, so the grid is Raw: no implicit
// constraints. A second Var layer tracks box placement:
//   VL  each cell's position inside its box: 0 if blank, else 1 + 3*rowOffset +
//       colOffset for offsets 0-2
const shape = new Shape('11x11', '0-9', 'Raw');
const grid = cellGraph(shape);
const label = grid.makeOverlay('VL');
const labelVars = label.toVar('Box labels');

// ---- Deconstruction: nine non-overlapping 3x3 boxes. VL steps by 1
// rightwards and by 3 downwards inside a box; at a box's trailing edge (or
// outside any box) the next cell either is blank or starts a new box.
const rowOffset = a => ((a - 1) / 3) | 0;
const colOffset = a => (a - 1) % 3;

const labelAcross = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || colOffset(b) === 0)
    : colOffset(a) < 2 ? b === a + 1
      : (b === 0 || colOffset(b) === 0), shape);
const labelDown = Pair.fnToKey((a, b) =>
  a === 0 ? (b === 0 || rowOffset(b) === 0)
    : rowOffset(a) < 2 ? b === a + 3
      : (b === 0 || rowOffset(b) === 0), shape);
// A cell is blank exactly when it lies in no box.
const emptyIff = Pair.fnToKey((d, l) => (d === 0) === (l === 0), shape);
// No row or column repeats a digit; blank cells (0) are exempt.
const noRepeat = PairX.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);

const labelRuns = [
  ...grid.rows().map((cells, i) => new Pair(labelAcross, `across${i + 1}`, ...label.at(cells))),
  ...grid.columns().map((cells, i) => new Pair(labelDown, `down${i + 1}`, ...label.at(cells))),
];
// A box cannot run off the grid, so the border rows/columns can only hold the
// labels of a box's leading or trailing edge.
const labelBorders = [
  ...label.at(grid.row(1)).map(c => new Given(c, 0, 1, 2, 3)),
  ...label.at(grid.row(11)).map(c => new Given(c, 0, 7, 8, 9)),
  ...label.at(grid.column(1)).map(c => new Given(c, 0, 1, 4, 7)),
  ...label.at(grid.column(11)).map(c => new Given(c, 0, 3, 6, 9)),
];
const emptyLinks = grid.cells().map(
  c => new Pair(emptyIff, 'empty', c, label.at(c)));
// Exactly nine cells carry label 1, i.e. there are exactly nine boxes.
const nineBoxes = new ContainExact(Array(9).fill(1).join('_'), ...label.cells());

// Wherever a box starts (label 1), its nine cells are non-blank (emptyLinks)
// and all different, which over a 9-value domain forces them to be 1-9.
const boxDigits = grid.cells().flatMap(topLeft => {
  const block = grid.block(topLeft, 3, 3);
  if (block === null) return [];
  return [new Or([
    new Given(label.at(topLeft), 0, 2, 3, 4, 5, 6, 7, 8, 9),
    new AllDifferent(...block)])];
});

const rowsAndCols = [
  ...grid.rows().map((cells, i) => new PairX(noRepeat, `row${i + 1}`, ...cells)),
  ...grid.columns().map((cells, i) => new PairX(noRepeat, `col${i + 1}`, ...cells)),
];

// ---- Thermometers: transcribed bulb-first from the drawn lines; each bulb
// cell is confirmed by a drawn circle underlay at that cell.
// Rows/columns 10 and 11 use the solver's base-36 cell-id digits ('a', 'b')
// rather than two-digit decimal, per makeCellId.
const THERMOS = [
  ['R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R6C6', 'R5C6', 'R5C5', 'R6C5', 'R7C6', 'R6C7', 'R5C7', 'R4C6', 'R4C5', 'R5C4', 'R6C4', 'R7C4', 'R8C5', 'R7C5', 'R8C6', 'R8C7', 'R7C8', 'R7C7', 'R6C8', 'R5C8', 'R4C7'],
  ['R6C2', 'R7C2', 'R6C1', 'R5C2'],
  ['R2C7', 'R1C6', 'R2C5', 'R2C6'],
  ['RaC7', 'RaC6', 'RaC5', 'RbC6'],
  ['RbCa', 'RbC9', 'RaC8', 'RaC9', 'R9Ca', 'R8Ca', 'R9Cb'],
  ['RaCa', 'RbCb', 'RaCb'],
  ['R9C1', 'R8C2', 'R9C2'],
  ['RbC3', 'RaC4', 'RaC3'],
  ['R2C9', 'R2C8', 'R1C9'],
  ['R3Ca', 'R4Ca', 'R3Cb'],
  ['R3C2', 'R4C1', 'R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R1C4', 'R2C3'],
  ['R6Cb', 'R7Ca', 'R6Ca'],
  ['R6Cb', 'R5Ca'],
];
// Scans a path bulb-to-tip carrying the last digit seen (null before any
// digit); a blank (0) leaves the state unchanged, a digit must exceed the
// last one seen (or be the first) and becomes the new last. Always
// acceptable once the whole path is read -- there is no end condition
// beyond never failing the increase check.
const thermoMachine = NFA.encodeSpec({
  startState: null,
  transition: (last, v) => {
    if (v === 0) return last;
    if (last !== null && v <= last) return undefined;
    return v;
  },
  accept: () => true,
}, shape);
const thermos = THERMOS.map(
  (path, i) => new NFA(thermoMachine, `thermo${i + 1}`, ...path));

return [
  shape,
  labelVars,
  ...labelRuns,
  ...labelBorders,
  ...emptyLinks,
  nineBoxes,
  ...boxDigits,
  ...rowsAndCols,
  ...thermos,
];
