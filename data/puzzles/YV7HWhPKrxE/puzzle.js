// Title: Sudoku Found in a Viking Grave
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=YV7HWhPKrxE
// Source: https://sudokupad.app/oltxq1ah39

// Standard Sudoku, connected Yin-Yang shading with no monochrome 2x2,
// consecutive shaded neighbours, shaded-digit outside sums, and odd circles.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');
const masked = graph.makeOverlay('VM');
const cells = graph.cells();
// Zero is available only for the masked sum layer; YY uses 0 shaded, 1 unshaded.
const digits = graph.makeReplicate(new Given('R1C1', 1,2,3,4,5,6,7,8,9));
const masks = cells.map(cell => new Or([
  new And([new Given(shade.at(cell), 0),
           new SameValues(2, cell, masked.at(cell))]),
  new And([new Given(shade.at(cell), 1), new Given(masked.at(cell), 0)]),
]));
const adjacent = cells.flatMap(a => graph.neighbours(a)
  .filter(b => cells.indexOf(a) < cells.indexOf(b))
  .map(b => new Or([
    new Given(shade.at(a), 1),
    new Given(shade.at(b), 1),
    new WhiteDot(a, b),
  ])));
// The printed top clues give column totals, the left clue gives a row total.
const totals = [
  [36, graph.column('R1C2')], [11, graph.column('R1C3')],
  [28, graph.column('R1C4')], [5, graph.column('R1C5')],
  [15, graph.column('R1C9')], [42, graph.row('R4C1')],
].map(([total, line]) => new Sum(total, ...masked.at(line)));
// The four drawn odd circles.
const odd = ['R2C2', 'R5C2', 'R6C3', 'R8C3']
  .map(cell => new Given(cell, 1,3,5,7,9));
return [shape, digits, new YinYang(), masked.toVar('shaded digits'),
        ...masks, ...adjacent, ...totals, ...odd];
