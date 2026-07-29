// Title: 4 Irregular Sandwiches
// Author: Tyson Price
// Video: https://www.youtube.com/watch?v=kUgl-ffNAH4
// Source: https://app.crackingthecryptic.com/xkl07t3f1s

// Rows, columns, and the nine drawn irregular regions contain 1-9. Orange lines
// are whispers with difference at least 4. Outside clues are sandwich sums.
const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);

return [
  new Shape('9x9'),
  // The drawn nine-cell irregular-region layout.
  new Jigsaw('9x9', 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'),
  new Jigsaw('9x9', 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C1', 'R8C1', 'R9C1'),
  new Jigsaw('9x9', 'R5C3', 'R6C3', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R9C2', 'R9C3'),
  new Jigsaw('9x9', 'R1C7', 'R1C8', 'R1C9', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9', 'R3C7'),
  new Jigsaw('9x9', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new Jigsaw('9x9', 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C4'),
  new Jigsaw('9x9', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C4', 'R6C5', 'R6C6'),
  new Jigsaw('9x9', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C7', 'R6C8'),
  new Jigsaw('9x9', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R9C4', 'R9C5', 'R9C6'),
  // Orange line paths transcribed from the drawing.
  new Whisper(4, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Whisper(4, 'R2C1', 'R2C2'),
  new Whisper(4, 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new Whisper(4, 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Whisper(4, 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new Whisper(4, 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'),
  new Whisper(4, 'R5C1', 'R5C2', 'R5C3'),
  new Whisper(4, 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Whisper(4, 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'),
  new Whisper(4, 'R6C7', 'R6C8', 'R6C9'),
  new Whisper(4, 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new Whisper(4, 'R8C1', 'R8C2', 'R8C3', 'R8C4'),
  new Whisper(4, 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'),
  new Whisper(4, 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new Whisper(4, 'R9C8', 'R9C9'),
  Sandwich.fromCells(5, graph.row(1), geometry), Sandwich.fromCells(5, graph.row(2), geometry), Sandwich.fromCells(5, graph.row(3), geometry),
  Sandwich.fromCells(5, graph.row(4), geometry), Sandwich.fromCells(5, graph.row(5), geometry), Sandwich.fromCells(30, graph.row(6), geometry),
  Sandwich.fromCells(5, graph.row(7), geometry), Sandwich.fromCells(5, graph.row(8), geometry), Sandwich.fromCells(30, graph.row(9), geometry),
  Sandwich.fromCells(19, graph.column(1), geometry), Sandwich.fromCells(19, graph.column(2), geometry), Sandwich.fromCells(24, graph.column(3), geometry),
  Sandwich.fromCells(8, graph.column(4), geometry), Sandwich.fromCells(8, graph.column(5), geometry), Sandwich.fromCells(25, graph.column(6), geometry),
  Sandwich.fromCells(2, graph.column(7), geometry), Sandwich.fromCells(2, graph.column(8), geometry), Sandwich.fromCells(27, graph.column(9), geometry),
];
