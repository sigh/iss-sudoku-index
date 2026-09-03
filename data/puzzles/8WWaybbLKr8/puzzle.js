// Title: Unknown
// Author: Volatility
// Video: https://www.youtube.com/watch?v=8WWaybbLKr8
// Source: https://tinyurl.com/y5ord7hj

// A 12x12 star-battle / loop hybrid with no digits. Rules:
//   - Two stars in every row, column and region; no two stars touch, not even
//     diagonally; no star on a cell carrying a moon or a sun.
//   - Draw one closed loop through cell centres which passes through each
//     region exactly once.
//   - In each region the loop passes through EITHER all of that region's moon
//     cells OR all of its sun cells, and through none of the other kind, and
//     through at least one such cell.
//   - Where the loop crosses from one region into the next, the kind changes:
//     moons in one region, suns in the region it enters next.
//   - The loop may not pass through a star.
// Every clause above is encoded; nothing is omitted.
//
// The loop is carried on three whole-grid overlays rather than a membership
// flag, because nothing in the rules forbids the loop from running alongside
// itself: two loop cells may be orthogonally adjacent without the loop using
// the border between them. VS holds each loop cell's successor direction, so
// "on the loop" is VS != OFF and the used borders are read off VS; VA and VB
// are modular positions along the loop which rule out a second, separate loop
// (see the comment above them).

// Transcribed from the drawn region walls (the 78 border segments in the
// source, flood-filled into 12 regions). [row, col], 1-based.
const REGION_CELLS = [
  [[1,1],[1,2],[1,3],[2,1],[2,2],[2,3],[2,4],[3,1],[3,2],[3,3],[3,4],[3,5],[4,3],[4,4]],
  [[1,4],[1,5],[1,6],[1,7],[1,8],[2,5],[2,6],[2,7],[2,8],[3,6],[3,7]],
  [[1,9],[1,10],[1,11],[1,12],[2,10],[2,11],[2,12],[3,11],[3,12],[4,10],[4,11],[4,12],[5,10],[5,11],[5,12],[6,10],[6,11],[6,12]],
  [[2,9],[3,8],[3,9],[3,10],[4,9]],
  [[4,1],[4,2],[5,1],[5,2],[5,3],[6,1],[6,2],[6,3],[7,1],[7,2],[7,3],[8,1],[8,2],[8,3]],
  [[4,5],[4,6],[5,4],[5,5],[5,6],[5,7],[6,4],[6,5],[6,6],[6,7]],
  [[4,7],[4,8],[5,8],[5,9],[6,8],[6,9],[7,8],[7,9],[8,8],[8,9],[9,7],[9,8]],
  [[7,4],[7,5],[7,6],[7,7],[8,4],[8,5],[8,6],[8,7],[9,5],[9,6]],
  [[7,10],[7,11],[7,12],[8,10],[8,11],[8,12],[9,9],[9,10],[9,11],[9,12],[10,9],[10,10],[10,11],[10,12]],
  [[9,1],[9,2],[10,1],[10,2],[11,1],[11,2],[11,3],[12,1],[12,2],[12,3],[12,4],[12,5],[12,6],[12,7]],
  [[9,3],[9,4],[10,3],[10,4],[10,5],[10,6],[10,7],[10,8],[11,4],[11,5],[11,6],[11,7]],
  [[11,8],[11,9],[11,10],[11,11],[11,12],[12,8],[12,9],[12,10],[12,11],[12,12]],
];

// The 29 drawn moon/sun symbols, as [row, col, kind]. The source draws both
// under one shape id and separates them only by a 1-or-2 style flag, so the
// flag is used as an opaque kind id; the rules treat the two symmetrically
// (each region takes one kind, and the kind alternates), so which flag is the
// moon never enters the encoding.
const MARKS = [
  [1,5,2], [1,9,1], [1,11,2], [2,3,2], [2,7,1], [3,5,1], [3,9,1], [4,1,1],
  [4,5,1], [4,6,1], [4,7,2], [6,9,2], [6,10,2], [6,12,1], [7,5,2], [7,11,1],
  [8,1,2], [8,10,2], [9,6,1], [9,7,2], [9,12,2], [10,2,1], [10,4,2], [10,5,1],
  [10,9,1], [11,3,2], [11,9,2], [11,11,2], [12,10,1],
];

const NOSTAR = 1, STAR = 2;                    // main grid
const OFF = 1, UP = 2, DOWN = 3, LEFT = 4, RIGHT = 5;   // VS
const UNUSED = 1, USED = 2;                    // VE
// Loop positions are counted modulo two coprime numbers whose smallest common
// even multiple, 126, exceeds the 120 non-star cells: see the VA/VB comment.
const MOD_A = 7, OFF_A = MOD_A + 1;            // VA: 1..7 on the loop, 8 off it
const MOD_B = 9, OFF_B = MOD_B + 1;            // VB: 1..9 on the loop, 10 off it

// 10 values: the widest overlay alphabet (VB) sets the range; every layer is
// restricted back to its own values below. 'Raw' because the grid holds a
// star/no-star flag, not digits, so it carries no row/column/box rules.
const shape = new Shape('12x12', 10, 'Raw');
const graph = cellGraph(shape);
const succ = graph.makeOverlay('VS');
const succVar = succ.toVar('loop successor');
const posA = graph.makeOverlay('VA');
const posB = graph.makeOverlay('VB');
const regionKind = new Var('R', 'region kind', REGION_CELLS.length);

// [direction value, dRow, dCol, the value pointing back the other way]
const DIRS = [
  [UP, -1, 0, DOWN],
  [DOWN, 1, 0, UP],
  [LEFT, 0, -1, RIGHT],
  [RIGHT, 0, 1, LEFT],
];
const dirsAt = (cell) => DIRS.filter(d => graph.step(cell, d[1], d[2]));
const stepTo = (cell, dir) => graph.step(cell, dir[1], dir[2]);

const cells = graph.cells();
const regionOf = (() => {
  const map = new Map();
  REGION_CELLS.forEach((rc, i) => rc.forEach(([r, c]) => map.set(makeCellId(r, c), i)));
  return (cell) => map.get(cell);
})();

const machines = new Map();
const machine = (key, build) => {
  if (!machines.has(key)) machines.set(key, build());
  return machines.get(key);
};

// --- Stars ------------------------------------------------------------------

const starCounts = [
  ...graph.rows().map(cs => new ContainExact('2_2', ...cs)),
  ...graph.columns().map(cs => new ContainExact('2_2', ...cs)),
  ...REGION_CELLS.map(rc => new ContainExact('2_2', ...rc.map(([r, c]) => makeCellId(r, c)))),
];

// Every cell is starred or not; nothing else is a legal grid value.
const starDomain = graph.makeReplicate(new Given(cells[0], NOSTAR, STAR));

const noTwoStars = Pair.fnToKey((a, b) => a !== STAR || b !== STAR, shape);
// One offset per unordered king-move adjacency; a Replicate stamps the pair
// onto every adjacency the offset has in the grid.
const noTouching = [[0, 1], [1, 0], [1, 1], [1, -1]].map(([dr, dc]) => {
  const origins = cells.filter(cell => graph.step(cell, dr, dc));
  const anchor = origins[0];
  return new Replicate(
    [new Pair(noTwoStars, 'stars do not touch', anchor, graph.step(anchor, dr, dc))],
    Replicate.encodeTargetCells(origins, anchor, graph), anchor);
});

const noStarOnMark = MARKS.map(([r, c]) => new Given(makeCellId(r, c), NOSTAR));

// --- The loop ---------------------------------------------------------------

// A cell either sits off the loop or points at the next cell along it; a cell
// on the edge of the grid has fewer directions to point in. The seam below
// carries its own, narrower restriction.
const SEAM = makeCellId(4, 5);
const interior = cells.filter(cell => dirsAt(cell).length === DIRS.length);
const succDomain = [
  succ.makeReplicate(
    [new Given(succ.at(interior[0]), OFF, ...DIRS.map(d => d[0]))],
    succ.at(interior.filter(cell => cell !== SEAM))),
  ...cells.filter(cell => !interior.includes(cell)).map(cell =>
    new Given(succ.at(cell), OFF, ...dirsAt(cell).map(d => d[0]))),
];

// Out-degree is 1 for a loop cell by construction; this adds in-degree 1, so
// the loop cells form disjoint directed cycles. It also rejects a cell and its
// successor pointing at each other, which would retrace a single border rather
// than close a loop.
const inDegreeFor = (cell) => {
  const dirs = dirsAt(cell);
  const spec = machine('deg' + dirs.map(d => d[0]).join(''), () => NFA.encodeSpec({
    startState: { phase: 'self' },
    transition: (state, v) => {
      if (state.phase === 'self') return { phase: 'nbr', out: v, pos: 0, count: 0 };
      if (state.pos >= dirs.length) return undefined;   // past the last neighbour
      const dir = dirs[state.pos];
      let count = state.count;
      if (v === dir[3]) {                       // this neighbour points back at us
        if (dir[0] === state.out) return undefined;
        if (++count > 1) return undefined;
      }
      return { phase: 'nbr', out: state.out, pos: state.pos + 1, count };
    },
    accept: (state) => state.count === (state.out === OFF ? 0 : 1),
  }, shape));
  return new NFA(spec, 'loop degree',
    succ.at(cell), ...dirs.map(d => succ.at(stepTo(cell, d))));
};
// The 100 cells away from the grid edge all read the same five-cell shape, so
// one Replicate covers them; the rest have fewer neighbours and are listed.
const inDegree = [
  new Replicate([inDegreeFor(interior[0])],
    Replicate.encodeTargetCells(succ.at(interior), succ.at(interior[0]), succ),
    succ.at(interior[0])),
  ...cells.filter(cell => !interior.includes(cell)).map(inDegreeFor),
];

// VA and VB number the cells along the loop, each one more than its
// predecessor modulo 7 and modulo 9. The step out of the seam cell below is
// left unconstrained, so the loop through the seam may be any length, while
// any *other* directed cycle has every step constrained and so must have a
// length divisible by both 7 and 9. Cycles in a grid are even, and the
// smallest even multiple of 63 is 126, more than the 120 cells left once the
// 24 stars are excluded -- so no second loop can exist.
const counters = [[posA, MOD_A, OFF_A], [posB, MOD_B, OFF_B]].flatMap(
  ([layer, mod, offValue]) => cells.filter(cell => cell !== SEAM).map(cell => {
    const dirs = dirsAt(cell);
    const spec = machine(`ctr${mod}` + dirs.map(d => d[0]).join(''), () => NFA.encodeSpec({
      startState: { phase: 'dir' },
      transition: (state, v) => {
        if (state.phase === 'dir') return { phase: 'own', out: v };
        if (state.phase === 'own') {
          if (state.out === OFF) {
            return v === offValue ? { phase: 'free' } : undefined;
          }
          if (v === offValue) return undefined;
          return { phase: 'nbr', out: state.out, pos: 0, want: (v % mod) + 1 };
        }
        if (state.phase === 'free') return state;
        if (state.pos >= dirs.length) return undefined;   // past the last neighbour
        if (dirs[state.pos][0] === state.out && v !== state.want) return undefined;
        return { phase: 'nbr', out: state.out, pos: state.pos + 1, want: state.want };
      },
      accept: () => true,
      maxDepth: 2 + dirs.length,
    }, shape));
    return new NFA(spec, `loop position mod ${mod}`,
      succ.at(cell), layer.at(cell), ...dirs.map(d => layer.at(stepTo(cell, d))));
  }));

// Position values only; an off-loop cell carries the sentinel instead.
const posDomain = [
  posA.makeReplicate(new Given(posA.at(cells[0]), ...[...Array(OFF_A).keys()].map(i => i + 1))),
  // VB uses the whole 1..10 range, so it needs no restriction.
];

// The seam. R4C5 carries a mark in a region whose marks are all of one kind, so
// that region's kind is forced to that kind and the mark is on the loop: a cell
// the rules put on the loop before anything is solved. Pinning its positions
// fixes the free offset in each counter, and the machine below fixes the loop's
// direction by requiring the border it leaves by to sort before the one it
// arrives on -- both are relabellings of one loop, not extra loops.
const seamDirs = dirsAt(SEAM);
const seam = [
  new Given(succ.at(SEAM), ...seamDirs.map(d => d[0])),
  new Given(posA.at(SEAM), 1),
  new Given(posB.at(SEAM), 1),
  new NFA(NFA.encodeSpec({
    startState: { phase: 'self' },
    transition: (state, v) => {
      if (state.phase === 'self') return { phase: 'nbr', out: v, pos: 0 };
      if (state.pos >= seamDirs.length) return undefined;   // past the last neighbour
      const dir = seamDirs[state.pos];
      if (v === dir[3] && dir[0] <= state.out) return undefined;
      return { phase: 'nbr', out: state.out, pos: state.pos + 1 };
    },
    accept: () => true,
    maxDepth: 1 + seamDirs.length,
  }, shape), 'seam direction',
    succ.at(SEAM), ...seamDirs.map(d => succ.at(stepTo(SEAM, d)))),
];

// A closed loop's cells are one orthogonally-connected group. This follows
// from the loop being single and closed, which the positions above already
// enforce; it is stated separately because the solver reasons about it
// globally, while the positions only relate a cell to its successor.
const loopConnected = new ConnectedValues('VS', DIRS.map(d => d[0]));

const starLoopKey = Pair.fnToKey((star, out) => !(star === STAR && out !== OFF), shape);
const loopAvoidsStars = cells.map(cell =>
  new Pair(starLoopKey, 'loop avoids stars', cell, succ.at(cell)));

// --- Region borders ---------------------------------------------------------

// Every border segment between two regions, as the pair of cells it separates.
const borders = cells.flatMap(cell => [DIRS[1], DIRS[3]]
  .map(dir => [cell, stepTo(cell, dir), dir])
  .filter(([a, b]) => b && regionOf(a) !== regionOf(b)));
const borderVar = new Var('E', 'region border used', borders.length);

// A border is used exactly when the loop steps across it, in either direction.
// The machine reads the flag first and admits only its two values, which is
// also what restricts the flag's domain.
const borderUsed = borders.map(([a, b, dir], i) => {
  const spec = machine('border' + dir[0], () => NFA.encodeSpec({
    startState: { phase: 'flag' },
    transition: (state, v) => {
      if (state.phase === 'flag') {
        if (v !== USED && v !== UNUSED) return undefined;
        return { phase: 'a', used: v === USED };
      }
      if (state.phase === 'a') return { phase: 'b', used: state.used, hit: v === dir[0] };
      if (state.phase === 'b') {
        return { phase: 'done', ok: state.used === (state.hit || v === dir[3]) };
      }
      return undefined;                          // no fourth symbol
    },
    accept: (state) => state.phase === 'done' && state.ok,
    maxDepth: 3,
  }, shape));
  return new NFA(spec, 'border crossed',
    borderVar.cell(i + 1), succ.at(a), succ.at(b));
});

// Passing through a region exactly once means crossing its border exactly
// twice -- once in, once out. With a single loop the two are equivalent.
const visitOnce = REGION_CELLS.map((_, region) => new ContainExact('2_2',
  ...borders.map(([a, b], i) => [a, b, i])
    .filter(([a, b]) => regionOf(a) === region || regionOf(b) === region)
    .map(([, , i]) => borderVar.cell(i + 1))));

// The kind changes at every crossing.
const alternates = borders.map(([a, b], i) => new Or([
  new Sum(UNUSED, borderVar.cell(i + 1)),
  new AllDifferent(regionKind.cell(regionOf(a) + 1), regionKind.cell(regionOf(b) + 1)),
]));

// --- Region kinds -----------------------------------------------------------

const kindDomain = REGION_CELLS.map(
  (_, region) => new Given(regionKind.cell(region + 1), 1, 2));

// A region's marks of the chosen kind are all on the loop and its marks of the
// other kind are all off it.
const markKeys = new Map([1, 2].map(kind =>
  [kind, Pair.fnToKey((out, k) => (out !== OFF) === (k === kind), shape)]));
const markGates = MARKS.map(([r, c, kind]) => new Pair(
  markKeys.get(kind), 'mark on the loop only for its own kind',
  succVar.cell(r, c), regionKind.cell(regionOf(makeCellId(r, c)) + 1)));

// "At least one moon or sun cell in each region" bites only where a region's
// marks are all of one kind: choosing the other kind would leave the loop
// passing through none of them. Counted from MARKS, not from a solution.
const kindForced = REGION_CELLS.map((rc, region) => {
  const inRegion = new Set(rc.map(([r, c]) => makeCellId(r, c)));
  const kinds = new Set(MARKS
    .filter(([r, c]) => inRegion.has(makeCellId(r, c)))
    .map(([, , kind]) => kind));
  return kinds.size === 1
    ? new Given(regionKind.cell(region + 1), [...kinds][0]) : null;
}).filter(Boolean);

return [
  shape,
  succVar,
  posA.toVar(`loop position mod ${MOD_A}`),
  posB.toVar(`loop position mod ${MOD_B}`),
  borderVar,
  regionKind,

  starDomain,
  ...starCounts,
  ...noTouching,
  ...noStarOnMark,

  ...succDomain,
  ...posDomain,
  ...inDegree,
  ...counters,
  ...seam,
  loopConnected,
  ...loopAvoidsStars,

  ...borderUsed,
  ...visitOnce,
  ...alternates,

  ...kindDomain,
  ...kindForced,
  ...markGates,
];
