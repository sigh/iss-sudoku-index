// Title: Butterfly
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=w-gtEvQXLuY
// Source: https://app.crackingthecryptic.com/sudoku/9rb4h4qbQG

// Standard 9x9 Sudoku. Each grey arrow's arm digits sum to its circular bulb.
return [
  new Shape('9x9'),
  new Arrow('R6C4', 'R5C4', 'R5C3'),
  new Arrow('R6C4', 'R6C5', 'R7C5'),
  new Arrow('R7C2', 'R6C2', 'R5C2'),
  new Arrow('R8C3', 'R8C4', 'R8C5'),
  new Arrow('R4C6', 'R4C7', 'R3C8'),
  new Arrow('R4C6', 'R3C6', 'R2C7'),
  new Arrow('R8C8', 'R7C9', 'R6C9', 'R5C9'),
  new Arrow('R8C8', 'R8C7', 'R8C6'),
  new Arrow('R4C4', 'R4C5', 'R3C5', 'R2C5'),
  new Arrow('R6C6', 'R5C6', 'R5C7', 'R5C8'),
  new Arrow('R6C6', 'R7C7', 'R6C8'),
  new Arrow('R2C2', 'R1C3', 'R1C4', 'R1C5'),
  new Arrow('R2C2', 'R3C2', 'R4C2'),
  new Arrow('R2C2', 'R3C3', 'R2C4'),
];
