// Title: Mountain and Valley
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=ZMP7PqyIckM
// Source: https://app.crackingthecryptic.com/q6kayoiu83

// Normal Sudoku, both green main diagonals, and the red/blue-cell rule. Each
// coloured cell is either lower than every orthogonal neighbour or higher than
// every orthogonal neighbour; the coloured rows are drawn as red rows 1-3 and
// blue rows 7-9.
const graph = cellGraph('9x9');
const colouredCells = graph.cells().filter((_, index) => index < 27 || index >= 54);

function mountainOrValley(cell) {
  const neighbours = graph.neighbours(cell);
  return new Or([
    new And([new GreaterThan(...neighbours, cell)]),
    new And([new GreaterThan(cell, ...neighbours)]),
  ]);
}

return [
  new Shape('9x9'),
  new Given('R1C1', 4), new Given('R1C2', 1),
  new Given('R2C6', 6), new Given('R2C9', 2), new Given('R3C1', 6),
  new Given('R8C3', 8), new Given('R8C4', 2), new Given('R8C5', 5),
  new Given('R9C8', 7),
  new Diagonal(1), new Diagonal(-1),
  ...colouredCells.map(mountainOrValley),
];
