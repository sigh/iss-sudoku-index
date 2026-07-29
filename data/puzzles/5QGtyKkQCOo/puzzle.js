// Title: Parroty Lines
// Author: Michael Lefkowitz and Marty Sears
// Video: https://www.youtube.com/watch?v=5QGtyKkQCOo
// Source: https://sudokupad.app/azp64ejj1v?setting-nogrid=1

// Normal sudoku rules apply.
// Each white path is one or more copies of a non-repeating word. The local
// source does not preserve readable parrot digits, so this encodes every word
// length that divides the drawn path length rather than selecting its missing
// required length.

// White Parroty Line paths, transcribed from the thick white drawn strokes.
const lines = [
  ['R4C9', 'R3C9', 'R2C9', 'R2C8', 'R2C7', 'R2C6', 'R1C6', 'R1C5'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R1C3', 'R1C4', 'R2C4', 'R3C4', 'R3C3', 'R2C3'],
  ['R8C9', 'R8C8', 'R8C7', 'R7C6', 'R7C5', 'R7C4', 'R6C4', 'R5C4', 'R4C5'],
  ['R5C6', 'R6C7', 'R7C8'],
  ['R9C3', 'R9C4', 'R8C4', 'R7C3', 'R6C2', 'R6C1'],
  ['R8C5', 'R9C5', 'R9C6', 'R9C7'],
];

function repeatedWord(cells) {
  const lengths = Array.from({ length: cells.length }, (_, i) => i + 1)
    .filter(length => cells.length % length === 0);
  return new Or(lengths.map(length => new And([
    new AllDifferent(...cells.slice(0, length)),
    ...cells.slice(length).map((cell, index) =>
      new SameValues(2, cells[index % length], cell)),
  ])));
}

return [
  new Shape('9x9'),
  ...lines.map(repeatedWord),
];
