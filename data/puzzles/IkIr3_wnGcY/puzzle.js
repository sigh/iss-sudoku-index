// Title: Rings And Cages #3
// Author: Steve360
// Video: https://www.youtube.com/watch?v=IkIr3_wnGcY
// Source: https://app.crackingthecryptic.com/sudoku/qdJpNj4rQ9

// Normal sudoku rules (default rows/columns/boxes). Every cage is a killer
// cage (distinct cells summing to the given total; cell lists transcribed
// from the drawn cage geometry). The green ring is a closed loop of 24 cells
// (drawn as a green-shaded band, one cell in from the outer edge) where every
// consecutive pair (including the wrap-around edge) differs by at most 4. The
// blue ring is a closed loop of 16 cells (drawn as a blue-shaded band around
// the central box) where every consecutive pair (including the wrap-around
// edge) has one digit a multiple of the other. Both rings are encoded with a
// custom Pair predicate over the whole ordered cycle, with the first cell
// repeated at the end to cover the closing edge (sequential-pair closed-loop
// convention).

const cages = [
  [12, 'R1C1', 'R1C2'],
  [6, 'R2C1', 'R3C1'],
  [15, 'R4C1', 'R5C1'],
  [10, 'R6C1', 'R7C1'],
  [11, 'R8C1', 'R9C1', 'R9C2'],
  [11, 'R4C4', 'R4C5', 'R4C6'],
  [6, 'R5C4', 'R5C5'],
  [11, 'R6C4', 'R6C5'],
  [17, 'R5C6', 'R6C6'],
  [15, 'R1C3', 'R1C4', 'R1C5'],
  [12, 'R1C6', 'R1C7'],
  [8, 'R1C8', 'R1C9', 'R2C9'],
  [9, 'R8C9', 'R9C9', 'R9C8'],
  [20, 'R9C3', 'R9C4', 'R9C5'],
  [9, 'R9C6', 'R9C7'],
  [15, 'R7C9', 'R6C9'],
  [16, 'R3C9', 'R4C9', 'R5C9'],
];

// Green ring cells, in walk order around the loop (drawn green-shaded
// cells), first cell repeated at the end to close the loop.
const greenRing = [
  'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
  'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8',
  'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2',
  'R7C2', 'R6C2', 'R5C2', 'R4C2', 'R3C2',
  'R2C2',
];

// Blue ring cells, in walk order around the loop (drawn blue-shaded
// cells), first cell repeated at the end to close the loop.
const blueRing = [
  'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7',
  'R7C6', 'R7C5', 'R7C4', 'R7C3',
  'R6C3', 'R5C3', 'R4C3', 'R3C3',
  'R3C4', 'R3C5', 'R3C6',
  'R3C7',
];

const maxDiff4Key = Pair.fnToKey((a, b) => Math.abs(a - b) <= 4, 9);
const multipleOrFactorKey = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  new Pair(maxDiff4Key, 'green ring: adjacent digits differ by at most 4', ...greenRing),
  new Pair(multipleOrFactorKey, 'blue ring: adjacent digits are a multiple/factor of each other', ...blueRing),
];
