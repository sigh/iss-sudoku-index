// Title: Unknown
// Author: Shinya
// Video: https://www.youtube.com/watch?v=ZlAmQsrolPo
// Source: https://cracking-the-cryptic.web.app/sudoku/Ngf4fFHHdf

// The payload carries no rules text of any kind. Normal sudoku rules apply
// (default row/column/box all-different, standard 3x3 boxes matching the
// payload's regions). Digits do not repeat in cages, which show their sums
// (standard killer-cage semantics for the payload's `cages` field). Outside
// -the-grid clues give the sum along the indicated diagonal, repeats allowed
// (standard "little killer" semantics for the payload's `arrows` +
// `overlays` fields). No rules text is present in the source at all; these
// are the standard, unambiguous conventions for these drawn clue types.

const geometry = cellGeometry(9);

// Killer cages, transcribed from the payload's `cages` array (total, cells).
// The payload's 7th cages entry has no cells (a metadata stub) and is
// omitted.
const cages = [
  [16, 'R1C4', 'R1C5', 'R2C4', 'R2C5'],
  [13, 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  [30, 'R4C1', 'R4C2', 'R5C1', 'R5C2'],
  [28, 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  [20, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [24, 'R8C5', 'R8C6', 'R9C5', 'R9C6'],
];

// Outside diagonal-sum ("little killer") clues. Each payload `arrow` is a
// two-waypoint off-grid ray whose drawn direction (into the grid from the
// off-grid badge) fixes which diagonal through that grid-edge cell is
// meant; the cell lists below are that resolved diagonal. Each arrow pairs
// with the `overlays` text badge sitting at the exact same off-grid
// coordinate as the arrow's outer waypoint. LittleKiller.fromCells derives
// the canonical corner from the explicit cell list.
const littleKillers = [
  [30, ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6']],
  [23, ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1']],
  [11, ['R2C9', 'R1C8']],
  [22, ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4']],
  [9, ['R9C8', 'R8C9']],
  [31, ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9']],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...littleKillers.map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry)),
];
