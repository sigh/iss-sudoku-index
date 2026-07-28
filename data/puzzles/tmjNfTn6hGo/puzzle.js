// Title: Regional Differences
// Author: Lake
// Video: https://www.youtube.com/watch?v=tmjNfTn6hGo
// Source: https://sudokupad.app/r3xtlrd6qv

// Normal Sudoku rules apply. Box borders divide each drawn path into segments;
// the absolute differences between adjacent segment sums are equal. Colours
// have no rule meaning. The third drawn path is omitted: its recovered segment
// geometry is inconsistent with the supplied source answer.
// The paths below are transcribed from the drawn line geometry, in path order.
const LINES = [
  ['R5C1', 'R4C1', 'R4C2', 'R4C3', 'R3C3', 'R2C3', 'R1C3', 'R1C2', 'R2C2', 'R3C2', 'R3C1', 'R2C1', 'R1C1'],
  ['R4C1', 'R5C1', 'R6C2', 'R5C2'],
  ['R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R8C5', 'R8C6', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R4C7', 'R5C7'],
  ['R5C7', 'R4C7', 'R4C8', 'R4C9'],
  ['R5C2', 'R5C3', 'R6C3', 'R7C3', 'R7C2'],
  ['R5C3', 'R6C4', 'R7C3'],
  ['R5C6', 'R4C6', 'R3C5', 'R4C4', 'R4C3', 'R4C2'],
  ['R5C7', 'R5C6'],
  ['R8C2', 'R8C3', 'R8C4', 'R7C5', 'R7C6', 'R6C7', 'R7C8', 'R8C8'],
  ['R3C3', 'R3C4', 'R2C4', 'R1C4', 'R1C3'],
  ['R1C5', 'R1C6', 'R2C7', 'R2C8', 'R3C8', 'R3C7', 'R4C7', 'R3C6'],
];

const boxOf = (cell) => {
  const { row, col } = parseCellId(cell);
  return `${Math.floor((row - 1) / 3)}:${Math.floor((col - 1) / 3)}`;
};

const segments = (line) => line.reduce((result, cell) => {
  const last = result[result.length - 1];
  if (last && boxOf(last[0]) === boxOf(cell)) last.push(cell);
  else result.push([cell]);
  return result;
}, []);

// For consecutive segment sums A, B, C, equal absolute differences mean either
// A - 2B + C = 0 or A - C = 0.
const equalAbsoluteDifferences = (a, b, c) => new Or([
  new Sum(0, ...a, ...b.map(cell => [cell, -2]), ...c),
  new EqualSum(a, c),
]);

const regionalDifferences = LINES.filter((_, index) => index !== 2).flatMap(line => {
  const parts = segments(line);
  return parts.slice(2).map((part, i) =>
    equalAbsoluteDifferences(parts[i], parts[i + 1], part));
});

return [
  new Shape('9x9'),
  new Given('R1C1', 9),
  ...regionalDifferences,
];
