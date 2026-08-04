// Title: Where's The Crusts?
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=FXFPpw8DGf0
// Source: https://app.crackingthecryptic.com/sudoku/fB8pgbJ27d

// Normal sudoku, 9x9, standard boxes, no givens.
//
// Crusts: each row, column and box has two crust cells -- the cell holding
// digit 1, and exactly one other cell (a non-1 crust). The non-1 crusts are
// modelled with a parallel `VF` flag overlay, one flag cell per grid cell,
// restricted to {1, 2} (2 = "this cell is a non-1 crust"). Summing a 9-cell
// row/column/box's flag values to 10 forces exactly one 2 among nine 1s/2s in
// that scope, i.e. exactly one non-1 crust per row, column and box. A flagged
// cell may not also hold digit 1 (the two crusts must be distinct cells), so
// each grid cell forbids the (digit=1, flag=2) pairing.
//
// Capsules: nine horizontally-adjacent grid-cell pairs, each read as a
// row-digit/column-digit coordinate naming one non-1 crust cell (worked
// example in the rules: R9C1/C2 = 4,5 => R4C5 is a non-1 crust). ISS has
// no direct "index into a cell array" primitive, so
// each capsule is a disjunction over all 81 possible target coordinates: the
// capsule's two digits equal that coordinate AND the flag cell there is 2.
// "No two capsules refer to the same crust cell": since a row holds exactly
// one flagged cell, two capsules naming the same target row would (by the
// disjunction above) be forced to the same target column too, so the row
// digit alone deciding distinctness is sufficient -- encoded as
// AllDifferent over the nine capsules' row-digit cells.
//
// Outside clues give the sum of digits strictly between a line's two crust
// cells; the rules do not fix which crust comes first, so both orders are
// covered. An "odd" clue asserts that sum is odd without stating its value.
// Each clued row/column gets one NFA scanning digit/flag pairs in order,
// tracking which marker (if any) has been seen and accumulating the sum of
// cells that lie strictly between the first and second marker.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VF');
const flagAt = cell => flags.at(cell);

// Capsules: [row-digit cell, column-digit cell]. Drawn as the nine
// horizontally-adjacent white rounded-rectangle underlays on the grid.
const capsules = [
  ['R1C5', 'R1C6'],
  ['R2C1', 'R2C2'],
  ['R3C7', 'R3C8'],
  ['R4C4', 'R4C5'],
  ['R5C8', 'R5C9'],
  ['R6C2', 'R6C3'],
  ['R7C8', 'R7C9'],
  ['R8C5', 'R8C6'],
  ['R9C1', 'R9C2'],
];

// Outside clues: row clues are left-of-grid, column clues are top-of-grid.
// A numeric value is the exact between-sum; 'odd' means the (unstated)
// between-sum is odd. Drawn as the eight text overlays outside the grid.
const rowClues = { 1: 10, 2: 42, 4: 15, 7: 'odd' };
const colClues = { 2: 35, 5: 'odd', 7: 8, 9: 16 };

const interleave = (digitCells, flagCells) =>
  digitCells.flatMap((cell, i) => [cell, flagCells[i]]);

// One NFA per clued line. Reads [digit, flag, digit, flag, ...] (18 symbols
// for a 9-cell line). `pending` carries a digit value across to its paired
// flag read. A cell is a marker if its digit is 1 or its flag is 2. Cells
// strictly between the first and second marker seen are summed; cells before
// the first marker or after the second are not.
const makeBetweenSumNFA = (target) => {
  const isOdd = target === 'odd';
  const cap = isOdd ? 2 : target + 1;
  const addToSum = (sum, value) =>
    isOdd ? (sum + value) % 2 : Math.min(sum + value, cap);

  const spec = {
    startState: {
      expectFlag: false, pending: null, seenFirst: false, seenSecond: false, sum: 0,
    },
    transition: (state, value) => {
      const { expectFlag, pending, seenFirst, seenSecond, sum } = state;
      if (!expectFlag) {
        return { expectFlag: true, pending: value, seenFirst, seenSecond, sum };
      }
      const isMarker = pending === 1 || value === 2;
      if (isMarker) {
        return seenFirst
          ? { expectFlag: false, pending: null, seenFirst, seenSecond: true, sum }
          : { expectFlag: false, pending: null, seenFirst: true, seenSecond, sum };
      }
      const nextSum = (seenFirst && !seenSecond) ? addToSum(sum, pending) : sum;
      return { expectFlag: false, pending: null, seenFirst, seenSecond, sum: nextSum };
    },
    accept: ({ seenFirst, seenSecond, sum }) =>
      seenFirst && seenSecond && (isOdd ? sum === 1 : sum === target),
    maxDepth: 18,
  };
  return NFA.encodeSpec(spec, 9);
};

const rowLineNFAs = Object.entries(rowClues).map(([r, target]) =>
  new NFA(
    makeBetweenSumNFA(target), `row-${r}-between`,
    ...interleave(graph.row(+r), flags.row(+r))));

const colLineNFAs = Object.entries(colClues).map(([c, target]) =>
  new NFA(
    makeBetweenSumNFA(target), `col-${c}-between`,
    ...interleave(graph.column(+c), flags.column(+c))));

// Forbid a flag cell being 2 (non-1 crust) while its grid cell holds digit 1.
const notOneAndFlagged = Pair.fnToKey((digit, flag) => !(digit === 1 && flag === 2), 9);

return [
  new Shape('9x9'),

  flags.toVar('non-1 crust flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  ...graph.cells().map(cell =>
    new Pair(notOneAndFlagged, 'crust-exclusive', cell, flagAt(cell))),

  // Exactly one non-1 crust per row, column and box.
  ...flags.rows().map(cells => new Sum(10, ...cells)),
  ...flags.columns().map(cells => new Sum(10, ...cells)),
  ...flags.boxes().map(cells => new Sum(10, ...cells)),

  // Capsules point at non-1 crust cells; no two point at the same one.
  ...capsules.map(([rowCell, colCell]) => new Or(
    graph.cells().map(target => new And([
      new Given(rowCell, parseCellId(target).row),
      new Given(colCell, parseCellId(target).col),
      new Given(flagAt(target), 2),
    ])))),
  new AllDifferent(...capsules.map(([rowCell]) => rowCell)),

  ...rowLineNFAs,
  ...colLineNFAs,
];
