// Title: Gate Key
// Author: grkles
// Video: https://www.youtube.com/watch?v=7KPcWI0vPTQ
// Source: https://app.crackingthecryptic.com/sudoku/gjdPMght6H

// Normal sudoku (default row/column/box all-different from Shape('9x9')).
// Renban(...cells): the digits on each purple line form a consecutive,
// non-repeating set, in any order.
// GreaterThan(...cells): binds by grid adjacency, each earlier-listed cell
// greater than any later-listed cell adjacent to it. Each min/max clue below
// lists its hub cell against its orthogonal neighbours (none of which are
// adjacent to each other), so it enforces exactly the hub-vs-neighbour
// relation and nothing else. Listing the hub first gives "hub greater than
// each neighbour" (max cell); listing the hub last gives "each neighbour
// greater than hub" (min cell).

const renbans = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8'],
  ['R4C6', 'R5C5', 'R6C4'],
  ['R6C5', 'R7C5', 'R7C6', 'R7C7'],
  ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
];

// Minimum cells (gold underlay, arrows point inward): hub less than every
// orthogonal neighbour it has.
const minCells = [
  ['R2C4', ['R1C4', 'R2C3', 'R2C5', 'R3C4']],
  ['R2C8', ['R1C8', 'R2C7', 'R2C9', 'R3C8']],
  ['R4C4', ['R3C4', 'R4C3', 'R4C5', 'R5C4']],
  ['R4C6', ['R3C6', 'R4C5', 'R4C7', 'R5C6']],
  ['R6C2', ['R5C2', 'R6C1', 'R6C3', 'R7C2']],
  ['R6C8', ['R5C8', 'R6C7', 'R6C9', 'R7C8']],
  ['R8C4', ['R7C4', 'R8C3', 'R8C5', 'R9C4']],
];

// Maximum cells (grey underlay, arrows point outward): hub greater than
// every orthogonal neighbour it has.
const maxCells = [
  ['R2C6', ['R1C6', 'R2C5', 'R2C7', 'R3C6']],
  ['R4C2', ['R3C2', 'R4C1', 'R4C3', 'R5C2']],
  ['R4C8', ['R3C8', 'R4C7', 'R4C9', 'R5C8']],
  ['R6C4', ['R5C4', 'R6C3', 'R6C5', 'R7C4']],
  ['R6C6', ['R5C6', 'R6C5', 'R6C7', 'R7C6']],
  ['R8C2', ['R7C2', 'R8C1', 'R8C3', 'R9C2']],
  ['R8C6', ['R7C6', 'R8C5', 'R8C7', 'R9C6']],
];

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  ...minCells.map(([hub, neighbours]) => new GreaterThan(...neighbours, hub)),
  ...maxCells.map(([hub, neighbours]) => new GreaterThan(hub, ...neighbours)),
];
