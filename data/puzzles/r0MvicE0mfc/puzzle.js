// Title: One Kingdom for my Horse
// Author: Nurgles Gift
// Video: https://www.youtube.com/watch?v=r0MvicE0mfc
// Source: https://app.crackingthecryptic.com/sudoku/QnmpJp4R6f

// Normal sudoku rules apply, plus:
// - Digits along a thermometer increase from the bulb (Thermo).
// - A digit in a circle appears at least once in the 4 surrounding cells
//   (Quad, anchored at each circle's top-left cell).
// - Identical digits cannot appear in cells separated by a chess king's
//   move (AntiKing) or a chess knight's move (AntiKnight).
// No givens.

return [
  new Shape('9x9'),

  new AntiKing(),
  new AntiKnight(),

  // Thermometers, bulb cell first. T9 bends diagonally (R9C1-R8C2-R7C1
  // are king-move steps, not orthogonal); Thermo binds by list order, not
  // grid adjacency, so this needs no special handling.
  new Thermo('R2C1', 'R2C2', 'R1C1'),
  new Thermo('R2C8', 'R1C8', 'R1C9', 'R2C9'),
  new Thermo('R3C7', 'R4C7', 'R4C6', 'R3C6'),
  new Thermo('R5C9', 'R4C9'),
  new Thermo('R9C9', 'R8C9'),
  new Thermo('R9C5', 'R8C6', 'R8C5'),
  new Thermo('R7C4', 'R6C4', 'R5C4', 'R5C3'),
  new Thermo('R5C2', 'R6C2', 'R6C3'),
  new Thermo('R9C1', 'R8C2', 'R7C1'),

  // Circle (quadruple) clues. The R1C8 circle is drawn as an outline
  // circle plus two small text fragments ("3 4" then "6") stacked at the
  // same corner -- one clue split across three overlay records because the
  // T2 thermometer's bulb/bend sits on that corner.
  new Quad('R1C1', 1),
  new Quad('R3C3', 1),
  new Quad('R4C8', 1),
  new Quad('R8C8', 1),
  new Quad('R8C1', 2),
  new Quad('R5C2', 2, 7),
  new Quad('R5C3', 3, 9),
  new Quad('R1C8', 3, 4, 6),
];
