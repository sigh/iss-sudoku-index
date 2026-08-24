// Title: When X-Sums Meet Killer
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=KiyWaXawodE
// Source: https://app.crackingthecryptic.com/sudoku/nFgHGGgPhD

// Rules encoded here:
//   * Normal sudoku.
//   * A clue outside the grid is an X-Sum: the first X digits of that
//     row/column, counted from the clue's side, add to the clue, where X is the
//     digit in the cell nearest the clue.
//   * Seven killer cages are drawn only by their totals: digits in a cage are
//     distinct and add to the total, the total sits in the cage's top-left
//     corner cell, and cages may not overlap. Their cells are for the solver to
//     find.
//   * Each cage is colour-matched to one X-Sum clue, and holds exactly X cells
//     for that clue's X.
// The clause "each cage is in the same row or column as its associated X-Sum
// clue" is encoded only as the drawn placement of the corner cell, which lies
// on that clue's line in all seven cases. The stronger reading, that the whole
// cage stays on that line, is not encodable here: taking the grey cage as the
// six cells R2C2-R2C7 forces R2C1=6, R2C7=5 and {R2C8,R2C9}={3,4} from the
// left-R2 clue alone, which leaves the right-R1 clue (17) no digit in 3-5 for
// R1C9 in that box, and 6 or more is already over 17.
//
// Model: one Var per grid cell holds the label of the cage that owns the cell,
// or NONE. Cage membership, size, digit sum and distinctness are then all
// properties of that label layer.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Drawn data. Each row is one colour: the killer total printed in the top-left
// corner of a cell (a 0.25-size text at that cell's top-left, as killer totals
// are drawn), and the identically coloured X-Sum clue outside the grid. `line`
// and `from` say which row/column the clue sits on and which side it is drawn.
const CAGES = [
  { colour: 'yellow-green', corner: 'R1C1', total: 14, clue: 17, line: 'R1', from: 'right' },
  { colour: 'grey', corner: 'R2C2', total: 32, clue: 33, line: 'R2', from: 'left' },
  { colour: 'purple', corner: 'R5C8', total: 15, clue: 9, line: 'R5', from: 'left' },
  { colour: 'red', corner: 'R6C4', total: 12, clue: 10, line: 'C4', from: 'top' },
  { colour: 'brown', corner: 'R8C3', total: 15, clue: 11, line: 'R8', from: 'right' },
  { colour: 'deep-sky-blue', corner: 'R8C7', total: 14, clue: 11, line: 'C7', from: 'top' },
  { colour: 'gold', corner: 'R9C5', total: 15, clue: 10, line: 'R9', from: 'left' },
];

const NONE = CAGES.length + 1;
const shape = new Shape(GRID);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const owner = graph.makeOverlay('VG');
const gridCells = graph.cells();

// The clue's cells in the order it reads them, nearest cell first.
const clueCells = (cage) => {
  const index = parseInt(cage.line.slice(1)) - 1;
  const cells = cage.line[0] === 'R'
    ? graph.rows()[index] : graph.columns()[index];
  return (cage.from === 'right' || cage.from === 'bottom')
    ? cells.slice().reverse() : cells;
};

// Cell counts a cage can have: n distinct digits sum to between 1+..+n and
// 9+..+(10-n), and the printed total fixes that sum.
const possibleSizes = (total) => DIGITS.filter(
  n => total >= (n * (n + 1)) / 2 && total <= (n * (19 - n)) / 2);

// Which cells a cage could reach. The total marks the cage's top-left corner,
// so no cage cell lies above that row, nor to its left within that row; and a
// connected cage of at most m cells reaches at most m-1 steps from the corner.
const zoneOf = (cage) => {
  const home = parseCellId(cage.corner);
  const limit = Math.max(...possibleSizes(cage.total)) - 1;
  return gridCells.filter(cell => {
    const { row, col } = parseCellId(cell);
    if (row < home.row || (row === home.row && col < home.col)) return false;
    return Math.abs(row - home.row) + Math.abs(col - home.col) <= limit;
  });
};
const zones = CAGES.map(zoneOf);

const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
const sumOfMask = (mask) => digitsOfMask(mask).reduce((a, b) => a + b, 0);

// Every cell carries exactly one label, so the cages cannot overlap. A corner
// cell is pinned to its own cage; every other cell may be unowned.
const labelDomain = gridCells.map(cell => {
  const corner = CAGES.findIndex(cage => cage.corner === cell);
  if (corner >= 0) return new Given(owner.at(cell), corner + 1);
  return new Given(
    owner.at(cell), NONE,
    ...zones.flatMap((zone, i) => zone.includes(cell) ? [i + 1] : []));
});

const connectivity = CAGES.map((cage, i) => new ConnectedValues('VG', i + 1));

// Cell count, digit sum and no-repeats are all read off the set of digits a
// cage holds, so one machine per cage scans its zone as (label, digit) pairs
// and accumulates that set as a bitmask. `reading` is true while the next
// symbol is the digit belonging to the label just seen. The final segment is
// the X-Sum's own first cell, whose digit X the cage's cell count must equal.
const contents = CAGES.map((cage, i) => {
  const label = i + 1;
  const maxSize = Math.max(...possibleSizes(cage.total));
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, inCage: false, phase: 'scan' },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { mask: state.mask, reading: false, inCage: false, phase: 'size' };
      }
      if (state.phase === 'size') {
        const digits = digitsOfMask(state.mask);
        const ok = digits.length === value && sumOfMask(state.mask) === cage.total;
        return { mask: 0, reading: false, inCage: false, phase: ok ? 'ok' : 'dead' };
      }
      if (!state.reading) {
        return { mask: state.mask, reading: true, inCage: value === label, phase: 'scan' };
      }
      if (!state.inCage) {
        return { mask: state.mask, reading: false, inCage: false, phase: 'scan' };
      }
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined;
      const mask = state.mask | bit;
      // Bound the state: neither the sum nor the count can come back down.
      if (sumOfMask(mask) > cage.total) return undefined;
      if (digitsOfMask(mask).length > maxSize) return undefined;
      return { mask, reading: false, inCage: false, phase: 'scan' };
    },
    accept: (state) => state.phase === 'ok',
  }, geometry, { multiSegment: true });
  return new NFA(machine, `${cage.colour}-cage`,
    zones[i].flatMap(cell => [owner.at(cell), cell]),
    [clueCells(cage)[0]]);
});

const xSums = CAGES.map(
  cage => XSum.fromCells(cage.clue, clueCells(cage), geometry));

return [
  shape,
  owner.toVar('cage'),
  ...labelDomain,
  ...connectivity,
  ...contents,
  ...xSums,
];
