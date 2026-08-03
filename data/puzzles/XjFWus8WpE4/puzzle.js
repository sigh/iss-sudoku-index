// Title: Double Helpings
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=XjFWus8WpE4
// Source: https://app.crackingthecryptic.com/sudoku/dnnhqnhjRB

// Normal sudoku rules apply. Every number drawn outside the grid does double
// duty: it is a frame sum for the three cells nearest its row/column edge,
// and it is also a Little Killer diagonal sum for the diagonal its arrow
// points along. Both readings share the same printed value; each is a
// separate constraint below, not a restatement of the other.
//
// Outside-clue table: value, the frame lane it labels (the row/column and
// which three cells count as "first" from that side), and the on-grid entry
// cell + direction of its diagonal. Transcribed from the drawn overlay
// (clue text + position) and the paired arrow's waypoints in the source
// payload: each arrow's waypoints give a heading (row/col delta) from its
// off-grid tail to its on-grid head; the diagonal follows that same heading
// from the head cell until it leaves the grid.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const outsideClues = [
  { value: 9, frame: ['R1C2', 'R2C2', 'R3C2'], diagStart: 'R1C1', dir: [1, -1] },
  { value: 14, frame: ['R1C3', 'R2C3', 'R3C3'], diagStart: 'R1C2', dir: [1, -1] },
  { value: 13, frame: ['R1C5', 'R2C5', 'R3C5'], diagStart: 'R1C4', dir: [1, -1] },
  { value: 10, frame: ['R3C9', 'R3C8', 'R3C7'], diagStart: 'R2C9', dir: [-1, -1] },
  { value: 12, frame: ['R4C9', 'R4C8', 'R4C7'], diagStart: 'R3C9', dir: [-1, -1] },
  { value: 9, frame: ['R9C8', 'R8C8', 'R7C8'], diagStart: 'R9C9', dir: [-1, 1] },
  { value: 12, frame: ['R9C7', 'R8C7', 'R7C7'], diagStart: 'R9C8', dir: [-1, 1] },
  { value: 17, frame: ['R9C6', 'R8C6', 'R7C6'], diagStart: 'R9C7', dir: [-1, 1] },
  { value: 19, frame: ['R9C5', 'R8C5', 'R7C5'], diagStart: 'R9C6', dir: [-1, 1] },
  { value: 21, frame: ['R6C1', 'R6C2', 'R6C3'], diagStart: 'R5C1', dir: [-1, 1] },
];

// Frame sums: plain Sum, not Cage -- these three cells already share a row
// or column, so Sudoku's own all-different covers distinctness; this
// constraint should not impose it a second time.
const frameSums = outsideClues.map(c => new Sum(c.value, ...c.frame));

// Little Killer diagonals: ISS's LittleKiller requires a diagonal of at
// least 2 cells. Two of these ten arrows enter a diagonal that exits the
// grid after a single cell (the clue sits next to the grid's corner), so
// for those the "diagonal sum" is just that one digit -- encoded as a
// Given, the same constraint a 1-cell LittleKiller would express.
const littleKillers = outsideClues.map(c => {
  const cells = graph.ray(c.diagStart, ...c.dir);
  return cells.length > 1
    ? LittleKiller.fromCells(c.value, cells, geometry)
    : new Given(cells[0], c.value);
});

return [
  new Shape('9x9'),
  new Given('R9C1', 1),
  ...frameSums,
  ...littleKillers,
];
