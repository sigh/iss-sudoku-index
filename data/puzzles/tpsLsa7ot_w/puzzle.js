// Title: Tenacious Whispers
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=tpsLsa7ot_w
// Source: https://sudokupad.app/ja8iov3ag3

// Normal sudoku rules (default 9x9 with default 3x3 boxes; the payload's
// `regions` array is the same standard box partition, so no explicit
// Region/NoBoxes override is needed).
// German Whispers: adjacent digits along a green line differ by >= 5.
// Ten lines: a grey line splits into contiguous, non-overlapping segments
// that each sum to exactly 10; digits may repeat within a segment.

// Green Whisper lines, each a 7-cell path confined to one box.
const whispers = [
  new Whisper(5, 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R8C8', 'R8C7'),
  new Whisper(5, 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R2C2', 'R2C3'),
  new Whisper(5, 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R2C8'),
  new Whisper(5, 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R8C2'),
];

// Grey ten lines. Each bends diagonally through a cell corner between its
// orthogonal legs (as drawn); SumLine only needs the ordered cell sequence,
// not grid adjacency, so the diagonal jump is not itself a modelling concern.
const tenLines = [
  new SumLine(10, 'R7C7', 'R7C6', 'R7C5', 'R6C4', 'R5C3', 'R4C3', 'R3C3'),
  new SumLine(10, 'R5C5', 'R4C5', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R5C7', 'R5C8', 'R5C9'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...tenLines,
];
