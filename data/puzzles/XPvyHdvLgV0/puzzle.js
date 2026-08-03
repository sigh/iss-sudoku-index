// Title: Icon
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=XPvyHdvLgV0
// Source: https://sudokupad.app/iqv3bub9ae

// Rules encoded here:
//  - Normal sudoku: rows, columns, and the standard 3x3 boxes (the payload
//    draws no custom jigsaw; the rectangular partition below is separate).
//  - Rooms: the grid is cut into non-overlapping axis-aligned rectangles
//    covering every cell. Each rectangle holds exactly two of the 16 drawn
//    circles, and those two digits are the rectangle's width and height, in
//    either order.
//  - Between: each of the 6 drawn lines' digits lie strictly between the
//    digits in the line's own two end circles.
// Nothing is omitted.

const graph = cellGraph('9x9');
const cells = graph.cells();

// The 16 drawn white-fill, dark-border circles (overlay/underlay markers).
const CIRCLES = [
  'R8C1', 'R9C1', 'R5C1', 'R2C2', 'R6C7', 'R3C7', 'R1C2', 'R2C4',
  'R4C5', 'R2C8', 'R8C6', 'R7C9', 'R4C9', 'R7C3', 'R8C9', 'R2C9',
];
const posOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return [row, col];
};
const CIRCLE_POS = CIRCLES.map(posOf);

// The 6 drawn grey strokes, as 9 between-line segments: a circle sitting mid
// stroke (R3C7, R2C4, R7C9) splits it into two segments attached to that
// circle, rather than one segment spanning the whole stroke.
const LINES = [
  ['R8C1', 'R7C1', 'R8C2', 'R9C1'],
  ['R5C1', 'R5C2', 'R4C2', 'R3C2', 'R2C2'],
  ['R6C7', 'R5C8', 'R4C8', 'R3C7'],
  ['R3C7', 'R4C6', 'R4C5'],
  ['R1C2', 'R2C3', 'R3C4', 'R2C4'],
  ['R2C4', 'R3C5', 'R2C6', 'R1C7', 'R2C8'],
  ['R8C6', 'R9C7', 'R8C8', 'R7C9'],
  ['R7C9', 'R7C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R7C9', 'R6C8', 'R7C7', 'R6C6', 'R6C5', 'R7C4', 'R7C3'],
];

// --- Rooms -------------------------------------------------------------
// Every cell carries the row/column extent (top, bottom, left, right) of the
// rectangle it belongs to. A cell's own position always lies inside its own
// extent (domain restriction below); two rectangles are the same room iff all
// four match, so the rectangle a circle sits in is read straight off its own
// four cells, with no separate region-label overlay needed.
const top = graph.makeOverlay('VT');
const bottom = graph.makeOverlay('VB');
const left = graph.makeOverlay('VL');
const right = graph.makeOverlay('VR');

// Self-consistency: a cell's own row/column always lies within its rectangle.
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const boundDomains = cells.flatMap((cell) => {
  const { row, col } = parseCellId(cell);
  return [
    new Given(top.at(cell), ...range(1, row)),
    new Given(bottom.at(cell), ...range(row, 9)),
    new Given(left.at(cell), ...range(1, col)),
    new Given(right.at(cell), ...range(col, 9)),
  ];
});

// Adjacency: two orthogonal neighbours are in the same rectangle (all four
// bounds equal) or the rectangle ends cleanly at their shared edge (the near
// side's bound stops exactly there, the far side's starts exactly beyond it).
// No third option exists once self-consistency holds, so this is exhaustive.
const sameRoom = (a, b) => new And([
  new SameValues(2, top.at(a), top.at(b)),
  new SameValues(2, bottom.at(a), bottom.at(b)),
  new SameValues(2, left.at(a), left.at(b)),
  new SameValues(2, right.at(a), right.at(b)),
]);

const roomAdjacency = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    const a = makeCellId(r, c), b = makeCellId(r, c + 1);
    roomAdjacency.push(new Or([
      sameRoom(a, b),
      new And([new Given(right.at(a), c), new Given(left.at(b), c + 1)]),
    ]));
  }
}
for (let c = 1; c <= 9; c++) {
  for (let r = 1; r <= 8; r++) {
    const a = makeCellId(r, c), b = makeCellId(r + 1, c);
    roomAdjacency.push(new Or([
      sameRoom(a, b),
      new And([new Given(bottom.at(a), r), new Given(top.at(b), r + 1)]),
    ]));
  }
}

// Every cell's rectangle holds exactly two circles ("each region must include
// exactly two circled cells"). Reads a cell's own four bounds and counts how
// many of the 16 fixed circle positions they enclose.
const countSpec = NFA.encodeSpec({
  startState: { stage: 'top' },
  transition(state, value) {
    if (state.stage === 'top') return { stage: 'bottom', top: value };
    if (state.stage === 'bottom') {
      return { stage: 'left', top: state.top, bottom: value };
    }
    if (state.stage === 'left') {
      return {
        stage: 'right', top: state.top, bottom: state.bottom, left: value,
      };
    }
    const { top: t, bottom: b, left: l } = state;
    const r = value;
    const count = CIRCLE_POS.filter(
      ([cr, cc]) => t <= cr && cr <= b && l <= cc && cc <= r).length;
    return { stage: 'done', ok: count === 2 };
  },
  accept: (s) => s.stage === 'done' && s.ok,
}, 9);

const roomCircleCounts = cells.map((cell) => new NFA(
  countSpec, 'room has two circles',
  top.at(cell), bottom.at(cell), left.at(cell), right.at(cell)));

// For a circle, every other circle a rectangle could pair it with: any
// height/width in 1-9 and placement containing exactly this circle and that
// other one (no third circle), fitting the grid. Purely geometric -- computed
// from the 16 fixed circle positions, not from any solved digit.
const partnersOf = (circle) => {
  const [r0, c0] = posOf(circle);
  const found = new Set();
  for (let h = 1; h <= 9; h++) {
    for (let w = 1; w <= 9; w++) {
      for (let t = Math.max(1, r0 - h + 1); t <= r0 && t + h - 1 <= 9; t++) {
        for (let l = Math.max(1, c0 - w + 1); l <= c0 && l + w - 1 <= 9; l++) {
          const bo = t + h - 1, ri = l + w - 1;
          const inside = CIRCLES.filter(
            (_, i) => t <= CIRCLE_POS[i][0] && CIRCLE_POS[i][0] <= bo
              && l <= CIRCLE_POS[i][1] && CIRCLE_POS[i][1] <= ri);
          if (inside.length === 2 && inside.includes(circle)) {
            found.add(inside.find((c) => c !== circle));
          }
        }
      }
    }
  }
  return [...found];
};

// A circled cell's own digit, together with its room-mate's, must be exactly
// {width, height} of the shared rectangle (read from this cell's own bounds).
// One NFA per candidate partner, closed over that partner's fixed position;
// `Or` over the (precomputed, geometry-only) candidate list picks the real one.
const pairingSpec = (pRow, pCol) => NFA.encodeSpec({
  startState: { stage: 'dX' },
  transition(state, value) {
    if (state.stage === 'dX') return { stage: 'top', dX: value };
    if (state.stage === 'top') {
      return { stage: 'bottom', dX: state.dX, top: value };
    }
    if (state.stage === 'bottom') {
      if (!(state.top <= pRow && pRow <= value)) return undefined;
      return { stage: 'left', dX: state.dX, height: value - state.top + 1 };
    }
    if (state.stage === 'left') {
      return {
        stage: 'right', dX: state.dX, height: state.height, left: value,
      };
    }
    if (state.stage === 'right') {
      if (!(state.left <= pCol && pCol <= value)) return undefined;
      return {
        stage: 'dP', dX: state.dX, height: state.height, width: value - state.left + 1,
      };
    }
    const dims = [state.height, state.width].sort((a, b) => a - b);
    const digits = [state.dX, value].sort((a, b) => a - b);
    return { stage: 'done', ok: dims[0] === digits[0] && dims[1] === digits[1] };
  },
  accept: (s) => s.stage === 'done' && s.ok,
}, 9);

const roomDigits = CIRCLES.map((circle) => new Or(
  partnersOf(circle).map((partner) => {
    const [pRow, pCol] = posOf(partner);
    return new NFA(
      pairingSpec(pRow, pCol), 'room width/height pairing',
      circle, top.at(circle), bottom.at(circle), left.at(circle), right.at(circle),
      partner);
  }),
));

// --- Between -------------------------------------------------------------
const betweens = LINES.map((line) => new Between(...line));

return [
  new Shape('9x9'),
  top.toVar('room top'),
  bottom.toVar('room bottom'),
  left.toVar('room left'),
  right.toVar('room right'),
  ...boundDomains,
  ...roomAdjacency,
  ...roomCircleCounts,
  ...roomDigits,
  ...betweens,
];
