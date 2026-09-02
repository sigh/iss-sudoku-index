// Title: Sudokurotto
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=inm7hcRbIzo
// Source: https://app.crackingthecryptic.com/sudoku/qLJgbhGhFb

// Rules encoded here, in full:
//   1. Normal sudoku rules apply.
//   2. Every cell is either shaded or unshaded (the solver finds the shading).
//   3. The digit in a circled cell is the total number of shaded cells in the
//      orthogonally-connected shaded groups that share an edge with that cell.
//   4. Circled cells cannot be shaded.
//   5. Each digit in a shaded cell is larger than any digit in an orthogonally
//      adjacent unshaded cell.
// Nothing is omitted.

const NUM_VALUES = 12;   // 9 digits, plus room for the layer code 12 below
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Shading overlay codes.
const UNSHADED = 1;
const SHADED = 2;

// Layer overlay codes. OUT means "not in this layer's set"; SET_A / SET_B name
// the (at most two) sets a layer carries. The values are 1 apart and 11 apart
// so that one weighted Sum over the layer recovers both set sizes: with sizes
// capped at 10 (see below), 11 * |B| cannot alias into |A|.
const OUT = 1;
const SET_A = 2;
const SET_B = 12;

const shape = new Shape('9x9', NUM_VALUES);
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');

// The fourteen drawn circles, read from the circle underlays.
const circles = [
  'R1C8', 'R2C9', 'R6C8', 'R6C6', 'R6C4', 'R6C1', 'R5C1',
  'R4C1', 'R2C1', 'R1C2', 'R1C3', 'R8C3', 'R9C1', 'R3C5',
];

// Rule 3 is modelled one circle at a time. For circle `c` define
//   S(c) = {c} union {every shaded cell reachable from c through shaded cells}.
// S(c) is exactly c together with the union of the shaded groups that share an
// edge with c, so |S(c)| - 1 is the total rule 3 asks for, with cells shared by
// two groups counted once and no group counted twice.
//
// A layer is a Var overlay holding one such set. Three constraints pin S(c):
// membership implies shaded (except c itself), closure (a shaded cell beside a
// member is a member), and ConnectedValues, which forbids the extra
// disconnected group that closure alone would allow. The layer's Sum then reads
// off |S(c)|.
//
// Two circles share a layer only when they can never share a cell. A group K
// counted by both circles has |K| <= min of their digits <= 9, and each circle
// is beside K, so the two circles would lie within |K| + 1 <= 10 king-free
// orthogonal steps of each other. The pairs below are 11+ steps apart, except
// R1C2, whose given 4 caps its own groups at 4 cells and so caps its reach at 5
// steps; R1C2 and R6C6 are 9 steps apart.
const layers = [
  { prefix: 'VA', anchors: ['R1C8', 'R6C1'] },   // 12 steps apart
  { prefix: 'VB', anchors: ['R2C9', 'R5C1'] },   // 11 steps apart
  { prefix: 'VC', anchors: ['R6C8', 'R2C1'] },   // 11 steps apart
  { prefix: 'VD', anchors: ['R1C2', 'R6C6'] },   // 9 steps apart, cap 5
  { prefix: 'VE', anchors: ['R6C4'] },
  { prefix: 'VF', anchors: ['R4C1'] },
  { prefix: 'VG', anchors: ['R1C3'] },
  { prefix: 'VH', anchors: ['R8C3'] },
  { prefix: 'VI', anchors: ['R9C1'] },
  { prefix: 'VJ', anchors: ['R3C5'] },
];

const setValues = [SET_A, SET_B];
const overlays = layers.map(layer => graph.makeOverlay(layer.prefix));

// One machine per cell per layer, reading [own layer code, own shade, then each
// orthogonal neighbour's layer code]. After the first two symbols the state is
// the cell's role, and every neighbour is checked against it:
//   free     unshaded, not a member  -- constrains nothing
//   allOut   shaded, not a member    -- no neighbour may be a member, since a
//                                       shaded cell beside a member is a member
//   onlyA/B  a member of that set    -- a neighbour is either out or in the
//                                       same set; the two sets are never
//                                       adjacent, as an adjacent pair would put
//                                       both circles on one group
// `anchorValue` is the set value of the circle this layer is anchored on, or 0
// for every other cell: the anchor is the one member that is unshaded.
const layerSpec = (anchorValue) => NFA.encodeSpec({
  startState: 'own',
  transition: (state, value) => {
    switch (state) {
      case 'own':
        if (value === OUT) return 'outShade';
        if (value === SET_A) return 'aShade';
        if (value === SET_B) return 'bShade';
        return undefined;
      case 'outShade':
        if (value === UNSHADED) return 'free';
        if (value === SHADED) return 'allOut';
        return undefined;
      case 'aShade':
        if (value === SHADED || anchorValue === SET_A) return 'onlyA';
        return undefined;
      case 'bShade':
        if (value === SHADED || anchorValue === SET_B) return 'onlyB';
        return undefined;
      case 'free':
        return value === OUT || value === SET_A || value === SET_B
          ? 'free' : undefined;
      case 'allOut':
        return value === OUT ? 'allOut' : undefined;
      case 'onlyA':
        return value === OUT || value === SET_A ? 'onlyA' : undefined;
      case 'onlyB':
        return value === OUT || value === SET_B ? 'onlyB' : undefined;
    }
    return undefined;
  },
  accept: (state) => ['free', 'allOut', 'onlyA', 'onlyB'].includes(state),
}, shape);

const layerSpecs = new Map([
  [0, layerSpec(0)],
  [SET_A, layerSpec(SET_A)],
  [SET_B, layerSpec(SET_B)],
]);

const layerRules = overlays.flatMap((overlay, i) => {
  const { prefix, anchors } = layers[i];
  const cells = overlay.cells();
  const anchorValueOf = (gridCell) => {
    const index = anchors.indexOf(gridCell);
    return index < 0 ? 0 : setValues[index];
  };
  const allowed = anchors.map((_, index) => setValues[index]);

  return [
    overlay.toVar(prefix.slice(1)),
    // Layer codes only.
    overlay.makeReplicate(new Given(cells[0], OUT, ...allowed)),
    // Each circle anchors its own layer set.
    ...anchors.map(
      (cell, index) => new Given(overlay.at(cell), setValues[index])),
    ...graph.cells().map(gridCell => new NFA(
      layerSpecs.get(anchorValueOf(gridCell)),
      prefix,
      overlay.at(gridCell),
      shade.at(gridCell),
      ...graph.neighbours(gridCell).map(n => overlay.at(n)))),
    ...anchors.map(
      (cell, index) => new ConnectedValues(prefix, setValues[index])),
    // Layer total = 81 + |A| + 11 * |B| over codes 1 / 2 / 12, and
    // |S| = digit + 1 for each anchor, so the constant is 81 + 1 (+ 11).
    new Sum(
      anchors.length === 2 ? 93 : 82,
      ...cells,
      ...anchors.map((cell, index) => [cell, index === 0 ? -1 : -11])),
  ];
});

// Rule 5, over [shade(x), shade(y), digit(x), digit(y)] for each orthogonally
// adjacent pair. The two shades pick the comparison, so only one digit has to
// be carried; equal shades carry nothing.
const orderSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0:
        if (value !== UNSHADED && value !== SHADED) return undefined;
        return { step: 1, shadeX: value };
      case 1: {
        if (value !== UNSHADED && value !== SHADED) return undefined;
        // 0: same shade, 1: x shaded and y not, -1: y shaded and x not.
        const rel = state.shadeX === value
          ? 0 : (state.shadeX === SHADED ? 1 : -1);
        return { step: 2, rel };
      }
      case 2:
        if (value > 9) return undefined;
        // Carrying x's digit only matters when the shades differ.
        return { step: 3, rel: state.rel, digitX: state.rel === 0 ? 0 : value };
      case 3:
        if (value > 9) return undefined;
        if (state.rel === 1 && state.digitX <= value) return undefined;
        if (state.rel === -1 && state.digitX >= value) return undefined;
        return { step: 4 };
    }
    return undefined;
  },
  accept: (state) => state.step === 4,
}, shape);

const adjacentPairs = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(other => other !== null).map(other => [cell, other]));

const orderRules = adjacentPairs.map(([a, b]) => new NFA(
  orderSpec, 'order', shade.at(a), shade.at(b), a, b));

return [
  shape,
  // The alphabet is widened for the layer code 12; the grid itself is 1-9.
  graph.makeReplicate(new Given(graph.cells()[0], ...DIGITS)),
  new Given('R1C2', 4),
  new Given('R7C3', 3),
  shade.toVar('S'),
  shade.makeReplicate(new Given(shade.cells()[0], UNSHADED, SHADED)),
  ...circles.map(cell => new Given(shade.at(cell), UNSHADED)),
  ...layerRules,
  ...orderRules,
];
