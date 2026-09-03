// Title: Foggy Banana Split
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=hCEi6T73KhM
// Source: https://sudokupad.app/23phi9d5m7

// Rules encoded here:
//   Sudoku: normal sudoku rules; the grid has no given digits.
//   Choco Banana: every cell is shaded chocolate or banana. An "area" is a
//     maximal orthogonally connected group of one shade. All chocolate areas
//     are rectangles; no banana area is a rectangle.
//   Circles (shading): a circled digit gives the size of the area containing
//     its cell, whichever shade that area has.
//   Circles (count): the digit in a circled cell with a line attached also
//     counts the cells of that line sharing the circle's shading, both
//     endpoints included.
//   Split Peas: the digits along a line between two circles sum to a two-digit
//     number whose tens digit sits in one of those circles and whose ones
//     digit sits in the other. "Along a line" excludes the two circles: the
//     Circles (count) rule in the same rules text spells out "along the line,
//     including the endpoints", a qualifier only needed because "along the
//     line" does not otherwise reach them.
//   XV: a pair separated by X sums to 10, by V to 5. The rules do not say all
//     X and V are given, so unmarked pairs carry no restriction.
//   Fog: progressive reveal only; it restricts no final digit.
//   "Lines do not cross, branch, or share cells" describes the drawn art,
//     which is fixed geometry here, so it implies no constraint.
//
// Three clauses are omitted:
//   - "no banana areas are rectangular". This quantifies over the components
//     of the unknown banana partition: each component must separately fail to
//     be a rectangle, and the number of components is unbounded.
//   - the Circles (shading) rule for a circle whose cell is banana, which
//     needs the size of that banana component. The chocolate branch is
//     encoded exactly; the banana branch is left unconstrained.
//   - the Circles (count) rule at all three circles of line 2 (R4C2, R1C3 and
//     R1C8). That line has a circle at R1C3 partway along it, so "along the
//     line" reads either as the whole drawn stroke or as the circle-to-circle
//     stretch that the split-pea rule uses, and the rules text and the art
//     leave both open. The clue is left out there rather than read one way;
//     it is encoded at the eight end circles of the other four lines, whose
//     only circles are their two ends, so that every reading agrees.

const CHOCOLATE = 1;
const BANANA = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');

// Green-bordered white circles, one per drawn overlay entry.
const CIRCLES = [
  'R3C1', 'R1C2', 'R1C3', 'R4C2', 'R5C1', 'R3C4', 'R5C5',
  'R7C2', 'R7C3', 'R6C4', 'R1C8', 'R6C7', 'R7C5', 'R8C7',
];

// Green line paths, in drawn waypoint order; each ends on a circle.
const LINES = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2'],
  [
    'R4C2', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C4',
    'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R1C8',
  ],
  ['R3C4', 'R3C5', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C5', 'R5C5'],
  [
    'R6C4', 'R7C4', 'R8C4', 'R8C5', 'R9C5', 'R9C4',
    'R9C3', 'R9C2', 'R8C2', 'R8C3', 'R7C3',
  ],
  [
    'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8',
    'R6C8', 'R7C8', 'R7C9', 'R8C9', 'R8C8', 'R8C7',
  ],
];

// Drawn X marks, as the cell pair each one separates.
const X_PAIRS = [
  ['R5C1', 'R6C1'],
  ['R5C2', 'R6C2'],
  ['R3C3', 'R3C4'],
  ['R2C5', 'R2C6'],
  ['R8C8', 'R8C9'],
];

// The single drawn V mark.
const V_PAIRS = [
  ['R4C3', 'R4C4'],
];

// Chocolate rectangularity, as a local test on every 2x2 window: reject a
// window holding exactly three chocolate cells. Three cells of a 2x2 window
// always form an L and are orthogonally connected, so they lie in one area,
// and the window's fourth cell cannot be chocolate without joining that area;
// hence a three-cell window is exactly a reflex corner of some chocolate area.
// A polyomino is a rectangle iff its boundary has no reflex corner, so "no
// window holds exactly three" and "every chocolate area is a rectangle" hold
// on the same grids.
const cornerSpec = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => count + (value === CHOCOLATE ? 1 : 0),
  accept: count => count !== 3,
  maxDepth: 4,
}, geometry.numValues);

// Stamped on every 2x2 window whose top-left corner leaves room for it.
const cornerOrigins = graph.cells().filter(
  cell => graph.block(cell, 2, 2) !== null);

const chocolateRectangles = shade.makeReplicate(
  new NFA(
    cornerSpec, 'chocolate 2x2 corner',
    ...shade.at(graph.block(graph.cells()[0], 2, 2))),
  shade.at(cornerOrigins));

// Area size at a circle. Segments are [circle digit], then the four rays taken
// from the circle outwards, each repeating the circle itself as its first
// cell; `skip` drops that repeat. The left ray's repeat is where the circle's
// own shading is read: a banana circle moves to FREE, which accepts every
// remaining symbol, and that is what leaves the banana branch of the rule
// unencoded. For a chocolate circle, rectangularity makes the maximal
// chocolate run through the cell equal to the side of its rectangle, in each
// direction: cells just past the run cannot be chocolate without extending the
// area beyond that rectangle. So `w` accumulates the width over the two
// horizontal rays and `h` the height over the two vertical ones, and the area
// is w * h. The width must divide the digit; the quotient becomes `hTarget`,
// the height the vertical rays have to produce. `blocked` latches at the first
// non-chocolate cell of a ray and clears at each segment break.
const FREE = {
  seg: 0, free: true, d: 0, w: 0, hTarget: 0, h: 0, blocked: false, skip: false,
};

const areaSpec = NFA.encodeSpec({
  startState: {
    seg: 0, free: false, d: 0, w: 0, hTarget: 0, h: 0,
    blocked: false, skip: false,
  },
  transition: (state, value) => {
    if (state.free) return state;
    if (value === SEGMENT_BREAK) {
      const seg = state.seg + 1;
      if (seg === 3) {
        // Horizontal rays are done: w is the rectangle's width.
        if (state.d % state.w !== 0) return undefined;
        return {
          seg, free: false, d: 0, w: 0, hTarget: state.d / state.w, h: 1,
          blocked: false, skip: true,
        };
      }
      return { ...state, seg, blocked: false, skip: true };
    }
    if (state.seg === 0) return { ...state, d: value };
    if (state.skip) {
      if (state.seg !== 1) return { ...state, skip: false };
      if (value === BANANA) return FREE;
      return { ...state, w: 1, skip: false };
    }
    if (state.blocked) return state;
    if (value !== CHOCOLATE) return { ...state, blocked: true };
    if (state.seg <= 2) {
      const w = state.w + 1;
      if (w > state.d) return undefined;
      return { ...state, w };
    }
    const h = state.h + 1;
    if (h > state.hTarget) return undefined;
    return { ...state, h };
  },
  accept: state => state.free || (state.seg === 4 && state.h === state.hTarget),
  // 1 digit cell + four rays totalling 20 cells + 4 segment breaks.
  maxDepth: 25,
}, geometry.numValues, { multiSegment: true });

const RAYS = [[0, -1], [0, 1], [-1, 0], [1, 0]];

const areaSizes = CIRCLES.map(cell => new NFA(
  areaSpec, `chocolate area at ${cell}`,
  [cell],
  ...RAYS.map(([dR, dC]) => shade.at(graph.ray(cell, dR, dC)))));

const circleSet = new Set(CIRCLES);

// Reads the endpoint digit, then the endpoint's shading, then the shading of
// every cell of the line: `count` tallies the line cells matching the endpoint.
const lineCountSpec = NFA.encodeSpec({
  startState: { target: null, colour: null, count: 0 },
  transition: (state, value) => {
    if (state.target === null) return { ...state, target: value };
    if (state.colour === null) return { ...state, colour: value };
    const count = state.count + (value === state.colour ? 1 : 0);
    if (count > state.target) return undefined;
    return { ...state, count };
  },
  accept: state => state.count === state.target,
}, geometry.numValues);

// Only for a line whose circles are exactly its two ends. Where a circle is
// drawn partway along a line -- line 2, at R1C3 -- "along the line" has two
// readings, the whole drawn stroke or the circle-to-circle stretch the
// split-pea rule uses, and neither the rules text nor the art picks one; all
// three of that line's circles are left without a count clue.
const lineCounts = LINES
  .filter(line => line.filter(cell => circleSet.has(cell)).length === 2)
  .flatMap(line => {
    const lineShades = shade.at(line);
    return [line[0], line[line.length - 1]].map(endpoint => new NFA(
      lineCountSpec, `line cells shaded like ${endpoint}`,
      endpoint, shade.at(endpoint), ...lineShades));
  });

// A split-pea sum runs between two circles: "the 'tens' digit is in one circle
// and the 'ones' digit is in the other" needs a stretch with exactly two of
// them. Four lines carry only their two end circles and are one stretch each.
// Line 2 also has a circle drawn at R1C3, four cells in from its R4C2 end, so
// its stretches are R4C2-R1C3 and R1C3-R1C8; taken whole it would have three
// circles and no "the other" to read.
const splitPeas = LINES.flatMap(line => {
  const stops = line
    .map((cell, i) => (circleSet.has(cell) ? i : -1))
    .filter(i => i >= 0);
  return stops.slice(1).map((end, k) => {
    const start = stops[k];
    const first = line[start];
    const last = line[end];
    const middle = line.slice(start + 1, end);
    // Either circle may hold the tens digit; nothing drawn orients a stretch.
    return new Or([
      new Sum(0, ...middle, [first, -10], [last, -1]),
      new Sum(0, ...middle, [last, -10], [first, -1]),
    ]);
  });
});

return [
  new Shape('9x9'),
  shade.toVar('choco banana shading'),
  shade.makeReplicate(new Given(shade.cells()[0], CHOCOLATE, BANANA)),
  chocolateRectangles,
  ...areaSizes,
  ...lineCounts,
  ...splitPeas,
  ...X_PAIRS.map(pair => new X(...pair)),
  ...V_PAIRS.map(pair => new V(...pair)),
];
