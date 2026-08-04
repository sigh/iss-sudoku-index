// Title: Kroopki Wonderland
// Author: MicroStudy
// Video: https://www.youtube.com/watch?v=pJzIaZXDjkQ
// Source: https://app.crackingthecryptic.com/sudoku/4LhtN674Br

// Normal sudoku (standard 3x3 boxes; the payload's 9 regions match them
// exactly). White Kropki dot: the two cells consecutive. Black Kropki dot:
// the two cells in a 1:2 ratio. White Kroopki "doot": two 2-cell dominoes'
// sums consecutive. Black Kroopki doot: the two dominoes' sums in a 1:2
// ratio. No givens; only marked pairs/dominoes are constrained (the rules
// do not say every dot/doot is shown).
//
// Decode note: the source draws these marks as two distinct overlay
// footprints. One kind sits at a plain 2-cell edge (only one cell each
// side despite the elongated capsule shape) and reads as an ordinary dot
// (WhiteDot/BlackDot), same as the small round marks.
//
// The other kind is centred exactly on a 4-cell grid corner, straddling it
// symmetrically, and is a doot relating the two dominoes on either side of
// its long axis's midpoint. Which pair of cells forms each domino is not
// pinned down by the drawn geometry alone: along the mark's long axis its
// coverage of the two cells it reaches is a clean, symmetric half/half
// split, and along its short axis coverage of its own two cells is also a
// clean, symmetric split -- both axes are "divided" the same way, so
// nothing in the mark's own footprint says which axis is the split and
// which is the pooled one. The source leaves this correspondence open, so
// both readings -- long-axis-splits/short-axis-pools, and its mirror -- are
// encoded as a disjunction: the puzzle uses one convention uniformly for
// all 11 corner doots, and the solver is left to discover which.
//
// A handful of the drawn edge-position capsules (between R2C4/R2C5,
// R2C5/R2C6, R8C4/R8C5, R8C5/R8C6, R5C5/R6C5, R6C2/R7C2, R3C8/R4C8) do not
// hold consecutive or a 1:2 ratio under either fill colour, so no
// dot/doot reading fits them; they are omitted here rather than guessed.

const whiteDots = [
  ['R4C5', 'R5C5'], ['R6C4', 'R6C5'], ['R7C5', 'R8C5'], ['R8C5', 'R9C5'],
  ['R1C8', 'R2C8'], ['R2C2', 'R3C2'],
];

const blackDots = [
  ['R1C4', 'R2C4'], ['R2C4', 'R3C4'], ['R3C7', 'R3C8'],
];

// Each corner doot: the 2x2 block of cells it straddles (top-left,
// top-right, bottom-left, bottom-right), its colour, and which axis its
// long dimension runs along -- transcribed from the source's drawn corner
// overlays and their exact bounding-box cell coverage (see decode note
// above).
const cornerDoots = [
  { tl: 'R4C3', tr: 'R4C4', bl: 'R5C3', br: 'R5C4', color: 'black', long: 'col' },
  { tl: 'R5C6', tr: 'R5C7', bl: 'R6C6', br: 'R6C7', color: 'black', long: 'col' },
  { tl: 'R4C8', tr: 'R4C9', bl: 'R5C8', br: 'R5C9', color: 'white', long: 'row' },
  { tl: 'R4C1', tr: 'R4C2', bl: 'R5C1', br: 'R5C2', color: 'white', long: 'row' },
  { tl: 'R6C8', tr: 'R6C9', bl: 'R7C8', br: 'R7C9', color: 'black', long: 'row' },
  { tl: 'R7C8', tr: 'R7C9', bl: 'R8C8', br: 'R8C9', color: 'white', long: 'row' },
  { tl: 'R7C7', tr: 'R7C8', bl: 'R8C7', br: 'R8C8', color: 'black', long: 'col' },
  { tl: 'R8C8', tr: 'R8C9', bl: 'R9C8', br: 'R9C9', color: 'white', long: 'col' },
  { tl: 'R3C2', tr: 'R3C3', bl: 'R4C2', br: 'R4C3', color: 'white', long: 'row' },
  { tl: 'R8C2', tr: 'R8C3', bl: 'R9C2', br: 'R9C3', color: 'black', long: 'col' },
  { tl: 'R3C1', tr: 'R3C2', bl: 'R4C1', br: 'R4C2', color: 'white', long: 'col' },
];

// Sum-consecutive: |sumA - sumB| = 1, as a disjunction of the two signed
// linear equations (Sum's coefficient form: target, then [cell, coeff]...).
const sumConsecutive = ([a, b]) => new Or([
  new Sum(1, [a[0], 1], [a[1], 1], [b[0], -1], [b[1], -1]),
  new Sum(-1, [a[0], 1], [a[1], 1], [b[0], -1], [b[1], -1]),
]);

// Sum-ratio 1:2: sumA = 2*sumB, or sumB = 2*sumA.
const sumRatio = ([a, b]) => new Or([
  new Sum(0, [a[0], 1], [a[1], 1], [b[0], -2], [b[1], -2]),
  new Sum(0, [a[0], -2], [a[1], -2], [b[0], 1], [b[1], 1]),
]);

const dootConstraint = (domino, m) =>
  (m.color === 'white' ? sumConsecutive : sumRatio)(domino);

// The two candidate dominoes for one mark's long axis: 'rows' pairs each
// row's two cells together (top domino vs bottom domino); 'cols' pairs
// each column's two cells together (left domino vs right domino).
const rowsDomino = m => [[m.tl, m.tr], [m.bl, m.br]];
const colsDomino = m => [[m.tl, m.bl], [m.tr, m.br]];

// Branch A: the long axis is the split (top/bottom, or left/right); the
// short axis is pooled into each domino. Branch B is the mirror image:
// the long axis is pooled, the short axis is the split. Exactly one
// convention applies to all 11 corner doots at once.
const branchA = new And(cornerDoots.map(m =>
  dootConstraint(m.long === 'row' ? rowsDomino(m) : colsDomino(m), m)));
const branchB = new And(cornerDoots.map(m =>
  dootConstraint(m.long === 'row' ? colsDomino(m) : rowsDomino(m), m)));

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  new Or([branchA, branchB]),
];
