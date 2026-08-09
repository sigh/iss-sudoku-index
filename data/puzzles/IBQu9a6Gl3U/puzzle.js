// Title: Deconstruction Site
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=IBQu9a6Gl3U
// Source: https://app.crackingthecryptic.com/sudoku/mGqqpTG48g

// A default Sudoku-type grid's rows and columns are always all-different, so
// an 11-cell row that can hold repeated "no digit" cells needs a Raw grid: no
// implicit constraints. The 11x11 answer is the main grid: 0 means a cell
// outside every region (no digit), 1-9 is a placed digit. Same construction
// as `nTU1kgeBTe0` (Kylo Ren) and `n80PJ9D5B1Y` (Across Roads).
//
// The 81 `VP` selectors are every possible top-left corner of a 3x3 block.
// Exactly nine are selected; a selected block holds 1-9 all-different, an
// unused one has no digit effect. A membership state machine requires each
// digit cell to have exactly one selected covering block and each blank cell
// none, which enforces both region coverage and non-overlap. A second state
// machine forbids two placed digits from repeating in a row/column while
// letting blanks repeat freely.
//
// Cages: "Cages show the sum of their digits, and digits cannot repeat within
// a cage" is read literally over whichever cells the region placement leaves
// with digits -- an ordinary Sum over the raw grid values (blanks contribute 0),
// plus a state machine forbidding a repeated nonzero digit while ignoring
// repeated blanks. Cage A (the 21-cell diagonal) is the video's "largest 6
// cage ever": most of its cells are expected to fall outside every region.
//
// Arrows: "Digits along an arrow sum to the digit in its connected circle"
// is likewise the raw grid values -- the built-in Arrow class already permits
// arm repeats, matching "digits along an arrow can repeat".

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('11x11', '0-9', 'Raw');
const canvas = cellGraph(shape);
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockAt = topLeft => canvas.block(topLeft, 3, 3);
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => canvas.block(topLeft, 3, 3).includes(cell)));

const selectedValues = Array(9).fill(SELECTED).join('_');

// A selected top-left creates one complete 1-9 region; an unused top-left has
// no digit effect. Exactly nine selectors are selected below.
const regions = topLefts.map(topLeft => {
  const blockCells = blockAt(topLeft);
  return new Or([
    new Given(placements.at(topLeft), UNUSED),
    new And([
      new Given(placements.at(topLeft), SELECTED),
      new AllDifferent(...blockCells),
      ...blockCells.map(cell => new Given(cell, ...DIGITS)),
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
  membershipMachine, 'region membership', cell, ...selectorsCovering(cell)));

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
    new NFA(noRepeatedDigitMachine, 'row nonblank digits differ', ...row)),
  ...canvas.columns().map(column =>
    new NFA(noRepeatedDigitMachine, 'column nonblank digits differ', ...column)),
];

// Killer cages. Cell tables transcribed from the puzzle's drawn cage outlines.
const CAGES = [
  [6, [[1, 1], [1, 2], [2, 2], [2, 3], [3, 3], [3, 4], [4, 4], [4, 5], [5, 5],
       [5, 6], [6, 6], [6, 7], [7, 7], [7, 8], [8, 8], [8, 9], [9, 9], [9, 10],
       [10, 10], [10, 11], [11, 11]]],   // A: the "largest 6 cage ever"
  [28, [[1, 6], [1, 7], [2, 7], [2, 8], [3, 8], [3, 9], [4, 9], [4, 10],
        [5, 10], [5, 11], [6, 11]]],     // B
  [7, [[11, 9], [11, 10]]],              // C
  [7, [[2, 1], [3, 1]]],                 // D
  [30, [[5, 1], [6, 1], [6, 2], [7, 1]]],// E
  [16, [[2, 4], [2, 5], [3, 5]]],        // F
  [15, [[7, 9], [7, 10], [8, 10]]],      // G
  [35, [[5, 4], [6, 4], [7, 4], [8, 4], [8, 5], [8, 6], [8, 7]]], // H
  [16, [[1, 8], [1, 9], [1, 10]]],       // I
  [24, [[8, 3], [9, 3], [9, 4]]],        // J
  [15, [[10, 1], [11, 1], [11, 2]]],     // K
  [18, [[9, 2], [10, 2], [10, 3]]],      // L
  [29, [[10, 6], [11, 5], [11, 6], [11, 7]]], // M
  [6, [[9, 7], [9, 8]]],                 // N
  [8, [[4, 3], [5, 3]]],                 // O
  [10, [[2, 11], [3, 11], [4, 11]]],     // P
];
const cageSums = CAGES.map(([total, cage]) =>
  new Sum(total, ...cells(cage)));
const cageNonzeroUniqueness = CAGES.map(([, cage]) => new NFA(
  noRepeatedDigitMachine, 'cage nonblank digits differ', ...cells(cage)));

// Arrows: bulb cell first, then arm cells in order along the drawn line.
// Cells transcribed from the puzzle's drawn arrow paths; each bulb is the
// circle overlay nearest the arrow's start.
const ARROWS = [
  [[3, 6], [[2, 7], [2, 8], [2, 9]]],
  [[9, 6], [[9, 7], [8, 7], [7, 6], [6, 5]]],
];
const arrows = ARROWS.map(([bulb, arm]) =>
  new Arrow(...cells([bulb, ...arm])));

return [
  shape,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...cageSums,
  ...cageNonzeroUniqueness,
  ...arrows,
];
