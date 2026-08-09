// Title: The Ls
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=Vzmxj7OGKoU
// Source: https://app.crackingthecryptic.com/sudoku/FF8fN88npr

// Normal sudoku rules (default row/column/box). Cells a knight's move apart
// cannot repeat a digit (AntiKnight, global). Each arrow's arm cells sum to
// its bulb cell (Arrow). Each purple line holds a set of non-repeating
// consecutive digits in any order (Renban).
//
// Arrow bulb cells were confirmed against the payload's circle underlays,
// which sit on exactly the same four cells as the four arrow tails.

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Arrow(bulb, ...arms): bulb first, then arm cells in path order.
  new Arrow('R3C1', 'R2C1', 'R1C2'),
  new Arrow('R4C4', 'R5C5', 'R4C6'),
  new Arrow('R6C7', 'R7C6', 'R8C7', 'R8C8', 'R7C8'),
  new Arrow('R7C3', 'R8C2', 'R9C2'),

  // Renban(...cells): purple lines, 4 consecutive non-repeating digits.
  new Renban('R1C5', 'R2C6', 'R3C5', 'R4C4'),
  new Renban('R1C6', 'R2C7', 'R3C8', 'R2C9'),
  new Renban('R3C9', 'R4C8', 'R5C7', 'R6C8'),
  new Renban('R6C6', 'R7C5', 'R8C4', 'R9C5'),
  new Renban('R6C2', 'R5C1', 'R4C2', 'R3C3'),
  new Renban('R5C4', 'R4C5', 'R5C6', 'R6C7'),
];
