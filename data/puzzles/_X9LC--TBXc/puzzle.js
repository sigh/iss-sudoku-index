// Title: Areal Sudoku
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=_X9LC--TBXc
// Source: https://app.crackingthecryptic.com/sudoku/bFLQ8GG8r9

// Normal sudoku rules (rows, columns, standard 3x3 boxes -- confirmed from
// the payload's own `regions` array). Both main diagonals contain all
// digits 1-9. In cages, digits sum to the small clue; each cage's three
// cells already share a row or column, so Cage's all-different is not a
// narrowing on top of that. Along thermometers, digits increase from the
// bulb. Along arrows, digits sum to the circled cell's own digit, and may
// repeat (default Arrow semantics: no extra all-different is applied to
// arrow cells beyond row/col/box).
return [
  new Shape('9x9'),

  // Diagonals: '\' is R1C1..R9C9, '/' is R1C9..R9C1 -- both pass through
  // the shared centre cell R5C5.
  new Diagonal(-1),
  new Diagonal(1),

  // Cages (provenance: payload `cages` array). Each cage's 3 cells share a
  // row or column already, so plain Cage (sum + all-different) is used;
  // the all-different half is inert there, matching Sum + implicit
  // row/column all-different.
  new Cage(20, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(11, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(24, 'R7C1', 'R8C1', 'R9C1'),
  new Cage(13, 'R9C7', 'R9C8', 'R9C9'),

  // Thermometers (provenance: payload `lines` #3-#6, grey th=10 strokes),
  // all sharing the bulb at the centre cell R5C5 and running out to the
  // four diagonally-adjacent cells.
  new Thermo('R5C5', 'R4C4'),
  new Thermo('R5C5', 'R4C6'),
  new Thermo('R5C5', 'R6C4'),
  new Thermo('R5C5', 'R6C6'),

  // Arrows (provenance: payload `arrows` array). Arrow's first cell is the
  // circle (sum cell); the rest are the arrow shaft. Four short arrows
  // share the circle at R5C5; four longer arrows have circles at the four
  // edge-midpoint cells.
  new Arrow('R5C5', 'R4C5', 'R3C5'),
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R5C5', 'R6C5', 'R7C5'),
  new Arrow('R5C5', 'R5C4', 'R5C3'),
  new Arrow('R1C5', 'R1C6', 'R2C7', 'R2C8'),
  new Arrow('R5C1', 'R4C1', 'R3C2', 'R2C2'),
  new Arrow('R9C5', 'R9C4', 'R8C3', 'R8C2'),
  new Arrow('R5C9', 'R6C9', 'R7C8', 'R8C8'),
];
