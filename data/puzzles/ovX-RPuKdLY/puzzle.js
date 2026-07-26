// Title: There's a 4 in the corner!
// Author: Md88keys
// Video: https://www.youtube.com/watch?v=ovX-RPuKdLY
// Source: https://sudokupad.app/c63io2bpp2

// Standard sudoku rules apply (rows, columns, and 3x3 boxes).
// Renban (purple): consecutive-set line.
// German whisper (green): adjacent-cell difference >= 5.
// Dutch whisper (orange): adjacent-cell difference >= 4.
// Region sum line (blue, x2): equal sum per box segment, via RegionSumLine.
// Kropki black dots: 1:2 ratio between the given dotted pairs. The rules
// state not all dots are given, so only the drawn dots are encoded -- no
// negative constraint is added elsewhere.

// German whisper: a 16-cell ring around the centre box (rows/cols 3-7),
// closed loop, so the start cell is repeated to cover the wrap-around edge.
const germanWhisper = new Whisper(
  5, 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7',
  'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3');

// Dutch whisper: the 8 cells surrounding the very centre cell R5C5, closed
// loop, so the start cell is repeated.
const dutchWhisper = new Whisper(
  4, 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4', 'R4C5');

// Region sum lines: straight across row 2 and row 8. RegionSumLine derives
// the per-box segments itself.
const regionSumLines = [
  new RegionSumLine('R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'),
  new RegionSumLine('R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'),
];

// Renban: the 8 cells surrounding R8C2 (centre of the bottom-left box).
// Renban is set-based, so (unlike the Whisper loops above) the start cell
// is not repeated.
const renban = new Renban(
  'R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1');

// Kropki black dots, one per drawn dot overlay.
const blackDots = [
  new BlackDot('R5C4', 'R6C4'),
  new BlackDot('R2C5', 'R2C6'),
  new BlackDot('R8C4', 'R8C5'),
  new BlackDot('R6C1', 'R7C1'),
];

return [
  new Shape('9x9'),
  germanWhisper,
  dutchWhisper,
  ...regionSumLines,
  renban,
  ...blackDots,
];
