// Title: Dancing in a ring
// Author: Fool on Hill
// Video: https://www.youtube.com/watch?v=I-2gLlYheHs
// Source: https://sudokupad.app/b37xfe4xjf

// Normal Sudoku rules apply. Standard 9x9 grid with default row/column/box
// groups; no givens.
return [
  new Shape('9x9'),
  // "The central cross is a single line" of pink Renban: a vertical run
  // R3C5-R7C5 crossing a horizontal run R5C3-R5C7 at R5C5, drawn as one
  // continuous line. Renban is a set constraint (consecutive, no repeats)
  // so cell order does not matter.
  new Renban(
    'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5',
    'R5C3', 'R5C4', 'R5C6', 'R5C7'
  ),
  // Pink Renban lines drawn as small closed 4-cell loops (one loop = one line).
  // Renban applies to the whole cell set regardless of order, so the loop
  // shape doesn't need a special encoding here.
  new Renban('R1C1', 'R1C2', 'R2C2', 'R2C1'), // top-left
  new Renban('R1C8', 'R1C9', 'R2C9', 'R2C8'), // top-right
  new Renban('R8C8', 'R8C9', 'R9C9', 'R9C8'), // bottom-right
  // (No matching loop is drawn in the bottom-left corner.)
  // Green German Whisper lines: adjacent digits on the line differ by >= 5.
  // Each is drawn as a closed 4-cell loop. Whisper only constrains consecutive
  // pairs in the given cell list, so each loop repeats its first cell at the
  // end to also cover the wrap-around edge.
  new Whisper('R6C3', 'R6C4', 'R7C4', 'R7C3', 'R6C3'),
  new Whisper('R6C6', 'R7C6', 'R7C7', 'R6C7', 'R6C6'),
  new Whisper('R3C6', 'R3C7', 'R4C7', 'R4C6', 'R3C6'),
  new Whisper('R3C3', 'R3C4', 'R4C4', 'R4C3', 'R3C3'),
  // Black dots: one digit is double the other.
  new BlackDot('R8C2', 'R9C2'),
  new BlackDot('R8C2', 'R8C3'),
  new BlackDot('R2C8', 'R3C8'),
  new BlackDot('R1C3', 'R1C4'),
  // White dots: digits are consecutive.
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R5C2', 'R5C3'),
  new WhiteDot('R2C5', 'R3C5'),
  new WhiteDot('R9C5', 'R9C6'),
  // "Not all dots are given (no negative constraint)": deliberately no
  // StrictKropki / other negative constraint is added for unmarked cell pairs.
];
