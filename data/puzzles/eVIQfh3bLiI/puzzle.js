// Title: Serial BoX
// Author: twototenth
// Video: https://www.youtube.com/watch?v=eVIQfh3bLiI
// Source: https://app.crackingthecryptic.com/sudoku/HMBLdFQ7FT

// Normal sudoku rules apply. Purple lines require a consecutive, non-repeating
// digit set (Renban). Marked X pairs sum to 10; the rules state not all
// possible Xs are drawn, so unmarked adjacent pairs carry no constraint (no
// StrictXV-style negative). The outside "48" clue gives the sum of the
// anti-diagonal R1C9..R9C1, and the rules explicitly allow repeats on it, so
// LittleKiller (which does not itself force distinctness) is the faithful
// class.

const geometry = cellGeometry(9, 9);

// Purple lines, transcribed from the drawn geometry (colour #d23be7). One
// further entry carries the same colour but no coordinates and renders
// nothing, so it is not a drawn clue.
const renbanLines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R4C2', 'R4C3', 'R3C3'],
  ['R9C3', 'R8C3', 'R8C4', 'R7C4'],
  ['R5C5', 'R4C5'],
  ['R4C6', 'R4C7'],
  ['R4C8', 'R5C8', 'R6C8'],
  ['R6C9', 'R7C9'],
  ['R8C9', 'R9C9'],
  ['R2C5', 'R2C6'],
  ['R1C6', 'R1C7', 'R1C8'],
  ['R2C9', 'R3C9'],
].map(cells => new Renban(...cells));

// X marks, transcribed from the drawn overlays (text "X" on a cell edge).
const xPairs = [
  ['R1C4', 'R1C5'],
  ['R2C2', 'R3C2'],
  ['R5C3', 'R6C3'],
  ['R3C4', 'R4C4'],
  ['R4C9', 'R5C9'],
  ['R7C2', 'R7C3'],
  ['R9C5', 'R9C6'],
].map(cells => new X(...cells));

// Outside diagonal clue: overlay text "48" near R1C9, paired by the drawn
// off-grid ray with the anti-diagonal starting at R1C9 and running down-left.
const graph = cellGraph('9x9');
const littleKiller = LittleKiller.fromCells(
  48,
  graph.ray('R1C9', 1, -1),
  geometry);

return [
  new Shape('9x9'),
  ...renbanLines,
  ...xPairs,
  littleKiller,
];
