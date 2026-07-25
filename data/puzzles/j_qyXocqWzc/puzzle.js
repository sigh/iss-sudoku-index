// Title: Portal Dolmen 2
// Author: juddimal
// Video: https://www.youtube.com/watch?v=j_qyXocqWzc
// Source: https://sudokupad.app/xpcj30ea23

// Normal sudoku, no givens, standard box regions. Anti-knight: cells a
// knight's move apart cannot repeat a digit. German whisper: adjacent
// digits along each line differ by at least 5. Equal split lines: a dot on
// a line splits it into two segments with equal sums; only one of the four
// whisper lines carries a dot.

const whispers = [
  ['R5C4', 'R5C5', 'R5C6'],
  ['R3C3', 'R2C2', 'R1C3'],
  ['R9C8', 'R8C9', 'R8C8'],
  // Closed loop (cuts two corners diagonally); repeats its first cell to
  // bind the wrap-around edge.
  ['R3C4', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7',
   'R5C7', 'R4C7', 'R3C7', 'R3C6', 'R3C5', 'R3C4'],
];

return [
  new AntiKnight(),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  // The dot sits at the midpoint of the R3C3-R2C2 leg of the second whisper
  // line, splitting it into segment {R3C3} and segment {R2C2, R1C3}.
  new EqualSum(['R3C3'], ['R2C2', 'R1C3']),
];
