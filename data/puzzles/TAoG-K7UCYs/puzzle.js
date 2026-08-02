// Title: Guess The Setter
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=TAoG-K7UCYs
// Source: https://sudokupad.app/qtrL4MFLFn

// Encode 1-8 once per row, column, and marked region; purple renbans; and the
// stated complete absence of X/V pairs. Region cell lists are transcribed from
// the drawn jigsaw-region data.
return [
  new Shape('8x8'),
  new NoBoxes(),
  new Given('R6C7', 5),
  new Jigsaw('8x8', 'R1C1', 'R2C1', 'R3C1', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2'),
  new Jigsaw('8x8', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R7C2', 'R7C3', 'R6C3'),
  new Jigsaw('8x8', 'R8C2', 'R8C3', 'R8C4', 'R7C4', 'R5C4', 'R6C4', 'R8C5', 'R8C6'),
  new Jigsaw('8x8', 'R6C5', 'R7C5', 'R6C6', 'R7C6', 'R6C7', 'R7C7', 'R8C7', 'R8C8'),
  new Jigsaw('8x8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R5C6', 'R5C7', 'R4C7', 'R3C7'),
  new Jigsaw('8x8', 'R5C3', 'R4C3', 'R4C4', 'R4C5', 'R5C5', 'R4C6', 'R3C6', 'R3C5'),
  new Jigsaw('8x8', 'R3C3', 'R3C4', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8'),
  new Jigsaw('8x8', 'R1C2', 'R1C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Renban('R1C2', 'R1C1', 'R2C1', 'R2C2'),
  new Renban('R3C4', 'R4C3', 'R5C4', 'R4C5'),
  new StrictXV(),
];
