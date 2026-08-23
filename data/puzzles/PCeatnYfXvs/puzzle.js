// Title: Hungry Snakes in Cages
// Author: Mathematix
// Video: https://www.youtube.com/watch?v=PCeatnYfXvs
// Source: https://app.crackingthecryptic.com/sudoku/FN3nBH38nq

// Normal sudoku. Digits within a cage must not repeat and sum to the total in
// the cage's top-left corner, where one is given. Within each cage is a snake
// that fills the entire cage; it moves orthogonally, cannot cross itself, and
// its digits strictly increase from head to tail.
// No rule is omitted. Nothing in the puzzle marks a head, a tail, or a route:
// the snake of a cage is whatever orthogonal single-visit path through all of
// its cells the digits describe.

const graph = cellGraph('9x9');

// Cage cells and totals, transcribed from the drawn cages (top-left corner
// totals; a blank means the cage prints no total).
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
  { total: null, cells: ['R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R5C5'] },
];

// The digits of a cage are distinct, so they order its cells completely, and
// that order is the snake read head to tail. A snake therefore exists exactly
// when every pair of cage cells adjacent *in value order* is also orthogonally
// adjacent in the grid. Stated per pair of cells that are not orthogonally
// adjacent: those two cells must not be neighbours in the cage's value order,
// i.e. some third cell of the cage holds a value strictly between them.
// `Between` reads its first and last cell as the two ends and requires the
// cells listed between them to lie strictly inside that range.
const snakeConstraints = (cells) => cells.flatMap((a, i) =>
  cells.slice(i + 1)
    .filter(b => !graph.neighbours(a).includes(b))
    .map(b => new Or(
      cells.filter(c => c !== a && c !== b).map(c => new Between(a, c, b)))));

// One cage is exactly the middle box, whose no-repeat the box group already
// gives; the others state theirs.
const boxKeys = graph.boxes().map(cells => cells.slice().sort().join(','));
const isBox = (cells) => boxKeys.includes(cells.slice().sort().join(','));

return [
  new Shape('9x9'),
  ...cages.filter(cage => cage.total !== null || !isBox(cage.cells))
    .map(cage => cage.total !== null
      ? new Cage(cage.total, ...cage.cells)
      : new AllDifferent(...cage.cells)),
  ...cages.flatMap(cage => snakeConstraints(cage.cells)),
];
