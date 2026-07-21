// Title: Abstract Art
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=IqW3xhRMXQ0
// Source: https://sudokupad.app/s7221r2i0r

// The grid uses eight of the digits 1-9. Every row and column, and each
// solver-selected 2x4 region, contains the same eight-digit set.
const shape = new Shape('8x8', 9);
const graph = cellGraph(shape);
const referenceRow = graph.row(1);

const rectangles = [];
for (const [height, width] of [[2, 4], [4, 2]]) {
  for (let row = 1; row <= 9 - height; row++) {
    for (let col = 1; col <= 9 - width; col++) {
      rectangles.push(Array.from({ length: height * width }, (_, index) => {
        const rowOffset = Math.floor(index / width);
        const colOffset = index % width;
        return makeCellId(row + rowOffset, col + colOffset);
      }));
    }
  }
}

const rectanglesByCell = new Map(graph.cells().map(cell => [cell, []]));
for (const rectangle of rectangles) {
  for (const cell of rectangle) rectanglesByCell.get(cell).push(rectangle);
}

const tilings = [];
function enumerateTilings(used = new Set(), chosen = []) {
  const firstUnused = graph.cells().find(cell => !used.has(cell));
  if (!firstUnused) {
    tilings.push(chosen);
    return;
  }

  for (const rectangle of rectanglesByCell.get(firstUnused)) {
    if (rectangle.some(cell => used.has(cell))) continue;
    enumerateTilings(
      new Set([...used, ...rectangle]),
      [...chosen, rectangle]
    );
  }
}
enumerateTilings();

const regionSumLoop = [
  'R4C3', 'R4C4', 'R5C5', 'R4C5', 'R3C5', 'R3C4',
];

function regionSumSegments(tiling) {
  const regionOf = new Map();
  tiling.forEach((region, index) => {
    for (const cell of region) regionOf.set(cell, index);
  });

  const segments = [];
  for (const cell of regionSumLoop) {
    const region = regionOf.get(cell);
    const previous = segments.at(-1);
    if (previous && previous.region === region) previous.cells.push(cell);
    else segments.push({ region, cells: [cell] });
  }

  // The line is closed, so its first and last sections are one section when
  // they lie in the same region.
  if (segments.length > 1 && segments[0].region === segments.at(-1).region) {
    segments[0].cells.unshift(...segments.pop().cells);
  }
  return segments.map(segment => segment.cells);
}

const regionChoices = new Or(tilings.map(tiling => {
  const segments = regionSumSegments(tiling);
  return new And([
    ...tiling.map(region => new SameValues(
      2, ...referenceRow, ...region
    )),
    ...(segments.length > 1 ? [new EqualSum(...segments)] : []),
  ]);
}));

const pinkRenban = [
  'R1C1', 'R2C1', 'R3C1', 'R4C2', 'R3C2', 'R2C2',
];
const yellowNabner = ['R1C5', 'R2C5', 'R2C6', 'R1C6'];
const greenWhisper = [
  'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R5C7', 'R5C6',
  'R4C6', 'R3C6', 'R3C7', 'R2C7', 'R2C8',
];
const redParity = ['R8C5', 'R7C5', 'R6C5', 'R6C6', 'R6C7'];
const greyPalindrome = ['R8C5', 'R8C6', 'R8C7', 'R7C7', 'R6C7'];
const sameDifferenceLines = [
  ['R1C3', 'R1C2', 'R2C2'],
  ['R2C2', 'R2C3', 'R1C3'],
  [
    'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R6C4',
    'R5C4', 'R5C3', 'R5C2', 'R6C2',
  ],
];

const nabnerKey = Pair.fnToKey((a, b) => Math.abs(a - b) > 1, 9);
const oppositeParityKey = Pair.fnToKey((a, b) => (a + b) % 2 === 1, 9);
const differenceKeys = Array.from({ length: 8 }, (_, index) => {
  const difference = index + 1;
  return Pair.fnToKey((a, b) => Math.abs(a - b) === difference, 9);
});

const sameDifference = sameDifferenceLines.map(cells => new Or(
  differenceKeys.map((key, index) => new Pair(
    key, `Same difference ${index + 1}`, ...cells
  ))
));

return [
  shape,
  new NoBoxes(),
  new RegionSameValues(),
  regionChoices,
  new Renban(...pinkRenban),
  new PairX(nabnerKey, 'Nabner', ...yellowNabner),
  new Whisper(5, ...greenWhisper),
  new Pair(oppositeParityKey, 'Alternating parity', ...redParity),
  new Palindrome(...greyPalindrome),
  ...sameDifference,
  new BlackDot('R3C7', 'R4C7'),
];
