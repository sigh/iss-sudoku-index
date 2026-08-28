// Title: Equal Color Sums
// Author: Rodrigo Mahu
// Video: https://www.youtube.com/watch?v=Y_4RI7QhViw
// Source: https://tinyurl.com/yxuvex7p
//
// Normal sudoku rules (standard 3x3 boxes; no custom regions drawn, no
// givens). Each drawn line is coloured (blue/green/red). Splitting every
// line at box boundaries -- a line that re-enters a box already visited
// contributes a separate segment for that later visit -- gives a set of
// segments per colour. The rules state one shared sum value per colour: all
// of that colour's segments (across all of that colour's lines) must total
// the same amount. `EqualSum` takes one array per segment and enforces they
// all sum equal, which is exactly this rule; splitting into segments is
// done here from the drawn cell paths rather than hand-transcribed, so the
// box split cannot silently drift from the drawn geometry.

const lines = {
  blue: [
    ['R1C9', 'R2C8', 'R2C7', 'R2C6', 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R3C7', 'R3C8'],
    ['R9C8', 'R8C7'],
    ['R1C2', 'R1C1', 'R2C1'],
    ['R8C1', 'R8C2', 'R9C3'],
  ],
  green: [
    ['R3C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5',
      'R4C5', 'R3C5', 'R2C5', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
    ['R2C1', 'R3C2', 'R2C3'],
    ['R8C9', 'R9C9', 'R9C8'],
    ['R9C3', 'R8C3', 'R7C3'],
  ],
  red: [
    ['R2C3', 'R1C2'],
    ['R8C7', 'R7C8', 'R8C9'],
    ['R9C4', 'R8C4', 'R7C4', 'R6C4', 'R6C3', 'R6C2', 'R6C1', 'R7C2', 'R8C1'],
  ],
};

// The box a cell belongs to, as a single small-int key.
const boxOf = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// Split one line's cell path into maximal runs that stay within one box,
// starting a new segment whenever the box changes (including re-entering a
// box the line already left, per RegionSumLine's segment-partition rule in
// the catalog).
const segmentsOf = (path) => {
  const segments = [];
  let currentBox = null;
  for (const cell of path) {
    const box = boxOf(cell);
    if (box !== currentBox) {
      segments.push([]);
      currentBox = box;
    }
    segments[segments.length - 1].push(cell);
  }
  return segments;
};

// One EqualSum per colour: all of that colour's segments share one sum.
const equalSumGroups = Object.values(lines).map(
  (paths) => new EqualSum(...paths.flatMap(segmentsOf)));

return [
  new Shape('9x9'),
  ...equalSumGroups,
];
