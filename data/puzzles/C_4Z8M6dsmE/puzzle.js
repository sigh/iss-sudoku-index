// Title: Unknown
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=C_4Z8M6dsmE
// Source: https://cracking-the-cryptic.web.app/sudoku/n9mq3gTF4J

// Standard Sudoku (rows, columns, boxes each contain 1-9 once; the payload's
// `regions` array is the ordinary nine 3x3 blocks, so no region override is
// needed) plus anti-knight: cells a chess knight's move apart cannot repeat a
// digit.
return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's `cells` array.
  new Given('R1C6', 5),
  new Given('R2C1', 1),
  new Given('R2C8', 7),
  new Given('R3C9', 2),
  new Given('R4C1', 6),
  new Given('R4C3', 4),
  new Given('R4C6', 7),
  new Given('R5C4', 8),
  new Given('R5C8', 6),
  new Given('R7C4', 2),
  new Given('R8C4', 3),
  new Given('R8C5', 9),

  new AntiKnight(),
];
