// Title: Four Lines make X and V
// Author: Biddy
// Video: https://www.youtube.com/watch?v=zrOd7y9tUBU
// Source: https://sudokupad.app/nu4b3ogzf2

// Normal 9x9 Sudoku rules apply. The green line is a whisper line, the orange
// line is entropic, the purple line is a renban, and the grey circled-end line
// is a between line. All possible X and V markers are shown.
// Line cells and marker pairs are transcribed from the colored paths and X/V
// overlays drawn on the grid.
return [
  new Shape('9x9'),
  new Whisper(5, 'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Entropic('R5C1', 'R5C2', 'R5C3', 'R4C4', 'R4C5', 'R5C6', 'R6C7', 'R5C8', 'R6C9'),
  new Renban('R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'),
  new Between('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6'),
  new X('R6C1', 'R7C1'),
  new X('R7C7', 'R7C8'),
  new X('R8C4', 'R8C5'),
  new X('R6C2', 'R6C3'),
  new X('R9C1', 'R9C2'),
  new X('R3C2', 'R4C2'),
  new X('R3C3', 'R3C4'),
  new X('R2C6', 'R2C7'),
  new X('R4C8', 'R4C9'),
  new X('R5C5', 'R5C6'),
  new V('R7C1', 'R7C2'),
  new V('R9C4', 'R9C5'),
  new V('R8C7', 'R8C8'),
  new V('R6C7', 'R7C7'),
  new V('R6C5', 'R6C6'),
  new V('R5C8', 'R5C9'),
  new V('R3C8', 'R4C8'),
  new V('R3C6', 'R3C7'),
  new V('R4C2', 'R4C3'),
  new V('R1C3', 'R1C4'),
  new StrictXV(),
];
