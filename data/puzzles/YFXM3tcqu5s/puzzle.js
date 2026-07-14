// Title: Counting Cages
// Author: Plasmath
// Video: https://www.youtube.com/watch?v=YFXM3tcqu5s
// Source: https://sudokupad.app/ijlrol8kkd

// Normal sudoku rules (rows, columns, boxes all-different) come from the
// default Shape('9x9'). No given digits.
//
// "Digits do not repeat within any cage": each drawn cage below is a
// Cage(0, ...cells) -- sum 0 means "any sum", i.e. all-different only,
// matching the source (no cage carries a printed total).
//
// Omitted: "Each cage has a circled digit, indicating how many cages have
// the same sum as that cage." The circled digit is a real given in the
// rendered puzzle, but the decoded source payload carries no value for it --
// the circle markers are plain background shapes (position/size/color only,
// no text/value field).

return [
  new Shape('9x9'),

  new Cage(0, 'R3C3'),
  new Cage(0, 'R3C7'),
  new Cage(0, 'R7C7'),
  new Cage(0, 'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9'),
  new Cage(0, 'R3C4', 'R3C5', 'R3C6', 'R4C6'),
  new Cage(0, 'R5C2'),
  new Cage(0, 'R8C5'),
  new Cage(0, 'R5C6', 'R6C6'),
  new Cage(0, 'R1C6', 'R1C7'),
  new Cage(0, 'R1C1', 'R2C1'),
  new Cage(0, 'R2C2', 'R3C2'),
  new Cage(0, 'R8C1', 'R9C1'),
  new Cage(0, 'R4C7', 'R4C8'),
  new Cage(0, 'R5C4', 'R5C5'),
  new Cage(0, 'R9C4', 'R9C5'),
  new Cage(0, 'R9C2', 'R9C3'),
  new Cage(0, 'R4C2', 'R4C3'),
  new Cage(0, 'R5C7', 'R6C7'),
  new Cage(0, 'R1C5', 'R2C5'),
  new Cage(0, 'R6C4', 'R7C4'),
  new Cage(0, 'R8C8', 'R8C9'),
  new Cage(0, 'R5C9', 'R6C9', 'R7C9'),
  new Cage(0, 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
  new Cage(0, 'R5C3', 'R6C3', 'R7C3'),
];
