// Title: Squished Knights
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=QUI70NKNOH0
// Source: https://sudokupad.app/ahxj704kln

// Digits 1-9 do not repeat in rows, columns, or the nine overlapping 3x3
// regions defined by the red dashed boundaries. Knight moves differ; cages
// are distinct and sum where labelled.
const graph = cellGraph('7x7');
const cells = graph.cells();
const origins = ['R1C1','R1C3','R1C5','R3C1','R3C3','R3C5','R5C1','R5C3','R5C5'];
return [
  new Shape('7x7', '1-9'), new NoBoxes(), new AntiKnight(),
  ...origins.map(cell => new AllDifferent(...graph.block(cell, 3, 3))),
  new Cage(13, 'R1C1', 'R1C2'),
  new Cage(16, 'R5C4', 'R6C2', 'R6C3', 'R6C4', 'R7C2'),
  new Cage(33, 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6'),
  new Cage(14, 'R6C7', 'R7C6', 'R7C7'),
  new AllDifferent('R1C1', 'R7C7'),
];
