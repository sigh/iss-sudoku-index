// Title: 400k Subscribers
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=MUdD4TqeKVQ
// Source: https://app.crackingthecryptic.com/sudoku/QTjg9tFG9r

// Normal sudoku rules apply (9x9, standard rows/columns/boxes), no givens.
// White dots mark consecutive digits between the two named cells; not every
// consecutive pair in the grid is dotted, so this is only a positive list --
// no exhaustive/negative reading is encoded.
// The grey line is a Double Digit Thermometer: reading from the bulb, digits
// alternate tens/units, forming a strictly increasing sequence of 2-digit
// numbers that together sum to 400.
// Each purple line's digits multiply to 400.

// White dots, transcribed from the payload's edge-sized rounded overlay
// marks (white fill, black border).
const WHITE_DOTS = [
  ['R1C3', 'R1C4'],
  ['R3C4', 'R3C5'],
  ['R4C5', 'R4C6'],
  ['R5C2', 'R6C2'],
  ['R7C6', 'R8C6'],
  ['R6C9', 'R7C9'],
  ['R5C8', 'R6C8'],
  ['R5C7', 'R5C8'],
  ['R3C9', 'R4C9'],
];

// Double Digit Thermometer path, bulb first. The drawn grey stroke itself
// (lines[0].wayPoints) only runs R8C2..R9C2 (15 cells), but a separate grey
// underlay capsule -- 1.6 cells wide, 0.7 cells tall, centred exactly on the
// R8C1/R8C2 boundary -- marks a two-cell bulb, unlike the small single-cell
// round marks used for white dots elsewhere in this payload. Reading the
// bulb as its own first cell pair makes the path 16 cells (a whole number of
// tens/units pairs); the drawn-only 15-cell reading would leave one digit
// unpaired, which the "alternates tens digits and units digits" rule cannot
// support. R8C1 is included as the thermometer's first (tens) cell on that
// basis.
const THERMO = [
  'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9',
  'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2',
];

// Purple product lines (multiply to 400). Line A crosses itself and revisits
// R3C2 (waypoint cell order R4C2-R3C2-R2C2-R3C1-R3C2-R3C3); the rules'
// setter note says it counts once, so only its distinct cells are listed.
// Lines B and C are closed loops with no repeated cell. A fourth purple
// `lines[]` entry carries styling only (no waypoints) and draws nothing.
const PRODUCT_LINES = [
  ['R4C2', 'R3C2', 'R2C2', 'R3C1', 'R3C3'],
  ['R2C6', 'R3C6', 'R4C7', 'R3C8', 'R2C8', 'R1C7'],
  ['R4C4', 'R5C3', 'R6C3', 'R7C4', 'R6C5', 'R5C5'],
];

// Reads the thermometer as consecutive, non-overlapping tens/units digit
// pairs starting at the bulb (list index 0), same NFA shape as the "Double
// Digit Thermo" reference script. State tracks the pending tens digit while
// reading a pair's second cell, and the previous completed pair's value
// (11..99, so the next pair can be compared to it). Accept only on a pair
// boundary; the thermometer's cell count is fixed and even, so this never
// rejects for a stray trailing digit. The "sum to 400" half of the rule is
// not carried in this state (a combined tens/prev/running-sum state blows
// the 4096-state NFA compile cap) -- it is enforced separately below as a
// weighted `Sum` over the same cells' fixed tens/units roles.
const increasingPairSpec = {
  startState: { tens: null, prev: null },
  transition: ({ tens, prev }, value) => {
    if (tens === null) return { tens: value, prev };
    const pair = tens * 10 + value;
    if (prev !== null && pair <= prev) return undefined; // must strictly increase
    return { tens: null, prev: pair };
  },
  accept: ({ tens }) => tens === null,
};
const increasingPairNFA = NFA.encodeSpec(increasingPairSpec, 9);

// The thermometer's tens/units roles are fixed by position (odd/even index
// in THERMO, bulb-first): sum of all eight 2-digit numbers = 10 * (sum of
// tens cells) + (sum of units cells). Expressed directly as a weighted Sum
// rather than carried through the NFA above.
const THERMO_TENS_CELLS = THERMO.filter((_, i) => i % 2 === 0);
const THERMO_UNITS_CELLS = THERMO.filter((_, i) => i % 2 === 1);

// Running-product NFA for a purple line, killed once the product exceeds
// 400 (same shape as data/scripts/factorial_cages.js's factorialCageNFA).
function productLineNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      if (next > target) return undefined;
      return next;
    },
    accept: (state) => state === target,
  }, 9);
}
const productNFA400 = productLineNFA(400);

return [
  new Shape('9x9'),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  new NFA(increasingPairNFA, 'doubleDigitThermoIncreasing', ...THERMO),
  new Sum(400,
    ...THERMO_TENS_CELLS.map((c) => [c, 10]),
    ...THERMO_UNITS_CELLS.map((c) => [c, 1])),
  ...PRODUCT_LINES.map(
    (cells) => new NFA(productNFA400, 'productLine400', ...cells)),
];
