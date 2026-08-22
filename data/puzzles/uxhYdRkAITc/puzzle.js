// Title: Boomerang 2
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=uxhYdRkAITc
// Source: https://app.crackingthecryptic.com/sudoku/nB66jBP6JG

// Normal sudoku on standard 3x3 boxes. Three arrows: each Arrow's first
// cell is the circle (drawn as a round marker at the arrow's start), the
// remaining three cells are the tail whose digits sum to it. Global
// anti-knight: cells a knight's move apart cannot repeat a digit.

return [
  new Shape('9x9'),

  new Given('R8C2', 3),
  new Given('R8C3', 5),
  new Given('R8C7', 4),

  new Arrow('R4C4', 'R5C3', 'R5C2', 'R6C1'),
  new Arrow('R4C6', 'R3C5', 'R2C5', 'R1C4'),
  new Arrow('R6C6', 'R7C5', 'R8C5', 'R9C4'),

  new AntiKnight(),
];
