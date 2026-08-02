// Title: Pixel Art
// Author: Twan2797
// Video: https://www.youtube.com/watch?v=d_4FHAJGTPg
// Source: https://app.crackingthecryptic.com/sudoku/J6JQrMjr6G

// Standard 9x9 Sudoku. Purple paths are renban lines; blue paths are both diagonals.
// The X and V overlays are the four drawn adjacent sum markers.
return [
  new Shape('9x9'),
  new Renban('R5C4', 'R5C3', 'R4C3', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7'),
  new Renban('R5C6', 'R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R6C3'),
  new Renban('R1C1', 'R1C2', 'R2C2', 'R2C1'),
  new Renban('R4C2', 'R4C1', 'R5C1'),
  new Renban('R5C2', 'R6C2', 'R6C1'),
  new Renban('R8C1', 'R8C2', 'R9C2', 'R9C1'),
  new Renban('R8C9', 'R8C8', 'R9C8', 'R9C9'),
  new Renban('R1C9', 'R1C8', 'R2C8', 'R2C9'),
  new Renban('R4C8', 'R4C9'),
  new Renban('R5C8', 'R5C9', 'R6C9'),
  new Diagonal(1),
  new Diagonal(-1),
  new X('R4C4', 'R5C4'),
  new X('R7C4', 'R8C4'),
  new V('R8C3', 'R9C3'),
  new X('R9C2', 'R9C3'),
];
