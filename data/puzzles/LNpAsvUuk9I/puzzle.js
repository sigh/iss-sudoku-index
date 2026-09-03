// Title: Space Invaders
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=LNpAsvUuk9I
// Source: https://sudokupad.app/uojuxaw1qw?setting-nogrid=1

// Normal sudoku rules apply.
//
// INVADERS - Each invader sums to 10 with a digit in some orthogonally
// adjacent cell.
//
// DIFFERENCE BOMBS - Digits connected by a bomb glyph always have the same
// difference.
//
// TURRETS - Strategically place 3 turrets into cells in the bottom row. Each
// turret has as many missiles as the digit in its cell, and can pivot to fire
// them upwards or diagonally. A turret can destroy an invader on a digit N by
// shooting it N times. Each invader is only shot by one of the turrets. All
// invaders must be destroyed.
//
// The rules never say that an invader blocks a missile aimed past it, and they
// fix no order in which the invaders fall, which a blocking reading would need
// to decide what is still in the way; so each of a turret's three rays reaches
// every cell along it.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Cells carrying an invader sprite.
const invaders = [
  'R2C2', 'R2C7', 'R4C4', 'R4C9', 'R5C2', 'R5C6', 'R6C4',
  'R6C6', 'R7C4', 'R7C6', 'R7C7', 'R8C6', 'R8C8',
];

// Cell pairs joined by a bomb glyph; all seven are drawn on vertical edges.
const bombPairs = [
  ['R2C3', 'R3C3'], ['R3C5', 'R4C5'], ['R3C7', 'R4C7'], ['R4C7', 'R5C7'],
  ['R5C3', 'R6C3'], ['R7C1', 'R8C1'], ['R7C3', 'R8C3'],
];

// --- Invaders ------------------------------------------------------------
const invaderSums = invaders.map(cell => new Or(
  graph.neighbours(cell).map(other => new X(cell, other))));

// --- Difference bombs ----------------------------------------------------
// The shared difference is not printed anywhere, so it is a variable: VD holds
// it. Each marked pair differs by it in one direction or the other, written as
// "one cell equals the other plus VD".
const commonDiff = new Var('D', 'shared bomb difference', 1);
const DIFF = commonDiff.cell(1);

const bombs = [
  commonDiff,
  ...bombPairs.map(([a, b]) => new Or([
    new EqualSum([a], [b, DIFF]),
    new EqualSum([b], [a, DIFF])])),
];

// --- Turrets -------------------------------------------------------------
// A turret in R9Ct fires up its own column and up both diagonals, reaching
// R(9-k)C(t-k), R(9-k)Ct and R(9-k)C(t+k) for k >= 1. Read backwards, the
// invader in row r, column c can be shot only from bottom-row columns
// c - (9 - r), c and c + (9 - r), dropping those off the board.
const shooters = cell => {
  const { row, col } = parseCellId(cell);
  const reach = 9 - row;
  return [col - reach, col, col + reach].filter(c => c >= 1 && c <= 9);
};

// VA<i> holds the bottom-row column of the turret that destroys invader i.
// One value per invader is what "only shot by one of the turrets" says.
const shotBy = new Var('A', 'turret that shoots each invader', invaders.length);
const shotByCells = shotBy.cells();

// VF<t> says whether R9Ct holds a turret.
const TURRET = 2;
const EMPTY = 1;
const placed = new Var('F', 'turret placed in each bottom-row cell', 9);
const placedCells = placed.cells();

// "If this invader names column t, then column t holds a turret", one relation
// per (invader, reachable column) pair.
const placedKeys = Array.from(
  { length: 9 },
  (_, i) => Pair.fnToKey((named, flag) => named !== i + 1 || flag === TURRET,
    shape));

// Missile budget for the turret in R9Ct. The cell list is
// [invader digit, its shooter, ...] as one segment, then [R9Ct]; the machine
// adds up the digits of the invaders that named t and checks the total against
// the turret's own digit. Totals are clamped at 10, one past the largest digit
// a turret cell can hold, so an over-budget run stays a single dead state.
const budgetMachine = t => NFA.encodeSpec({
  startState: { spent: 0, invader: 0 },  // invader 0: next symbol is a digit
  transition: ({ spent, invader }, value) => {
    if (value === SEGMENT_BREAK) return { spent, invader: null };
    // After the break the only symbol left is the turret's own digit.
    if (invader === null) return spent <= value ? { done: true } : undefined;
    if (invader === 0) return { spent, invader: value };
    const total = value === t ? spent + invader : spent;
    return { spent: Math.min(total, 10), invader: 0 };
  },
  accept: state => state.done === true,
}, shape, { multiSegment: true });

const turrets = [
  shotBy,
  placed,
  // Each invader names one of the columns that can reach it.
  ...shotByCells.map(
    (cell, i) => new Given(cell, ...shooters(invaders[i]))),
  ...placedCells.map(cell => new Given(cell, EMPTY, TURRET)),
  // Exactly three of the nine bottom-row cells hold a turret.
  new ContainExact(`${TURRET}_${TURRET}_${TURRET}`, ...placedCells),
  ...invaders.flatMap((invader, i) => shooters(invader).map(
    t => new Pair(placedKeys[t - 1], 'turret is placed',
      shotByCells[i], placedCells[t - 1]))),
  ...graph.row(9).map((turretCell, i) => {
    const t = i + 1;
    const scan = invaders.flatMap(
      (cell, j) => shooters(cell).includes(t) ? [cell, shotByCells[j]] : []);
    return new NFA(budgetMachine(t), `${turretCell} missiles`, scan, [turretCell]);
  }),
];

return [shape, ...invaderSums, ...bombs, ...turrets];
