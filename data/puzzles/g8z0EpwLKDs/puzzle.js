// Title: Mirrored Zippers
// Author: gdc
// Video: https://www.youtube.com/watch?v=g8z0EpwLKDs
// Source: https://sudokupad.app/4hq3qvqmnk

// Normal Sudoku applies. Each row, column, and box has one mirrored digit, and
// each displayed digit is mirrored once. A mirrored digit has value 10 minus
// its displayed digit; other digits retain their displayed value. Zipper lines
// use those values: equally distant cells sum to the circled centre's value.
const graph = cellGraph('9x9');
const mirror = graph.makeOverlay('VM');
const value = graph.makeOverlay('VE');
const cells = graph.cells();

// The marker is 1 for an ordinary digit and 2 for a mirrored digit.
const markerDomains = mirror.makeReplicate(new Given(mirror.cells()[0], 1, 2));

// This three-symbol machine ties each displayed digit and marker to its value.
const effectiveValue = NFA.encodeSpec({
  startState: { digit: null, marker: null },
  transition: ({ digit, marker }, input) => {
    if (digit === null) return { digit: input, marker: null };
    if (marker === null) return { digit, marker: input };
    if ((marker === 1 && input === digit) ||
        (marker === 2 && input === 10 - digit)) return { digit: null, marker: null };
    return undefined;
  },
  accept: ({ digit }) => digit === null,
}, 9);

// For a displayed target digit, exactly one occurrence carries the mirrored marker.
function mirroredDigit(target) {
  return NFA.encodeSpec({
    startState: { digit: null, count: 0 },
    transition: ({ digit, count }, input) => {
      if (digit === null) return { digit: input, count };
      const next = count + (digit === target && input === 2 ? 1 : 0);
      return next > 1 ? undefined : { digit: null, count: next };
    },
    accept: ({ digit, count }) => digit === null && count === 1,
  }, 9);
}

// The lavender drawn zipper paths, in their drawn order; the fourth retraces R7C3.
const zippers = [
  ['R5C8', 'R5C7', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C5', 'R4C6', 'R4C5', 'R4C4', 'R5C4', 'R5C3', 'R5C2'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7'],
  ['R4C2', 'R4C1', 'R5C1', 'R6C1', 'R6C2'],
  ['R8C1', 'R7C1', 'R7C2', 'R7C3', 'R6C3', 'R7C3', 'R8C3', 'R8C2', 'R9C2'],
  ['R2C2', 'R2C3', 'R3C3', 'R4C3', 'R3C2', 'R3C1', 'R2C1'],
  ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'],
  ['R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'],
  ['R9C9', 'R9C8', 'R8C8'],
  ['R9C9', 'R8C9', 'R8C8'],
];

return [
  new Shape('9x9'),
  mirror.toVar('mirrored-digit markers'),
  value.toVar('effective digit values'),
  markerDomains,
  new NFA(effectiveValue, 'effective values', ...cells.flatMap(cell => [cell, mirror.at(cell), value.at(cell)])),
  ...mirror.rowsColumnsBoxes().map(unit => new Sum(10, ...unit)),
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    mirroredDigit(i + 1), `mirrored ${i + 1}`,
    ...cells.flatMap(cell => [cell, mirror.at(cell)]),
  )),
  ...zippers.map(cellsOnLine => new Zipper(...value.at(cellsOnLine))),
];
