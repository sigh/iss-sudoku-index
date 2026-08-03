// Title: Fog, Deconstructed
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=rGtTswpyWy4
// Source: https://app.crackingthecryptic.com/sudoku/p9TjBQfq8f

// ISS main-grid rows and columns are always all-different, so an 11-cell row
// that can hold repeated "no digit" cells cannot live in the main grid. The
// 11x11 answer is instead represented row-major by the `VA` group: 0 means a
// cell outside every region (no digit), 1-9 is a placed digit. A pinned 1x1
// main grid supplies the 0-9 value range. Same construction as `IBQu9a6Gl3U`
// (Deconstruction Site, same author/genre), `nTU1kgeBTe0` and `n80PJ9D5B1Y`.
//
// The 81 `VP` selectors are every possible top-left corner of a 3x3 block.
// Exactly nine are selected; a selected block holds 1-9 all-different, an
// unused one has no digit effect. A membership state machine requires each
// digit cell to have exactly one selected covering block and each blank cell
// none, which enforces both region coverage and non-overlap. A second state
// machine forbids two placed digits from repeating in a row/column while
// letting blanks repeat freely.
//
// Cages: "Cages show the sum of their digits ... and digits cannot repeat
// within a cage" is read literally over whichever cells the region placement
// leaves with digits -- an ordinary Sum over the raw VA values (blanks
// contribute 0), plus a state machine forbidding a repeated nonzero digit
// while ignoring repeated blanks. Cage R (45, 15 cells) is by far the
// largest: most of its cells are expected to fall outside every region.
//
// Parity markers: "Cells with a shaded square must contain an even digit.
// Cells with a shaded circle must contain an odd digit." Read as a positive
// assertion ("must contain" a digit of that parity), not a conditional that
// a blank vacuously satisfies -- so each marked cell's domain excludes 0
// (blank) as well as the wrong parity, pinning it to always hold a digit.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const ODD_DIGITS = [1, 3, 5, 7, 9];
const EVEN_DIGITS = [2, 4, 6, 8];

const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const answerVar = answer.toVar('11x11 answer, row-major; 0 is no digit');
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();
const cells = coordinates => coordinates.map(([row, col]) => makeCellId(row, col));

const blockAt = topLeft => answer.at(canvas.block(topLeft, 3, 3));
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
  membershipMachine, 'region membership', answer.at(cell), ...selectorsCovering(cell)));

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

// Killer cages. Cell tables transcribed from the puzzle's drawn cage outlines.
const CAGES = [
  [2, [[3, 3], [3, 4], [4, 3]]],                                    // A
  [8, [[2, 2], [2, 3], [3, 2]]],                                    // B
  [11, [[2, 1], [3, 1]]],                                           // C
  [15, [[1, 2], [1, 3]]],                                           // D
  [1, [[2, 4], [2, 5], [3, 5], [3, 6]]],                            // E
  [2, [[1, 4], [1, 5], [1, 6], [2, 6]]],                            // F
  [7, [[3, 7], [4, 7]]],                                            // G
  [18, [[3, 8], [3, 9], [4, 8], [4, 9]]],                           // H
  [9, [[3, 10], [4, 10], [5, 10]]],                                 // I
  [9, [[4, 6], [5, 6], [5, 7]]],                                    // J
  [10, [[6, 6], [7, 5], [7, 6]]],                                   // K
  [4, [[5, 8], [5, 9]]],                                            // L
  [9, [[6, 10], [7, 10]]],                                          // M
  [5, [[6, 7], [6, 8], [6, 9], [7, 7]]],                            // N
  [10, [[5, 5], [6, 5]]],                                           // O
  [2, [[4, 1], [4, 2], [5, 2], [6, 2]]],                            // P
  [11, [[7, 11], [8, 10], [8, 11], [9, 10]]],                       // Q
  [45, [[4, 4], [4, 5], [5, 3], [5, 4], [6, 3], [7, 3], [7, 8],
        [7, 9], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8],
        [9, 6]]],                                                  // R
  [22, [[1, 10], [2, 8], [2, 9], [2, 10]]],                         // S
  [8, [[9, 11], [10, 11]]],                                         // T
  [8, [[9, 3], [9, 4], [9, 5]]],                                    // U
  [12, [[10, 10], [11, 7], [11, 8], [11, 9], [11, 10]]],            // V
];
const cageSums = CAGES.map(([total, cage]) =>
  new Sum(total, ...answer.at(cells(cage))));
const cageNonzeroUniqueness = CAGES.map(([, cage]) => new NFA(
  noRepeatedDigitMachine, 'cage nonblank digits differ', ...answer.at(cells(cage))));

// Shaded parity markers. Coordinates transcribed from the puzzle's drawn
// underlay shapes (circle == odd; square == even).
const ODD_CELLS = cells([[1, 2], [6, 11], [7, 10], [9, 2]]);
const EVEN_CELLS = cells([[2, 1], [3, 2]]);
const parity = [
  ...ODD_CELLS.map(cell => new Given(answer.at(cell), ...ODD_DIGITS)),
  ...EVEN_CELLS.map(cell => new Given(answer.at(cell), ...EVEN_DIGITS)),
];

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answerVar,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...regions,
  ...memberships,
  ...rowAndColumnUniqueness,
  ...cageSums,
  ...cageNonzeroUniqueness,
  ...parity,
];
