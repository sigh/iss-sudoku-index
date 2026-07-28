// Title: Three-Sums
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=YROLYwkhj4E
// Source: https://sudokupad.app/myzopzm5k3

// A parallel adjustment cell is 0 normally and 3 at a three-sum cell. Adding
// the adjustment to its Sudoku digit gives the value used by blue lines.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();
const adjustment = graph.makeOverlay('VA');
const adjustmentAt = cell => adjustment.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, adjustmentAt(cell)]);
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const gridDigitDomain = graph.makeReplicate(
  new Given(gridCells[0], ...DIGITS));

// Exactly one adjustment of 3 in every row, column, and box.
const oneThreeSumPerHouse = graph.rowsColumnsBoxes().map(
  cells => new ContainExact('3', ...adjustment.at(cells)));

// Each row's scan also copies its unique three-sum digit into a capture cell.
// AllDifferent over the nine captures makes digits 1-9 three-sums exactly once.
const threeSumDigits = new Var('VT', 'three-sum digit by row', 9);
const rowThreeSumSpec = NFA.encodeSpec({
  startState: { phase: 'digit', pairsLeft: 9, found: null },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { ...state, phase: 'adjustment', digit: value };
    }
    if (state.phase === 'adjustment') {
      const found = value === 3 ? state.digit : state.found;
      const pairsLeft = state.pairsLeft - 1;
      return {
        phase: pairsLeft === 0 ? 'capture' : 'digit',
        pairsLeft,
        found,
      };
    }
    if (state.phase === 'capture') {
      return value === state.found ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, shape);

const rowThreeSums = graph.rows().map((row, index) => new NFA(
  rowThreeSumSpec,
  `row ${index + 1} three-sum`,
  ...interleave(row),
  threeSumDigits.cell(index + 1)));

// Contiguous portions in the same 3x3 box are one region-sum segment.
const lineSegments = [
  [['R4C1'], ['R3C1', 'R2C1', 'R2C2', 'R3C2']],
  [['R3C4', 'R2C4'], ['R1C3'], ['R1C4', 'R1C5']],
  [['R1C9', 'R1C8', 'R1C7'], ['R2C6'], ['R2C7', 'R2C8', 'R2C9']],
  [['R3C9'], ['R4C9'], ['R3C8'], ['R4C7', 'R5C7', 'R6C7']],
  [['R6C8'], ['R7C8', 'R7C9', 'R8C8']],
  [['R8C4', 'R8C5', 'R8C6'], ['R8C7'], ['R9C6', 'R9C5', 'R9C4']],
  [['R9C2', 'R8C3'], ['R7C4'], ['R6C5', 'R6C6'], ['R7C7']],
  [['R7C4'], ['R7C3', 'R7C2']],
  [['R4C3', 'R5C3'], ['R5C4', 'R5C5']],
];
const effectiveTerms = cells => [...cells, ...adjustment.at(cells)];
const regionSumLines = lineSegments.map(segments => new EqualSum(
  ...segments.map(effectiveTerms)));

return [
  shape,
  gridDigitDomain,
  adjustment.toVar('three-sum adjustment'),
  adjustment.makeReplicate(
    new Given(adjustmentAt(gridCells[0]), 0, 3),
    adjustment.at(gridCells)),
  ...oneThreeSumPerHouse,
  threeSumDigits,
  ...threeSumDigits.cells().map(cell => new Given(cell, ...DIGITS)),
  ...rowThreeSums,
  new AllDifferent(...threeSumDigits.cells()),
  ...regionSumLines,
];
