// Title: Overlarge
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=veXU8ERPYIs
// Source: https://app.crackingthecryptic.com/sudoku/RmmfTLFJqB

// Nine 3x3 regions are located anywhere in the 11x11 grid (non-overlapping);
// each holds 1-9 once. Cells outside every region hold no digit. No digit
// repeats in a row/column (among the digits actually present -- an 11-cell
// row cannot hold nine distinct values across all eleven cells). Each region
// has one "doubler" cell whose value counts double in cage totals only (not
// for row/column/region/cage-repeat purposes); no row or column holds more
// than one doubler, and the nine doublers' digits are all different (so,
// with exactly nine of them from a 1-9 alphabet, every digit is used once).
// Digits may not repeat within a cage, and a cage's total counts each
// member's doubled-or-plain value.
//
// ISS main-grid rows/columns are always all-different, so an 11-cell row
// that can repeat "no digit" cannot live in the main grid. The 11x11 answer
// is instead a `VA` overlay, row-major, 0 = no digit / 1-9 = a placed digit;
// a pinned 1x1 main grid supplies the 0-9 value range. Same construction as
// `nTU1kgeBTe0` (Kylo Ren), `n80PJ9D5B1Y` (Across Roads) and `IBQu9a6Gl3U`
// (Deconstruction Site).
//
// The 81 `VP` selectors are every possible top-left corner of a 3x3 block
// within the 11x11 grid (a 9x9 space of candidates). Exactly nine are
// selected; a selected block holds 1-9 all-different, an unused one has no
// digit effect. A membership state machine requires each digit cell to have
// exactly one selected covering block and each blank cell none, which
// enforces both region coverage and non-overlap in one pass.
//
// Doublers are a parallel `VD` overlay, 1 = ordinary / 2 = doubler. A blank
// cell is forced ordinary (a doubler must sit in a region, i.e. hold a
// digit). Each selected block's nine `VD` cells must sum to 10 (eight 1s
// plus one 2), i.e. exactly one doubler per region. Two more machines cover
// the global doubler rules: an at-most-one-per-row/column scan, and a
// digit-uniqueness scan across every doubler cell in the grid (interleaving
// each cell's digit and flag, folding digit*flag only when flag is a
// doubler).
//
// Cages: totals are read directly off the raw `VA`/`VD` pair per member cell
// (digit*flag, so a blank cell always contributes 0 regardless of its
// forced-ordinary flag), matching "the sum of cell values in a cage" read
// literally over whichever cells the region placement leaves with digits.
// "Digits may not repeat in a cage" reuses the nonzero-uniqueness scan over
// raw digits (ignoring blanks).

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const NOT_DOUBLER = 1;
const DOUBLER = 2;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ONE_DOUBLER_PER_REGION = 8 * NOT_DOUBLER + 1 * DOUBLER; // = 10

const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const answerVar = answer.toVar('11x11 answer, row-major; 0 is no digit');
const flags = canvas.makeOverlay('VD');
const flagsVar = flags.toVar('doubler flags, row-major; 1 ordinary, 2 doubler');
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockCellsAt = topLeft => canvas.block(topLeft, 3, 3);
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => blockCellsAt(topLeft).includes(cell)));

const selectedValues = Array(9).fill(SELECTED).join('_');

// A selected top-left creates one complete 1-9 region, with exactly one of
// its nine cells doubled; an unused top-left has no digit or doubler effect.
// Exactly nine selectors are selected below.
const regions = topLefts.map(topLeft => {
  const blockCells = blockCellsAt(topLeft);
  const blockDigits = answer.at(blockCells);
  const blockFlags = flags.at(blockCells);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([
      new Given(placements.at(topLeft), SELECTED),
      new AllDifferent(...blockDigits),
      ...blockDigits.map(cell => new Given(cell, ...DIGITS)),
      new Sum(ONE_DOUBLER_PER_REGION, ...blockFlags),
    ]),
  ]);
});

// A blank has no selected covering placement; a digit has exactly one. This
// simultaneously enforces region coverage and non-overlap.
const membershipMachine = NFA.encodeSpec({
  startState: { needed: null, count: 0 },
  transition: ({ needed, count }, value) => {
    if (needed === null) {
      return { needed: value === BLANK ? 0 : 1, count: 0 };
    }
    if (value !== UNUSED && value !== SELECTED) return undefined;
    const next = count + value;
    return next <= needed ? { needed, count: next } : undefined;
  },
  accept: ({ needed, count }) => needed !== null && count === needed,
}, shape);
const memberships = canvas.cells().map(cell => new NFA(
  membershipMachine, 'region membership', answer.at(cell), ...selectorsCovering(cell)));

// A blank cell cannot be a doubler (a doubler is always inside a region).
const blankImpliesNotDoubler = canvas.cells().map(cell => new Or([
  new Given(answer.at(cell), ...DIGITS),
  new Given(flags.at(cell), NOT_DOUBLER),
]));

// Ignore repeated blanks, but reject a second occurrence of any placed digit.
const noRepeatedDigitMachine = NFA.encodeSpec({
  startState: 0,
  transition: (seen, value) => {
    if (value === BLANK) return seen;
    const bit = 1 << (value - 1);
    return seen & bit ? undefined : seen | bit;
  },
  accept: () => true,
}, shape);
const rowAndColumnUniqueness = [
  ...canvas.rows().map(row =>
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...answer.at(row))),
  ...canvas.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...answer.at(column))),
];

// At most one doubler per row/column, scanning the VD overlay alone.
const atMostOneDoublerMachine = NFA.encodeSpec({
  startState: false,
  transition: (seenDoubler, value) => {
    if (value !== DOUBLER) return seenDoubler;
    return seenDoubler ? undefined : true;
  },
  accept: () => true,
}, shape);
const doublerRowColumnLimit = [
  ...canvas.rows().map(row =>
    new NFA(atMostOneDoublerMachine, 'at most one doubler per row', ...flags.at(row))),
  ...canvas.columns().map(column =>
    new NFA(atMostOneDoublerMachine, 'at most one doubler per column', ...flags.at(column))),
];

// Global: each digit appears in exactly one doubler cell, checked one digit
// at a time (a single combined seen-bitmask state machine overflows the NFA
// state cap). Each machine interleaves a cell's digit then its flag, in
// canvas row-major order, and counts cells where both match.
function oneDoublerOfDigitMachine(digit) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', count: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') return { phase: 'flag', count: state.count, matches: value === digit };
      const count = state.count + ((state.matches && value === DOUBLER) ? 1 : 0);
      return count <= 1 ? { phase: 'digit', count } : undefined;
    },
    accept: (state) => state.phase === 'digit' && state.count === 1,
  }, shape);
}
const doublerDigitsAllDifferent = DIGITS.map(digit => new NFA(
  oneDoublerOfDigitMachine(digit), `digit ${digit} appears in exactly one doubler`,
  ...canvas.cells().flatMap(cell => [answer.at(cell), flags.at(cell)])));

// Killer cages. Cell tables transcribed from the puzzle's drawn cage outlines.
const CAGES = [
  [24, [[2, 3], [3, 2], [3, 3]]],                                        // A
  [30, [[1, 4], [2, 4], [3, 4], [4, 1], [4, 2], [4, 3], [4, 4], [4, 5],
        [4, 6], [5, 4], [6, 4]]],                                       // B
  [18, [[3, 6], [3, 7]]],                                                // C
  [24, [[2, 9], [3, 8], [3, 9]]],                                        // D
  [18, [[6, 3], [7, 3]]],                                                // E
  [24, [[8, 3], [9, 2], [9, 3]]],                                        // F
  [17, [[8, 5], [8, 6]]],                                                // G
  [10, [[9, 6], [9, 7]]],                                                // H
  [24, [[8, 9], [9, 8], [9, 9]]],                                        // I
  [9, [[6, 9], [7, 9]]],                                                 // J
  [17, [[5, 8], [6, 8]]],                                                // K
  [6, [[3, 10], [4, 10], [4, 11], [5, 11]]],                             // L
  [14, [[10, 3], [10, 4], [11, 4], [11, 5]]],                            // M
  [4, [[10, 9], [11, 9]]],                                               // N
  [6, [[9, 10], [9, 11]]],                                               // O
  [24, [[4, 7], [5, 7], [6, 7], [7, 4], [7, 5], [7, 6], [7, 7]]],        // P
];

// Effective value = digit * flag (flag is 1 or 2), summed along the cage. A
// blank cell contributes 0 regardless of its (forced-ordinary) flag. Prunes
// as soon as the running sum exceeds the target, since digit*flag >= 0.
function cageSumMachine(total) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') return { phase: 'flag', sum: state.sum, digit: value };
      const sum = state.sum + state.digit * value;
      if (sum > total) return undefined;
      return { phase: 'digit', sum };
    },
    accept: (state) => state.phase === 'digit' && state.sum === total,
  }, shape);
}
const cageEffectiveSums = CAGES.map(([total, cage]) => new NFA(
  cageSumMachine(total), 'cage sum with doubler',
  ...cells(cage).flatMap(cell => [answer.at(cell), flags.at(cell)])));
const cageNonzeroUniqueness = CAGES.map(([, cage]) => new NFA(
  noRepeatedDigitMachine, 'cage nonblank digits differ', ...answer.at(cells(cage))));

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answerVar,
  flagsVar,
  flags.makeReplicate(new Given(flags.cells()[0], NOT_DOUBLER, DOUBLER)),
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...blankImpliesNotDoubler,
  ...rowAndColumnUniqueness,
  ...doublerRowColumnLimit,
  ...doublerDigitsAllDifferent,
  ...cageEffectiveSums,
  ...cageNonzeroUniqueness,
];
