// Title: That's Even Better
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=zsbRiLWMVy0
// Source: https://sudokupad.app/b23h412fnm

// Normal sudoku rules apply. Outside clues are Little Killer clues giving
// either the digit sum or the parity of the digit sum on the indicated
// diagonal (digits may repeat along a diagonal -- no distinctness rule
// applies to it). White dots are Kropki consecutive; the black dots are
// Kropki ratio 1:2. Every one of the 13 outside-clue arrowheads is drawn as
// an exact 45-degree shaft whose waypoints hold a constant diagonal invariant
// (row-col, or row+col for the other orientation). Each shaft lies on the line
// through its diagonal's cell centres -- e.g. the "14" mark's shaft, apex and
// barbs all sit on row-col = 7.00, the line through R9C2 and R8C1, while the
// adjacent lane's centres lie on row-col = 6.00, a full lane away. The
// entry cells below are the ones on each shaft's own invariant; the shaft only
// clips the neighbouring lane's corner point and never enters its interior.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// [entryCell, dRow, dCol, total] -- the one numeric little killer.
const SUM_CLUE = ['R9C2', -1, -1, 14];

// [entryCell, dRow, dCol, parity] -- parity is 0 (even) or 1 (odd).
const PARITY_CLUES = [
  ['R9C3', -1, -1, 1],
  ['R1C6', 1, 1, 1],
  ['R1C7', 1, 1, 1],
  ['R1C8', 1, 1, 0],
  ['R2C1', -1, 1, 0],
  ['R3C1', -1, 1, 1],
  ['R6C9', 1, -1, 1],
  ['R5C1', -1, 1, 1],
  ['R7C9', 1, -1, 0],
  ['R6C1', -1, 1, 0],
  ['R9C4', -1, -1, 0],
  ['R9C6', -1, -1, 0],
];

const WHITE_DOTS = [
  ['R1C5', 'R2C5'], ['R1C7', 'R2C7'], ['R2C1', 'R3C1'], ['R2C4', 'R3C4'],
  ['R3C9', 'R4C9'], ['R4C1', 'R5C1'], ['R5C1', 'R6C1'], ['R5C2', 'R6C2'],
  ['R6C3', 'R7C3'], ['R6C9', 'R7C9'], ['R7C1', 'R8C1'], ['R7C2', 'R8C2'],
  ['R8C5', 'R9C5'], ['R8C6', 'R9C6'], ['R8C7', 'R9C7'], ['R1C5', 'R1C6'],
  ['R2C2', 'R2C3'], ['R3C8', 'R3C9'], ['R7C3', 'R7C4'], ['R7C8', 'R7C9'],
  ['R8C2', 'R8C3'], ['R9C2', 'R9C3'], ['R9C4', 'R9C5'],
];

const BLACK_DOTS = [
  ['R2C2', 'R3C2'], ['R1C2', 'R1C3'],
];

// ISS has no built-in "sum of these cells is even/odd" class (LittleKiller
// takes only a fixed numeric total). One NFA state tracks the running sum
// mod 2; it accepts iff the final residue matches the wanted parity. The
// two specs below are shared across every parity clue regardless of its
// diagonal's length.
const paritySpec = (target) => NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => (state + value) % 2,
  accept: (state) => state === target,
}, 9);
const EVEN_SPEC = paritySpec(0);
const ODD_SPEC = paritySpec(1);

return [
  new Shape('9x9'),

  LittleKiller.fromCells(
    SUM_CLUE[3], graph.ray(SUM_CLUE[0], SUM_CLUE[1], SUM_CLUE[2]), geometry),

  ...PARITY_CLUES.map(([entry, dRow, dCol, target], i) => new NFA(
    target ? ODD_SPEC : EVEN_SPEC, `little-killer-parity-${i + 1}`,
    ...graph.ray(entry, dRow, dCol))),

  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];
