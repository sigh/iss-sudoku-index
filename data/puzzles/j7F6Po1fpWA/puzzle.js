// Title: Entropic islands
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=j7F6Po1fpWA
// Source: https://sudokupad.app/1l8hcd2k4v

// Rules encoded here:
//  - Normal sudoku rules.
//  - Digits form entropic sets Low {1,2,3}, Mid {4,5,6}, High {7,8,9}.  An
//    "island" is a maximal orthogonally-connected group of cells whose digits
//    all come from one entropic set.
//  - A circled digit is the size of the island containing it.
//  - No island holds more than one circled cell.
//  - At least one island holds no circle ("not all regions contain a circle").
//  - White dot: consecutive.  Black dot: 2:1 ratio.  The rules do not declare
//    the dots exhaustive, so unmarked adjacent pairs carry no constraint.
//
// The last three rules are worded with "region".  A region cannot be a box:
// box 1 alone carries five circles (R1C1, R1C2, R2C1, R3C1, R2C3), which
// contradicts "no region contains more than one circled cell" as drawn.  The
// islands of the preceding sentence are the only other antecedent, so "region"
// is read as "island" throughout.

// The 14 white circle underlays, in reading order.
const CIRCLES = [
  'R1C1', 'R1C2', 'R1C5',
  'R2C1', 'R2C3',
  'R3C1', 'R3C6', 'R3C7',
  'R4C9',
  'R6C3',
  'R7C1', 'R7C2', 'R7C4', 'R7C7',
];

// The four edge dots, as the cell pair each is drawn between.
const BLACK_DOTS = [['R2C1', 'R3C1'], ['R5C3', 'R5C4'], ['R5C8', 'R6C8']];
const WHITE_DOTS = [['R2C5', 'R3C5']];

// Islands are discovered by the solver, so each cell carries an island code in
// a Var overlay: UNOWNED for an island with no circle, otherwise the code of
// the one circle that island holds.  14 circles plus UNOWNED needs 15 values,
// so the alphabet is widened and the grid cells are pinned back to 1-9.
const UNOWNED = 1;
const codeOf = (i) => i + 2;

const shape = new Shape('9x9', 15);
const graph = cellGraph(shape);
const island = graph.makeOverlay('VI');

const entropicSet = (digit) => Math.ceil(digit / 3);  // 1 = Low, 2 = Mid, 3 = High

// Reads a domino as [digit, digit, island code, island code].  Two adjacent
// cells of the same entropic set lie in one island, hence carry one code; two
// of different sets lie in different islands, which may share a code only when
// neither island carries a circle.  Together with one distinct code pinned per
// circle and one ConnectedValues per code, this makes each code's cells exactly
// the island of its circle, and forbids two circles sharing an island.
const edgeSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0:  // digit of the first cell
        return value <= 9 ? { step: 1, set: entropicSet(value) } : undefined;
      case 1:  // digit of the second cell
        return value <= 9
          ? { step: 2, same: entropicSet(value) === state.set }
          : undefined;
      case 2:  // island code of the first cell
        return { step: 3, same: state.same, code: value };
      case 3: {  // island code of the second cell
        const sameCode = value === state.code;
        return (state.same ? sameCode : !(sameCode && value !== UNOWNED))
          ? { step: 4 }
          : undefined;
      }
    }
    return undefined;
  },
  accept: (state) => state.step === 4,
}, shape);

// Every orthogonally adjacent cell pair, once: the 1x2 and 2x1 blocks that fit.
const dominoes = graph.cells()
  .flatMap((cell) => [graph.block(cell, 1, 2), graph.block(cell, 2, 1)])
  .filter((domino) => domino !== null);

// Counts one island code across the whole overlay and compares it with the
// circled digit, which is read first as its own segment.  The count is bounded
// by that digit, so the branch dies as soon as it is exceeded.
const sizeSpec = (code) => NFA.encodeSpec({
  startState: { size: null, count: 0 },
  transition: ({ size, count }, value) => {
    if (value === SEGMENT_BREAK) return { size, count };
    if (size === null) {  // the circled digit
      return value <= 9 ? { size: value, count: 0 } : undefined;
    }
    if (value !== code) return { size, count };
    return count < size ? { size, count: count + 1 } : undefined;
  },
  accept: ({ size, count }) => size !== null && count === size,
  maxDepth: 83,  // 1 digit + 1 segment break + 81 overlay cells
}, shape, { multiSegment: true });

const overlayCells = island.at(graph.cells());

return [
  shape,
  // The widened alphabet exists for the overlay only.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  island.toVar('island'),

  ...CIRCLES.map((cell, i) => new Given(island.at(cell), codeOf(i))),
  ...CIRCLES.map((cell, i) => new ConnectedValues('VI', codeOf(i))),
  ...CIRCLES.map((cell, i) => new NFA(
    sizeSpec(codeOf(i)), `island size ${cell}`, [cell], overlayCells)),

  ...dominoes.map(([a, b]) => new NFA(
    edgeSpec, 'island edge', a, b, island.at(a), island.at(b))),

  // "Not all regions contain a circle": some island carries no circle.
  new ContainAtLeast(String(UNOWNED), ...overlayCells),

  ...BLACK_DOTS.map((cells) => new BlackDot(...cells)),
  ...WHITE_DOTS.map((cells) => new WhiteDot(...cells)),
];
