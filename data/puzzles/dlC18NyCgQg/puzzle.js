// Title: SVS (273) - Thermal Killer Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=dlC18NyCgQg
// Source: https://app.crackingthecryptic.com/webapp/Fd6j36j2jr

// Normal sudoku rules apply. Each cage's small clue is the sum of its
// digits, and digits cannot repeat within a cage (Cage: distinct + sum).
// Additionally, every cage's own cells must be arrangeable into one
// orthogonally-connected, one-cell-wide snake covering every cell of the
// cage, with digits strictly increasing along that snake -- a
// "thermometer" whose route through the cage, and which end is low, are
// not drawn: only the cage's boundary and total are. Since the route
// itself is not drawn, every directed Hamiltonian path through the cage's
// own cell-adjacency graph is offered as an alternative reading:
// `Or(...Thermo(path))` requires only that some such snake exists,
// covering the whole cage, in some direction of travel.

// Enumerate every directed Hamiltonian path through the graph whose nodes
// are `cells` (cage cell ids) and whose edges are orthogonal grid
// adjacencies between them. This depends only on the cage's fixed
// geometry (never on solved digits), so it is computed once here rather
// than hand-enumerated.
const graph = cellGraph();

function hamiltonianPaths(cells) {
  const cellSet = new Set(cells);
  const neighboursOf = new Map(cells.map(
    id => [id, graph.neighbours(id).filter(n => cellSet.has(n))]));

  const paths = [];
  const visit = (path, visited) => {
    if (path.length === cells.length) {
      paths.push([...path]);
      return;
    }
    for (const next of neighboursOf.get(path[path.length - 1])) {
      if (!visited.has(next)) {
        visited.add(next);
        path.push(next);
        visit(path, visited);
        path.pop();
        visited.delete(next);
      }
    }
  };
  for (const start of cells) visit([start], new Set([start]));
  return paths;
}

// Cage cell lists and totals, transcribed from the drawn cage geometry.
const cages = [
  { total: 22, cells: ['R1C8', 'R2C8', 'R3C8'] },
  { total: 18, cells: ['R1C7', 'R1C6', 'R1C5', 'R2C5', 'R2C6'] },
  { total: 17, cells: ['R3C5', 'R3C6', 'R3C7', 'R4C7', 'R4C6'] },
  { total: 18, cells: ['R3C4', 'R3C3', 'R4C3', 'R4C4'] },
  { total: 29, cells: ['R4C8', 'R5C8', 'R5C9', 'R4C9', 'R6C9'] },
  { total: 31, cells: ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'] },
  {
    total: 45,
    cells: ['R6C8', 'R7C8', 'R8C8', 'R8C7', 'R7C7', 'R6C7', 'R6C6', 'R7C6', 'R8C6'],
  },
  { total: 17, cells: ['R8C5', 'R8C4', 'R9C4', 'R9C5', 'R9C6'] },
  { total: 20, cells: ['R8C1', 'R8C2', 'R8C3'] },
  { total: 19, cells: ['R7C1', 'R6C1', 'R5C1', 'R5C2', 'R6C2'] },
  { total: 29, cells: ['R5C3', 'R6C3', 'R7C3', 'R7C4', 'R6C4'] },
];

const cageConstraints = cages.flatMap(({ total, cells }) => {
  const snakes = hamiltonianPaths(cells).map(path => new Thermo(...path));
  return [
    new Cage(total, ...cells),
    new Or(snakes),
  ];
});

return [
  new Shape('9x9'),
  ...cageConstraints,
];
