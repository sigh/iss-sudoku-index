// Title: Nanro (Signpost)
// Author: Robert Vollmert
// Video: https://www.youtube.com/watch?v=GKmGGEiJL7s
// Source: https://cracking-the-cryptic.web.app/sudoku/j24Hdqtq6m

// Nanro (Signpost) on a 10x10 grid divided into 20 rooms. No rules text is
// printed with the puzzle; what follows is the standard ruleset of the genre
// the video names.
//
//   1. Label some cells with a number. A cell that is not labelled is blank;
//      blank is encoded here as the value 0.
//   2. The labelled cells form a single orthogonally connected group.
//   3. No 2x2 block of cells is entirely labelled.
//   4. Every room contains at least one labelled cell.
//   5. Every number equals the count of labelled cells in its own room --
//      so all the labels in a room are the same number.
//   6. Two labelled cells that are orthogonally adjacent but lie in
//      different rooms must carry different numbers.
//   7. The small number drawn in the corner of a room -- the signpost -- is
//      that room's number. Four rooms carry no signpost; their number is
//      left for the solver.
//
// A signpost labels the whole room, not the cell it is drawn in: all 16 are
// drawn in the top-left corner of their room's first cell in reading order,
// the way a killer cage prints its total, so the position picks out a room
// and nothing finer. Nothing here asserts that a signposted cell is itself
// labelled.

// The drawn room partition and the drawn signposts. Room cells are
// [row, col], 1-indexed; `clue` is the room's signpost number, or null for a
// room that carries none. Rooms are listed in reading order of their first
// cell.
const ROOMS = [
  { clue: 2, cells: [[1, 1], [2, 1], [2, 2], [3, 1]] },
  { clue: 2, cells: [[1, 2], [1, 3], [1, 4], [2, 3]] },
  { clue: 3, cells: [[1, 5], [2, 5], [3, 5], [4, 5], [5, 1], [5, 2], [5, 3], [5, 4], [5, 5]] },
  { clue: 4, cells: [[1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [5, 7], [5, 8], [5, 9], [5, 10]] },
  { clue: 2, cells: [[1, 7], [1, 8], [1, 9], [2, 8]] },
  { clue: 4, cells: [[1, 10], [2, 9], [2, 10], [3, 10]] },
  { clue: null, cells: [[2, 4], [3, 3], [3, 4], [4, 4]] },
  { clue: 4, cells: [[2, 7], [3, 7], [3, 8], [4, 7]] },
  { clue: 3, cells: [[3, 2], [4, 1], [4, 2], [4, 3]] },
  { clue: null, cells: [[3, 9], [4, 8], [4, 9], [4, 10]] },
  { clue: 1, cells: [[6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5]] },
  { clue: 3, cells: [[6, 6], [6, 7], [6, 8], [6, 9], [6, 10], [7, 6], [8, 6], [9, 6], [10, 6]] },
  { clue: 1, cells: [[7, 1], [7, 2], [7, 3], [8, 2]] },
  { clue: 2, cells: [[7, 4], [8, 3], [8, 4], [9, 4]] },
  { clue: null, cells: [[7, 7], [8, 7], [8, 8], [9, 7]] },
  { clue: null, cells: [[7, 8], [7, 9], [7, 10], [8, 9]] },
  { clue: 4, cells: [[8, 1], [9, 1], [9, 2], [10, 1]] },
  { clue: 3, cells: [[8, 10], [9, 9], [9, 10], [10, 10]] },
  { clue: 3, cells: [[9, 3], [10, 2], [10, 3], [10, 4]] },
  { clue: 3, cells: [[9, 8], [10, 7], [10, 8], [10, 9]] },
];

// Values are 0 (blank) and 1-4 (a label). 4 is the largest label the rules
// allow here: every drawn signpost is 1-4, and each of the four unsignposted
// rooms holds 4 cells, so no room's number can exceed 4. `Raw` because Nanro
// constrains no row, column or box -- rule 6 is the only restriction on where
// equal values may sit.
const shape = new Shape('10x10', '0-4', 'Raw');
const graph = cellGraph(shape);

const roomCells = ROOMS.map(room => room.cells.map(([r, c]) => makeCellId(r, c)));

// Rules 4, 5 and 7: a room of `size` cells whose number is `n` holds n cells
// labelled n and size - n blanks, in any arrangement -- that is the whole
// multiset of the room's values, which ContainExact states directly. n >= 1
// is rule 4.
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

// Rule 6, over every grid edge that crosses a room border. The predicate
// holds unless both cells are labelled with the same number; a blank (0) on
// either side never conflicts. The 100 such edges fall into two offset
// groups -- the border is crossed rightwards or downwards -- so each becomes
// one Replicate of a single Pair template.
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
