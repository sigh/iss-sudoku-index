// Title: Overlap
// Author: Sudoku Skunkworks
// Video: https://www.youtube.com/watch?v=bbEC1sHC5x4
// Source: https://app.crackingthecryptic.com/sudoku/H8F2RQ4q6F

// Normal sudoku rules apply. Black dots: 2:1 ratio. White dots: consecutive.
// Not all black/white dots are given (no negative dot inference). Purple
// lines: any 5-cell window along a line of >= 5 cells holds five consecutive
// digits in some order, no repeats; a line shorter than 5 cells holds a run
// of consecutive digits (its whole cell set), no repeats.
// Dots and purple-line cell paths are transcribed from the drawn overlays
// and lines in the source payload.

const blackDots = [
  ['R1C8', 'R1C9'],
  ['R8C2', 'R9C2'],
];
const whiteDots = [
  ['R2C2', 'R3C2'],
  ['R2C2', 'R2C3'],
  ['R3C6', 'R3C7'],
  ['R4C7', 'R4C8'],
  ['R5C8', 'R5C9'],
  ['R4C5', 'R5C5'],
  ['R5C4', 'R5C5'],
  ['R6C2', 'R7C2'],
  ['R7C3', 'R8C3'],
  ['R8C4', 'R9C4'],
];

// Lines shorter than 5 cells: whole cell set is a Renban (consecutive run,
// no repeats). Renban is set-based, so the closed 4-cell loop needs no
// repeated start cell.
const shortRenbanLines = [
  ['R3C8', 'R4C8', 'R5C8'],
  ['R8C3', 'R8C4', 'R8C5'],
  ['R8C7', 'R7C7', 'R7C8'],
  ['R4C5', 'R5C5', 'R5C4'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R3C4', 'R3C3', 'R4C3', 'R4C4'],
];

// Lines with >= 5 cells: every window of 5 consecutive-along-the-line cells
// must independently be a Renban set. Line 1 is a closed loop, so its
// windows wrap cyclically; line 2 is an open path, so its windows do not.
const closedLoop = [
  'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R6C4',
  'R6C5', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6', 'R1C5', 'R1C4',
  'R1C3', 'R1C2',
];
const cyclicClosedLoop = [...closedLoop, ...closedLoop.slice(0, 4)];
const closedLoopWindows = closedLoop.map(
  (_, start) => new Renban(...cyclicClosedLoop.slice(start, start + 5)));

const openPath = [
  'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9',
];
const openPathWindows = [];
for (let start = 0; start + 5 <= openPath.length; start++) {
  openPathWindows.push(new Renban(...openPath.slice(start, start + 5)));
}

return [
  new Shape('9x9'),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...shortRenbanLines.map(cells => new Renban(...cells)),
  ...closedLoopWindows,
  ...openPathWindows,
];
