// Title: Colour Wheel
// Author: The Book Wyrm
// Video: https://www.youtube.com/watch?v=7BiyQxa-BiQ
// Source: https://sudokupad.app/bBR8Rj8Ng7

// Normal Sudoku rules apply. The drawn cages have no repeated digits.
// The colour-by-cage-total rules and the unknown rotational partner-digit rule
// are omitted; both require a global relation among unknown cage totals or digit pairs.
// Cage cells are transcribed from the drawn cage boundaries in the source payload.
const cages = [
  ['R5C5'],
  ['R4C5', 'R4C6'], ['R6C4', 'R6C5'],
  ['R4C4', 'R5C4'], ['R5C6', 'R6C6'],
  ['R3C6', 'R3C7', 'R4C7'], ['R3C4', 'R3C5'],
  ['R6C3', 'R7C3', 'R7C4'], ['R7C5', 'R7C6'],
  ['R8C4', 'R8C5', 'R8C6', 'R9C4'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'], ['R1C7', 'R1C8', 'R2C7'],
  ['R8C3', 'R9C2', 'R9C3'], ['R1C1', 'R2C1', 'R2C2'],
  ['R3C2', 'R3C3', 'R4C3'], ['R5C2', 'R5C3', 'R6C2'],
  ['R4C8', 'R5C7', 'R5C8'], ['R6C7', 'R7C7', 'R7C8'],
  ['R8C8', 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),
  new Given('R3C1', 9),
  new Given('R7C9', 7),
  ...cages.filter(cage => cage.length > 1).map(cage => new AllDifferent(...cage)),
];
