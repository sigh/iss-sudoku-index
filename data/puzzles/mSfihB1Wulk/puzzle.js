// Title: Mean Quartet
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=mSfihB1Wulk
// Source: https://sudokupad.app/3dc006fsed

// Rules encoded:
// - 8x8 grid, digits 0-9 playable (10 symbols); no digit is required to
//   appear anywhere on the grid.
// - No digit repeats in any marked 2x2 box: the marked boxes are the 16
//   2x2 regions that tile the grid (four per 4x4 quadrant). RegionSize(4)
//   on this 8x8 shape produces exactly that row-major 2x2 tiling, so the
//   boxes below are the solver's native default boxes, not a jigsaw.
// - No digit repeats in any row or column of the full 8x8 grid: the
//   solver's default row/column all-different (unaffected by RegionSize).
// - "For each 4x4 quadrant, choose 4 of the digits from 0-9 and use them to
//   fill that quadrant": since each of a quadrant's four 2x2 boxes is
//   already all-different (4 cells, no repeat), forcing all four boxes to
//   hold the same 4-value set (SameValues) is exactly "the quadrant is
//   filled using only those 4 digits."
// - RENBAN (pink line): non-repeating consecutive run, any order.
// - GERMAN WHISPER (green line): adjacent digits differ by >= 5.
// - REGION SUM (blue line): each segment between box borders sums the same;
//   uses the same 2x2 box borders as above.
// - NABNER (yellow line): no two digits anywhere on the line -- not just
//   adjacent -- may be equal or consecutive, so this is PairX (all pairs
//   of the line's cells), not Pair (consecutive pairs only).
// Four black rectangles drawn on the grid trace the 4x4 quadrant borders
// only (decoration for the "quadrant" language above); no rules-text line
// colour corresponds to them, so they are not encoded.

const shape = new Shape('8x8', '0-9');
const graph = cellGraph(shape);

// The 16 2x2 boxes in row-major order -- matches RegionSize(4) on 8x8.
const boxes = graph.boxes(4);

// Group the 16 boxes into the four 4x4 quadrants (a 2x2 block of boxes
// each) and force each quadrant's four boxes onto one shared 4-value set.
const sameValues = [];
for (let qr = 0; qr < 2; qr++) {
  for (let qc = 0; qc < 2; qc++) {
    const quadCells = [];
    for (let br = 0; br < 2; br++) {
      for (let bc = 0; bc < 2; bc++) {
        const boxIndex = (qr * 2 + br) * 4 + (qc * 2 + bc);
        quadCells.push(...boxes[boxIndex]);
      }
    }
    sameValues.push(new SameValues(4, ...quadCells));
  }
}

// Renban: cells read off the drawn pink line's interpolated cell path.
const renban = new Renban(
  'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7');

// German whisper: two separate green lines.
const whispers = [
  new Whisper(5,
    'R8C4', 'R8C5', 'R8C6', 'R7C6', 'R6C5', 'R5C6', 'R5C7', 'R5C8', 'R4C8'),
  new Whisper(5, 'R1C6', 'R1C7'),
];

// Region sum: three separate blue lines.
const regionSums = [
  new RegionSumLine(
    'R6C1', 'R5C1', 'R5C2', 'R4C3', 'R3C3', 'R3C4', 'R2C5', 'R2C6'),
  new RegionSumLine('R6C2', 'R7C1', 'R8C2', 'R8C3', 'R7C4'),
  new RegionSumLine('R2C8', 'R3C7'),
];

// Nabner: five separate yellow lines, each with PairX applied within itself.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, shape);
const nabnerLines = [
  ['R6C7', 'R6C8'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R4C1', 'R4C2'],
  ['R1C4', 'R2C4'],
  ['R1C1', 'R2C1'],
];
const nabners = nabnerLines.map(
  cells => new PairX(nabnerKey, 'Nabner', ...cells));

return [
  shape,
  new RegionSize(4),
  ...sameValues,
  renban,
  ...whispers,
  ...regionSums,
  ...nabners,
];
