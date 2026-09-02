// Title: The Special Theory of Relativity
// Author: Tobias Brixner
// Video: https://www.youtube.com/watch?v=I3WmjNwgEjg
// Source: https://sudokupad.app/qhib25buqr

// Normal sudoku, no givens. Each cage is a spaceship at rest. Every ship
// translates along one orthogonal direction to a second footprint that lies
// fully inside the grid, keeping its orientation. Along the direction of travel
// the shape is scaled down by Lobs/Lrest (Lrest = extent at rest, Lobs = extent
// while moving, Lobs < Lrest); the Lorentz factor is gamma = Lrest/Lobs. Size
// and position perpendicular to the travel direction are unchanged. A ship's
// energy is the sum of the digits it covers, and energy_moving = gamma *
// energy_rest. No rest or moving footprint overlaps any other rest or moving
// footprint, a ship's own two footprints included, and no ship sweeps across
// another ship's rest or moving footprint. Cells joined by an X sum to 10.
// The rules say digits may repeat within a spaceship, so the cages carry no
// all-different and no total of their own and no Cage constraint is emitted.

// Drawn geometry, transcribed from the eight cage outlines in source order.
const SHIPS = [
  ['R2C2', 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R3C5'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R7C3', 'R7C4', 'R8C3', 'R8C4'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R6C2', 'R6C3', 'R6C4', 'R6C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R9C5', 'R9C6', 'R9C7'],
];
// Drawn X marks, each on the edge between the two named cells.
const X_EDGES = [['R7C2', 'R7C3'], ['R7C8', 'R7C9']];

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const GRID_SIZE = 9;
const restCells = new Set(SHIPS.flat());

// Motion axes. axis 0 = the ship travels vertically (row index changes and the
// shape is scaled along rows); axis 1 = it travels horizontally.
const AXES = [0, 1];

const coordsOf = id => {
  const { row, col } = parseCellId(id);
  return [row, col];
};
const idOf = (axis, alongPos, acrossPos) =>
  axis === 0 ? makeCellId(alongPos, acrossPos) : makeCellId(acrossPos, alongPos);

// Every travel the rules permit for one ship: a choice of axis, of observed
// length, and of how far along the axis the moving footprint sits.
//
// The shape is a set of runs, one per line perpendicular to the axis. Scaling a
// run [start, start+len) by Lobs/Lrest has to leave both ends on cell
// boundaries, otherwise the contracted ship does not occupy grid cells at all
// and the reading is not a placement. `sweep` is the body's path: in each line
// the ship covers every cell from its resting run to its moving run inclusive,
// which is what "passing through" refers to.
function travels(shipCells) {
  const coords = shipCells.map(coordsOf);
  const out = [];
  for (const axis of AXES) {
    const along = coords.map(c => c[axis]);
    const lo = Math.min(...along);
    const restLen = Math.max(...along) - lo + 1;

    // Group the shape into runs, keyed by the perpendicular coordinate.
    const lines = new Map();
    for (const c of coords) {
      const key = c[1 - axis];
      if (!lines.has(key)) lines.set(key, []);
      lines.get(key).push(c[axis] - lo);
    }
    const runs = [];
    let contiguous = true;
    for (const [key, offsets] of lines) {
      offsets.sort((a, b) => a - b);
      const len = offsets.length;
      if (offsets[len - 1] - offsets[0] !== len - 1) contiguous = false;
      runs.push({ key, start: offsets[0], len });
    }
    // None of the eight drawn shapes breaks this, but a shape with a gap along
    // the axis has no single body run to contract, so skip the axis if so.
    if (!contiguous) continue;

    for (let obsLen = 1; obsLen < restLen; obsLen++) {
      const scaled = [];
      let wholeCells = true;
      for (const run of runs) {
        if ((run.start * obsLen) % restLen || (run.len * obsLen) % restLen) {
          wholeCells = false;
          break;
        }
        scaled.push({
          key: run.key,
          start: (run.start * obsLen) / restLen,
          len: (run.len * obsLen) / restLen,
        });
      }
      if (!wholeCells) continue;

      const span = Math.max(...scaled.map(r => r.start + r.len));
      for (let origin = 1; origin + span - 1 <= GRID_SIZE; origin++) {
        const moving = [];
        const sweep = [];
        for (const r of scaled) {
          const line = runs.find(x => x.key === r.key);
          for (let i = 0; i < r.len; i++) {
            moving.push(idOf(axis, origin + r.start + i, r.key));
          }
          const from = Math.min(lo + line.start, origin + r.start);
          const to = Math.max(lo + line.start + line.len - 1,
            origin + r.start + r.len - 1);
          for (let p = from; p <= to; p++) sweep.push(idOf(axis, p, r.key));
        }
        out.push({ restLen, obsLen, moving, sweep });
      }
    }
  }
  return out;
}

// Keep the travels the fixed part of the geometry already allows: the moving
// footprint may not land on this ship's own resting cells, and the body may not
// cross any other ship's resting cells. Both tests are against drawn cages, so
// they do not depend on where any other ship ends up.
const OPTIONS = SHIPS.map(shipCells => {
  const own = new Set(shipCells);
  return travels(shipCells).filter(t =>
    t.moving.every(c => !own.has(c)) &&
    t.sweep.every(c => !restCells.has(c) || own.has(c)));
});

// One Var per ship holds the 1-based index of the travel it takes. The largest
// option list is longer than 9, so the value range is widened to hold it and the
// playable grid cells are restricted back to 1-9.
const numStates = Math.max(GRID_SIZE, ...OPTIONS.map(o => o.length));
const shape = new Shape('9x9', numStates);
const graph = cellGraph(shape);
const choice = new Var('S', 'ship travel', SHIPS.length);
const choiceCell = i => choice.cell(i + 1);

const digitsOnly = graph.makeReplicate(
  new Given(graph.cells()[0], ...DIGITS));

const choiceDomains = OPTIONS.map((options, i) =>
  new Given(choiceCell(i), ...options.map((_, k) => k + 1)));

// energy_moving = gamma * energy_rest with gamma = restLen/obsLen, cleared of
// the fraction: obsLen * sum(moving cells) - restLen * sum(resting cells) = 0.
// Each branch is guarded by the ship's choice Var, so exactly the chosen
// travel's energy equation is enforced.
const energy = OPTIONS.map((options, i) => new Or(
  options.map((t, k) => new And([
    new Given(choiceCell(i), k + 1),
    new Sum(0,
      ...t.moving.map(c => [c, t.obsLen]),
      ...SHIPS[i].map(c => [c, -t.restLen])),
  ]))));

// Ship-to-ship geometry. A resting footprint is fixed, so the only pair of
// unknowns left is one ship's body against another ship's moving footprint;
// forbidding both directions also forbids the two moving footprints from
// overlapping, since a ship's sweep contains its moving footprint. Pairs whose
// options never conflict are dropped: their table would permit everything.
const clearance = [];
for (let i = 0; i < SHIPS.length; i++) {
  for (let j = i + 1; j < SHIPS.length; j++) {
    const ok = (a, b) => {
      const s = OPTIONS[i][a - 1], t = OPTIONS[j][b - 1];
      if (!s || !t) return false;
      return s.sweep.every(c => !t.moving.includes(c)) &&
        t.sweep.every(c => !s.moving.includes(c));
    };
    let restricts = false;
    for (let a = 1; a <= OPTIONS[i].length; a++) {
      for (let b = 1; b <= OPTIONS[j].length; b++) if (!ok(a, b)) restricts = true;
    }
    if (!restricts) continue;
    clearance.push(new Pair(
      Pair.fnToKey(ok, shape), `clear${i + 1}${j + 1}`,
      choiceCell(i), choiceCell(j)));
  }
}

const xMarks = X_EDGES.map(([a, b]) => new X(a, b));

return [
  shape,
  choice,
  digitsOnly,
  ...choiceDomains,
  ...energy,
  ...clearance,
  ...xMarks,
];
