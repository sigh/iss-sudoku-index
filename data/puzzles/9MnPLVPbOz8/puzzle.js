// Title: The Coriolis Effect
// Author: Jim Taylor
// Video: https://www.youtube.com/watch?v=9MnPLVPbOz8
// Source: https://app.crackingthecryptic.com/sudoku/bBb9qHG2gr

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Five drawn
// lines: the sum of the digits on each line, within any one box it passes
// through, must equal that line's total; a line that re-enters the same
// box contributes a separately-summing segment. This is exactly
// RegionSumLine's semantics. Lines 3 and 4 both touch R3C3 (line 3 ends
// there; line 4's diagonal segment only crosses it) but are two separate
// entries in the source and are encoded as two independent lines with
// independent sums.

const line1 = [
  'R1C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R7C3', 'R7C4', 'R7C5', 'R6C5',
];
const line2 = [
  'R4C5', 'R3C5', 'R3C6', 'R3C7', 'R4C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9',
];
const line3 = ['R5C4', 'R4C4', 'R3C3'];
const line4 = ['R4C2', 'R3C3', 'R2C4', 'R1C5', 'R1C6', 'R1C7'];
const line5 = [
  'R6C6', 'R5C7', 'R6C7', 'R7C7', 'R8C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2',
];

const regionSumLines = [line1, line2, line3, line4, line5].map(
  (cells) => new RegionSumLine(...cells));

return [
  new Shape('9x9'),
  ...regionSumLines,
];
