// Title: Starburst
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=Rv7XMr2EtT0
// Source: https://app.crackingthecryptic.com/sudoku/gdH4d4ThtQ

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes matching the payload's regions). Digits along a thermometer
// increase from the bulb end. Cells joined by a V sum to 5; by an X sum to
// 10. "Not all Xs and Vs are shown" -- only the drawn pairs are constrained,
// no negative inference on unmarked adjacent pairs. The two outside clues
// give the sum of digits along their indicated diagonal, repeats allowed
// except where a stretch of the diagonal shares a row/column/box.

const geometry = cellGeometry(9);

// Eight thermometers, bulb first, radiating from the 8 non-center cells of
// the center box out to the grid edge (the "starburst"). Center cell R5C5
// carries no thermometer. Transcribed from the drawn thermometer lines.
const thermos = [
  ['R4C4', 'R3C3', 'R2C2'],
  ['R4C5', 'R3C5', 'R2C5'],
  ['R4C6', 'R3C7'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
  ['R6C4', 'R7C3', 'R8C2'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R6C6', 'R7C7'],
].map(cells => new Thermo(...cells));

// V (sum to 5) and X (sum to 10) edge marks. Transcribed from the drawn
// "V"/"X" badges, each centered on one shared cell edge.
const vClues = [
  ['R1C4', 'R2C4'],
  ['R8C4', 'R9C4'],
].map(cells => new V(...cells));

const xClues = [
  ['R2C8', 'R2C9'],
  ['R6C7', 'R6C8'],
  ['R4C2', 'R4C3'],
].map(cells => new X(...cells));

// Outside diagonal-sum clues. LittleKiller.fromCells derives the canonical
// corner from the explicit cell list, walking the drawn arrow's diagonal.
const littleKillers = [
  [55, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [25, ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),
  ...thermos,
  ...vClues,
  ...xClues,
  ...littleKillers,
];
