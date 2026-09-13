// Title: Group Theory
// Author: Gabriel Kammer
// Video: https://www.youtube.com/watch?v=wiP7-PmQ74U
// Source: https://sudokupad.app/q66okox4du

// Rules encoded here:
//   1. Normal sudoku rules apply.
//   2. Renban: digits along a purple line form a set of consecutive digits in
//      any order.
//   3. German whispers: adjacent digits along a green line differ by at least 5.
//   4. Equal-sum: box borders divide a blue line into multiple segments which
//      have the same sum; different lines may have different sums.
// The puzzle is a black-and-white photocopy: every line is drawn in the same
// grey, no line's colour is recoverable, and the rules warn that not all three
// types need occur. So each line's type is unknown and every line is encoded as
// a disjunction over the three rules, independently per line (the rules state no
// correspondence tying the types together or requiring each type to be used).
// There are no givens.
//
// Not encoded: "You assume the original had a unique solution, but is it still
// reconstructible?" -- the premise that the intended type assignment is the one
// whose resulting puzzle is itself uniquely solvable. That is a condition on the
// solution set of the encoding rather than on a grid, so it is omitted and this
// encoding is far looser than the original puzzle.

// Cell paths transcribed from the eight drawn grey strokes. Every stroke
// waypoint sits on a cell centre; runs longer than one cell are straight
// diagonals, whose interpolated cells are listed. `closed` marks a stroke whose
// last waypoint returns to its first.
const LINES = [
  { cells: ['R9C3', 'R8C3', 'R7C2', 'R7C1', 'R8C2', 'R8C1', 'R9C2', 'R9C1'], closed: false },
  { cells: ['R6C9', 'R6C8', 'R5C7', 'R5C6', 'R4C6', 'R4C5', 'R3C5', 'R2C4', 'R1C4'], closed: false },
  { cells: ['R2C8', 'R2C9', 'R1C9', 'R1C8'], closed: true },
  { cells: ['R8C6', 'R8C5', 'R7C5', 'R6C4', 'R5C3', 'R5C2', 'R4C2'], closed: false },
  { cells: ['R9C4', 'R8C4', 'R7C4', 'R7C3', 'R6C3', 'R6C2', 'R6C1'], closed: false },
  { cells: ['R7C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3', 'R3C3'], closed: false },
  { cells: ['R6C6', 'R5C5', 'R4C4'], closed: false },
  { cells: ['R3C6', 'R4C7', 'R3C7'], closed: true },
];

// One line, type unknown: at least one of the three rules holds on it.
// Whisper binds consecutive pairs by list order, so a closed stroke repeats its
// first cell to cover the wrap-around edge. Renban is set-based and needs no
// repeat. RegionSumLine splits the list by walking it, and a repeated first cell
// would create a spurious extra segment; the two closed strokes need no rotation
// either, since #2 lies wholly inside box 3 (one segment) and every cell of #7
// lies in a different box (three one-cell segments), so their cyclic and linear
// segmentations agree.
const lineConstraint = ({ cells, closed }) => new Or([
  new Renban(...cells),
  new Whisper(5, ...(closed ? [...cells, cells[0]] : cells)),
  new RegionSumLine(...cells),
]);

return [
  new Shape('9x9'),
  ...LINES.map(lineConstraint),
];
