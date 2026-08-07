// Title: Foggy Pea-losophy
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=T29RlxU1Xt0
// Source: https://sudokupad.app/f6xcgzdav3

// Rules encoded below:
//  - Normal sudoku.
//  - Yin Yang: shaded cells orthogonally connected, unshaded cells orthogonally
//    connected, no 2x2 wholly shaded or wholly unshaded; R5C5 is neither.
//  - Split Peas: the digits strictly between two circles on a line sum to a
//    concatenation of that line's two circle digits.
//  - Pea Circles: each circle's digit is the number of cells sharing that
//    circle's shading along each line connected to it, bounding circles
//    included.
//  - XV: X sums to 10, V sums to 5; "not all are given", so no negative rule.
//
// Not encoded, as neither restricts the final grid: the Fog rule and its two
// FOGLIGHT cages (reveal UI), and "All lines travel orthogonally; lines may not
// branch or cross, except at circles", which describes the drawn art. That last
// sentence is what makes a circle a line boundary, and so is what splits each
// drawn stroke into the circle-bounded stretches used below.

const SHADED = 1;
const UNSHADED = 2;
const NEITHER = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// The five drawn green strokes, as the cells each polyline runs through.
const strokes = [
  ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2', 'R2C3', 'R1C3', 'R1C2'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4',
    'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4',
    'R8C4', 'R8C5', 'R8C6', 'R7C6', 'R6C6', 'R6C5'],
  ['R1C6', 'R1C7', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R5C6'],
  ['R8C7', 'R7C7', 'R6C7', 'R6C8'],
];

// The thirteen drawn circles (white fill, green border). Every one sits on a
// stroke, at an end or where the stroke passes through it.
const circles = new Set([
  'R1C1', 'R1C2', 'R4C1', 'R4C2', 'R3C4', 'R4C5', 'R8C2', 'R1C6', 'R5C6',
  'R8C6', 'R6C5', 'R8C7', 'R6C8',
]);

// Cut each stroke at its circles, so every stretch runs circle to circle and
// carries no circle in its interior. Both clue rules are stated over such a
// stretch: "strictly between two circles", "the bounding circles".
const stretches = strokes.flatMap(stroke => {
  const cuts = stroke.flatMap((cell, i) => circles.has(cell) ? [i] : []);
  return cuts.slice(0, -1).map((from, k) => stroke.slice(from, cuts[k + 1] + 1));
});

// Every shade Var is shaded or unshaded, except the one the rules exempt.
const HOLE = 'R5C5';
const shadedCells = gridCells.filter(cell => cell !== HOLE);
const shadeDomain = shade.makeReplicate(
  new Given(shade.at(shadedCells[0]), SHADED, UNSHADED),
  shade.at(shadedCells));

// No 2x2 block may be all shaded or all unshaded: an NFA rejecting four equal
// values, replicated to every 2x2 origin. A block covering R5C5 passes on its
// NEITHER value, which is what "completely shaded or unshaded" excludes.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// sum(interior) = 10*first + last, or the two circles read the other way round.
const splitPeas = stretches.map(cells => {
  const head = cells[0];
  const tail = cells[cells.length - 1];
  const interior = cells.slice(1, -1);
  return new Or([
    new Sum(0, ...interior, [head, -10], [tail, -1]),
    new Sum(0, ...interior, [tail, -10], [head, -1]),
  ]);
});

// Reads one circle's digit, then the shading of its stretch starting at that
// same circle. The first shading read is therefore the circle's own: it fixes
// the shading being counted and opens the count at 1 for the circle itself.
// Each later cell of that shading adds one; a count past the digit can never
// come back down, so those branches are dropped.
const peaCountMachine = NFA.encodeSpec({
  startState: { digit: null, target: null, count: 0 },
  transition: ({ digit, target, count }, value) => {
    if (digit === null) return { digit: value, target: null, count: 0 };
    if (target === null) {
      // Stretch cells never carry NEITHER: R5C5 lies on no stroke.
      if (value !== SHADED && value !== UNSHADED) return undefined;
      return { digit, target: value, count: 1 };
    }
    const next = count + (value === target ? 1 : 0);
    return next > digit ? undefined : { digit, target, count: next };
  },
  accept: ({ digit, count }) => count === digit,
}, geometry.numValues);

// One machine per circle per stretch it bounds -- "each line connected to the
// circle" -- reading the stretch outwards from that circle.
const peaCircles = stretches.flatMap(cells => {
  const orders = [cells, [...cells].reverse()];
  return orders.map(order => new NFA(
    peaCountMachine, 'pea-circle', order[0], ...shade.at(order)));
});

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new Given(shade.at(HOLE), NEITHER),
  // Nothing in the rules tells the two shades apart -- every constraint here is
  // invariant under swapping them -- so each shading has a mirror image. Name
  // the first cell in reading order the shaded one to pick one of the pair.
  new Given(shade.at(gridCells[0]), SHADED),
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...splitPeas,
  ...peaCircles,
  new X('R7C2', 'R7C3'),
  new V('R2C5', 'R2C6'),
  new V('R6C4', 'R6C5'),
  new V('R8C5', 'R8C6'),
  new V('R8C7', 'R9C7'),
];
