// Title: Deep Space 9x9
// Author: Haley Prochilo
// Video: https://www.youtube.com/watch?v=2eEArPok23Q
// Source: https://app.crackingthecryptic.com/sudoku/6jmMrgJHLT

// Normal Sudoku; yellow circles are odd, each drawn purple or grey line is a
// renban, and one 9-cell orthogonal non-self-crossing thermo occupies one
// whole unknown 3x3 box. Every such in-box Hamiltonian route is enumerated,
// with its direction representing the unknown bulb end.

const oddCells = ['R1C2', 'R2C8', 'R4C5', 'R6C1', 'R7C4', 'R7C6', 'R8C6'];
const graph = cellGraph('9x9');

// Drawn purple/grey line paths, transcribed from the payload waypoints.
const renbanLines = [
  ['R3C5', 'R4C4', 'R5C4', 'R6C4', 'R7C5'],
  ['R3C7', 'R4C8', 'R5C8', 'R6C8', 'R7C7'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'],
];

function boxHamiltonianThermos(cells) {
  const cellIndex = new Map(cells.map((cell, index) => [cell, index]));
  const neighbours = index => graph.neighbours(cells[index])
    .filter(cell => cellIndex.has(cell))
    .map(cell => cellIndex.get(cell));
  const paths = [];
  function visit(path, used) {
    const last = path[path.length - 1];
    if (path.length === 9) {
      paths.push(path.map(index => cells[index]));
      return;
    }
    for (const next of neighbours(last)) {
      if (!used.has(next)) {
        used.add(next);
        visit([...path, next], used);
        used.delete(next);
      }
    }
  }
  for (let start = 0; start < 9; start++) visit([start], new Set([start]));
  return paths.map(path => new Thermo(...path));
}

const hiddenThermoRoutes = graph.boxes().flatMap(boxHamiltonianThermos);

return [
  new Shape('9x9'),
  new Given('R1C1', 3),
  new Given('R2C1', 4),
  new Given('R2C6', 3),
  new Given('R5C2', 9),
  new Given('R6C3', 2),
  new Given('R9C4', 4),
  new Given('R9C7', 9),
  new Given('R9C8', 2),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...renbanLines.map(cells => new Renban(...cells)),
  new Or(hiddenThermoRoutes),
];
