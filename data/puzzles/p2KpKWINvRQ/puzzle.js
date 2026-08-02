// Title: Chasing Steeples
// Author: Vitray
// Video: https://www.youtube.com/watch?v=p2KpKWINvRQ
// Source: https://sudokupad.app/rv19zovgvb

// Standard 9x9 Sudoku; cages are distinct and sum to their displayed totals;
// cells a knight's move apart differ; the arrow arms sum to its circular bulb.
// Cage coordinates are transcribed from the drawn cage outlines and totals.
const cages = [
  [3, 'R1C3', 'R2C3'], [7, 'R1C5', 'R2C5'], [6, 'R1C7', 'R2C7'],
  [12, 'R3C1', 'R3C2'], [17, 'R5C1', 'R5C2'], [13, 'R7C1', 'R7C2'],
  [14, 'R8C3', 'R9C3'], [17, 'R8C7', 'R9C7'], [8, 'R7C8', 'R7C9'],
  [7, 'R3C8', 'R3C9'], [3, 'R5C8', 'R5C9'], [13, 'R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new AntiKnight(),
  new Arrow('R2C8', 'R2C7', 'R2C6', 'R2C5'),
];
