// Title: Swirl
// Author: zetamath
// Video: https://www.youtube.com/watch?v=FHtlA-R3PgE
// Source: https://app.crackingthecryptic.com/sudoku/n9ngLR9pg2

// Normal sudoku rules apply. Every green line is a whisper line: consecutive
// cells along the drawn stroke (which sometimes bends diagonally through a
// cell's centre, per the SudokuPad drawing convention) must differ by at
// least 5. A second, undrawn rule applies across the whole grid: no
// orthogonally adjacent domino (on or off a green line) may sum to 5.

const graph = cellGraph('9x9');

// Green whisper lines, cell paths transcribed from the drawn stroke geometry.
// 5 is Whisper's documented default difference, passed explicitly to match
// "at least 5" in the rules text.
const whispers = [
  new Whisper(5, 'R8C1', 'R9C1', 'R9C2'),
  new Whisper(5, 'R7C2', 'R8C3'),
  new Whisper(5, 'R9C3', 'R8C4', 'R9C4'),
  new Whisper(5, 'R8C6', 'R7C7'),
  new Whisper(5, 'R7C8', 'R6C9'),
  new Whisper(5, 'R3C7', 'R4C8'),
  new Whisper(5,
    'R2C6', 'R3C6', 'R4C7', 'R5C8', 'R6C7', 'R7C6', 'R7C5', 'R6C4',
    'R5C3', 'R4C4', 'R3C5', 'R4C6', 'R5C7', 'R6C6'),
  new Whisper(5, 'R4C3', 'R3C4'),
  new Whisper(5, 'R6C2', 'R7C3', 'R7C4'),
];

// Global negative: no orthogonally adjacent domino anywhere in the grid may
// sum to 5. Stamped as two Replicate groups (rightward edges, downward
// edges) over every cell that has that neighbour, rather than hand-listing
// all 144 grid edges.
const notSum5 = Pair.fnToKey((a, b) => a + b !== 5, 9);

const rightNeighbourCells = graph.cells().filter(c => graph.step(c, 0, 1));
const noSum5Horizontal = graph.makeReplicate(
  new Pair(notSum5, '', 'R1C1', 'R1C2'), rightNeighbourCells);

const downNeighbourCells = graph.cells().filter(c => graph.step(c, 1, 0));
const noSum5Vertical = graph.makeReplicate(
  new Pair(notSum5, '', 'R1C1', 'R2C1'), downNeighbourCells);

return [
  new Shape('9x9'),
  ...whispers,
  noSum5Horizontal,
  noSum5Vertical,
];
