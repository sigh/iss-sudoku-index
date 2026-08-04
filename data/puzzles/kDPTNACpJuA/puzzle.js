// Title: Madrigal
// Author: Fafrd
// Video: https://www.youtube.com/watch?v=kDPTNACpJuA
// Source: https://app.crackingthecryptic.com/sudoku/tGqm6F2nPN

// ISS main-grid rows and columns are always all-different, so an 11-cell row
// that can hold repeated "empty" cells cannot live in the main grid. The
// 11x11 answer instead lives row-major in the `VA` overlay group: 0 means a
// cell outside every box (empty), 1-9 is a placed digit. A pinned 1x1 main
// grid supplies the 0-9 value range.
//
// The 81 `VP` selectors are every possible top-left corner of a 3x3 box
// inside the 11x11 canvas. Exactly nine are selected; a selected box holds
// 1-9 all-different, an unused one has no digit effect. A membership state
// machine requires each digit cell to have exactly one selected covering box
// and each empty cell none, which enforces both "cells outside the boxes
// remain empty" and box non-overlap. A second state machine forbids two
// placed digits from repeating in a row/column while letting empty cells
// repeat freely, reading "Digits cannot repeat in a row or column" as
// applying only to placed digits.
//
// Cage: "Digits within a cage must sum to the given total" is a plain Sum
// over the raw VA values; the cage's two cells (transcribed from the
// payload's single non-stub `cages` entry) both sit in column 9, so the
// column rule above already forces them distinct.
//
// Adjacency: "Orthogonally adjacent digits can never be consecutive, be in a
// 1:2 ratio, sum to 5, or sum to 10" is read as applying only where both
// cells hold a digit -- an empty (0) cell is not a digit, so a pair with
// either side empty is exempt on either side.

const BLANK = 0;
const UNUSED = 0;
const SELECTED = 1;
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const shape = new Shape('1x1', '0-9');
const canvas = cellGraph('11x11');
const answer = canvas.makeOverlay('VA');
const answerVar = answer.toVar('11x11 answer, row-major; 0 is empty');
const placementGrid = cellGraph('9x9');
const placements = placementGrid.makeOverlay('VP');
const topLefts = placementGrid.cells();

const blockAt = topLeft => answer.at(canvas.block(topLeft, 3, 3));
const selectorsCovering = cell => placements.at(topLefts
  .filter(topLeft => canvas.block(topLeft, 3, 3).includes(cell)));

const selectedValues = Array(9).fill(SELECTED).join('_');

// A selected top-left creates one complete 1-9 box; an unused top-left has no
// digit effect. Exactly nine selectors are selected below.
const boxes = topLefts.map(topLeft => {
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

// An empty cell has no selected covering placement; a digit has exactly one.
// This simultaneously enforces box coverage and non-overlap.
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
  membershipMachine, 'box membership', answer.at(cell), ...selectorsCovering(cell)));

// Ignore repeated empties, but reject a second occurrence of any placed digit.
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

// The puzzle's single cage. Cell IDs use a single hex-like digit for row/col
// >= 10 (a=10, b=11): R10C9 is 'RaC9', R11C9 is 'RbC9'.
const cageSum = new Sum(11, ...answer.at(['RaC9', 'RbC9']));

// Orthogonally adjacent digits may not be consecutive, a 1:2 ratio, or sum to
// 5 or 10; an empty (0) cell on either side exempts the pair.
const adjacentAllowed = Pair.fnToKey((a, b) => {
  if (a === BLANK || b === BLANK) return true;
  if (Math.abs(a - b) === 1) return false;
  if (a === 2 * b || b === 2 * a) return false;
  const sum = a + b;
  return sum !== 5 && sum !== 10;
}, shape);
const origin = answer.cells()[0];
const horizontalStarts = answer.cells().filter(cell => answer.step(cell, 0, 1));
const verticalStarts = answer.cells().filter(cell => answer.step(cell, 1, 0));
const adjacency = [
  answer.makeReplicate(
    new Pair(adjacentAllowed, 'adjacent restriction', origin, answer.step(origin, 0, 1)),
    horizontalStarts),
  answer.makeReplicate(
    new Pair(adjacentAllowed, 'adjacent restriction', origin, answer.step(origin, 1, 0)),
    verticalStarts),
];

return [
  shape,
  new Given('R1C1', BLANK), // Pin the otherwise-unused ISS main-grid cell.
  answerVar,
  placements.toVar('selected 3x3 top-left corners'),
  placements.makeReplicate(new Given(placements.cells()[0], UNUSED, SELECTED)),
  new ContainExact(selectedValues, ...placements.cells()),
  ...boxes,
  ...memberships,
  ...rowAndColumnUniqueness,
  cageSum,
  ...adjacency,
];
