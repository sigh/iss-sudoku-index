// Title: Double Fireworks
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=KXumBBj0QqM
// Source: https://app.crackingthecryptic.com/sudoku/fbqQB8jrhn

// Normal sudoku rules apply; boxes are the standard 3x3 regions (the
// payload's `regions` matches the default box layout exactly).
//
// Arrows: each arrow's shaft digits multiply to the digit in its circled
// cell; the circled cell is always the first cell of the drawn path.
//
// Doublers: nine cells, one per row/column/box, are Doublers; a Doubler
// counts double wherever its cell is used within an arrow computation --
// a shaft cell (explicitly including a one-cell arrow, per the rules'
// own worked example) or the circled cell itself, both being cells "on"
// that arrow. Each digit 1-9 appears in exactly one Doubler cell (so the
// nine Doubler digits are all different). Doublers need not sit on an
// arrow at all.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);

// Doubler flag per cell: 1 = normal, 2 = doubled.
const flagConstraints = [
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
];

// One Doubler per row/column/box: with a {1,2} domain and 9 cells per
// region, a region total of 10 forces exactly one 2 (and eight 1s).
const placementConstraints = graph.rowsColumnsBoxes().map(
  cells => new Sum(10, ...flags.at(cells)));

// Each digit 1-9 appears in exactly one Doubler cell: scan the whole grid
// as (flag, digit) pairs and reject a digit repeating at a Doubler cell.
// Reads the flag before its digit, and immediately collapses the flag's
// raw grid-alphabet value (1-9) down to "is this a 2" -- so the compiled
// state stays {seen-digit bitmask} x {pending flag: none/doubled/not},
// instead of also multiplying in the flag's full 9-value read.
const doublerDigitsSpec = NFA.encodeSpec({
  startState: { bitmask: 0, pendingIsDoubler: null },
  transition: (state, value) => {
    if (state.pendingIsDoubler === null) {
      // Reading a flag cell.
      return { bitmask: state.bitmask, pendingIsDoubler: value === 2 };
    }
    // Reading the digit cell paired with the flag just read.
    if (!state.pendingIsDoubler) {
      return { bitmask: state.bitmask, pendingIsDoubler: null };
    }
    const bit = 1 << (value - 1);
    if (state.bitmask & bit) return undefined; // digit already used at a Doubler
    return { bitmask: state.bitmask | bit, pendingIsDoubler: null };
  },
  accept: state => state.pendingIsDoubler === null,
}, 9);

const doublerDigitsSequence = graph.cells().flatMap(cell => [flag(cell), cell]);
const doublerDigitsConstraint = new NFA(
  doublerDigitsSpec, 'doubler digits distinct', ...doublerDigitsSequence);

// Arrow product NFA: every cell on the arrow (circled cell first, then
// each shaft cell) is read as a (flag, digit) pair, with the flag's raw
// value collapsed to a 1/2 multiplier before combining into that cell's
// effective value. The first cell's effective value becomes the target;
// each later cell's effective value multiplies into the running product.
// A branch dies as soon as the running product exceeds the target, since
// every digit is >= 1 so the product only grows.
const arrowProductSpec = NFA.encodeSpec({
  startState: { target: null, product: 1, pendingMult: null },
  transition: (state, value) => {
    if (state.pendingMult === null) {
      return { ...state, pendingMult: value === 2 ? 2 : 1 }; // this cell's flag
    }
    const effective = state.pendingMult * value; // this cell's digit
    if (state.target === null) {
      return { target: effective, product: 1, pendingMult: null }; // circled cell
    }
    const newProduct = state.product * effective;
    if (newProduct > state.target) return undefined;
    return { target: state.target, product: newProduct, pendingMult: null };
  },
  accept: state =>
    state.target !== null &&
    state.pendingMult === null &&
    state.product === state.target,
}, 9);

const arrowProduct = (circle, shaft) => new NFA(
  arrowProductSpec, 'arrow product',
  ...[circle, ...shaft].flatMap(cell => [flag(cell), cell]));

// Circle cell, then shaft cells in path order.
const arrows = [
  ['R1C6', ['R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1']],
  ['R3C1', ['R4C1', 'R3C2']],
  ['R1C7', ['R2C7', 'R3C7']],
  ['R4C9', ['R3C9', 'R2C9']],
  ['R6C8', ['R7C9']],
  ['R9C7', ['R8C7', 'R7C7', 'R6C7']],
  ['R6C5', ['R7C6']],
  ['R7C4', ['R7C3']],
  ['R7C4', ['R8C5']],
  ['R8C3', ['R8C2', 'R9C3', 'R9C4']],
];
const arrowConstraints = arrows.map(([circle, shaft]) => arrowProduct(circle, shaft));

return [
  new Shape('9x9'),
  new Given('R1C9', 5),
  new Given('R2C3', 7),
  ...flagConstraints,
  ...placementConstraints,
  doublerDigitsConstraint,
  ...arrowConstraints,
];
