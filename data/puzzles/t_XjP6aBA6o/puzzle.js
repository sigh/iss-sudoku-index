// Title: Don't even touch
// Author: Boh
// Video: https://www.youtube.com/watch?v=t_XjP6aBA6o
// Source: https://sudokupad.app/i08b8g32oc

// Rules encoded:
// - Normal sudoku rules (rows, columns, boxes all-different): default Shape.
// - Within each 3x3 box, two orthogonally adjacent cells cannot both hold an
//   even digit (adjacency across a box boundary is unrestricted).
// - German Whispers: adjacent digits on a green line differ by at least 5.
// - Black Kropki dots: digits either side of the dot are in a 1:2 ratio.

// Within-box even-adjacency exclusion. Box membership is derived from
// row/col (floor((n-1)/3)), not hand-listed, so every in-box orthogonal edge
// is covered exactly once regardless of box position. All horizontal in-box
// edges are +1-column shifts of one template, all vertical in-box edges are
// +1-row shifts of another, so each group replicates a single Pair.
const graph = cellGraph('9x9');
const notBothEven = Pair.fnToKey((a, b) => !(a % 2 === 0 && b % 2 === 0), 9);
const boxOf = (row, col) => [Math.floor((row - 1) / 3), Math.floor((col - 1) / 3)];
const horizStarts = [];
const vertStarts = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    if (col < 9) {
      const [br, bc] = boxOf(row, col);
      const [br2, bc2] = boxOf(row, col + 1);
      if (br === br2 && bc === bc2) horizStarts.push(makeCellId(row, col));
    }
    if (row < 9) {
      const [br, bc] = boxOf(row, col);
      const [br2, bc2] = boxOf(row + 1, col);
      if (br === br2 && bc === bc2) vertStarts.push(makeCellId(row, col));
    }
  }
}
const evenNoTouch = [
  graph.makeReplicate(
    new Pair(notBothEven, 'Even no touch', horizStarts[0],
      makeCellId(parseCellId(horizStarts[0]).row, parseCellId(horizStarts[0]).col + 1)),
    horizStarts),
  graph.makeReplicate(
    new Pair(notBothEven, 'Even no touch', vertStarts[0],
      makeCellId(parseCellId(vertStarts[0]).row + 1, parseCellId(vertStarts[0]).col)),
    vertStarts),
];

// German Whisper lines, transcribed from the puzzle's drawn green line
// segments (12 short strokes). Segments sharing an endpoint were merged into
// maximal paths; two of the merged shapes have a genuine branch (three
// strokes meeting at one cell: R4C4 and, symmetrically, R6C6), so each
// branch is a separate Whisper line sharing just that one cell, per "a line
// drawn as several strokes ... is encoded per drawn segment."
const whispers = [
  new Whisper('R3C3', 'R4C4'),
  new Whisper('R4C6', 'R4C5', 'R5C4', 'R5C3', 'R4C4', 'R3C5'),
  new Whisper('R7C7', 'R6C6'),
  new Whisper('R7C5', 'R6C6', 'R5C7', 'R5C6', 'R6C5', 'R6C4'),
  new Whisper('R3C6', 'R4C7', 'R5C8'),
  new Whisper('R5C2', 'R6C3', 'R7C4'),
];

// Black Kropki dots, transcribed from the puzzle's two drawn dots (both
// black).
const kropkiDots = [
  new BlackDot('R8C8', 'R8C9'),
  new BlackDot('R4C1', 'R3C1'),
];

return [
  new Shape('9x9'),
  ...evenNoTouch,
  ...whispers,
  ...kropkiDots,
];
