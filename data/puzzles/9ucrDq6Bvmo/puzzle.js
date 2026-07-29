// Title: Copycat Collaboration
// Author: Scojo & Chat
// Video: https://www.youtube.com/watch?v=9ucrDq6Bvmo
// Source: https://sudokupad.app/j3hwgi98hr

// Standard Sudoku. Select nine Copycat Cells: one per row, column, and box,
// with different digits; a selected cell equals its 180-degree opposite.
// Lavender lines are Zippers. Yellow circles are Odd Lots clues.

const SELECTED = 1;
const UNSELECTED = 2;
const graph = cellGraph('9x9');
const copycat = graph.makeOverlay('VC');
const copycatValue = graph.makeOverlay('VV');
const gridCells = graph.cells();

// Every Copycat overlay cell is a two-state membership marker.
const copycatDomain = copycat.makeReplicate(
  new Given(copycat.cells()[0], SELECTED, UNSELECTED));

// Each Sudoku row, column, and box contains exactly one selected marker.
const oneSelectedSpec = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === SELECTED ? 1 : 0);
    return next <= 1 ? { count: next } : undefined;
  },
  accept: ({ count }) => count === 1,
}, 9);
const oneCopycatPerGroup = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
].map(cells => new NFA(oneSelectedSpec, 'one-copycat', ...copycat.at(cells)));

// Scan membership and its contained grid digit together; selected digits cannot repeat.
const differentCopycatDigitsSpec = NFA.encodeSpec({
  startState: { selected: [], pending: null },
  transition: ({ selected, pending }, value) => {
    if (pending === null) {
      return { selected, pending: value === SELECTED };
    }
    if (!pending) return { selected, pending: null };
    return selected.includes(value)
      ? undefined
      : { selected: [...selected, value].sort((a, b) => a - b), pending: null };
  },
  accept: ({ pending }) => pending === null,
}, 9);
const differentCopycatDigits = new NFA(
  differentCopycatDigitsSpec,
  'different-copycat-digits',
  ...gridCells.flatMap(cell => [copycat.at(cell), cell]));

// A Copycat Cell's value is its opposite cell's digit; every other cell keeps
// its own digit. The Zipper and Odd Lots rules use these effective values.
const effectiveValues = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const opposite = makeCellId(10 - row, 10 - col);
  return new Or([
    new And([
      new Given(copycat.at(cell), UNSELECTED),
      new SameValues(2, copycatValue.at(cell), cell),
    ]),
    new And([
      new Given(copycat.at(cell), SELECTED),
      new SameValues(2, copycatValue.at(cell), opposite),
    ]),
  ]);
});

const zippers = [
  ['R2C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R1C6', 'R1C7'],
  ['R9C8', 'R9C9', 'R8C8'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3', 'R8C2'],
  ['R8C5', 'R9C5', 'R9C6', 'R8C6', 'R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R7C8'],
  ['R5C2', 'R4C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3', 'R4C3'],
  ['R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6'],
  ['R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R5C5'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R6C8', 'R6C7', 'R7C7'],
].map(cells => new Zipper(...copycatValue.at(cells)));

// In each NFA, the yellow circle is first; its value counts all odd line digits.
const oddLotsSpec = NFA.encodeSpec({
  startState: { remaining: null },
  transition: ({ remaining }, value) => {
    const target = remaining === null ? value : remaining;
    const next = target - (value % 2 === 1 ? 1 : 0);
    return next >= 0 ? { remaining: next } : undefined;
  },
  accept: ({ remaining }) => remaining === 0,
}, 9);
const oddLots = [
  ['R2C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R1C6', 'R1C7'],
  ['R3C3', 'R2C2', 'R1C1'],
  ['R7C7', 'R6C7', 'R6C8'],
  ['R6C9', 'R5C9', 'R7C9', 'R8C9', 'R7C8'],
  ['R8C6', 'R8C5', 'R9C5', 'R9C6', 'R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4'],
  ['R4C3', 'R5C3', 'R6C3', 'R6C2', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R5C2'],
].map(cells => new NFA(oddLotsSpec, 'odd-lots', ...copycatValue.at(cells)));

return [
  new Shape('9x9'),
  copycat.toVar('Copycat membership'),
  copycatValue.toVar('Copycat values'),
  // The main grid retains the normal Sudoku digits; Copycat values are a
  // parallel layer used by the rules that refer to a cell's value.
  copycatDomain,
  ...oneCopycatPerGroup,
  differentCopycatDigits,
  ...effectiveValues,
  ...zippers,
  ...oddLots,
];
