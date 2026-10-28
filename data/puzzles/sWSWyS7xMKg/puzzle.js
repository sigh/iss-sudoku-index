// Title: Triple Hop Killer
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=sWSWyS7xMKg
// Source: https://sudokupad.app/g3nxvntmun

// Normal Sudoku; each cage is distinct, adjacent cages have different colors,
// and cages of the same color have equal sums. No rules omitted.
const shape = new Shape('9x9');
// The 23 dashed cages, in drawing order.
const cages = [
  [
    "R1C2",
    "R1C3",
    "R2C3"
  ],
  [
    "R2C2",
    "R3C2",
    "R3C3"
  ],
  [
    "R1C4",
    "R1C5",
    "R2C4"
  ],
  [
    "R3C4",
    "R3C5"
  ],
  [
    "R1C6",
    "R2C6",
    "R3C6"
  ],
  [
    "R1C7",
    "R1C8",
    "R2C7"
  ],
  [
    "R2C8",
    "R2C9",
    "R3C8",
    "R3C9"
  ],
  [
    "R3C7",
    "R4C7"
  ],
  [
    "R4C8",
    "R4C9"
  ],
  [
    "R5C7",
    "R6C7",
    "R6C8",
    "R6C9",
    "R7C8"
  ],
  [
    "R4C6",
    "R5C5",
    "R5C6"
  ],
  [
    "R6C6"
  ],
  [
    "R4C4",
    "R4C5",
    "R5C4"
  ],
  [
    "R6C4",
    "R6C5"
  ],
  [
    "R4C2",
    "R4C3"
  ],
  [
    "R4C1",
    "R5C1",
    "R6C1"
  ],
  [
    "R5C2",
    "R6C2",
    "R7C2"
  ],
  [
    "R5C3",
    "R6C3"
  ],
  [
    "R7C1",
    "R7C3",
    "R8C1",
    "R8C2",
    "R8C3"
  ],
  [
    "R8C4",
    "R8C5"
  ],
  [
    "R9C3",
    "R9C4"
  ],
  [
    "R8C7",
    "R9C5",
    "R9C6",
    "R9C7"
  ],
  [
    "R7C6",
    "R7C7"
  ]
];
const colorVars = new Var('C', 'Cage colors', cages.length);
const colors = colorVars.cells();
const graph = cellGraph('9x9');
const touching = (a, b) => a.some(cell => graph.neighbours(cell).some(n => b.includes(n)));
const pairs = cages.flatMap((a, i) => cages.slice(i + 1).map((b, offset) => [i, i + offset + 1]));
const adjacent = pairs.filter(([i, j]) => touching(cages[i], cages[j]));
// Cages 3, 4 and 5 pairwise share edges, so assigning them labels 1,2,3
// fixes only the arbitrary names of the three colors.
const colorNames = [new Given(colors[2], 1), new Given(colors[3], 2), new Given(colors[4], 3)];
return [
  shape,
  colorVars,
  ...colors.map(cell => new Given(cell, 1, 2, 3)),
  ...colorNames,
  ...cages.map(cells => new AllDifferent(...cells)),
  ...adjacent.map(([i, j]) => new AllDifferent(colors[i], colors[j])),
  ...pairs.map(([i, j]) => new Or([
    new AllDifferent(colors[i], colors[j]),
    new EqualSum(cages[i], cages[j])
  ])),
];
