// Title: This Sudoku Tells Lies
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=git-UNVfd5Q
// Source: https://cracking-the-cryptic.web.app/sudoku/8QDLTJG34f

// Normal sudoku (default row/column/box all-different from Shape('9x9')).
// Eight killer cages: no repeated digit in the cage, digits sum to the
// printed total. Four outside diagonals give the sum of the digits along
// the diagonal, repeats allowed.
//
// One digit 1-9 is a global "joker" (which one is for the solver to find,
// so it is a Var, not a Given). Every grid cell showing the joker digit may
// count as any digit 1-9 when computing a cage total or a diagonal total,
// chosen independently per cage-membership and per diagonal-membership (a
// cell that is both a cage cell and a diagonal cell may use two different
// interpreted values) -- but the cage's own "no repeated digit" rule still
// reads the literal grid digit, unaffected by the joker.
//
// Modelled as: the literal grid stays literal for every rule except the two
// sum families. For each cage cell and each diagonal cell, a parallel Var
// holds the value that cell actually contributes to that sum. A shared NFA
// ties each (joker, digit, contributed) triple: if digit == joker the
// contributed value is free (1-9); otherwise it is pinned to digit. Cage and
// diagonal sums are then plain `Sum`s over the contributed-value overlays,
// and the cage's `AllDifferent` still runs over the literal cells.

const cid = makeCellId;

const cages = [
  { total: 7, cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'] },
  { total: 28, cells: ['R3C5', 'R3C6', 'R4C5', 'R4C6'] },
  { total: 8, cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'] },
  { total: 33, cells: ['R5C6', 'R5C7', 'R6C6', 'R6C7'] },
  { total: 15, cells: ['R4C3', 'R4C4', 'R5C3', 'R5C4'] },
  { total: 27, cells: ['R6C4', 'R6C5', 'R7C4', 'R7C5'] },
  { total: 12, cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'] },
  { total: 33, cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'] },
];

// Diagonals, cells in drawn-arrow order (order does not matter to Sum).
const diagonals = [
  { total: 38, cells: ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R8C9'] },
  { total: 21, cells: ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'] },
  { total: 45, cells: ['R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'] },
  { total: 40, cells: ['R9C8', 'R8C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3', 'R3C2', 'R2C1'] },
];

const cageCells = [...new Set(cages.flatMap(cg => cg.cells))];
const diagCells = [...new Set(diagonals.flatMap(d => d.cells))];

const graph = cellGraph('9x9');
const cageValue = graph.makeOverlay('VC', cageCells); // per-cell cage-sum contribution
const diagValue = graph.makeOverlay('VD', diagCells); // per-cell diagonal-sum contribution

// The single global joker digit. Not a Given: which digit is the joker is
// determined by the solver, not printed anywhere in the puzzle.
const joker = new Var('J', 'joker digit', 1);
const jokerCell = joker.cell(1);

// Ties (joker, literal digit, contributed value) for one cell: read in that
// fixed order as a 3-symbol NFA segment. If digit == joker, the contributed
// value is unconstrained (free 1-9); otherwise it must equal the literal
// digit. One shared spec is reused (via multiSegment) for every cage cell
// and every diagonal cell, each as its own independent 3-cell segment.
const jokerSubSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (s, value) => {
    if (value === SEGMENT_BREAK) return { phase: 0 };
    if (s.phase === 0) return { phase: 1, j: value };          // read joker
    if (s.phase === 1) return { phase: 2, j: s.j, d: value };  // read digit
    // phase 2: value is the contributed value.
    if (s.d === s.j) return { phase: 3 };                      // joker cell: free
    return value === s.d ? { phase: 3 } : undefined;           // else: pinned to digit
  },
  accept: () => true,
}, 9, { multiSegment: true });

const jokerCageSub = new NFA(
  jokerSubSpec, 'joker-cage-sub',
  ...cageCells.map(cell => [jokerCell, cell, cageValue.at(cell)]));
const jokerDiagSub = new NFA(
  jokerSubSpec, 'joker-diag-sub',
  ...diagCells.map(cell => [jokerCell, cell, diagValue.at(cell)]));

const cageConstraints = cages.flatMap(cg => [
  new AllDifferent(...cg.cells),                       // literal digits, no repeat in cage
  new Sum(cg.total, ...cageValue.at(cg.cells)),         // joker-interpreted total
]);

const diagonalConstraints = diagonals.map(d =>
  new Sum(d.total, ...diagValue.at(d.cells)));          // repeats allowed, joker-interpreted

return [
  new Shape('9x9'),
  joker,
  cageValue.toVar('cage-sum contributed values'),
  diagValue.toVar('diagonal-sum contributed values'),
  jokerCageSub,
  jokerDiagSub,
  ...cageConstraints,
  ...diagonalConstraints,
];
