// Title: The Most Beautiful Mathematical Equation
// Author: Tobias Brixner
// Video: https://www.youtube.com/watch?v=oo2lmGOUOPQ
// Source: https://sudokupad.app/6bqix93gqg

// Normal sudoku rules (default Shape('9x9') box regions) plus:
// - Green German whispers lines: adjacent cells differ by >= 5.
// - Red parity lines: the two cells hold one odd and one even digit.
// - Pink/orchid Renban line: a non-repeating run of consecutive digits, any
//   order.
// - Grey circle: that cell holds an odd digit.
//
// The drawn color counts (8 green / 2 red / 1 pink / 1 circle) match the
// rule text's cardinality ("a green ... line", "each red ... line", "the
// pink Renban line", "the cell with a grey circle") one-for-one, so the
// color -> rule assignment is unambiguous. Some green strokes share an
// endpoint cell with another green stroke (near R1C5/R1C6, and at R8C2);
// they are kept as the separately drawn payload entries they are, which is
// equivalent to merging them since no edge falls between two strokes.

const germanWhispers = [
  ['R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R6C3', 'R6C4'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R1C6', 'R2C6', 'R3C6'],
  ['R2C8', 'R3C8'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R8C3', 'R8C2', 'R8C1'],
  // Closed loop: repeat the first cell at the end to cover the wrap-around edge.
  ['R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R6C8'],
];

const renbanLine = ['R7C4', 'R6C5', 'R7C5', 'R8C5', 'R9C5'];

const parityLines = [
  ['R7C6', 'R7C7'],
  ['R8C6', 'R8C7'],
];

const greyCircleCell = 'R1C8';

return [
  new Shape('9x9'),

  new Given('R2C5', 3),
  new Given('R6C8', 6),
  new Given('R8C5', 1),

  // Parity clue: no dedicated Odd/Even class, so encode as a candidate
  // restriction on the cell.
  new Given(greyCircleCell, 1, 3, 5, 7, 9),

  ...germanWhispers.map(cells => new Whisper(5, ...cells)),

  new Renban(...renbanLine),

  // Modular(2) forces each adjacent pair to differ mod 2, i.e. one odd, one
  // even -- exactly the "parity line" rule for a 2-cell segment.
  ...parityLines.map(cells => new Modular(2, ...cells)),
];
