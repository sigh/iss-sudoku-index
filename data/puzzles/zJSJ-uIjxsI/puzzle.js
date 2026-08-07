// Title: Schrodinger
// Author: JT
// Video: https://www.youtube.com/watch?v=zJSJ-uIjxsI
// Source: https://sudokupad.app/4jjr2ooiit

// Normal sudoku rules: default row/column/box AllDifferent.
//
// Schrodinger swap: some pair of distinct digits summing to 10 can be
// swapped everywhere in the finished grid and the result still satisfies
// every other clue (cages, arrows, white dots). Row/column/box AllDifferent
// survives any such swap automatically -- swapping two digit *labels*
// throughout a set of already-distinct cells cannot make two of them equal
// -- so only the cage, arrow and dot clues constrain which pair(s) can work;
// each is re-expressed below as a condition on the real grid that is
// equivalent to "this clue still holds after swapping a and b":
//   - cage: the swapped sum changes by (countB-countA)*(a-b) over the
//     cage's cells, so the sum survives iff countA == countB. A cage is
//     all-different, so each of countA/countB is 0 or 1: either neither
//     digit appears, or both do (once each).
//   - arrow: by the same shift, arm-sum == circle survives iff
//     (countA-countB) along the arm equals +1 when the circle is a, -1 when
//     the circle is b, or 0 when the circle is neither.
//   - white dot: checked directly by swapping both cells' values and
//     re-testing consecutiveness. (Touching only one of a/b does not always
//     break it: for the 4/6 pair specifically, a neighbouring 5 stays
//     consecutive with either, since 4/5/6 are themselves consecutive.)
// The puzzle's 4 givens are exempt from this (see below), so the encoding
// is one `Or` over the 4 candidate pairs, each an `And` of these per-clue
// conditions on the real grid -- no shadow grid or extra Var state needed.
//
// Arrow: sum of the arm cells equals the circled cell.
// Killer cage: cells distinct, summing to the corner total.
// White dot: orthogonally adjacent cells are consecutive.

// Cages: cells/totals from the drawn killer cages (top-left-corner totals).
const cageDefs = [
  { total: 8, cells: ['R5C2', 'R6C2'] },
  { total: 22, cells: ['R8C4', 'R9C3', 'R9C4'] },
  { total: 11, cells: ['R4C4', 'R4C5', 'R5C4'] },
  { total: 14, cells: ['R1C6', 'R2C6'] },
];

// Arrows: circle + arm cells from the drawn arrow paths (snapped to cell
// centres; each arrow's path starts at its drawn circle).
const arrowDefs = [
  { circle: 'R3C8', arm: ['R2C7', 'R3C6'] },
  { circle: 'R6C6', arm: ['R6C7', 'R5C7', 'R4C7'] },
];

// White dots: drawn edge-midpoint circles (white fill, black border,
// edge-sized) -- the rules text names only white (consecutive) dots, and no
// other edge marker is described.
const dotPairs = [
  ['R1C1', 'R1C2'],
  ['R1C4', 'R2C4'],
  ['R3C4', 'R3C5'],
  ['R4C6', 'R5C6'],
  ['R4C1', 'R5C1'],
  ['R6C1', 'R6C2'],
  ['R7C1', 'R8C1'],
  ['R7C3', 'R8C3'],
  ['R7C4', 'R7C5'],
  ['R6C8', 'R7C8'],
  ['R7C8', 'R7C9'],
];

// The 4 candidate swap pairs: distinct digits summing to 10.
const swapPairs = [[1, 9], [2, 8], [3, 7], [4, 6]];

// The given digits are 4, 1, 2, 3 (R2C2, R2C8, R8C2, R8C8) -- one member of
// every candidate pair. If a given cell's digit were required to survive the
// swap unchanged, no candidate pair could ever work (each pair contains a
// given digit, so swapping it would always violate that given), making the
// rule's claimed pair impossible -- decidable by this pigeonhole check alone,
// without solving the grid. So a "solution" for swap purposes means one
// satisfying the cage/arrow/dot clues (and normal sudoku); the given cells
// are the puzzle's fixed data, not a condition re-checked on the swap.

const digitsExcluding = (...exclude) =>
  [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => !exclude.includes(v));

// A cage's sum survives the swap iff neither a nor b appears, or both do
// (each once) -- see the derivation above.
const cageInvariant = ([a, b], cage) => new Or([
  new And(cage.cells.map(cell => new Given(cell, ...digitsExcluding(a, b)))),
  new ContainExact(`${a}_${b}`, ...cage.cells),
]);

// The running (count of a) - (count of b) along the arm, read cell by cell;
// maxDepth bounds it to the arm's own length (this NFA is only ever built
// for a specific arrow's arm below) so the compiler doesn't try to bound an
// unrelated, unboundedly long line. A 2-cell arm is a plain binary relation
// (a Pair), not a state machine.
const armDiff = (v, a, b) => (v === a ? 1 : v === b ? -1 : 0);
const armDiffConstraint = (a, b, target, cells) => cells.length === 2
  ? new Pair(
    Pair.fnToKey((v1, v2) => armDiff(v1, a, b) + armDiff(v2, a, b) === target, 9),
    '', ...cells)
  : new NFA(NFA.encodeSpec({
    startState: 0,
    transition: (diff, value) => diff + armDiff(value, a, b),
    accept: diff => diff === target,
    maxDepth: cells.length,
  }, 9), '', ...cells);

// An arrow's sum survives the swap iff the circle/arm case matches one of
// the three derived above.
const arrowInvariant = ([a, b], arrow) => new Or([
  new And([
    new Given(arrow.circle, ...digitsExcluding(a, b)),
    armDiffConstraint(a, b, 0, arrow.arm),
  ]),
  new And([
    new Given(arrow.circle, a),
    armDiffConstraint(a, b, 1, arrow.arm),
  ]),
  new And([
    new Given(arrow.circle, b),
    armDiffConstraint(a, b, -1, arrow.arm),
  ]),
]);

// A white dot survives the swap iff its two swapped values are still
// consecutive -- see the derivation above for why this can't be simplified
// to "neither cell is a or b".
const swapValue = (v, a, b) => (v === a ? b : v === b ? a : v);
const dotInvariant = ([a, b], [x, y]) => new Pair(
  Pair.fnToKey((v1, v2) => {
    const d = swapValue(v1, a, b) - swapValue(v2, a, b);
    return d === 1 || d === -1;
  }, 9),
  '', x, y);

const swapBranch = pair => new And([
  ...cageDefs.map(c => cageInvariant(pair, c)),
  ...arrowDefs.map(ar => arrowInvariant(pair, ar)),
  ...dotPairs.map(d => dotInvariant(pair, d)),
]);

return [
  new Shape('9x9'),

  new Given('R2C2', 4),
  new Given('R2C8', 1),
  new Given('R8C2', 2),
  new Given('R8C8', 3),

  ...cageDefs.map(c => new Cage(c.total, ...c.cells)),
  ...arrowDefs.map(ar => new Arrow(ar.circle, ...ar.arm)),
  ...dotPairs.map(([x, y]) => new WhiteDot(x, y)),

  new Or(swapPairs.map(swapBranch)),
];
