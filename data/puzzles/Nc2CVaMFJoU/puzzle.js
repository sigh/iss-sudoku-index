// Title: Minimaximum
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=Nc2CVaMFJoU
// Source: https://app.crackingthecryptic.com/sudoku/GtRpGn2tJ4

// Normal sudoku rules (rows, columns, boxes) come from the default Shape.
// Digits in gray cells are even -- there is no dedicated Even class, so a
// parity clue is a candidate-restricting Given per cell.
// Digits joined by an X sum to 10, by a V sum to 5. "Not all Xs and Vs are
// shown", so only the drawn marks are encoded -- their absence elsewhere
// says nothing (no StrictXV).
//
// Minimum/maximum square: for a box, S is the sum of its three rows, three
// columns and two diagonals; that sum is the smallest possible for exactly
// one box, and the largest possible for exactly one box.
//
// A cell's weight in S is 1 (its row) + 1 (its column) + 1 per diagonal
// through it: the centre sits on both diagonals (weight 4), the four
// corners sit on one each (weight 3), the four edge-centres sit on neither
// (weight 2). A box always holds 1-9 once each, so S = 2*centre +
// (sum of the 4 corner digits) + 90 (derived from total-weight bookkeeping,
// since the four corner digits and four edge digits together are the
// remaining 8 values summing to 45 - centre). Minimising/maximising a
// weighted sum of a fixed digit set puts the smallest/largest digit at the
// heaviest weight, so:
//   S is smallest (106) iff centre = 1 and the corners are exactly {2,3,4,5};
//   S is largest (134) iff centre = 9 and the corners are exactly {5,6,7,8}.
// (Edges then are forced to the remaining four digits by box AllDifferent.)
// This was checked by exhaustively scoring all 9! digit placements of one
// isolated box -- it is the rule's own arithmetic, not a fit to any grid
// solution (this source has none stored). "Exactly one" box is a real
// constraint, not automatic: box centres share a row or column only within
// the same band/stack, so e.g. the three centres on a box diagonal (one per
// band, one per stack) could all independently be 1 without this rule.
//
// Each box gets a flag cell (VMIN#/VMAX#, domain {1,2}: 1 = "is the
// min/max box"). ContainExact pins exactly one flag to 1 per flag group; an
// Or/Given biconditional per box ties a flag's value to the centre+corner
// pattern above (5 forward implications, one per centre/corner cell, plus
// one combined backward implication).

const graph = cellGraph('9x9');
const boxes = graph.boxes(); // 9 boxes, 9 cells each, row-major within the box:
// [0]=TL corner,[1]=top edge,[2]=TR corner,[3]=left edge,[4]=centre,
// [5]=right edge,[6]=BL corner,[7]=bottom edge,[8]=BR corner.
const centreOf = (box) => box[4];
const cornersOf = (box) => [box[0], box[2], box[6], box[8]];

const CORNERS_MIN = [2, 3, 4, 5];
const CORNERS_MIN_COMPLEMENT = [1, 6, 7, 8, 9];
const CORNERS_MAX = [5, 6, 7, 8];
const CORNERS_MAX_COMPLEMENT = [1, 2, 3, 4, 9];

// Ties one box's flag cell to "centre = centreVal and every corner in
// cornerSet", both directions: flag=1 forces the pattern (one Or per
// conjunct), flag=2 forbids it (one Or covering the whole negation).
function flagBiconditional(
  flagCell, centre, corners, centreVal, centreComplement, cornerSet, cornerComplement
) {
  const forward = [
    new Or([new Given(flagCell, 2), new Given(centre, centreVal)]),
    ...corners.map(c => new Or([new Given(flagCell, 2), new Given(c, ...cornerSet)])),
  ];
  const backward = new Or([
    new Given(flagCell, 1),
    new Given(centre, ...centreComplement),
    ...corners.map(c => new Given(c, ...cornerComplement)),
  ]);
  return [...forward, backward];
}

const minFlags = new Var('MIN', 'minBoxFlag', 9);
const maxFlags = new Var('MAX', 'maxBoxFlag', 9);
const minFlagCells = minFlags.cells();
const maxFlagCells = maxFlags.cells();

const flagDomains = [...minFlagCells, ...maxFlagCells].map(c => new Given(c, 1, 2));
const exactlyOneMin = new ContainExact('1', ...minFlagCells);
const exactlyOneMax = new ContainExact('1', ...maxFlagCells);

const minConditions = boxes.flatMap((box, i) => flagBiconditional(
  minFlagCells[i], centreOf(box), cornersOf(box),
  1, [2, 3, 4, 5, 6, 7, 8, 9], CORNERS_MIN, CORNERS_MIN_COMPLEMENT));
const maxConditions = boxes.flatMap((box, i) => flagBiconditional(
  maxFlagCells[i], centreOf(box), cornersOf(box),
  9, [1, 2, 3, 4, 5, 6, 7, 8], CORNERS_MAX, CORNERS_MAX_COMPLEMENT));

// Gray cell fills -- the drawn light-gray square fill in each listed cell.
const evenCells = [
  'R1C4', 'R1C5', 'R2C6', 'R1C9', 'R4C9', 'R6C9',
  'R6C6', 'R4C6', 'R4C4', 'R4C1', 'R5C2', 'R8C2', 'R9C1',
];
const evenGivens = evenCells.map(c => new Given(c, 2, 4, 6, 8));

// X/V overlays -- edge-centred "X"/"V" text marks between two adjacent cells.
const xEdges = [
  ['R8C1', 'R8C2'], ['R6C1', 'R7C1'], ['R4C2', 'R4C3'],
  ['R6C6', 'R6C7'], ['R3C8', 'R4C8'],
];
const vEdges = [
  ['R2C9', 'R3C9'], ['R1C2', 'R2C2'], ['R5C1', 'R6C1'],
  ['R9C3', 'R9C4'], ['R8C7', 'R9C7'], ['R7C2', 'R8C2'],
];
const xConstraints = xEdges.map(([a, b]) => new X(a, b));
const vConstraints = vEdges.map(([a, b]) => new V(a, b));

return [
  new Shape('9x9'),
  minFlags,
  maxFlags,
  ...flagDomains,
  exactlyOneMin,
  exactlyOneMax,
  ...minConditions,
  ...maxConditions,
  ...evenGivens,
  ...xConstraints,
  ...vConstraints,
];
