// Title: Hungry Snakes in Cages
// Author: Mathematix
// Video: https://www.youtube.com/watch?v=PCeatnYfXvs
// Source: https://app.crackingthecryptic.com/sudoku/FN3nBH38nq

// Normal sudoku. Digits within a cage must not repeat, and sum to the total
// in the cage's top-left cell when one is given. Every cage cell also
// belongs to a snake that fills the whole cage: the snake moves orthogonally,
// never crosses itself, and its digits strictly increase from head to tail.
// Which end is the head, and (for a branching or cyclic cage) which of its
// possible routes is the snake, is not drawn or stated -- only the digits
// pin it down.

const graph = cellGraph('9x9');

// Cage cell lists and totals, transcribed from the source payload's `cages`
// array (0-indexed [row, col] pairs there, converted to R#C# here). `null`
// means the cage prints no total.
const cages = [
  { total: 8, cells: ['R1C1', 'R1C2', 'R1C3'] },
  { total: null, cells: ['R3C2', 'R4C2', 'R4C3'] },
  { total: 13, cells: ['R3C3', 'R3C4', 'R2C4', 'R2C5'] },
  { total: 13, cells: ['R6C1', 'R7C1', 'R8C1', 'R9C1'] },
  { total: 14, cells: ['R8C4', 'R8C5', 'R8C6', 'R8C7'] },
  { total: null, cells: ['R8C2', 'R8C3', 'R9C3', 'R9C2'] },
  { total: null, cells: ['R9C8', 'R8C8', 'R7C8', 'R7C9', 'R8C9'] },
  { total: 32, cells: ['R5C8', 'R5C9', 'R4C9', 'R3C9', 'R3C8'] },
  { total: null, cells: ['R3C7', 'R3C6', 'R2C6', 'R1C6'] },
  { total: null, cells: ['R7C7', 'R7C6', 'R7C5'] },
  // The entire middle 3x3 box (region 5), used here as a cage too.
  { total: null, cells: ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R5C5'] },
];

// Every ordering of `cells` that is a simple walk across the cage's own
// orthogonal-adjacency subgraph, visiting each cell exactly once -- i.e.
// every possible snake route through the cage, in both possible head/tail
// directions. Enumerated by DFS at script-generation time (cages here are at
// most 9 cells, so this is always a small, bounded search): the largest
// cage, the full middle box, has exactly 40 such orderings.
const hamiltonianPaths = (cells) => {
  const cellSet = new Set(cells);
  const paths = [];
  const extend = (path, visited) => {
    if (path.length === cells.length) { paths.push([...path]); return; }
    for (const next of graph.neighbours(path[path.length - 1])) {
      if (cellSet.has(next) && !visited.has(next)) {
        visited.add(next);
        path.push(next);
        extend(path, visited);
        path.pop();
        visited.delete(next);
      }
    }
  };
  for (const start of cells) extend([start], new Set([start]));
  return paths;
};

// A cage whose cells exactly match one of the 9 boxes already gets its
// all-different from the box; adding another would only duplicate it.
const boxCellSets = new Set(graph.boxes().map(cells => [...cells].sort().join(',')));
const isBoxShaped = (cells) => boxCellSets.has([...cells].sort().join(','));

return [
  new Shape('9x9'),
  // "Digits within a cage must not repeat and sum to the total (if given)".
  ...cages.map(cage => cage.total !== null
    ? new Cage(cage.total, ...cage.cells)
    : (isBoxShaped(cage.cells) ? null : new AllDifferent(...cage.cells)))
    .filter(c => c !== null),
  // "A snake fills the entire cage ... digits strictly increase head to
  // tail": at least one Hamiltonian ordering of the cage must read as a
  // strictly increasing Thermo.
  ...cages.map(cage => new Or(
    hamiltonianPaths(cage.cells).map(path => new Thermo(...path)))),
];
