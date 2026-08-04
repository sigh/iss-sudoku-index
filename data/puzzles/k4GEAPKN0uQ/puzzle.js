// Title: Hopscotch (Remix)
// Author: Nordy
// Video: https://www.youtube.com/watch?v=k4GEAPKN0uQ
// Source: https://app.crackingthecryptic.com/sudoku/Q3NL4tDB7p

// Rules encoded here:
//  1. Normal sudoku rules apply.
//  2. Every 3x3 box contains one hidden 2x2 "Whisper Square", in an unknown
//     one of its four corners (the only four 2x2 placements that fit inside a
//     3x3 box, and every one of them covers the box's centre cell).
//  3. Inside a Whisper Square, orthogonally adjacent digits differ by 5 or
//     more (its 4 internal edges).
//  4. Whisper Squares in orthogonally-adjacent boxes may not touch orthogonally
//     (they may touch diagonally).
//  5. Five drawn 3-cell cages (no total): within each cage, the sum of the
//     digits that lie inside a Whisper Square equals the sum of the digits
//     that lie outside one. Cage cells also may not repeat, per the usual
//     no-total-cage convention.
// Nothing is omitted.
//
// Each box's Whisper Square position is modelled with one auxiliary Var,
// valued 1-4 for its anchor (top-left cell of the 2x2), TL/TR/BL/BR. A
// per-box Or over the four anchors ties the position Var to the whisper-diff
// constraint that actually applies (Given(pos, label) is false for the other
// three branches, so only the branch matching the real position can satisfy
// the Or, and that branch is the one that must hold). The same Or-over-position
// pattern extends to the cross-box no-touch rule (a Pair over two boxes'
// position Vars) and the cage sum rule (an Or over the label combinations of
// the box(es) the cage touches, each branch a concrete signed Sum).

const shape = new Shape('9x9');
const ALPHABET = 9; // grid alphabet, used to build Pair truth tables

// box(row, col) -> box number 1-9; boxLocal(row, col) -> [localRow, localCol] in 1..3.
function boxOf(row, col) {
  const rowBand = Math.floor((row - 1) / 3);
  const colBand = Math.floor((col - 1) / 3);
  return rowBand * 3 + colBand + 1;
}
function boxLocal(row, col) {
  return [((row - 1) % 3) + 1, ((col - 1) % 3) + 1];
}
// Absolute cell for box b (1-9) at local (lr, lc) in 1..3.
function boxCell(b, lr, lc) {
  const rowBand = Math.floor((b - 1) / 3);
  const colBand = (b - 1) % 3;
  return makeCellId(rowBand * 3 + lr, colBand * 3 + lc);
}

// The four candidate Whisper Square anchors (top-left cell of the 2x2) within
// a box's local 3x3: 1=TL 2=TR 3=BL 4=BR. All four 2x2s cover local (2,2).
const LABELS = [1, 2, 3, 4];
const ANCHOR = { 1: [1, 1], 2: [1, 2], 3: [2, 1], 4: [2, 2] };

// The 2x2 block's 4 cells for a given box/label, in cyclic order
// (TL, TR, BR, BL) so a closed Whisper walks all 4 edges of the square.
function blockCycle(b, label) {
  const [ar, ac] = ANCHOR[label];
  const c1 = boxCell(b, ar, ac);
  const c2 = boxCell(b, ar, ac + 1);
  const c3 = boxCell(b, ar + 1, ac + 1);
  const c4 = boxCell(b, ar + 1, ac);
  return [c1, c2, c3, c4, c1];
}

// Which anchor labels place local cell (lr, lc) inside their 2x2 block.
function insideLabels(lr, lc) {
  return LABELS.filter(label => {
    const [ar, ac] = ANCHOR[label];
    return lr >= ar && lr <= ar + 1 && lc >= ac && lc <= ac + 1;
  });
}

// One position Var per box: value 1-4 selects the box's Whisper Square anchor.
const posVar = new Var('P', 'whisper square anchor (1=TL 2=TR 3=BL 4=BR)', 9);
const pos = b => posVar.cell(b);
const posDomain = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  b => new Given(pos(b), ...LABELS));

// Rule 2/3: per box, the branch matching the real anchor is the only one that
// can satisfy the Or, so its Whisper(5, ...) is the constraint that binds.
const whisperSquares = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(b => new Or(
  LABELS.map(label => new And([
    new Given(pos(b), label),
    new Whisper(5, ...blockCycle(b, label)),
  ]))
));

// Rule 4: adjacent boxes' Whisper Squares must not touch across the shared
// box border. Any two 2-row (or 2-col) windows inside a 3-row (3-col) band
// always overlap, so "touch" reduces to: the left/top box's anchor reaches
// the shared border AND the right/bottom box's anchor reaches it too.
const RIGHT_EDGE = [2, 4]; // TR, BR: block includes the box's local col 3
const LEFT_EDGE = [1, 3];  // TL, BL: block includes the box's local col 1
const BOTTOM_EDGE = [3, 4]; // BL, BR: block includes the box's local row 3
const TOP_EDGE = [1, 2];    // TL, TR: block includes the box's local row 1

const noTouchH = Pair.fnToKey(
  (a, b) => !(RIGHT_EDGE.includes(a) && LEFT_EDGE.includes(b)), ALPHABET);
const noTouchV = Pair.fnToKey(
  (a, b) => !(BOTTOM_EDGE.includes(a) && TOP_EDGE.includes(b)), ALPHABET);

const horizontalBoxPairs = [1, 2, 4, 5, 7, 8].map(b => [b, b + 1]);
const verticalBoxPairs = [1, 2, 3, 4, 5, 6].map(b => [b, b + 3]);

const noTouch = [
  ...horizontalBoxPairs.map(([l, r]) =>
    new Pair(noTouchH, 'whisper squares do not touch', pos(l), pos(r))),
  ...verticalBoxPairs.map(([t, d]) =>
    new Pair(noTouchV, 'whisper squares do not touch', pos(t), pos(d))),
];

// The five drawn 3-cell cages (no total shown), transcribed from the puzzle's
// drawn cage outlines.
const CAGES = [
  ['R1C2', 'R2C1', 'R2C2'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R1C9', 'R2C8', 'R2C9'],
  ['R8C4', 'R9C3', 'R9C4'],
];

// Rule 5, no-repeat half: standard no-total-cage convention.
const cageAllDifferent = CAGES.map(cells => new AllDifferent(...cells));

// Rule 5, sum-equality half: branch over the label(s) of the box(es) the cage
// touches. Each branch pins those labels and states the resulting signed sum
// (+cell where inside that combination, -cell where outside) equals zero.
function cageSumEquality(cells) {
  const parsed = cells.map(id => {
    const { row, col } = parseCellId(id);
    const b = boxOf(row, col);
    const [lr, lc] = boxLocal(row, col);
    return { id, box: b, inside: insideLabels(lr, lc) };
  });
  const boxes = [...new Set(parsed.map(p => p.box))];

  function combos(list) {
    if (list.length === 0) return [[]];
    const [first, ...rest] = list;
    return combos(rest).flatMap(
      tail => LABELS.map(label => [[first, label], ...tail]));
  }

  // A branch that puts every cage cell on the same side is impossible to
  // satisfy (a non-empty digit sum can never equal an empty one's 0), so it
  // is dropped rather than encoded -- omitting a branch that can never be
  // chosen removes no real solution.
  const branches = combos(boxes).flatMap(assignment => {
    const labelOf = new Map(assignment);
    const insideCells = [];
    const outsideCells = [];
    for (const p of parsed) {
      const label = labelOf.get(p.box);
      (p.inside.includes(label) ? insideCells : outsideCells).push(p.id);
    }
    if (insideCells.length === 0 || outsideCells.length === 0) return [];
    const givens = assignment.map(([b, label]) => new Given(pos(b), label));
    return [new And([...givens, new EqualSum(insideCells, outsideCells)])];
  });
  return new Or(branches);
}
const cageSums = CAGES.map(cageSumEquality);

return [
  shape,
  new Given('R6C6', 9),
  new Given('R9C9', 1),
  posVar,
  ...posDomain,
  ...whisperSquares,
  ...noTouch,
  ...cageAllDifferent,
  ...cageSums,
];
