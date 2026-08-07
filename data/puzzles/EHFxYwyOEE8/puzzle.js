// Title: Whispering Cube
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=EHFxYwyOEE8
// Source: https://sudokupad.app/3eipqnv8xm

// Normal sudoku rules apply. Neighbouring digits on the orange line must
// differ in value by at least 4.
//
// The orange line is drawn as three polyline strokes (a closed loop plus two
// open spokes) that share endpoint cells, tracing the edges of a Necker cube
// projected onto the grid. All strokes carry the same colour and rule, so
// each is encoded as its own Whisper(4, ...) group; the shared endpoint cells
// enforce the whisper constraint on every edge meeting there, matching the
// connected drawn network.

const whispers = [
  // Loop: R6C9-R7C8-R8C7-R9C6-R8C6-R7C6-R6C6-R5C6-R4C6-R3C7-R2C8-R1C9-R2C9-
  // R3C9-R4C9-R5C9, closed back to R6C9 (16 cells / 16 edges).
  new Whisper(
    4,
    'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C6', 'R7C6', 'R6C6', 'R5C6',
    'R4C6', 'R3C7', 'R2C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'
  ),
  // Spoke A: R9C6-R9C5-R9C4-R9C3-R9C2-R9C1-R8C1-R7C1-R6C1-R5C1-R4C1-R4C2-
  // R4C3-R4C4-R4C5-R4C6 (16 cells, open).
  new Whisper(
    4,
    'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1',
    'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6'
  ),
  // Spoke B: R1C9-R1C8-R1C7-R1C6-R1C5-R1C4-R2C3-R3C2-R4C1 (9 cells, open).
  new Whisper(
    4,
    'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C1'
  ),
];

return [
  new Shape('9x9'),
  new Given('R1C4', 3),
  new Given('R1C9', 2),
  new Given('R6C9', 5),
  new Given('R9C1', 1),
  new Given('R9C6', 2),
  ...whispers,
];
