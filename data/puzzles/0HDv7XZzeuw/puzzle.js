// Title: Answers on a Postcard
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=0HDv7XZzeuw
// Source: https://sudokupad.app/wxge3tm0qt

// Digits do not repeat in rows, columns, 3x3 boxes, or at a knight's move.
const redCells = [
  'R1C1', 'R2C1', 'R3C1',
  'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5',
];

const greenLines = [
  ['R5C5', 'R4C4', 'R4C5', 'R4C6', 'R3C5'],
  ['R2C4', 'R2C5'],
];

return [
  new Shape('6x9', 9),
  new AntiKnight(),

  // On a red cell in column C, digit V places C in column V of that row.
  new Indexing('C', ...redCells),

  // Adjacent digits on each green line differ by at least 5.
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
