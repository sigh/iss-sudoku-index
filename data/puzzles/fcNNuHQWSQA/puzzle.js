// Title: Coloured Circles
// Author: Prof Dorlir
// Video: https://www.youtube.com/watch?v=fcNNuHQWSQA
// Source: https://app.crackingthecryptic.com/sudoku/n4FR3FtL4D

// Rules encoded:
// - Normal 8x8 Sudoku with the source's ordinary 2x4 boxes.
// - For every labelled cell, its digit equals the number of occurrences of
//   that digit among all cells carrying its letter, except at naughty cells
//   where that equality does not hold.
// - Exactly one labelled cell is naughty in every row, column, and box.

const graph = cellGraph('8x8');
const naughty = graph.makeOverlay('VN');
const flag = cell => naughty.at(cell);

// Letter positions transcribed from the source's text overlays.
const LETTERS = {
  A: ['R1C1', 'R1C4', 'R4C8', 'R5C3', 'R6C1', 'R7C3', 'R8C6'],
  B: ['R1C2', 'R2C2', 'R1C6', 'R1C7', 'R3C6', 'R3C8', 'R4C1', 'R4C3',
    'R4C4', 'R5C7', 'R5C8', 'R7C1', 'R7C4', 'R7C5', 'R8C5'],
  C: ['R1C3', 'R1C5', 'R2C4', 'R2C6', 'R3C3', 'R3C7', 'R4C2', 'R5C1',
    'R6C3', 'R6C4', 'R5C6', 'R6C6', 'R7C8', 'R7C6', 'R8C3'],
  D: ['R1C8', 'R2C1', 'R2C3', 'R2C7', 'R3C1', 'R3C5', 'R5C2', 'R6C2',
    'R6C5', 'R8C7'],
  E: ['R2C5', 'R3C4', 'R4C7', 'R5C5', 'R7C2'],
  F: ['R2C8', 'R4C5', 'R4C6', 'R5C4', 'R6C7', 'R8C1'],
  G: ['R3C2', 'R8C2'],
  H: ['R6C8', 'R7C7', 'R8C8', 'R8C4'],
};

// Every machine reads [naughty flag, displayed digit, all cells of that
// digit's letter]. Flag 1 is ordinary and requires equality; flag 2 is naughty
// and requires inequality. The bounded count is the number of occurrences of
// the displayed digit in the letter group.
function letterCountSpec(groupLength) {
  return NFA.encodeSpec({
    startState: {flag: null, digit: null, count: 0},
    transition: ({flag, digit, count}, value) => {
      if (flag === null) return {flag: value, digit: null, count: 0};
      if (digit === null) return {flag, digit: value, count: 0};
      const nextCount = count + (value === digit ? 1 : 0);
      return nextCount > 8 ? undefined : {flag, digit, count: nextCount};
    },
    accept: ({flag, digit, count}) =>
      flag === 1 ? count === digit : count !== digit,
    maxDepth: groupLength + 2,
  }, 8);
}

const letterSpecs = Object.fromEntries(
  Object.entries(LETTERS).map(([letter, cells]) => [letter, letterCountSpec(cells.length)]));

return [
  new Shape('8x8'),
  naughty.toVar('naughty flags'),
  naughty.makeReplicate(new Given(naughty.cells()[0], 1, 2)),

  // One flag value 2 in each house selects exactly the eight naughty cells.
  ...graph.rowsColumnsBoxes().map(cells => new ContainExact('2', ...flag(cells))),

  ...Object.entries(LETTERS).flatMap(([letter, cells]) =>
    cells.map(cell => new NFA(letterSpecs[letter], `${letter} count`, flag(cell), cell, ...cells))),
];
