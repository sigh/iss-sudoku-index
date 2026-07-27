// Title: Chaos Construction: Arrow Knots
// Author: Myxo
// Video: https://www.youtube.com/watch?v=sln3fUQXzbM
// Source: https://sudokupad.app/v3zxi1cddk

// Chaos construction (the solver deduces nine 9-cell orthogonally-connected
// regions). From each marked circle, some number of straight (horizontal or
// vertical) arrows run into the circle's own region; the digits along an
// arrow sum to the circle's own digit, and an arrow runs exactly to the edge
// of its region -- a non-edge tip's next cell must lie in a different
// region. Two region borders are pre-drawn.

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// Region borders already drawn: two wall segments in the payload's `lines`,
// each at integer (grid-edge, not cell-centre) coordinates.
// row=3, col 6-7 -> the edge between R3C7 and R4C7.
// col=6, row 7-8 -> the edge between R8C6 and R8C7.
const BORDERS = [['R3C7', 'R4C7'], ['R8C6', 'R8C7']];

// Circle cell -> number of arrows to draw from it (the corner number).
const HUB_COUNTS = {
  'R1C4': 2, 'R2C3': 1, 'R4C1': 2, 'R4C4': 4,
  'R2C8': 1, 'R5C8': 3, 'R6C9': 2, 'R8C4': 1,
};

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Per-hub candidate rays: one per orthogonal direction that has a neighbour
// (an arrow needs at least one arm cell). `ray()` includes the hub itself.
const hubs = Object.entries(HUB_COUNTS).map(([hub, count]) => ({
  hub,
  count,
  rays: DIRS.map(([dr, dc]) => graph.ray(hub, dr, dc)).filter(cells => cells.length >= 2),
}));

// One flag var per (hub, candidate direction): 2 = an arrow is drawn that
// way, 1 = it is not. Exactly `count` of a hub's flags must be 2 (asserted
// below with Sum, since flags are valued {1,2} not {0,1}).
const totalFlags = hubs.reduce((n, h) => n + h.rays.length, 0);
const flags = new Var('FL', 'arrow flag', totalFlags);
let nextFlag = 0;
const hubFlags = hubs.map(h => ({
  ...h,
  flagCells: h.rays.map(() => flags.cell(++nextFlag)),
}));

// Sum-arrow NFA. Stream per ray: [flag, hubRegion, hubValue, region1, value1,
// region2, value2, ...] (hubRegion/hubValue is the [region,value] pair of the
// ray's own first cell -- the circle).
//
// flag=1 (off): the 'skip' sink accepts unconditionally -- no rule applies.
// flag=2 (on): cells sharing the hub's region (r) subtract their digit from
// `remaining`, which starts at the hub's own digit (the arrow's target sum).
// The run must hit `remaining === 0` at the exact moment it leaves the
// region (the first differently-regioned cell after the tip) or at the grid
// edge while still in the region. Overshooting (`remaining < 0`) or leaving
// the region early/late are both rejected -- together this is "digits along
// the arrow sum to the circle" plus "the cell after a non-edge tip differs".
const arrowSpec = {
  startState: { stage: 'flag' },
  transition: (state, value) => {
    switch (state.stage) {
      case 'flag':
        return value === 2 ? { stage: 'hubRegion' } : { stage: 'skip' };
      case 'skip':
        return { stage: 'skip' };
      case 'done':
        // The tip may be mid-ray; the ray still carries cells out to the grid
        // edge, which are irrelevant once the arrow's boundary is settled.
        return { stage: 'done' };
      case 'hubRegion':
        return { stage: 'hubValue', r: value };
      case 'hubValue':
        return { stage: 'cellRegion', r: state.r, remaining: value };
      case 'cellRegion':
        return { stage: 'cellValue', r: state.r, remaining: state.remaining, li: value };
      case 'cellValue': {
        const { r, remaining, li } = state;
        if (li === r) {
          const left = remaining - value;
          if (left < 0) return undefined;
          return { stage: 'cellRegion', r, remaining: left };
        }
        // `li` already differs: this is the cell after the tip.
        return remaining === 0 ? { stage: 'done' } : undefined;
      }
    }
  },
  accept: (state) =>
    state.stage === 'skip' || state.stage === 'done' ||
    (state.stage === 'cellRegion' && state.remaining === 0),
};
const arrowNFA = NFA.encodeSpec(arrowSpec, 9);

const rayStream = (flagCell, cells) => {
  const regions = cc.at(cells);
  return [flagCell, ...cells.flatMap((cell, i) => [regions[i], cell])];
};

const arrows = hubFlags.flatMap(({ rays, flagCells }) =>
  rays.map((cells, i) => new NFA(arrowNFA, 'arrow', ...rayStream(flagCells[i], cells))));

const flagDomains = hubFlags.flatMap(({ flagCells }) =>
  flagCells.map(cell => new Given(cell, 1, 2)));

const arrowCounts = hubFlags.map(({ rays, count, flagCells }) =>
  new Sum(rays.length + count, ...flagCells));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  flags,
  ...BORDERS.map(([a, b]) => new AllDifferent(...cc.at([a, b]))),
  ...flagDomains,
  ...arrowCounts,
  ...arrows,
];
