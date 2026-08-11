// Title: Whispered Somethings
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=35wKUcSN9BY
// Source: https://app.crackingthecryptic.com/sudoku/hFRMdthhM3

// Normal sudoku rules apply (default 9x9 rows/cols/boxes).
// All five drawn lines are BOTH German Whisper lines (adjacent digits differ
// by >= 5, i.e. Whisper(5)) and Region Sum Lines (equal sum within each box
// the line passes through, i.e. RegionSumLine) -- "all lines must satisfy
// BOTH properties". Whisper(5) and RegionSumLine over the identical cell
// list state exactly that, with no line revisiting a box (checked against
// the drawn geometry), so no wrap/segment reordering is needed.
// The source drawing has each line's edge set stroked twice (colours
// #a3e048 th=10 and #cfcfcf th=5 over the same 24 edges) -- one drawn line,
// encoded once. Two further stroke entries carry styling but no coordinates
// and render nothing; they are not clues.

const lines = [
  ['R1C4', 'R2C5', 'R2C6', 'R1C7', 'R1C8', 'R2C9'],
  ['R2C2', 'R3C3', 'R4C4', 'R5C4', 'R6C4', 'R7C3', 'R8C2'],
  ['R3C1', 'R4C2', 'R5C2'],
  ['R4C7', 'R5C7', 'R6C6', 'R7C5', 'R7C4', 'R8C3', 'R9C2'],
  ['R9C4', 'R8C5', 'R8C6', 'R9C7', 'R9C8', 'R8C9'],
];

return [
  new Shape('9x9'),
  new Given('R4C5', 3),
  new Given('R7C8', 4),
  ...lines.map(cells => new Whisper(5, ...cells)),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
