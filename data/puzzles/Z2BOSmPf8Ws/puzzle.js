// Title: Sashigane Whispers
// Author: yttrio
// Video: https://www.youtube.com/watch?v=Z2BOSmPf8Ws
// Source: https://sudokupad.app/tl5phvto7f

// Rules encoded here:
//   Normal sudoku.
//   Sashigane: the grid is divided into orthogonally connected regions, each an
//     L shape one cell wide.
//   Arrows lie at one end of an L and point toward the bend; the arrow digit is
//     the number of cells along that leg, counting the bend and arrow cells.
//   Circles lie at the bend of an L; the circled digit is the region's total
//     cell count, counting the circled cell.
//   Any region containing a circle or an arrow acts as a German whispers line:
//     adjacent digits inside that region differ by at least 5. A region with no
//     circle or arrow is unrestricted.
//
// Omitted: "Digits cannot repeat within a region", in the only part of it that
//   is not already implied. Every region cell shares its row or its column with
//   the bend, so sudoku already separates the bend from every other region cell
//   and separates any two cells of the same leg. What is left unencoded is the
//   cross-leg part: a cell of the vertical leg and a cell of the horizontal leg
//   share neither row nor column, and this encoding does not force them to
//   differ. The size bound that follows from it (no region larger than 9 cells)
//   is therefore also absent, except where a circle states the size.

// The Sashigane partition, as a per-cell overlay: each cell records the
// direction of the next cell along its own region toward that region's bend,
// or BEND for the bend itself. Region = a bend plus the two pointer chains
// running into it, so the partition is fixed entirely by local conditions.
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

// Drawn clues, transcribed from the puzzle art: three circles (white discs) and
// five arrows, each arrow a half-cell stroke from its cell centre.
const CIRCLES = ['R1C1', 'R2C2', 'R5C5'];
const ARROWS = [
  { cell: 'R9C7', code: 5 },  // points right
  { cell: 'R8C4', code: 4 },  // points left
  { cell: 'R6C6', code: 2 },  // points up
  { cell: 'R4C9', code: 2 },  // points up
  { cell: 'R5C7', code: 5 },  // points right
];

const g = cellGraph('9x9');
const p = g.makeOverlay('VP');

const rayFrom = (cell, d) => g.ray(cell, d.dr, d.dc).slice(1);

// Local L-partition machine, read over [cell, ...its in-grid neighbours].
// `presentCodes` names the neighbour directions in scan order, so the machine
// knows which neighbour each symbol is. It enforces two things:
//   - a cell pointing in direction d has a neighbour there whose own pointer is
//     the same direction or BEND, which makes every chain a straight run ending
//     at a bend and rules out branches and cycles;
//   - a bend is entered by exactly two chains, on perpendicular axes, which is
//     what makes each region an L one cell wide with both legs non-empty.
const specCache = new Map();
function localSpec(presentCodes) {
  const key = presentCodes.join(',');
  if (!specCache.has(key)) {
    specCache.set(key, NFA.encodeSpec({
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
  return specCache.get(key);
}

const partition = g.cells().map(cell => {
  const present = DIRS.filter(d => g.step(cell, d.dr, d.dc) !== null);
  return new NFA(
    localSpec(present.map(d => d.code)), 'L',
    p.at(cell), ...present.map(d => p.at(g.step(cell, d.dr, d.dc))));
});

// Circle: the digit counts the whole region. Segment 0 is the circled digit;
// each later segment is one ray of pointers leaving the bend, and the machine
// counts the leading run of pointers aimed back at the bend. Rays that are not
// legs stop on their first symbol and contribute nothing.
function circleSizeConstraint(cell) {
  const rays = DIRS
    .map(d => ({ expect: OPP[d.code], cells: p.at(rayFrom(cell, d)) }))
    .filter(r => r.cells.length > 0);
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
  return new NFA(spec, 'CircleSize', [cell], ...rays.map(r => r.cells));
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

// Whispers along the arrow's own leg: the arrow digit is that leg's cell count,
// so the machine whispers over exactly that many cells from the arrow inward.
function arrowLegWhisper({ cell, code }) {
  const d = DIR_BY_CODE.get(code);
  const ray = g.ray(cell, d.dr, d.dc);
  const spec = NFA.encodeSpec({
    startState: { left: -1, prev: 0 },
    transition(s, v) {
      if (s.left === -1) return { left: v - 1, prev: v };
      if (s.left === 0) return s;
      if (Math.abs(v - s.prev) < 5) return undefined;
      const left = s.left - 1;
      return { left, prev: left === 0 ? 0 : v };
    },
    accept: s => s.left === 0,
    maxDepth: ray.length,
  }, 9);
  return new NFA(spec, 'ArrowWhisper', ...ray);
}

// Whispers along one leg leaving a known bend, over the interleaved sequence
// [bend digit, pointer, digit, pointer, digit, ...]. The machine whispers while
// the pointers keep aiming back at the bend and falls silent once they stop, so
// applying it to a direction that is not a leg of this region constrains
// nothing.
function armWhisper(bend, d) {
  const ray = rayFrom(bend, d);
  if (ray.length === 0) return null;
  const expect = OPP[d.code];
  const spec = NFA.encodeSpec({
    startState: { phase: 0, active: true, prev: 0 },
    transition(s, v) {
      if (s.phase === 0) return { phase: 1, active: true, prev: v };
      if (s.phase === 1) {
        const active = s.active && v === expect;
        return { phase: 2, active, prev: active ? s.prev : 0 };
      }
      if (!s.active) return { phase: 1, active: false, prev: 0 };
      if (Math.abs(v - s.prev) < 5) return undefined;
      return { phase: 1, active: true, prev: v };
    },
    accept: () => true,
    maxDepth: 1 + 2 * ray.length,
  }, 9);
  const cells = [bend];
  for (const c of ray) cells.push(p.at(c), c);
  return new NFA(spec, 'ArmWhisper', ...cells);
}

// A circle sits at its region's bend, so both legs are whispered from there.
const circleClues = CIRCLES.flatMap(cell => [
  new Given(p.at(cell), BEND),
  circleSizeConstraint(cell),
  ...DIRS.map(d => armWhisper(cell, d)).filter(Boolean),
]);

// An arrow sits at a leg end pointing at the bend, so: its own pointer is the
// arrow direction; the cell behind it must not point at it, which is what puts
// the arrow at the end of the leg; and the leg count and leg whispers apply.
// The bend itself is the arrow digit minus one step along the ray, so the far
// leg is whispered under an Or over the candidate bends, each branch pinning
// the arrow digit that places the bend there.
const arrowClues = ARROWS.flatMap(arrow => {
  const d = DIR_BY_CODE.get(arrow.code);
  const behind = g.step(arrow.cell, -d.dr, -d.dc);
  const perp = DIRS.filter(o => o.axis !== d.axis);
  const branches = rayFrom(arrow.cell, d).map((bend, i) => new And([
    new Given(arrow.cell, i + 2),
    ...perp.map(o => armWhisper(bend, o)).filter(Boolean),
  ]));
  return [
    new Given(p.at(arrow.cell), arrow.code),
    ...(behind ? [new Given(p.at(behind), ...[1, 2, 3, 4, 5].filter(v => v !== arrow.code))] : []),
    arrowCountConstraint(arrow),
    arrowLegWhisper(arrow),
    new Or(branches),
  ];
});

return [
  new Shape('9x9'),
  p.toVar('sashigane'),
  new Given('R8C8', 6),
  ...partition,
  ...circleClues,
  ...arrowClues,
];
