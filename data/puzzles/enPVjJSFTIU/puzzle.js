// Title: Lizard babies grow so fast...
// Author: olima
// Video: https://www.youtube.com/watch?v=enPVjJSFTIU
// Source: https://sudokupad.app/1xf09aa30a

// Normal Sudoku rules apply (standard 3x3 boxes, drawn `regions` match the
// default boxes). Green lines: adjacent digits differ by at least 5
// (Whisper). Purple lines: digits are distinct and consecutive, in any order
// (Renban). Blue lines: box borders divide the line into segments, each
// segment sums to the same total (RegionSumLine). Black dots: the two digits
// are in a 1:2 ratio (BlackDot). The rules state dots are not exhaustively
// marked, so no negative/absence constraint is added for un-dotted pairs.

// Blue lines (deepskyblue), cell order from lines[0] and lines[1] wayPoints.
const regionSumLines = [
  ['R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
  ['R5C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R9C5'],
].map((cells) => new RegionSumLine(...cells));

// Purple lines (orchid), cell order from lines[2..7] wayPoints.
const renbanLines = [
  ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7'],
  ['R5C6', 'R6C6', 'R6C5'],
  ['R8C3', 'R9C3'],
  ['R2C8', 'R3C9'],
  ['R1C2', 'R2C2'],
  ['R8C8', 'R9C9'],
].map((cells) => new Renban(...cells));

// Green lines (springgreen), cell order from lines[8..10] wayPoints.
const whisperLines = [
  ['R1C9', 'R2C8', 'R2C9'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R9C2'],
  ['R7C2', 'R8C3', 'R8C2'],
].map((cells) => new Whisper(5, ...cells));

// Black dots, from overlays[0] and overlays[1] (edge marks, white-on-black
// rounded fill).
const blackDots = [
  ['R4C4', 'R5C4'],
  ['R3C6', 'R4C6'],
].map((cells) => new BlackDot(...cells));

return [
  new Shape('9x9'),
  ...regionSumLines,
  ...renbanLines,
  ...whisperLines,
  ...blackDots,
];
