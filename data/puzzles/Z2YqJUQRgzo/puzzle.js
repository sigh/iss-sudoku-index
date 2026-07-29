// Title: Three Wishes
// Author: Matt Tressel
// Video: https://www.youtube.com/watch?v=Z2YqJUQRgzo
// Source: https://sudokupad.app/m8j8rRQbTj

// Normal Sudoku rules apply. Orthogonally adjacent cells in one 3x3 region
// differ by at least 3; pairs across a region boundary differ by at least 4.
// Each region's centre digit is at most its reading-order region number.
const graph = cellGraph('9x9');
const difference3 = Pair.fnToKey((a, b) => Math.abs(a - b) >= 3, 9);
const difference4 = Pair.fnToKey((a, b) => Math.abs(a - b) >= 4, 9);
const boxes = graph.boxes();

// Each Replicate target is the R1C1-relative origin of the shown edge template.
const withinRegionHorizontal = graph.makeReplicate([
  new Pair(difference3, 'difference at least 3', 'R1C1', 'R1C2'),
  new Pair(difference3, 'difference at least 3', 'R1C2', 'R1C3'),
], boxes.flatMap(box => [box[0], box[3], box[6]]));
const withinRegionVertical = graph.makeReplicate([
  new Pair(difference3, 'difference at least 3', 'R1C1', 'R2C1'),
  new Pair(difference3, 'difference at least 3', 'R2C1', 'R3C1'),
], boxes.flatMap(box => [box[0], box[1], box[2]]));
const betweenRegionHorizontal = graph.makeReplicate(
  new Pair(difference4, 'difference at least 4', 'R1C3', 'R1C4'),
  graph.rows().flatMap(row => [row[0], row[3]]));
const betweenRegionVertical = graph.makeReplicate(
  new Pair(difference4, 'difference at least 4', 'R3C1', 'R4C1'),
  graph.columns().flatMap(column => [column[0], column[3]]));

const regionCentres = boxes.slice(0, 8).map((box, index) =>
  new Given(box[4],
    ...Array.from({length: index + 1}, (_, digit) => digit + 1))
);

return [
  new Shape('9x9'),
  withinRegionHorizontal,
  withinRegionVertical,
  betweenRegionHorizontal,
  betweenRegionVertical,
  ...regionCentres,
];
