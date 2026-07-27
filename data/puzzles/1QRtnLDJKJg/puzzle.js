// Title: The Graveyard Of Knapp Daneben
// Author: fjam
// Video: https://www.youtube.com/watch?v=1QRtnLDJKJg
// Source: https://sudokupad.app/bofuhbwz6i

// Rules encoded (normal sudoku is automatic):
//
// - Each grave (a cage) is printed with a date DD/MM/YY. Its digits must be
//   distinct and must sum to the day, month, or year of the date one day
//   before OR one day after the printed date. That leaves both the direction
//   (before/after) and the field (day/month/year) open, so each grave is
//   encoded as "distinct AND sum equals one of the (deduplicated) day/month/
//   /year values of the two adjacent dates" -- computed below from the
//   transcribed date, not committed to a single direction/field. Month and
//   year are identical for both adjacent dates except at the three graves
//   whose date is the 1st or last day of a month, where dedup collapses the
//   overlap.
// - A path connects the green cell (R1C1) and the red cell (R9C9), travelling
//   orthogonally cell to cell. Modeled as a per-cell "shape" Var (which of a
//   cell's up to 4 edges the path uses: off, straight-through, or one of four
//   turns) with edge agreement between neighbours, capping every general cell
//   at 2 used edges (so it can't branch or cross itself). R1C1/R9C9 are grid
//   corners with only 2 possible neighbours each; they get a dedicated
//   1-edge "which neighbour" Var instead of the general alphabet, since the
//   general alphabet has no 1-edge code.
//   Omission: this proves local path structure (no branch, no reused edge)
//   and that the on-path cells are one orthogonally-connected region, but not
//   that they form a single route with exactly these two endpoints -- two
//   route fragments could run alongside each other, touching cell-to-cell
//   without ever sharing a used edge, and still satisfy every check here. The
//   rules never state whether the path may touch itself, so the stricter
//   "cell has exactly N *orthogonally-adjacent* on-path neighbours" model
//   (which would close this fully) is not used: it would reject a genuine
//   touching-path solution if the puzzle allows touching, which is a
//   tightening beyond the stated rule, not a faithful encoding.
// - "The path may not cross the highest or lowest digit in a grave": since a
//   grave's digits are distinct (above), each grave has one cell with the
//   largest digit and one with the smallest; both are barred from the path.
//   Encoded per grave cell as: off-path, or (some other cell in the grave
//   beats it, so it isn't the highest) and (it beats some other cell in the
//   grave, so it isn't the lowest).

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// ---- Graves: cells from the drawn cages, and the printed date (the cage's
// non-numeric value, format DD/MM/YY) as [day, month, 2-digit year]. ----
const graves = [
  { cells: ['R1C5', 'R1C6', 'R2C6', 'R3C6'], date: [30, 9, 15] },
  { cells: ['R1C4', 'R2C4', 'R2C5', 'R3C5'], date: [19, 11, 30] },
  { cells: ['R2C3', 'R3C3', 'R3C4'], date: [7, 7, 22] },
  { cells: ['R1C2', 'R1C3', 'R2C1', 'R2C2'], date: [30, 10, 30] },
  { cells: ['R3C1', 'R3C2', 'R4C2'], date: [7, 11, 23] },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C9'], date: [26, 10, 18] },
  { cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8', 'R3C9', 'R4C9'], date: [27, 2, 37] },
  { cells: ['R4C1', 'R5C1', 'R5C2'], date: [8, 6, 20] },
  { cells: ['R4C3', 'R4C4', 'R5C3', 'R6C2', 'R6C3'], date: [19, 4, 35] },
  { cells: ['R4C5', 'R4C6', 'R5C4', 'R5C5', 'R6C4'], date: [1, 1, 33] },
  { cells: ['R4C7', 'R4C8', 'R5C7'], date: [23, 11, 10] },
  { cells: ['R5C6', 'R6C6', 'R6C7', 'R7C7'], date: [16, 11, 24] },
  { cells: ['R6C5', 'R7C5', 'R8C4', 'R8C5'], date: [15, 12, 23] },
  { cells: ['R7C3', 'R7C4', 'R8C2', 'R8C3', 'R9C1', 'R9C2'], date: [31, 12, 23] },
  { cells: ['R6C1', 'R7C1', 'R7C2', 'R8C1'], date: [18, 12, 23] },
  { cells: ['R9C3', 'R9C4', 'R9C5'], date: [12, 8, 18] },
  { cells: ['R7C6', 'R8C6', 'R9C6'], date: [23, 10, 18] },
  { cells: ['R5C8', 'R5C9', 'R6C8'], date: [22, 11, 22] },
  { cells: ['R6C9', 'R7C8', 'R7C9', 'R8C9'], date: [21, 5, 23] },
  { cells: ['R8C7', 'R8C8', 'R9C7', 'R9C8'], date: [26, 3, 22] },
];

// The day before/after a date shares its month and year unless the date is
// the first or last day of a month. Using real calendar arithmetic (rather
// than a hand-built table) also gets Feb 28/29 right automatically.
function adjacentFieldValues([day, month, yy]) {
  const date = new Date(2000 + yy, month - 1, day);
  const before = new Date(date); before.setDate(date.getDate() - 1);
  const after = new Date(date); after.setDate(date.getDate() + 1);
  const fields = d => [d.getDate(), d.getMonth() + 1, d.getFullYear() % 100];
  return [...new Set([...fields(before), ...fields(after)])];
}

const graveConstraints = graves.flatMap(({ cells, date }) => [
  new AllDifferent(...cells),
  new Or(adjacentFieldValues(date).map(total => new Sum(total, ...cells))),
]);

// ---- Path: green start, red end (see the coloured-cell underlays). ----
const START = 'R1C1', END = 'R9C9';

// General per-cell path "shape": OFF (not on path), or one of six 2-edge
// codes (straight through, or a turn). No code uses more than 2 edges, so no
// cell can branch.
const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ON_CODES = [HORIZ, VERT, UL, UR, DL, DR];

const shape = graph.makeOverlay('VS');
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
// Border cells can't use a shape that points off the grid. R1C1/R9C9 are
// handled by their own dedicated Var below, so pin their unused 'VS' cell to
// an inert OFF.
const shapeDomains = gridCells
  .filter(cell => cell !== START && cell !== END)
  .map(cell => {
    const { row, col } = parseCellId(cell);
    const allowed = ALL_SHAPES.filter(s =>
      !(row === 1 && usesUp(s)) && !(row === geometry.numRows && usesDown(s)) &&
      !(col === 1 && usesLeft(s)) && !(col === geometry.numCols && usesRight(s)));
    return new Given(shape.at(cell), ...allowed);
  });
const cornerPlaceholders = [START, END].map(cell => new Given(shape.at(cell), OFF));

// R1C1's only possible neighbours are down (R2C1) and right (R1C2); R9C9's
// only possible neighbours are up (R8C9) and left (R9C8). Each is forced onto
// the path (it's a named endpoint) using exactly one of its two edges.
const START_DOWN = 1, START_RIGHT = 2, END_UP = 3, END_LEFT = 4;
const ends = graph.makeOverlay('VE', [START, END]);
const endDomains = [
  new Given(ends.at(START), START_DOWN, START_RIGHT),
  new Given(ends.at(END), END_UP, END_LEFT),
];

// Edge agreement: neighbours must agree on the shared edge. A two-cell
// relation, so `Pair` rather than an `NFA`: the first uses the edge towards
// the second iff the second uses the edge back.
const edgeAgreeKey = (toB, toA) => Pair.fnToKey((a, b) => toB(a) === toA(b), geometry.numValues);
const rightKey = edgeAgreeKey(usesRight, usesLeft), downKey = edgeAgreeKey(usesDown, usesUp);

// Every orthogonal pair once (right/down steps), skipping the four edges that
// touch a corner -- those are wired separately below via the corner's own Var.
// One Pair template per direction, replicated over every valid anchor cell
// (all are shifted copies of the same relative-offset relation).
function directionalEdgeFamily(key, label, dRow, dCol) {
  const anchors = gridCells.filter(cell => {
    if (cell === START || cell === END) return false;
    const neighbour = graph.step(cell, dRow, dCol);
    return neighbour && neighbour !== START && neighbour !== END;
  });
  // The template is pinned at the overlay's own first cell (R1C1, forced by
  // makeReplicate) purely to fix the (0,0)/(dRow,dCol) offset pair; R1C1
  // itself is never a target (it's excluded from `anchors`, above).
  const first = gridCells[0];
  const template = new Pair(key, label, shape.at(first), shape.at(graph.step(first, dRow, dCol)));
  return shape.makeReplicate([template], shape.at(anchors));
}
const generalEdges = [
  directionalEdgeFamily(rightKey, 'edge-h', 0, 1),
  directionalEdgeFamily(downKey, 'edge-v', 1, 0),
];

// The four edges touching a corner, tied to its dedicated direction Var.
const cornerEdges = [
  new Pair(edgeAgreeKey(v => v === START_DOWN, usesUp), 'edge-start-v', ends.at(START), shape.at('R2C1')),
  new Pair(edgeAgreeKey(v => v === START_RIGHT, usesLeft), 'edge-start-h', ends.at(START), shape.at('R1C2')),
  new Pair(edgeAgreeKey(v => v === END_UP, usesDown), 'edge-end-v', ends.at(END), shape.at('R8C9')),
  new Pair(edgeAgreeKey(v => v === END_LEFT, usesRight), 'edge-end-h', ends.at(END), shape.at('R9C8')),
];

// On-path cells (any non-corner cell whose shape isn't OFF) form one
// orthogonally-connected region. See the top-of-file omission note for the
// residual gap this leaves (touching-without-a-shared-edge fragments).
const connectivity = new ConnectedValues('VS', ON_CODES);

// ---- Grave exclusion: bar each grave's own highest and lowest digit from
// the path. ----
const gtKey = Pair.fnToKey((a, b) => a > b, geometry.numValues);
const graveExclusions = graves.flatMap(({ cells }) => cells.map(cell => {
  const others = cells.filter(other => other !== cell);
  return new Or([
    new Given(shape.at(cell), OFF),
    new And([
      new Or(others.map(other => new Pair(gtKey, 'gt', other, cell))), // not the highest
      new Or(others.map(other => new Pair(gtKey, 'gt', cell, other))), // not the lowest
    ]),
  ]);
}));

return [
  new Shape('9x9'),
  ...graveConstraints,
  shape.toVar('shape'),
  ends.toVar('end'),
  ...shapeDomains,
  ...cornerPlaceholders,
  ...endDomains,
  ...generalEdges,
  ...cornerEdges,
  connectivity,
  ...graveExclusions,
];
