// Title: Snapshot
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=NNGRjoEPjY0
// Source: https://tinyurl.com/33tupken

// Rules: normal sudoku; two 9-cell cages forbid repeats but carry no total,
// so each is AllDifferent over its cells; green lines are German whisper
// lines (adjacent cells differ by >= 5, Whisper's default); and each white
// circle's printed digits must each appear in at least one of its
// surrounding 2x2 cells, which is exactly Quad's semantics.

const cages = [
  new AllDifferent('R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6'),
  new AllDifferent('R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8'),
];

const whispers = [
  new Whisper('R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'),
  new Whisper('R4C2', 'R5C2', 'R6C2', 'R7C2'),
  new Whisper('R3C8', 'R4C8', 'R5C8', 'R6C8'),
];

const quads = [
  new Quad('R2C2', 3, 4, 5, 6),
  new Quad('R7C7', 3, 4, 5, 6),
  new Quad('R6C7', 2, 4, 5),
  new Quad('R4C2', 1, 2, 5),
  new Quad('R7C4', 1, 2, 8),
  new Quad('R2C4', 2, 4),
  new Quad('R3C6', 2),
];

return [
  new Shape('9x9'),
  ...cages,
  ...whispers,
  ...quads,
];
