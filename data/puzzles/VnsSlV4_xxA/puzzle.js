// Title: That's Sum Slithering
// Author: AndreasV
// Video: https://www.youtube.com/watch?v=VnsSlV4_xxA
// Source: https://app.crackingthecryptic.com/sudoku/mJL2Hn6MBL

// Rules encoded below:
//   Standard 9x9 sudoku, 16 givens. A snake (a self-avoiding path of
//   orthogonally-connected cells, nowhere drawn -- membership, shape, and
//   size are entirely solver-discovered) passes through every box exactly
//   once: it doesn't touch itself, not even diagonally, and each box holds
//   exactly one contiguous run of the snake. The snake's cells sum to the
//   same total in every box. In each box, the digit equal to the count of
//   the snake's cells there is itself one of those snake cells.
// "Snake" is read as an open path (a head and a tail), not a closed loop --
//   the word names an animal with two ends, matching how every other CTC
//   "snake" puzzle in this index (e.g. Slang and Slanger) draws one.
// Omitted: "If a box has given digits, one of them gives the length in that
//   box, and must therefore be included in the snake" is a stated corollary
//   of the box length-digit rule above (sudoku already makes a given digit
//   the box's only copy of that value), not an additional constraint, so it
//   needs no separate encoding.

// The grid is widened to 0-9 only to give the masked-sum overlay below (VM)
// an off-snake value that drops cleanly out of a sum; real cells stay 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();
const playable = graph.makeReplicate(new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const OFF = 1, MID = 2, END = 3;   // snake membership/role, on the VL overlay

const GIVENS = [
  ['R1C5', 5], ['R1C9', 6], ['R2C4', 3], ['R2C5', 6], ['R3C1', 5],
  ['R5C1', 9], ['R5C2', 4], ['R5C7', 1], ['R6C6', 7], ['R6C9', 4],
  ['R7C7', 7], ['R7C9', 5], ['R8C6', 1], ['R8C9', 8], ['R9C4', 5],
  ['R9C5', 2],
];

// --- Snake membership: every cell is OFF, or ON with a role -- MID (an
// interior snake cell) or END (a path endpoint). Folding the endpoint role
// into this one overlay (rather than a second Var layer) keeps the search
// under the 1000-cell budget once nine per-box overlays are added below.
const snake = graph.makeOverlay('VL');
const snakeDomain = snake.makeReplicate(new Given(snake.cells()[0], OFF, MID, END));

// --- Degree: reads this cell's own value, then each orthogonal neighbour's.
// A MID cell needs exactly two on-neighbours, an END cell exactly one, an
// OFF cell is unconstrained. Any two orthogonally adjacent on-cells must be
// path-consecutive (the snake cannot touch itself), so this raw neighbour
// count *is* the path degree -- no separate edge bookkeeping is needed.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'self' },
  transition: (state, value) => {
    if (state.phase === 'self') {
      if (value === OFF) return { phase: 'off' };
      return { phase: 'on', expected: value === END ? 1 : 2, count: 0 };
    }
    if (state.phase === 'off') return state;   // absorb remaining neighbours
    const on = value === MID || value === END;
    const count = state.count + (on ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', expected: state.expected, count };
  },
  accept: (state) => state.phase === 'off' || state.count === state.expected,
}, shape);
const degreeRules = cells.map(cell => new NFA(
  degreeMachine, 'snake degree', snake.at(cell), ...snake.at(graph.neighbours(cell))));

// --- No diagonal self-touch: forbid a 2x2 block whose only on cells are a
// diagonal pair (from nordschleife.js's identical construction). ---
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === MID || value === END];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, shape);
// Every 2x2 block is the same shape (topLeft, +1 col, +1 row, +1 row +1 col),
// so all 64 on-grid blocks are one template under a shift: Replicate it
// instead of stamping 64 separate NFA instances by hand. The template's
// cells are all on the VL overlay, so VL (not the main grid) is the locator.
const blockOrigins = cells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = snake.makeReplicate(
  [new NFA(noDiagonalTouchMachine, 'no diagonal touch', ...snake.at(graph.block(blockOrigins[0], 2, 2)))],
  snake.at(blockOrigins));

// --- Single path: degree above already forbids branching. Connecting every
// on-cell into one region, plus exactly two END cells, rules out the other
// topology degree-<=2 connectivity allows: a closed loop with no endpoints. --
const connectivity = [
  new ConnectedValues('VL', [MID, END]),
  new ContainExact(`${END}_${END}`, ...snake.at(cells)),
];

// --- Per box: the digit equal to the snake's cell count there must be one
// of those cells. Read as one invariant per candidate length t (1-9): "if
// the box's on-cell count is t, an on cell there holds digit t" -- true
// vacuously when the count isn't t, so exactly one of the nine invariants
// per box does real work, without knowing in advance which. ---
const boxes = graph.boxes();
const lengthDigitMachines = new Map();
function lengthDigitMachine(t) {
  if (!lengthDigitMachines.has(t)) {
    // pendingOn classifies the snake read as a boolean immediately -- keeping
    // the raw 0-9 value in state would multiply every later state manyfold.
    lengthDigitMachines.set(t, NFA.encodeSpec({
      startState: { pendingOn: null, count: 0, sawT: false },
      transition: (state, value) => {
        if (state.pendingOn === null) {
          return { ...state, pendingOn: value === MID || value === END };
        }
        const on = state.pendingOn;
        const count = Math.min(state.count + (on ? 1 : 0), t + 1);
        const sawT = state.sawT || (on && value === t);
        return { pendingOn: null, count, sawT };
      },
      accept: (state) => state.pendingOn === null && (state.count !== t || state.sawT),
      maxDepth: 18,
    }, shape));
  }
  return lengthDigitMachines.get(t);
}
const boxLengthDigitRules = boxes.flatMap(box => Array.from({ length: 9 }, (_, i) => {
  const t = i + 1;
  return new NFA(lengthDigitMachine(t), 'box length is on-snake digit',
    ...box.flatMap(cell => [snake.at(cell), cell]));
}));

// --- Per box: the snake's cell-sum is the same in every box. VM mirrors
// each cell's digit when it's on the snake, and 0 (the reason the grid was
// widened) when it's off, so a plain EqualSum over each box's nine VM cells
// ties all nine box totals together in one native constraint. ---
const mask = graph.makeOverlay('VM');
const maskMachine = NFA.encodeSpec({
  startState: { phase: 'snake' },
  transition: (state, value) => {
    if (state.phase === 'snake') return { phase: 'digit', on: value === MID || value === END };
    if (state.phase === 'digit') return { phase: 'mask', on: state.on, digit: value };
    const ok = state.on ? value === state.digit : value === 0;
    return ok ? { phase: 'done' } : undefined;
  },
  accept: (state) => state.phase === 'done',
}, shape);
const maskRules = cells.map(cell =>
  new NFA(maskMachine, 'masked snake value', snake.at(cell), cell, mask.at(cell)));
// boxes is an array of per-box cell arrays; EqualSum wants each box's VM
// cells as its own segment argument, not one flattened array, so each
// segment is copied out (mask.at(box) alone) rather than passed through.
const boxSumEqual = new EqualSum(...boxes.map(box => [...mask.at(box)]));

// --- Per box: the on-snake cells form one contiguous run, not several
// separate visits. One scoped overlay per box mirrors "is this cell on the
// snake" inside the box and is fixed off outside it, so ConnectedValues on
// that layer's on cells checks connectivity within the box alone -- and,
// since ConnectedValues also requires a non-empty region, this doubles as
// "every box is visited at all". ---
const BOX_OFF = 1, BOX_ON = 2;
const boxOnKey = Pair.fnToKey(
  (layerVal, vlVal) => (layerVal === BOX_ON) === (vlVal === MID || vlVal === END), shape);
// Var prefixes are 'V' plus letters only, so each box gets its own single
// trailing letter (A-I, skipping L and M which VL/VM already use). Spelled
// out as literals, not built from a template, since each is a Var *group*
// prefix (an internal id handed to makeOverlay), not a cell id.
const BOX_PREFIXES = ['VA', 'VB', 'VC', 'VD', 'VE', 'VF', 'VG', 'VH', 'VI'];
const boxRunRules = boxes.flatMap((box, i) => {
  const boxSet = new Set(box);
  const prefix = BOX_PREFIXES[i];
  const layer = graph.makeOverlay(prefix);
  const exterior = cells.filter(cell => !boxSet.has(cell));
  // One template ("this cell is BOX_OFF"), replicated over the 72 exterior
  // cells, rather than 72 hand-stamped Given instances. makeReplicate's
  // origin is always the overlay's own first cell, so the template must
  // reference that cell; the target list is in the overlay's own cell space.
  const exteriorOff = layer.makeReplicate(
    new Given(layer.cells()[0], BOX_OFF), layer.at(exterior));
  return [
    layer.toVar(`box ${i + 1} snake membership copy`),
    exteriorOff,
    ...box.map(cell => new Pair(boxOnKey, 'box layer mirrors snake', layer.at(cell), snake.at(cell))),
    new ConnectedValues(prefix, BOX_ON),
  ];
});

return [
  shape,
  playable,
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  snake.toVar('snake membership and role'),
  snakeDomain,
  ...degreeRules,
  noDiagonalTouches,
  ...connectivity,
  ...boxLengthDigitRules,
  mask.toVar('masked on-snake digit'),
  ...maskRules,
  boxSumEqual,
  ...boxRunRules,
];
