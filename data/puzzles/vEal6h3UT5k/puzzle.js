// Title: Killer Blister
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=vEal6h3UT5k
// Source: https://app.crackingthecryptic.com/sudoku/drgFt2mrtD

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Digits do not repeat in cages,
// which show their sums. Outside-the-grid clues give the sum along the
// indicated diagonal, repeats allowed (it is not a cage).

const geometry = cellGeometry(9);

// Killer cages, transcribed from the payload's `cages` array (total, cells).
const cages = [
  [26, 'R1C6', 'R1C7', 'R1C8', 'R2C7'],
  [16, 'R1C5', 'R2C5', 'R3C5', 'R4C5'],
  [18, 'R2C3', 'R3C3', 'R3C2'],
  [7, 'R3C1', 'R4C1'],
  [3, 'R4C2', 'R4C3'],
  [7, 'R5C4', 'R5C5', 'R5C6'],
  [10, 'R6C7', 'R6C8', 'R6C9', 'R7C9'],
  [12, 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  [12, 'R7C7', 'R7C8', 'R8C8', 'R8C7'],
  [38, 'R6C5', 'R6C6', 'R8C6', 'R8C5', 'R7C5', 'R7C6'],
  [17, 'R8C4', 'R8C3', 'R8C2'],
  [20, 'R6C1', 'R7C1', 'R8C1'],
];

// Outside diagonal-sum ("little killer") clues. Each payload `arrow` is a
// two-waypoint off-grid ray whose drawn direction (into the grid from the
// off-grid badge) fixes which of the two diagonals through that corner is
// meant; cell lists below are that resolved diagonal, paired with the
// nearest (distance-0) overlay total. LittleKiller.fromCells derives the
// canonical corner from the explicit cell list.
const littleKillers = [
  [20, ['R3C1', 'R2C2', 'R1C3']],
  [54, ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9']],
  [12, ['R9C4', 'R8C3', 'R7C2', 'R6C1']],
  [37, ['R7C9', 'R6C8', 'R5C7', 'R4C6', 'R3C5', 'R2C4', 'R1C3']],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...littleKillers.map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry)),
];
