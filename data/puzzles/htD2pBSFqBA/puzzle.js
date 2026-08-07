// Title: Nightfall
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=htD2pBSFqBA
// Source: https://app.crackingthecryptic.com/sudoku/Tq37QbFhpP
//
// Normal sudoku, standard 3x3 boxes. Adjacent cells on a green line differ by
// at least 5. Adjacent cells on an orange line differ by at most 2 (repeats
// allowed, no extra distinctness). Digits on the grey line sum to an equal
// total N within each box the line passes through.
//
// The grid carries 16 drawn line strokes (three colours) plus one line entry
// with no waypoints, which covers no cells and is omitted. Several orange and
// green strokes share an endpoint cell where they visually meet, but each
// stroke is its own separate constraint of its own colour.

// Orange strokes: max-adjacent-difference 2, one Pair per drawn stroke.
const ORANGE_LINES = [
  ['R1C9', 'R1C8', 'R2C8', 'R3C9'],
  ['R2C4', 'R1C5'],
  ['R1C6', 'R2C7'],
  ['R3C2', 'R2C2', 'R3C1'],
  ['R4C2', 'R5C3', 'R4C3'],
  ['R6C7', 'R6C8', 'R5C9', 'R4C8', 'R4C7'],
  ['R7C1', 'R7C2', 'R7C3'],
  ['R7C7', 'R7C8', 'R7C9'],
];

// Green strokes: Whisper(5), one per drawn stroke.
const GREEN_LINES = [
  ['R1C6', 'R1C5', 'R1C4'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R2C1', 'R3C1'],
  ['R5C2', 'R6C2', 'R5C1'],
  ['R7C1', 'R8C1', 'R8C2', 'R7C3'],
  ['R7C7', 'R8C8', 'R8C9', 'R7C9'],
  ['R5C9', 'R5C8'],
];

// Grey line: closed loop, box-segment equal-sum rule (RegionSumLine). The
// drawn path closes back to its first cell (R3C6); the trailing repeat is
// dropped because RegionSumLine partitions the list by walking it once, and
// no box's visit straddles the array ends in this rotation (start box2,
// end box5).
const GREY_LINE = [
  'R3C6', 'R3C5', 'R4C4', 'R5C4', 'R6C4', 'R7C5', 'R7C6', 'R6C5', 'R5C5', 'R4C5',
];

const orangeKey = Pair.fnToKey((a, b) => Math.abs(a - b) <= 2, 9);

const orangeLines = ORANGE_LINES.map(
  cells => new Pair(orangeKey, 'Orange line (max diff 2)', ...cells));

const greenLines = GREEN_LINES.map(cells => new Whisper(5, ...cells));

return [
  new Shape('9x9'),
  new Given('R3C8', 5),
  ...orangeLines,
  ...greenLines,
  new RegionSumLine(...GREY_LINE),
];
