// Title: Feb. 16, 2022: B1G3 Antiknight
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lDlym71OqIg
// Source: https://tinyurl.com/2p86zjw9

// 6x6 grid, digits 1-6. Default box tiling for a 6x6 Shape is 2 rows x 3
// columns (six boxes), matching "1-6 appears in each row, column and
// region." Cells a chess knight's move apart cannot repeat (AntiKnight),
// matching the rule text exactly -- see AntiKnight.DESCRIPTION.
return [
  new Shape('6x6'),
  new AntiKnight(),

  new Given('R1C2', 6),
  new Given('R1C5', 3),
  new Given('R2C3', 1),
  new Given('R3C3', 5),
  new Given('R3C4', 2),
  new Given('R6C1', 1),
  new Given('R6C6', 4),
];
