// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=uPLdMSoU4NY
// Source: https://cracking-the-cryptic.web.app/sudoku/t2m4QjDQqN

// Nanro (Signpost) on a 10x10 board divided into 25 rooms of four cells each.
// No rules text is printed with the puzzle; what follows is the published
// ruleset of the genre the video names.
//
//   1. Label some cells with a number; the rest stay blank. Blank is encoded
//      here as the value 0.
//   2. The labelled cells form a single orthogonally connected group.
//   3. No 2x2 block of cells is entirely labelled.
//   4. Every room contains at least one labelled cell.
//   5. Every number equals the count of labelled cells in its own room, so all
//      the labels inside one room are the same number.
//   6. Two labelled cells that are orthogonally adjacent but lie in different
//      rooms must hold different numbers.
//   7. The small number drawn in the corner of a room -- its signpost -- is
//      that room's number. Five rooms carry no signpost; their number is left
//      for the solver.
//
// There is no Sudoku layer: rows, columns and boxes are unconstrained, so the
// board is a Raw grid and rule 6 is the only restriction on where equal values
// may sit.
//
// A signpost names its room, not the cell it is drawn in: all 20 are
// quarter-cell texts in a cell's top-left corner, where a killer cage prints
// its total, and each sits in the first cell in reading order of a distinct
// room. The competing reading, that a signposted cell must itself be labelled,
// is contradicted by the drawing alone -- R1C1 and R2C1 are adjacent, lie in
// different rooms and both read 2, which rule 6 forbids.

// The drawn room partition and the drawn signposts, transcribed from the bold
// borders and the twenty corner numbers. Room cells are [row, col], 1-indexed;
// `clue` is the room's signpost number, or null for a room that carries none.
// Rooms are listed in reading order of their first cell.
const ROOMS = [
  { clue: 2, cells: [[1, 1], [1, 2], [1, 3], [1, 4]] },
  { clue: 2, cells: [[1, 5], [2, 4], [2, 5], [3, 4]] },
  { clue: 1, cells: [[1, 6], [2, 6], [2, 7], [3, 6]] },
  { clue: null, cells: [[1, 7], [1, 8], [1, 9], [1, 10]] },
  { clue: 2, cells: [[2, 1], [2, 2], [3, 1], [4, 1]] },
  { clue: 1, cells: [[2, 3], [3, 2], [3, 3], [4, 2]] },
  { clue: 2, cells: [[2, 8], [2, 9], [2, 10], [3, 10]] },
  { clue: null, cells: [[3, 5], [4, 4], [4, 5], [4, 6]] },
  { clue: 3, cells: [[3, 7], [3, 8], [4, 7], [5, 7]] },
  { clue: 1, cells: [[3, 9], [4, 9], [4, 10], [5, 9]] },
  { clue: 2, cells: [[4, 3], [5, 2], [5, 3], [6, 3]] },
  { clue: 3, cells: [[4, 8], [5, 8], [6, 8], [7, 8]] },
  { clue: null, cells: [[5, 1], [6, 1], [6, 2], [7, 1]] },
  { clue: 2, cells: [[5, 4], [5, 5], [5, 6], [6, 6]] },
  { clue: 2, cells: [[5, 10], [6, 9], [6, 10], [7, 9]] },
  { clue: 3, cells: [[6, 4], [6, 5], [7, 3], [7, 4]] },
  { clue: 2, cells: [[6, 7], [7, 6], [7, 7], [8, 6]] },
  { clue: 1, cells: [[7, 2], [8, 2], [8, 3], [8, 4]] },
  { clue: 2, cells: [[7, 5], [8, 5], [9, 4], [9, 5]] },
  { clue: null, cells: [[7, 10], [8, 10], [9, 10], [10, 10]] },
  { clue: 3, cells: [[8, 1], [9, 1], [10, 1], [10, 2]] },
  { clue: 3, cells: [[8, 7], [8, 8], [8, 9], [9, 8]] },
  { clue: 2, cells: [[9, 2], [9, 3], [10, 3], [10, 4]] },
  { clue: 2, cells: [[9, 6], [9, 7], [10, 5], [10, 6]] },
  { clue: null, cells: [[9, 9], [10, 7], [10, 8], [10, 9]] },
];

// Values are 0 (blank) and 1-4 (a label). 4 is the largest number the rules
// allow here: every room holds four cells, so no room's count can exceed 4.
const shape = new Shape('10x10', '0-4', 'Raw');
const graph = cellGraph(shape);

const roomCells = ROOMS.map(room => room.cells.map(([r, c]) => makeCellId(r, c)));

// Rules 4, 5 and 7: a room of `size` cells whose number is `n` holds n cells
// labelled n and size - n blanks, in any arrangement -- that is the whole
// multiset of the room's values, which ContainExact states directly. n >= 1 is
// rule 4.
const countPattern = (size, n) =>
  Array(n).fill(n).concat(Array(size - n).fill(0)).join('_');

const roomRules = ROOMS.map((room, i) => {
  const cells = roomCells[i];
  if (room.clue !== null) {
    return new ContainExact(countPattern(cells.length, room.clue), ...cells);
  }
  // No signpost: disjoin over every number the room could take, 1 up to its
  // own size.
  return new Or(Array.from(
    { length: cells.length },
    (_, k) => new ContainExact(countPattern(cells.length, k + 1), ...cells)));
});

const roomOf = new Map();
roomCells.forEach((cells, i) => cells.forEach(cell => roomOf.set(cell, i)));

// Rule 6, over every grid edge that crosses a room border. The predicate holds
// unless both cells are labelled with the same number; a blank (0) on either
// side never conflicts. Such an edge is crossed either rightwards or
// downwards, so each of the two offsets becomes one Replicate of a single Pair
// template.
const borderKey = Pair.fnToKey((a, b) => a === 0 || b === 0 || a !== b, shape);
const borderRules = [[0, 1], [1, 0]].map(([dr, dc]) => {
  const starts = graph.cells().filter(cell => {
    const other = graph.step(cell, dr, dc);
    return other !== null && roomOf.get(other) !== roomOf.get(cell);
  });
  const origin = starts[0];
  return new Replicate(
    [new Pair(borderKey, 'room-border', origin, graph.step(origin, dr, dc))],
    Replicate.encodeTargetCells(starts, origin, graph),
    origin);
});

// Rule 3, as "a blank appears in every 2x2 square": Quad anchors on the
// square's top-left cell, and the 81 squares are one Replicate group.
const blockStarts = graph.cells().filter(cell => graph.block(cell, 2, 2) !== null);
const blockOrigin = blockStarts[0];
const no2x2 = new Replicate(
  [new Quad(blockOrigin, 0)],
  Replicate.encodeTargetCells(blockStarts, blockOrigin, graph),
  blockOrigin);

return [
  shape,
  ...roomRules,
  ...borderRules,
  no2x2,
  // Rule 2, over the whole grid: the cells holding a label (any non-zero
  // value) form one orthogonally connected region.
  new ConnectedValues('', [1, 2, 3, 4]),
];
