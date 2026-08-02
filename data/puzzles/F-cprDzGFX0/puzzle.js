// Title: Squishdoku
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=F-cprDzGFX0
// Source: https://sudokupad.app/hj6147ck7h

// Digits 1-9 do not repeat in each row, column, or overlapping 3x3 region.
// Adjacent cells on green lines differ by at least 5. Each blue line has equal
// sums in all of the overlapping 3x3 regions it crosses, including boundary cells.
const regionStarts = [1, 3, 5];
const regions = regionStarts.flatMap(row => regionStarts.map(col =>
  Array.from({length: 3}, (_, dr) =>
    Array.from({length: 3}, (_, dc) => makeCellId(row + dr, col + dc))).flat()
));

// The drawn green and blue cell paths.
const greenLines = [
  ['R3C6', 'R3C5', 'R4C5', 'R4C4'],
  ['R5C4', 'R6C5', 'R7C6', 'R7C7'],
];
const blueLines = [
  ['R1C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R4C1'],
  ['R2C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C6'],
];

function equalRegionSums(line) {
  const segments = regions
    .map(region => line.filter(cellId => region.includes(cellId)))
    .filter(segment => segment.length > 0);
  return [new EqualSum(...segments)];
}

return [
  new Shape('7x7', 9),
  new NoBoxes(),
  ...regions.map(region => new AllDifferent(...region)),
  ...greenLines.map(line => new Whisper(5, ...line)),
  ...blueLines.flatMap(equalRegionSums),
];
