// Title: Hot Sandwich
// Author: Mountainfarmer
// Video: https://www.youtube.com/watch?v=1V5J7NGQqyE
// Source: https://app.crackingthecryptic.com/sudoku/RfGfTfHHJq

// Rules: normal sudoku (rows/cols/3x3 boxes), plus:
//  - global anti-knight: identical digits cannot be a knight's move apart.
//  - a 9-cell grey region has no repeated digits.
//  - a 7-cell cage has no repeated digits and sums to 42.
//  - a 7-cell thermometer strictly increases away from its bulb.
//  - four sandwich (outside) clues give the sum of the digits strictly
//    between the 1 and the 9 in the named row/column.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Grey region (drawn cell shading): an L/plus shape spanning the centre
// column above the centre row and the centre row left of the centre
// column, sharing R5C5.
const greyRegion = [
  'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R5C4', 'R5C3', 'R5C2', 'R5C1',
];

// Killer cage (drawn cage outline, total 42): an L shape along the right
// column and bottom-middle row of the lower-right box region.
const cageCells = [
  'R6C9', 'R6C8', 'R6C7', 'R6C6', 'R7C6', 'R8C6', 'R9C6',
];

// Thermometer (drawn line, R1C4-R4C4-R4C1). The bulb is the filled grey
// circle drawn with no text at R1C4, so the first cell below is the
// bulb / low end.
const thermo = ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2', 'R4C1'];

return [
  new Given('R1C9', 1),

  new AntiKnight(),

  new AllDifferent(...greyRegion),

  new Cage(42, ...cageCells),

  new Thermo(...thermo),

  // Sandwich clues (drawn outside-grid circles):
  // above C1=8, above C6=12, above C8=7, left of R4=21.
  Sandwich.fromCells(8, graph.column(1), geometry),
  Sandwich.fromCells(12, graph.column(6), geometry),
  Sandwich.fromCells(7, graph.column(8), geometry),
  Sandwich.fromCells(21, graph.row(4), geometry),
];
