// Title: Sashigane Sudoku
// Author: Ambrose
// Video: https://www.youtube.com/watch?v=ikMsx9EPWZE
// Source: https://app.crackingthecryptic.com/sudoku/3n92Hf2fGQ

// Rules encoded here:
//   Normal sudoku. The grid carries no given digits.
//   Sashigane: the grid is divided into one-cell-wide L-shaped regions, each a
//     bend cell with one non-empty straight leg leaving it vertically and one
//     leaving it horizontally.
//   Digits may not repeat within a region.
//   A circled cell is the bend of its region, and its digit is that region's
//     total cell count.
//   An arrow cell is an end of its region, the arrow points along that region's
//     leg towards the bend, and the arrow digit counts that leg's cells,
//     including the bend cell.
//   A small number in a cell's top-left corner is the sum of the whole region
//     that cell belongs to; the clued cell may sit anywhere in its region.
//
// None of the three clue types is exhaustive -- the rules say a region may lack
// any or all of them -- so an unmarked bend, an unmarked region end and an
// entirely unclued region are all permitted, and nothing is imposed on
// unmarked cells.
//
// "L-shaped" plus both clue sentences speaking of *the* bend of a region is
// read as requiring a genuine L: a bend with two non-empty perpendicular legs,
// so the smallest region is 3 cells. The degenerate reading, under which a
// straight run or a single cell counts as an L, would be the default only if
// the text were silent about the bend.

const BEND = 1;
const DIRS = [
  { code: 2, dr: -1, dc: 0, axis: 1 },  // bend lies above
  { code: 3, dr: 1, dc: 0, axis: 1 },   // bend lies below
  { code: 4, dr: 0, dc: -1, axis: 2 },  // bend lies to the left
  { code: 5, dr: 0, dc: 1, axis: 2 },   // bend lies to the right
];
const OPP = { 2: 3, 3: 2, 4: 5, 5: 4 };
const AXIS = { 2: 1, 3: 1, 4: 2, 5: 2 };
const DIR_BY_CODE = new Map(DIRS.map(d => [d.code, d]));

// Drawn clues, transcribed from the puzzle art: six white discs drawn centred
// in a cell, eight arrows each a half-cell stroke from its cell's centre
// towards one side, and eight small numbers printed inside a cell's top-left
// corner.
const CIRCLES = ['R2C7', 'R4C8', 'R5C6', 'R5C9', 'R8C1', 'R8C8'];
const ARROWS = [
  { cell: 'R2C1', code: 5 },  // points right
  { cell: 'R2C5', code: 4 },  // points left
  { cell: 'R4C5', code: 5 },  // points right
  { cell: 'R5C3', code: 2 },  // points up
  { cell: 'R6C5', code: 4 },  // points left
  { cell: 'R7C1', code: 2 },  // points up
  { cell: 'R7C3', code: 5 },  // points right
  { cell: 'R9C6', code: 4 },  // points left
];
const CORNER_SUMS = [
  { cell: 'R3C2', total: 15 },
  { cell: 'R5C1', total: 19 },
  { cell: 'R6C2', total: 17 },
  { cell: 'R6C8', total: 28 },
  { cell: 'R8C5', total: 15 },
  { cell: 'R8C9', total: 22 },
  { cell: 'R9C1', total: 13 },
  { cell: 'R9C4', total: 25 },
];

const g = cellGraph('9x9');

// Three overlays carry the partition. VP is the primary one: each cell records
// the direction of the next cell along its own region towards that region's
// bend, or BEND for the bend itself, so a region is a bend plus the two pointer
// chains running into it and the partition is fixed by purely local conditions.
// VR and VC name the row and column of the cell's own bend; they are a function
// of VP, and exist so that "these two cells are in the same region" can be
// tested by a constraint that reads only the two cells involved.
const p = g.makeOverlay('VP');
const vr = g.makeOverlay('VR');
const vc = g.makeOverlay('VC');

const rayFrom = (cell, d) => g.ray(cell, d.dr, d.dc).slice(1);

// The four rays leaving a candidate bend. `expect` is the pointer value a ray
// cell carries while it is still inside this bend's leg: a cell one step
// further out along direction d belongs to that leg exactly when it points back
// along OPP[d].
const raysFrom = (bend) => DIRS
  .map(d => ({ expect: OPP[d.code], axis: d.axis, cells: rayFrom(bend, d) }))
  .filter(r => r.cells.length > 0);

// A ray read as [pointer, digit, pointer, digit, ...] so one machine can test
// leg membership and read the digit in the same pass.
const interleave = (cells) => cells.flatMap(c => [p.at(c), c]);

// Local L-partition machine, read over [cell, ...its in-grid neighbours].
// `presentCodes` names the neighbour directions in scan order, so the machine
// knows which neighbour each symbol is. It enforces two things:
//   - a cell pointing in direction d has a neighbour there whose own pointer is
//     the same direction or BEND, which makes every chain a straight run ending
//     at a bend and rules out branches and cycles;
//   - a bend is entered by exactly two chains, on perpendicular axes, which is
//     what makes each region an L one cell wide with both legs non-empty.
const localCache = new Map();
function localSpec(presentCodes) {
  const key = presentCodes.join(',');
  if (!localCache.has(key)) {
    localCache.set(key, NFA.encodeSpec({
      startState: { i: 0, self: 0, inCount: 0, axes: 0 },
      transition({ i, self, inCount, axes }, v) {
        if (v < 1 || v > 5) return undefined;
        if (i === 0) {
          // A cell may not point off the grid.
          if (v !== BEND && !presentCodes.includes(v)) return undefined;
          return { i: 1, self: v, inCount: 0, axes: 0 };
        }
        const d = presentCodes[i - 1];
        if (self === d && v !== d && v !== BEND) return undefined;
        let nIn = inCount;
        let nAxes = axes;
        if (v === OPP[d]) {  // this neighbour points back at the cell
          if (self !== BEND && self !== OPP[d]) return undefined;
          if (self === BEND) {
            nIn = inCount + 1;
            if (nIn > 2) return undefined;
            nAxes = axes | AXIS[d];
          }
        }
        return { i: i + 1, self, inCount: nIn, axes: nAxes };
      },
      // axes === 3 is one vertical chain and one horizontal chain.
      accept: ({ i, self, inCount, axes }) =>
        i === presentCodes.length + 1 &&
        (self !== BEND || (inCount === 2 && axes === 3)),
      maxDepth: presentCodes.length + 1,
    }, 9));
  }
  return localCache.get(key);
}

const partition = g.cells().map(cell => {
  const present = DIRS.filter(d => g.step(cell, d.dr, d.dc) !== null);
  return new NFA(
    localSpec(present.map(d => d.code)), 'L',
    p.at(cell), ...present.map(d => p.at(g.step(cell, d.dr, d.dc))));
});

// VR/VC at a bend are that bend's own coordinates; elsewhere they are copied
// from the next cell along the chain, so every cell ends up holding the
// coordinates of the bend its chain terminates at.
const bendAnchors = g.cells().map(cell => {
  const { row, col } = parseCellId(cell);
  return new Or([
    new Given(p.at(cell), 2, 3, 4, 5),
    new And([
      new Given(p.at(cell), BEND),
      new Given(vr.at(cell), row),
      new Given(vc.at(cell), col),
    ]),
  ]);
});

// Read over [pointer of this cell, coordinate here, coordinate one step along
// direction `code`]: when the cell points that way the two coordinates must
// agree, and otherwise the machine says nothing.
const copyCache = new Map();
function copySpec(code) {
  if (!copyCache.has(code)) {
    copyCache.set(code, NFA.encodeSpec({
      startState: { i: 0, care: false, ref: 0 },
      transition(s, v) {
        if (s.i === 0) return { i: 1, care: v === code, ref: 0 };
        if (s.i === 1) return { i: 2, care: s.care, ref: s.care ? v : 0 };
        if (s.care && v !== s.ref) return undefined;
        return { i: 3, care: false, ref: 0 };
      },
      accept: s => s.i === 3,
      maxDepth: 3,
    }, 9));
  }
  return copyCache.get(code);
}

const bendCoords = g.cells().flatMap(cell => DIRS.flatMap(d => {
  const nb = g.step(cell, d.dr, d.dc);
  if (nb === null) return [];
  return [
    new NFA(copySpec(d.code), 'BendRow', p.at(cell), vr.at(cell), vr.at(nb)),
    new NFA(copySpec(d.code), 'BendCol', p.at(cell), vc.at(cell), vc.at(nb)),
  ];
}));

// "Digits may not repeat in a region", in the one part of it that sudoku does
// not already give. Every region cell shares its row or its column with the
// bend, so the row and column groups already separate the bend from every other
// region cell and separate any two cells of the same leg; what is left is the
// cross-leg pairs, which share neither line. Read over
// [VR(a), VR(b), VC(a), VC(b), a, b], the machine follows the two cells' bend
// coordinates and rejects only when both coordinates agree -- same region --
// and the digits are equal. One spec serves all such pairs.
const distinctSpec = NFA.encodeSpec({
  startState: { i: 0, ref: 0, live: true },
  transition(s, v) {
    if (s.i === 0) return { i: 1, ref: v, live: true };
    if (s.i === 1) return { i: 2, ref: 0, live: v === s.ref };
    if (s.i === 2) return { i: 3, ref: s.live ? v : 0, live: s.live };
    if (s.i === 3) return { i: 4, ref: 0, live: s.live && v === s.ref };
    if (s.i === 4) return { i: 5, ref: s.live ? v : 0, live: s.live };
    if (s.live && v === s.ref) return undefined;
    return { i: 6, ref: 0, live: false };
  },
  accept: s => s.i === 6,
  maxDepth: 6,
}, 9);

const gridCells = g.cells();
const crossLegDistinct = gridCells.flatMap((a, i) => {
  const pa = parseCellId(a);
  return gridCells.slice(i + 1)
    .filter(b => {
      const pb = parseCellId(b);
      return pa.row !== pb.row && pa.col !== pb.col;
    })
    .map(b => new NFA(distinctSpec, 'RegionDistinct',
      vr.at(a), vr.at(b), vc.at(a), vc.at(b), a, b));
});

// Circle: the digit counts the whole region. Segment 0 is the circled digit;
// each later segment is one ray of pointers leaving the bend, and the machine
// counts the leading run of pointers aimed back at the bend. Rays that are not
// legs stop on their first symbol and contribute nothing.
function circleSizeConstraint(cell) {
  const rays = raysFrom(cell);
  const expected = rays.map(r => r.expect);
  const cellCount = 1 + rays.reduce((n, r) => n + r.cells.length, 0);
  const spec = NFA.encodeSpec({
    startState: { seg: 0, target: 0, count: 0, active: false },
    transition(s, v) {
      if (v === SEGMENT_BREAK) {
        return { seg: s.seg + 1, target: s.target, count: s.count, active: true };
      }
      if (s.seg === 0) return { seg: 0, target: v, count: 0, active: false };
      if (!s.active) return s;
      if (v !== expected[s.seg - 1]) {
        return { seg: s.seg, target: s.target, count: s.count, active: false };
      }
      const count = s.count + 1;
      if (count > s.target - 1) return undefined;
      return { seg: s.seg, target: s.target, count, active: true };
    },
    accept: s => s.seg === expected.length && s.count === s.target - 1,
    maxDepth: cellCount + expected.length,
  }, 9, { multiSegment: true });
  return new NFA(spec, 'CircleSize', [cell], ...rays.map(r => p.at(r.cells)));
}

// Arrow: the digit counts the arrow's own leg, arrow cell through bend. Read
// over [arrow digit, pointers from the arrow cell along the arrow direction],
// the machine requires target - 1 pointers in the arrow direction followed by
// the bend. target >= 2 because the arrow is at a leg end, never at the bend.
function arrowCountConstraint({ cell, code }) {
  const d = DIR_BY_CODE.get(code);
  const ray = g.ray(cell, d.dr, d.dc);
  const spec = NFA.encodeSpec({
    startState: { target: 0, n: 0, done: false },
    transition(s, v) {
      if (s.done) return s;
      if (s.target === 0) {
        if (v < 2) return undefined;
        return { target: v, n: 0, done: false };
      }
      if (v === code) {
        const n = s.n + 1;
        if (n > s.target - 1) return undefined;
        return { target: s.target, n, done: false };
      }
      if (v === BEND && s.n === s.target - 1) {
        return { target: 0, n: 0, done: true };
      }
      return undefined;
    },
    accept: s => s.done,
    maxDepth: 1 + ray.length,
  }, 9);
  return new NFA(spec, 'ArrowLeg', cell, ...p.at(ray));
}

// Region total at a known bend. Segment 0 is the bend's own digit; each later
// segment is one ray read as [pointer, digit, ...], and the machine adds the
// digits of the leading run of cells pointing back at the bend, falling silent
// once that run ends. Rejecting as soon as the running total passes the clue
// keeps the state space finite.
function regionSumConstraint(bend, total) {
  const rays = raysFrom(bend);
  const expected = rays.map(r => r.expect);
  const cellCount = 1 + rays.reduce((n, r) => n + 2 * r.cells.length, 0);
  const spec = NFA.encodeSpec({
    startState: { seg: 0, phase: 0, sum: 0, live: false },
    transition(s, v) {
      if (v === SEGMENT_BREAK) {
        return { seg: s.seg + 1, phase: 0, sum: s.sum, live: true };
      }
      if (s.seg === 0) {
        if (v > total) return undefined;
        return { seg: 0, phase: 0, sum: v, live: false };
      }
      if (s.phase === 0) {  // a ray cell's pointer
        return {
          seg: s.seg, phase: 1, sum: s.sum,
          live: s.live && v === expected[s.seg - 1],
        };
      }
      // a ray cell's digit, added only while still inside the leg
      if (!s.live) return { seg: s.seg, phase: 0, sum: s.sum, live: false };
      const sum = s.sum + v;
      if (sum > total) return undefined;
      return { seg: s.seg, phase: 0, sum, live: true };
    },
    accept: s => s.seg === expected.length && s.sum === total,
    maxDepth: cellCount + expected.length,
  }, 9, { multiSegment: true });
  return new NFA(
    spec, 'RegionSum', [bend], ...rays.map(r => interleave(r.cells)));
}

// Corner sum: the clued cell may sit anywhere in its region, so its bend is
// wherever its own pointer chain terminates -- at itself, or at a cell reached
// by a straight run in one direction. Each branch pins that chain and applies
// the region total at the bend it names. The branches are mutually exclusive
// because a cell has exactly one pointer chain, and they are exhaustive because
// the chain cannot leave the grid.
function cornerSumConstraint({ cell, total }) {
  const branches = [new And([
    new Given(p.at(cell), BEND),
    regionSumConstraint(cell, total),
  ])];
  for (const d of DIRS) {
    const ray = rayFrom(cell, d);
    ray.forEach((bend, i) => branches.push(new And([
      ...[cell, ...ray.slice(0, i)].map(c => new Given(p.at(c), d.code)),
      new Given(p.at(bend), BEND),
      regionSumConstraint(bend, total),
    ])));
  }
  return new Or(branches);
}

const circleClues = CIRCLES.flatMap(cell => [
  new Given(p.at(cell), BEND),
  circleSizeConstraint(cell),
]);

// An arrow sits at a leg end pointing at the bend, so its own pointer is the
// arrow direction and the cell behind it must not point at it -- that second
// half is what puts the arrow at the end of its leg rather than inside it.
const arrowClues = ARROWS.flatMap(arrow => {
  const d = DIR_BY_CODE.get(arrow.code);
  const behind = g.step(arrow.cell, -d.dr, -d.dc);
  return [
    new Given(p.at(arrow.cell), arrow.code),
    ...(behind
      ? [new Given(p.at(behind), ...[1, 2, 3, 4, 5].filter(v => v !== arrow.code))]
      : []),
    arrowCountConstraint(arrow),
  ];
});

return [
  new Shape('9x9'),
  p.toVar('sashigane'),
  vr.toVar('bend row'),
  vc.toVar('bend column'),
  ...partition,
  ...bendAnchors,
  ...bendCoords,
  ...crossLegDistinct,
  ...circleClues,
  ...arrowClues,
  ...CORNER_SUMS.map(cornerSumConstraint),
];
