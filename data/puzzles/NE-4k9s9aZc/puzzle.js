// Title: Fawlty Towers
// Author: Peter C Hayward
// Video: https://www.youtube.com/watch?v=NE-4k9s9aZc
// Source: https://cracking-the-cryptic.web.app/sudoku/drtq6RH6TF

// Normal sudoku rules apply (default row/column/box).
//
// Nine towers, one per column, each a run of cells from the bottom of the
// grid up to a printed row, with a total printed below the column. A tower's
// digits are meant to increase from bottom to top and sum to its total.
// Except: exactly two towers do not increase, and a further (disjoint) five
// towers do not sum to their total -- no tower is faulty both ways, so
// exactly two towers are fully correct (increasing and correct sum).
//
// Tower cells and totals are hand-transcribed from the drawn colour-strip
// underlays (bottom-to-top, by descending row number within the column) and
// the outside-clue total printed beneath each column.
//
// Each tower's fault mode is modelled as one 3-valued flag cell:
//   1 = normal (increasing AND sum correct)
//   2 = fails only "increasing" (sum still correct)
//   3 = fails only "sum" (still increasing)
// A value of 4+ never satisfies any Or-branch below, so is dead; a top-level
// Given still restricts to {1,2,3} for solver efficiency. This flag scheme
// bakes in "no tower is faulty both ways" directly: there is no 4th flag
// value for "fails both".
// ContainExact fixes the counts the rules state: two 1s, two 2s, five 3s.

const towers = [
  { total: 11, cells: ['R9C1', 'R8C1', 'R7C1'] },
  { total: 30, cells: ['R9C2', 'R8C2', 'R7C2', 'R6C2'] },
  { total: 28, cells: ['R9C3', 'R8C3', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'] },
  { total: 34, cells: ['R9C4', 'R8C4', 'R7C4', 'R6C4', 'R5C4'] },
  { total: 27, cells: ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5'] },
  { total: 31, cells: ['R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6'] },
  { total: 42, cells: ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7'] },
  { total: 3, cells: ['R9C8', 'R8C8'] },
  { total: 41, cells: ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9'] },
];

// "Does not increase" is the negation of Thermo: at least one bottom-to-top
// step fails to strictly increase (ties are already impossible -- a tower's
// cells share a column, and standard column all-different already forbids
// repeats -- so "not strictly increasing" and "not increasing" coincide).
const NOT_INCREASING_KEY = Pair.fnToKey((a, b) => a >= b, 9);
function notIncreasing(cells) {
  const fails = [];
  for (let i = 0; i + 1 < cells.length; i++) {
    fails.push(new Pair(
      NOT_INCREASING_KEY, 'tower step not increasing', cells[i], cells[i + 1]));
  }
  return new Or(fails);
}

// "Does not sum to total": a 2-cell tower is a plain Pair relation; a longer
// one needs an NFA carrying the running sum, clamped at total+1 once it can
// only fail, accepting every final sum except the exact total.
function sumFails(total, cells) {
  if (cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a + b !== total, 9);
    return new Pair(key, `tower sum != ${total}`, cells[0], cells[1]);
  }
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, total + 1),
    accept: (sum) => sum !== total,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `tower sum != ${total}`, ...cells);
}

const towerFlags = new Var('TF', 'tower fault-mode flags', towers.length);
const flagCells = towerFlags.cells();

function towerConstraint(flagCell, total, cells) {
  return new Or([
    new And([new Given(flagCell, 1), new Thermo(...cells), new Sum(total, ...cells)]),
    new And([new Given(flagCell, 2), notIncreasing(cells), new Sum(total, ...cells)]),
    new And([new Given(flagCell, 3), new Thermo(...cells), sumFails(total, cells)]),
  ]);
}

return [
  new Shape('9x9'),
  new Given('R2C8', 7),

  towerFlags,
  ...flagCells.map(c => new Given(c, 1, 2, 3)),
  new ContainExact('1_1_2_2_3_3_3_3_3', ...flagCells),

  ...towers.map((t, i) => towerConstraint(flagCells[i], t.total, t.cells)),
];
