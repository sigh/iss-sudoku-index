// Title: Leaning in
// Author: Thenonymous
// Video: https://www.youtube.com/watch?v=M0Bf_fZ0Nfs
// Source: https://sudokupad.app/ho51fykiy7

// Normal 9x9 sudoku rules apply.
//
// German whispers (green lines): adjacent digits along a green line must
// differ by at least 5.
//
// Biased entropic lines (beige lines): each sequential group of 3 digits
// along a beige line contains one digit from {1, 2}, one digit from
// {3, 4, 5}, and one digit from {6, 7, 8, 9}.
//
// (The "regions" array in the source lists all nine standard 3x3 boxes, not
// an irregular partition -- the "skewed" in the video title refers to the
// unequal 2/3/4 group sizes on the entropic lines, not the regions.)

// The built-in Entropic class only supports the fixed {1,2,3}/{4,5,6}/
// {7,8,9} split, so the biased grouping here is encoded directly with
// PairX, mirroring how the solver expands the built-in Entropic constraint
// itself: one all-pairs-different PairX per sliding window of 3 cells.
function biasedGroup(v) {
  if (v <= 2) return 0;
  if (v <= 5) return 1;
  return 2;
}
const geometry = cellGeometry('9x9');
const biasedEntropicKey = PairX.fnToKey(
  (a, b) => biasedGroup(a) !== biasedGroup(b), geometry);

function biasedEntropicWindows(cells) {
  return Array.from(
    { length: cells.length - 2 },
    (_, i) => new PairX(
      biasedEntropicKey, 'Biased Entropic', ...cells.slice(i, i + 3)));
}

// Beige (entropic) line cell paths, in drawn order. Waypoints are cell
// centres; collinear runs between waypoints are filled in (e.g. line 0's
// R1C2-R3C2 leg passes through R2C2).
const entropicLines = [
  ['R2C1', 'R1C1', 'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R2C3'],
  ['R2C4', 'R3C4', 'R3C5', 'R2C5', 'R1C5', 'R1C6', 'R2C6'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R4C3', 'R5C3', 'R6C3', 'R6C2', 'R5C2', 'R5C1'],
  ['R9C6', 'R9C5', 'R8C5', 'R8C6'],
  ['R4C5', 'R4C6', 'R5C6', 'R5C5', 'R6C5'],
];

// Green (German whisper) line cell paths, in drawn order.
const whisperLines = [
  ['R2C9', 'R3C9', 'R3C8', 'R3C7', 'R4C7'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R5C7', 'R6C7', 'R6C6', 'R7C6', 'R7C7', 'R8C7', 'R9C7'],
  ['R8C3', 'R8C2', 'R7C2'],
  ['R2C3', 'R2C4', 'R1C4'],
];

return [
  new Shape('9x9'),
  ...entropicLines.flatMap(biasedEntropicWindows),
  ...whisperLines.map(cells => new Whisper(5, ...cells)),
];
