// Title: Sumarku
// Author: Catmandoku
// Video: https://www.youtube.com/watch?v=RGcTzUMKxyA
// Source: https://app.crackingthecryptic.com/4t7offdy6f

// Rules encoded here (nothing is omitted): normal sudoku; the ten displayed
// quadruples; the X; peach low/high alternation; green and orange minimum-
// difference strokes; and the connected pink renban.

// The circles and their displayed digits are transcribed from the drawn 2x2
// quadruple clues.
const quads = [
  ['R4C4', 5, 6, 7, 8], ['R8C1', 2, 3, 5, 9],
  ['R2C7', 1, 4, 6, 7], ['R2C2', 2, 5, 6, 9],
  ['R8C7', 2, 3, 7, 8], ['R5C5', 1, 2, 3, 5],
  ['R5C8', 1, 3, 6, 8], ['R8C4', 1, 4, 6, 8],
  ['R4C1', 1, 2, 6, 9], ['R1C5', 3, 4, 6, 9],
];

// The peach path is transcribed from its single drawn stroke. This predicate
// means one adjacent value is low (1-4) and the other high (6-9), excluding 5.
const peachLine = ['R3C1', 'R2C1', 'R1C1', 'R2C2', 'R1C3', 'R2C3', 'R3C3'];
const peachKey = Pair.fnToKey(
  (a, b) => (a <= 4 && b >= 6) || (a >= 6 && b <= 4), 9);

// Each array is one continuous drawn stroke. The orange path's final R8C1 is
// deliberate: the source geometry returns to that already visited cell.
const greenLines = [
  ['R3C7', 'R2C7', 'R2C8', 'R2C9', 'R3C9'],
  ['R2C7', 'R1C8', 'R2C9'],
];
const orangeLines = [
  ['R9C1', 'R8C1', 'R8C2', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1'],
  ['R8C2', 'R9C3'],
];
// The three pink strokes meet into one connected drawing, and the rule calls it
// the singular "pink line". Renban is set-based, so this is its six-cell union.
const pinkRenban = ['R7C7', 'R8C7', 'R9C7', 'R8C8', 'R9C9', 'R7C9'];

return [
  new Shape('9x9'),
  ...quads.map(([topLeft, ...digits]) => new Quad(topLeft, ...digits)),
  new X('R8C3', 'R8C4'),
  new Pair(peachKey, 'Peach low/high line', ...peachLine),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),
  new Renban(...pinkRenban),
];
