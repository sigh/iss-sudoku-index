// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5vcOYclVXtk
// Source: https://cracking-the-cryptic.web.app/sudoku/qrQhJNg9NM

// Normal sudoku rules (default 3x3 box regions). Eight little killer clues
// point diagonally into the grid from outside it; each sums its diagonal,
// repeats allowed. The eight totals are printed together as a plain list
// beside the grid with no drawn pairing to any one clue, so which total
// belongs to which diagonal is an open one-to-one correspondence that the
// solver must resolve -- encoded below as a disjunction over every
// assignment consistent with each diagonal's own possible sum range.

const geometry = cellGeometry('9x9');

// Each clue's diagonal, transcribed from the drawn arrow direction and
// off-grid bulb position; cells run from the arrow's entry corner to the
// far board edge.
const CLUES = [
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R1C8', 'R2C9'],
  ['R1C9'],
  ['R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'],
  ['R7C9', 'R8C8', 'R9C7'],
  ['R9C9'],
  ['R9C3', 'R8C2', 'R7C1'],
  ['R4C1', 'R3C2', 'R2C3', 'R1C4'],
];

// The unassigned totals list, transcribed top-to-bottom from the sidebar
// text overlays at R1C11..R8C11; order there carries no meaning.
const TOTALS = [31, 10, 19, 35, 6, 7, 20, 20];

const sumClue = (cells, total) => cells.length === 1
  ? new Sum(total, cells[0])
  : LittleKiller.fromCells(total, cells, geometry);

// A diagonal of n cells with repeats allowed can only total between n and
// 9n; a candidate assignment putting a total outside that range for some
// clue is not a live reading of that clue (describe-json-puzzle ladder rung
// 5, "the rule's internal arithmetic"), so it is dropped before building the
// disjunction rather than left for the solver to discover is unsatisfiable.
const feasible = (n, total) => total >= n && total <= 9 * n;

const permutations = (arr) => arr.length <= 1 ? [arr] : arr.flatMap(
  (item, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)])
    .map(rest => [item, ...rest]));

// Assignments are one-to-one on the eight total *values*: swapping the two
// equal 20s produces the same assignment, so dedupe by the resulting value
// sequence rather than treating the two legend slots as distinguishable.
const seenAssignments = new Set();
const assignmentBranches = [];
for (const perm of permutations(TOTALS)) {
  if (!CLUES.every((cells, i) => feasible(cells.length, perm[i]))) continue;
  const key = perm.join(',');
  if (seenAssignments.has(key)) continue;
  seenAssignments.add(key);
  assignmentBranches.push(
    new And(CLUES.map((cells, i) => sumClue(cells, perm[i]))));
}

return [
  new Shape('9x9'),
  // Givens, transcribed from the drawn grid.
  new Given('R2C4', 3), new Given('R2C5', 8), new Given('R2C6', 7),
  new Given('R3C3', 5),
  new Given('R4C3', 9), new Given('R4C7', 6),
  new Given('R5C3', 1), new Given('R5C5', 6), new Given('R5C6', 2), new Given('R5C8', 4),
  new Given('R6C3', 4), new Given('R6C7', 7),
  new Given('R7C3', 6), new Given('R7C7', 2),
  new Given('R8C4', 4), new Given('R8C5', 2), new Given('R8C6', 6),
  new Or(assignmentBranches),
];
