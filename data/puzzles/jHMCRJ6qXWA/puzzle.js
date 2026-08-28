// Title: Orbital Sandwiches 3
// Author: Dusara
// Video: https://www.youtube.com/watch?v=jHMCRJ6qXWA
// Source: https://tinyurl.com/rzv6m9yw

// Normal Sudoku rules apply.
//
// The grid is drawn as concentric square rings ("orbital paths") around the
// central square R5C5; the shading alternates ring by ring, marking them out.
// Each numbered small circle ("planet") straddles the boundary between two
// cells that are neighbours on one of those rings.
//
// A sandwich is a run of digits enclosed by a 9 (crown) and a 1 (heel). Every
// planet lies inside a sandwich taken along its own ring, read cyclically, and
// the number on the planet is the sum of the digits between the two buns.
// Digits inside a sandwich may repeat but are never 9 or 1, so the buns are the
// nearest 9-or-1 cell on each side of the planet, and those two must be one 9
// and one 1.
//
// The large circle on R5C5 is the central square the orbits run around: it
// carries no number and states no constraint. No rule is omitted.

const CENTRE = { row: 5, col: 5 };

// The cells at Chebyshev distance `r` from CENTRE, in cyclic order starting at
// the ring's top-left corner. Length 8r: 32 for the grid border (r = 4), 24 and
// 8 for the two shaded rings (r = 3, r = 1).
const orbit = (r) => {
  const lo = CENTRE.row - r;
  const hi = CENTRE.row + r;
  const cells = [];
  for (let c = lo; c <= hi; c++) cells.push(makeCellId(lo, c));
  for (let x = lo + 1; x <= hi; x++) cells.push(makeCellId(x, hi));
  for (let c = hi - 1; c >= lo; c--) cells.push(makeCellId(hi, c));
  for (let x = hi - 1; x > lo; x--) cells.push(makeCellId(x, lo));
  return cells;
};

const ringRadius = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return Math.max(Math.abs(row - CENTRE.row), Math.abs(col - CENTRE.col));
};

// The nine numbered circles and the number printed on each. Every circle is
// drawn over exactly two cells; both lie on the same ring and are adjacent on
// it, which is what puts the planet on the orbital path rather than in a cell.
const PLANETS = [
  { cells: ['R1C6', 'R1C5'], sum: 17 },
  { cells: ['R2C5', 'R2C4'], sum: 16 },
  { cells: ['R5C1', 'R4C1'], sum: 34 },
  { cells: ['R5C2', 'R6C2'], sum: 14 },
  { cells: ['R9C5', 'R9C4'], sum: 8 },
  { cells: ['R8C5', 'R8C6'], sum: 30 },
  { cells: ['R6C9', 'R5C9'], sum: 22 },
  { cells: ['R5C8', 'R4C8'], sum: 6 },
  { cells: ['R5C4', 'R6C4'], sum: 22 },
];

// Rotate a planet's ring so the scan starts at one of the two cells the planet
// sits between and ends at the other. The planet is then the gap between the
// last and first cell read, so its sandwich is exactly the head run plus the
// tail run of the scan. Which of the two cells starts the scan only mirrors the
// reading, so the ring's own direction carries no meaning here.
const scanOrder = (planet) => {
  const cells = orbit(ringRadius(planet.cells[0]));
  const n = cells.length;
  const i = cells.indexOf(planet.cells[0]);
  const j = cells.indexOf(planet.cells[1]);
  const start = (i + 1) % n === j ? j : i;
  return cells.slice(start).concat(cells.slice(0, start));
};

// Reads a whole ring, cut at the planet. `pre` is the sum of the head run,
// closed off by the first bun seen; `tail` is the sum since the most recent
// bun, which is the tail run once the scan ends. `f` and `l` are the first and
// last bun values, and must differ so that the planet is enclosed by a 9 and a
// 1 rather than by two crowns or two heels. Digits are dropped from `pre` and
// `tail` only towards the target: `pre` can never shrink, so overshooting it
// rejects, while an over-target `tail` becomes the sink OVER because a later
// bun still resets it to 0.
const OVER = -1;
const sandwichSpec = (target) => NFA.encodeSpec({
  startState: { pre: 0, f: 0, l: 0, tail: 0 },
  transition: (s, v) => {
    const isBun = v === 9 || v === 1;
    if (s.f === 0) {
      if (isBun) return { pre: s.pre, f: v, l: v, tail: 0 };
      const pre = s.pre + v;
      return pre > target ? undefined : { pre: pre, f: 0, l: 0, tail: 0 };
    }
    if (isBun) return { pre: s.pre, f: s.f, l: v, tail: 0 };
    const tail = s.tail === OVER ? OVER : s.tail + v;
    return {
      pre: s.pre,
      f: s.f,
      l: s.l,
      tail: tail === OVER || s.pre + tail > target ? OVER : tail,
    };
  },
  accept: (s) => s.f !== 0 && s.l !== s.f && s.tail !== OVER
    && s.pre + s.tail === target,
}, 9);

const sandwiches = PLANETS.map((planet) => new NFA(
  sandwichSpec(planet.sum),
  'Orbit' + planet.sum,
  ...scanOrder(planet)));

return [
  new Shape('9x9'),

  new Given('R2C4', 9),
  new Given('R4C8', 1),
  new Given('R6C2', 1),
  new Given('R8C6', 9),

  ...sandwiches,
];
