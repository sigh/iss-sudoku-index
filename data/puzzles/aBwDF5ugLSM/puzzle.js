// Title: Killer Quiver
// Author: MrMercurial
// Video: https://www.youtube.com/watch?v=aBwDF5ugLSM
// Source: https://app.crackingthecryptic.com/webapp/DghmLf3JQ3

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top-left corner of the cage (killer cage: distinct digits summing to
// the total). Digits in the circled cells represent the sum of all digits
// along the path of the circle's arrow; digits can repeat within a sum
// provided they obey other sudoku rules (Arrow: no distinctness on the arm).

const cage = new Cage(9, 'R1C1', 'R1C2');

// Each Arrow takes the bulb first, then the arm cells in path order. Short
// arrows have a single arm cell (bulb equals that cell); longer arrows bend
// through the arm cells listed below. Cell lists come from interpolating each
// drawn arrow's waypoints to cell centres; every bulb coincides with one of
// the puzzle's 15 drawn circles.
const arrows = [
  new Arrow('R2C4', 'R3C3'),
  new Arrow('R2C7', 'R3C6'),
  new Arrow('R3C4', 'R4C5'),
  new Arrow('R3C5', 'R4C6'),
  new Arrow('R4C7', 'R5C6'),
  new Arrow('R5C7', 'R6C6'),
  new Arrow('R8C4', 'R9C3'),
  new Arrow('R5C3', 'R4C4'),
  new Arrow('R6C3', 'R5C4'),
  new Arrow('R7C5', 'R6C4'),
  new Arrow('R7C6', 'R6C5'),
  new Arrow('R5C2', 'R4C2', 'R3C2', 'R2C2', 'R2C3'),
  new Arrow('R5C9', 'R4C9', 'R3C9', 'R2C9'),
  new Arrow('R5C8', 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6'),
  new Arrow('R5C1', 'R6C1', 'R7C1', 'R8C1'),
];

return [
  new Shape('9x9'),
  cage,
  ...arrows,
];
