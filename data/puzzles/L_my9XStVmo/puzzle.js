// Title: Inbetween Taken
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=L_my9XStVmo
// Source: https://sudokupad.app/g78oascrp0

// Normal sudoku rules apply. Digits on a line must lie strictly between the
// values of the circled cells at the two ends of that line. Several lines
// share a circled endpoint, so that cell's value bounds every line touching
// it.

return [
  new Shape('9x9'),

  new Given('R3C4', 8),
  new Given('R3C5', 7),
  new Given('R3C6', 9),
  new Given('R5C5', 1),
  new Given('R7C1', 5),
  new Given('R7C9', 9),

  new Between('R3C1', 'R2C2', 'R1C3'),
  new Between('R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Between('R6C9', 'R7C8', 'R8C7', 'R9C6'),
  new Between('R7C9', 'R8C8', 'R9C7'),
  new Between('R5C1', 'R6C1', 'R7C1'),
  new Between('R7C1', 'R8C2', 'R9C3'),
  new Between('R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'),
  new Between('R3C9', 'R2C8', 'R1C7'),
  new Between('R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'),
  new Between('R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'),
  new Between('R1C5', 'R1C6', 'R1C7'),
  new Between('R3C9', 'R4C9', 'R5C9'),
  new Between('R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'),
  new Between('R9C5', 'R9C4', 'R9C3'),
];
