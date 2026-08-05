// Title: Di-agony!
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=fOvH1aihuMQ
// Source: https://app.crackingthecryptic.com/sudoku/ftH3b3mHnH

// Normal Sudoku, disjoint groups, anti-knight, and the drawn blue \ diagonal.
// Arrow cell paths are transcribed from the pale-grey circles and shafts.
return [
  new Shape('9x9'),
  new Given('R4C9', 1),
  new Given('R9C2', 5),
  new Given('R9C9', 2),
  new DisjointSets(),
  new AntiKnight(),
  new Diagonal(-1),
  new Arrow('R3C3', 'R4C4', 'R5C5'),
  new Arrow('R6C3', 'R5C2', 'R4C1'),
  new Arrow('R6C3', 'R7C4', 'R8C5', 'R9C6'),
  new Arrow('R1C7', 'R2C8', 'R3C9'),
  new Arrow('R4C7', 'R3C6', 'R2C5', 'R1C4'),
  new Arrow('R4C7', 'R5C8', 'R6C9'),
];
