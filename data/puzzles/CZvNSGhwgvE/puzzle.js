// Title: Hungry Hungry Hippos
// Author: Scojo
// Video: https://www.youtube.com/watch?v=CZvNSGhwgvE
// Source: https://sudokupad.app/65113ete79

// Normal sudoku (default 3x3 boxes; the payload's `regions` also list the
// same nine boxes, so no override is needed).
//
// Hippo territory: the payload's two black diagonal lines and four coloured
// half-diagonal lines (one per hippo colour, each running corner -> centre
// -> corner) draw the grid split into four triangles by both diagonals --
// Top, Right, Bottom, Left, named for the edge each hippo sits on. A large
// circle strictly inside one triangle is that hippo's; a circle sitting on
// a diagonal is on the border between the two (R5C5, on both diagonals,
// borders all four) and "which hippo eats it must be determined" -- an
// unknown-owner Var per such circle, restricted to the hippos that share
// its border, feeds a bounded-sum NFA per hippo (interior circles always
// count; a border circle counts only when its owner Var matches that
// hippo). "A number on a hippo shows the sum of all circles it eats" is
// that NFA's target.
// "A digit on a circle indicates how many circles contain that digit" is
// CountingCircles verbatim, over every large circle regardless of owner.
// "Digits separated by a small white dot are consecutive... not all
// possible dots are shown" is a plain (non-exhaustive) WhiteDot per shown
// dot; "too small for the hippos to care about" just confirms dots aren't
// circles -- no extra encoding.

// Hippo codes used as owner-Var values below.
const TOP = 1, RIGHT = 2, BOTTOM = 3, LEFT = 4;
const HIPPOES = [
  { id: TOP, sum: 76 },
  { id: RIGHT, sum: 20 },
  { id: BOTTOM, sum: 87 },
  { id: LEFT, sum: 21 },
];

// Every large circle (payload `underlays`, 0.82x0.82 white/black circles),
// split by triangle membership (row==col or row+col==10 means "on a
// diagonal", i.e. a border circle).
const interiorCircles = {
  [TOP]: ['R1C2', 'R1C3', 'R1C8', 'R2C3', 'R2C4', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C5'],
  [RIGHT]: ['R5C6', 'R6C7', 'R6C8', 'R7C8'],
  [BOTTOM]: ['R7C4', 'R7C5', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R9C3', 'R9C8'],
  [LEFT]: ['R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C3'],
};

// Border circles (on a diagonal) with the hippos that could own each one,
// derived from the same triangle split: R4C4/R8C8/R9C9 sit on the row==col
// diagonal, R1C9/R2C8/R6C4/R7C3 on the row+col==10 diagonal, and R5C5 on
// both (so all four hippos border it).
const borderCircles = [
  ['R4C4', [TOP, LEFT]],
  ['R1C9', [TOP, RIGHT]],
  ['R2C8', [TOP, RIGHT]],
  ['R5C5', [TOP, RIGHT, BOTTOM, LEFT]],
  ['R6C4', [LEFT, BOTTOM]],
  ['R7C3', [LEFT, BOTTOM]],
  ['R8C8', [RIGHT, BOTTOM]],
  ['R9C9', [RIGHT, BOTTOM]],
];
const allCircles = [
  ...Object.values(interiorCircles).flat(),
  ...borderCircles.map(([cell]) => cell),
];

// White consecutive dots (payload `overlays`, white/black-bordered edge
// marks), one per shown dot -- see rules note above on "not all shown".
const dots = [
  ['R2C4', 'R3C4'],
  ['R8C1', 'R9C1'],
  ['R7C2', 'R8C2'],
  ['R9C6', 'R9C7'],
  ['R7C8', 'R7C9'],
  ['R7C9', 'R8C9'],
];

const graph = cellGraph();
// One Var per border circle: which hippo eats it. Domain restricted below
// to the hippos whose territory actually touches that cell.
const owner = graph.makeOverlay('VW', borderCircles.map(([cell]) => cell));

// Bounded running-sum NFA per hippo: segment 1 reads interior circles
// unconditionally; segment 2 reads (circle, ownerVar) pairs for every
// border circle this hippo could own, adding the circle's value only when
// its owner Var equals this hippo. The sum is clamped at target+1 (a dead
// sink) so state stays bounded regardless of scan order.
function hippoSumSpec(hippoId, target) {
  return NFA.encodeSpec({
    startState: { sum: 0, phase: 'interior' },
    transition: ({ sum, phase, digit }, value) => {
      if (value === SEGMENT_BREAK) return { sum, phase: 'border' };
      if (phase === 'interior') {
        return { sum: Math.min(sum + value, target + 1), phase };
      }
      if (digit === undefined) return { sum, phase, digit: value };
      const next = (value === hippoId) ? Math.min(sum + digit, target + 1) : sum;
      return { sum: next, phase };
    },
    accept: ({ sum, digit }) => digit === undefined && sum === target,
  }, 9, { multiSegment: true });
}

function hippoSumNFA({ id, sum }) {
  const border = borderCircles.filter(([, hippos]) => hippos.includes(id));
  const borderPairs = border.flatMap(([cell]) => [cell, owner.at(cell)]);
  return new NFA(
    hippoSumSpec(id, sum), `Hippo${id}Sum`,
    interiorCircles[id], borderPairs);
}

return [
  new Shape('9x9'),
  owner.toVar('HippoOwner'),
  ...borderCircles.map(([cell, hippos]) => new Given(owner.at(cell), ...hippos)),
  ...HIPPOES.map(hippoSumNFA),
  new CountingCircles(...allCircles),
  ...dots.map(([a, b]) => new WhiteDot(a, b)),
];
