// Title: Kropki Arrow Sandwich
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=01mr-g5G5co
// Source: https://sudokupad.app/hr3yy4ec3p

// Normal sudoku: digits 1-9 once each in every row, column and 3x3 box, on
// the 9x9 playing grid.
//
// Sandwich: the number outside the grid at the end of a row/column is never
// drawn ("must be deduced") -- it is the sum of the digits strictly between
// the cells holding 1 and 9 in that row/column. Only the row/column ends
// that carry a dot (below) need that total, so only those are modelled.
//
// Kropki Arrow: every dot in this puzzle sits exactly on the grid's outer
// border -- each dot's drawn centre coincides with the first waypoint of its
// grey arrow line, and that shared point always falls on the boundary
// between the border (never-filled) row/column and the playing grid. So
// "the two numbers separated by the dot" are that row/column's undrawn
// sandwich total on one side, and the single grid cell touching the dot on
// the other. A white dot forces their difference, a black dot their ratio,
// to equal the dot's own value, which the rules separately define as the
// sum of the digits on the grey arrow leaving that dot.

const shape = new Shape('9x9', '0-9'); // widen 1 value (adds 0) so a
  // sandwich total's tens/ones digits (below) each fit in a single cell; the
  // solver's per-cell alphabet is capped at 16 values, well short of the 36
  // a sandwich total itself would need (0-35), so it is split in two.
const graph = cellGraph(shape);

// Restrict the 81 playing cells back down to ordinary sudoku digits; only
// the tens/ones Vars below use the extra 0 value. One Given template,
// replicated over every grid cell.
const digitGivens = graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// One auxiliary total per row/column that actually carries a dot, identified
// by matching each border-adjacent dot's drawn position to its row/column.
// Represented as tens/ones digit Vars (0-35 needs two digits) rather than
// one wide cell.
const sandwichLines = [
  { key: 'row1', cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'] },
  { key: 'row4', cells: ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'] },
  { key: 'row6', cells: ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'] },
  { key: 'row8', cells: ['R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'] },
  { key: 'col3', cells: ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'] },
  { key: 'col4', cells: ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'] },
  { key: 'col6', cells: ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'] },
  { key: 'col7', cells: ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7'] },
  { key: 'col9', cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'] },
];
const tensVar = new Var('VT', 'sandwich total tens digit (deduced; never drawn)', sandwichLines.length);
const onesVar = new Var('VO', 'sandwich total ones digit (deduced; never drawn)', sandwichLines.length);
const lineIndex = key => sandwichLines.findIndex(l => l.key === key) + 1;
const tCell = key => tensVar.cell(lineIndex(key));
const oCell = key => onesVar.cell(lineIndex(key));
// A sandwich total is at most 35 (digits 2-8, if 1 and 9 sit at the two ends
// of a 9-cell line), so its tens digit is at most 3.
const tensGivens = sandwichLines.map(({ key }) => new Given(tCell(key), 0, 1, 2, 3));

// Reads [tens, ones, ...line] and accepts iff 10*tens + ones equals the sum
// of the digits strictly between the cells holding 1 and 9 in `line`.
// `target` and `sum` are both clamped at 36 (a shared sink above the real
// max of 35): once either is there it can never match the other, so folding
// every larger value into one sink keeps the compiled state count bounded
// regardless of the hypothetical (tens, ones) pairs the compiler explores.
const sandwichSpec = NFA.encodeSpec({
  startState: 'start-tens',
  transition: (state, value) => {
    if (state === 'start-tens') return { needOnes: true, tens: value };
    if (state.needOnes) {
      return { target: Math.min(10 * state.tens + value, 36), phase: 'before', sum: 0 };
    }
    if (state.phase === 'before') {
      return (value === 1 || value === 9)
        ? { target: state.target, phase: 'between', sum: 0 }
        : state;
    }
    if (state.phase === 'between') {
      return (value === 1 || value === 9)
        ? { target: state.target, phase: 'after', sum: state.sum }
        : { target: state.target, phase: 'between', sum: Math.min(state.sum + value, 36) };
    }
    return state; // phase === 'after': cells past the second marker don't count.
  },
  accept: state => typeof state === 'object' && state.phase === 'after' && state.sum === state.target,
}, shape);

const sandwichConstraints = sandwichLines.map(
  ({ key, cells }) => new NFA(sandwichSpec, `sandwich total, ${key}`, tCell(key), oCell(key), ...cells));

// Every dot's arrow starts exactly where the dot touches the grid, so the
// arrow's first cell is *also* "the number on the inside" of the Kropki
// relation -- it is not a separate bulb cell. `cells[0]` is therefore
// counted twice by the rule: once as the plain adjacent digit, once as an
// arrow member.
const whiteDots = [
  { sandwich: 'row6', cells: ['R6C1', 'R6C2', 'R6C3'] },
  { sandwich: 'row8', cells: ['R8C1', 'R8C2'] },
  { sandwich: 'row6', cells: ['R6C9', 'R6C8', 'R6C7', 'R6C6'] },
  { sandwich: 'col4', cells: ['R9C4'] },
  { sandwich: 'col9', cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'] },
  { sandwich: 'col7', cells: ['R1C7'] },
];
const blackDots = [
  { sandwich: 'row1', cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'] },
  { sandwich: 'row4', cells: ['R4C1', 'R4C2', 'R4C3'] },
  { sandwich: 'col3', cells: ['R9C3', 'R8C3', 'R7C3'] },
  { sandwich: 'col6', cells: ['R9C6'] },
];

// White: |total - first| = first + sum(rest) (the arrow sum, first included
// twice per the note above, total = 10*tens + ones). Expand and solve for
// `total` under each sign -- both linear, so no NFA is needed:
//   total = 2*first + sum(rest)          -- total is the larger side
//   total = -sum(rest)                   -- total is the smaller side (first cancels)
function whiteKropkiArrow({ sandwich, cells }) {
  const [first, ...rest] = cells;
  const tens = tCell(sandwich), ones = oCell(sandwich);
  return new Or([
    new Sum(0, [tens, 10], ones, [first, -2], ...rest.map(c => [c, -1])),
    new Sum(0, [tens, 10], ones, ...rest.map(c => [c, 1])),
  ]);
}

// Black: max(total, first)/min(total, first) = first + sum(rest), an
// integer ratio -- nonlinear, so it needs a scanning NFA. First the arrow
// (first + rest) is read to get the (at most 2) raw totals that would
// satisfy the ratio; then tens and ones are read and checked against that
// set digit-by-digit, so no stage ever has to carry a wide (0-35) value in
// its state -- only the reduced set of candidates does, and that set is
// always tiny (<=2 members).
function acceptableTotals(d, arrowSum) {
  if (arrowSum <= 0) return [];
  const vals = new Set();
  if (d * arrowSum <= 35) vals.add(d * arrowSum);
  if (d % arrowSum === 0) vals.add(d / arrowSum);
  return [...vals];
}
const blackKropkiSpecs = new Map();
function blackKropkiSpec(restLen) {
  if (blackKropkiSpecs.has(restLen)) return blackKropkiSpecs.get(restLen);
  const spec = NFA.encodeSpec({
    startState: 'start',
    transition: (state, value) => {
      if (state === 'start') {
        return restLen === 0
          ? { phase: 'awaitTens', totals: acceptableTotals(value, value) }
          : { phase: 'rest', d: value, restSum: 0, seen: 0 };
      }
      if (state.phase === 'rest') {
        const restSum = Math.min(state.restSum + value, 36);
        const seen = state.seen + 1;
        if (seen === restLen) {
          const arrowSum = Math.min(state.d + restSum, 36);
          return { phase: 'awaitTens', totals: acceptableTotals(state.d, arrowSum) };
        }
        return { phase: 'rest', d: state.d, restSum, seen };
      }
      if (state.phase === 'awaitTens') {
        // Keep only totals whose tens digit matches; remember the ones
        // digit each surviving one still needs.
        const neededOnes = state.totals
          .filter(t => Math.floor(t / 10) === value)
          .map(t => t % 10);
        return { phase: 'awaitOnes', neededOnes };
      }
      if (state.phase === 'awaitOnes') {
        return state.neededOnes.includes(value) ? 'ACCEPT' : 'REJECT';
      }
      return undefined; // ACCEPT / REJECT are terminal.
    },
    accept: state => state === 'ACCEPT',
  }, shape);
  blackKropkiSpecs.set(restLen, spec);
  return spec;
}
function blackKropkiArrow({ sandwich, cells }) {
  const [first, ...rest] = cells;
  const spec = blackKropkiSpec(rest.length);
  return new NFA(spec, `black kropki arrow, ${sandwich}`, first, ...rest, tCell(sandwich), oCell(sandwich));
}

return [
  shape,
  digitGivens,
  tensVar,
  onesVar,
  ...tensGivens,
  ...sandwichConstraints,
  ...whiteDots.map(whiteKropkiArrow),
  ...blackDots.map(blackKropkiArrow),
];
