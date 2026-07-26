// Title: It's A Wonderful Day For Pi!
// Author: SirWoezel
// Video: https://www.youtube.com/watch?v=-QcSeQcEo0M
// Source: https://sudokupad.app/pxw6dzgcdp

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
//
// Mean Diamonds: a digit N in a blue diamond cell means that, for at least
// one direction the drawn line leaves the diamond, the first N digits from
// the diamond (its own digit plus the next N-1 cells along that direction)
// average exactly N -- i.e. sum to N*N. An endpoint diamond has one
// direction leaving it; an interior diamond has two. "Any line leaving from
// that diamond" is read existentially (at least one of the up to two
// directions, not necessarily both): the diamond sits where the single
// drawn line splits into two distinct rays, and "any" picks an unspecified
// one of them, rather than asserting the property of every one of them
// simultaneously.
//
// The rule's closing sentence -- "All cells on a line must be counted in at
// least one of those averages" -- is not encoded (omitted).
//
// Pi Day: the three gold cells hold the digits 1, 3 and 4, in some order.

// Line geometry: the two coloured lines from the payload's `lines[]`, each
// interpolated cell-by-cell along its drawn wayPoints (blue, thickness
// 9.6). LINE_A merges payload lines[0] and lines[1], which share an
// endpoint at the same non-cell-centre corner waypoint and are one
// continuous stroke. Between R3C7 and R3C4, lines[0]'s waypoints route
// through that same corner point via two more 45-degree diagonal legs;
// interpolating those legs (not just their shared corner) crosses two more
// cell centres, R2C6 and R2C5, that a simple endpoint-to-endpoint pairing
// misses because neither leg starts or ends on a cell centre.
const LINE_A = [
  'R6C4', 'R7C4', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7',
  'R3C7', 'R2C6', 'R2C5', 'R3C4', 'R3C3', 'R2C3', 'R3C2', 'R4C3', 'R4C4', 'R4C5',
  'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R7C5', 'R6C5', 'R5C5', 'R5C4', 'R5C3', 'R4C2',
  'R3C1', 'R2C2', 'R1C3', 'R2C4', 'R1C5', 'R1C6',
];

// LINE_B is payload lines[2], interpolated the same way; no corner
// waypoints on this stroke, so it is a straightforward cell-centre chain.
const LINE_B = [
  'R3C8', 'R2C8', 'R3C9', 'R4C9', 'R5C8', 'R6C9', 'R6C8', 'R7C8', 'R8C8', 'R9C7',
  'R9C6', 'R9C5', 'R9C4', 'R8C3', 'R8C2', 'R7C2', 'R6C1', 'R5C1', 'R4C1',
];

// Diamond marker cells: the nine 0.5x0.5, 45-degree-rotated blue overlays.
const DIAMOND_CELLS = new Set([
  'R5C3', 'R4C1', 'R4C3', 'R1C6', 'R4C7', 'R3C8', 'R9C7', 'R7C5', 'R6C4',
]);

// Gold cells for the Pi Day rule: the three 1x1 gold underlays.
const GOLD_CELLS = ['R5C3', 'R5C5', 'R7C5'];

// One NFA spec, shared by every diamond/direction. It reads the diamond's
// own digit as the target window length N, then consumes exactly N-1 more
// digits, summing all N and checking the total equals N*N. Once the window
// resolves (true or false) the state becomes a sink and ignores the rest of
// the ray, so the same spec can be scanned over each diamond's whole
// remaining ray without caring what lies beyond its own window.
const MEAN_DIAMOND_SPEC = NFA.encodeSpec({
  startState: { target: null, remaining: null, sum: 0, ok: null },
  transition: (state, value) => {
    if (state.target === null) {
      // First cell consumed is the diamond itself.
      const remaining = value - 1;
      const sum = value;
      if (remaining === 0) {
        return { target: value, remaining: 0, sum, ok: sum === value * value };
      }
      return { target: value, remaining, sum, ok: null };
    }
    if (state.ok !== null) return state; // sink: this window already resolved
    // Clamp the running sum once it can only fail, to bound the state space.
    const sum = Math.min(state.sum + value, state.target * state.target + 1);
    const remaining = state.remaining - 1;
    if (remaining === 0) {
      return { target: state.target, remaining: 0, sum, ok: sum === state.target * state.target };
    }
    return { target: state.target, remaining, sum, ok: null };
  },
  accept: (state) => state.ok === true,
}, 9);

// Per line: one constraint per diamond requiring at least one of its
// available directions' MEAN_DIAMOND_SPEC window to hold (an endpoint
// diamond has only one direction, so that single NFA is mandatory; an
// interior diamond gets Or(forward, backward)).
function meanDiamondConstraints(line) {
  const diamondIdx = [];
  line.forEach((cell, i) => { if (DIAMOND_CELLS.has(cell)) diamondIdx.push(i); });

  return diamondIdx.map(i => {
    const directions = [];
    if (i < line.length - 1) {
      directions.push(new NFA(MEAN_DIAMOND_SPEC, 'MeanDiamond', ...line.slice(i)));
    }
    if (i > 0) {
      directions.push(new NFA(MEAN_DIAMOND_SPEC, 'MeanDiamond', ...line.slice(0, i + 1).reverse()));
    }
    return directions.length > 1 ? new Or(directions) : directions[0];
  });
}

return [
  new Shape('9x9'),
  new AllDifferent(...GOLD_CELLS),
  ...GOLD_CELLS.map(cell => new Given(cell, 1, 3, 4)),
  ...meanDiamondConstraints(LINE_A),
  ...meanDiamondConstraints(LINE_B),
];
