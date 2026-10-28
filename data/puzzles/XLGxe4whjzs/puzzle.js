// Title: Double Equality Yin Yang
// Author: yttrio
// Video: https://www.youtube.com/watch?v=XLGxe4whjzs
// Source: https://sudokupad.app/peoe36s43j

// Normal Sudoku, connected Yin Yang shades with no monochrome 2x2,
// and distinct cage digits. Each cage contains both shades and its doubled
// shaded total equals its ordinary unshaded total.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const masked = graph.makeOverlay('VM');
// The zero in the widened range is the masked-out digit; board digits stay 1-9.
const digits = graph.makeReplicate(new Given('R1C1', 1,2,3,4,5,6,7,8,9));
const masks = graph.cells().map(cell => new Or([
  new And([new Given(shade.at(cell), 0), new SameValues(2, cell, masked.at(cell))]),
  new And([new Given(shade.at(cell), 1), new Given(masked.at(cell), 0)]),
]));
// Dashed cage outlines.
const cages = [
  [
    "R1C1",
    "R1C2",
    "R1C3",
    "R1C4",
    "R1C5",
    "R1C6",
    "R1C7",
    "R1C8"
  ],
  [
    "R2C5",
    "R2C6"
  ],
  [
    "R3C5",
    "R3C6"
  ],
  [
    "R3C1",
    "R3C2",
    "R3C3",
    "R3C4",
    "R4C1",
    "R5C1",
    "R6C1"
  ],
  [
    "R4C3",
    "R4C4"
  ],
  [
    "R5C2",
    "R5C3",
    "R5C4",
    "R5C5"
  ],
  [
    "R6C2",
    "R6C3",
    "R7C1",
    "R7C2",
    "R7C3",
    "R8C1"
  ],
  [
    "R9C1",
    "R9C2",
    "R9C3",
    "R9C4",
    "R9C5",
    "R9C6",
    "R9C7",
    "R9C8"
  ],
  [
    "R7C4",
    "R8C3",
    "R8C4"
  ],
  [
    "R7C5",
    "R7C6",
    "R7C7"
  ],
  [
    "R6C8",
    "R7C8",
    "R8C5",
    "R8C6",
    "R8C7",
    "R8C8"
  ],
  [
    "R3C8",
    "R3C9",
    "R4C9",
    "R5C9",
    "R6C9",
    "R7C9"
  ],
  [
    "R6C4",
    "R6C5",
    "R6C6"
  ]
];
// With M the shaded digit sum and T the total digit sum, 2M = T-M.
const cageRules = cages.flatMap(cells => [
  new AllDifferent(...cells),
  new ContainAtLeast('0_1', ...shade.at(cells)),
  new Sum(0, ...masked.at(cells).map(cell => [cell, 3]), ...cells.map(cell => [cell, -1])),
]);
return [shape, new YinYang(), masked.toVar('shaded digit or zero'), digits, ...masks, ...cageRules];
