// Title: ZipBan!
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=FUJVsYZwNwY
// Source: https://sudokupad.app/8851i50p1d

// Normal Sudoku rules apply. Every drawn purple line is both a Renban line
// (a non-repeating consecutive digit set) and a Zipper line. The nine cell
// paths below are transcribed from those double-stroked lines; the thin
// thistle strokes duplicate the purple strokes as outlines.
const lines = [
  ['R2C1', 'R1C1', 'R1C2'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R3C6', 'R4C6', 'R4C7', 'R3C7'],
  ['R4C3', 'R3C3', 'R3C4', 'R4C4'],
  ['R4C9', 'R5C9', 'R6C9', 'R6C8'],
  ['R7C8', 'R8C8', 'R9C8', 'R9C9'],
  ['R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6'],
  ['R9C1', 'R9C2', 'R8C2'],
  ['R4C1', 'R5C1', 'R6C1', 'R6C2'],
];

return [
  new Shape('9x9'),
  new Given('R2C5', 3),
  new Given('R5C6', 3),
  ...lines.map(cells => new Renban(...cells)),
  ...lines.map(cells => new Zipper(...cells)),
];
