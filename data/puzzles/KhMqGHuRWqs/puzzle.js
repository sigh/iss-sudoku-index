// Title: River Flows in You
// Author: Ridhwan
// Video: https://www.youtube.com/watch?v=KhMqGHuRWqs
// Source: https://sudokupad.app/dcsl0fizk9

// Normal sudoku rules apply. Box borders divide a blue line into segments with
// an equal sum. Every rules sentence is encoded; nothing is omitted.
//
// Cells are listed in drawing order along each blue line; RegionSumLine walks
// the list and splits it at box borders itself.
return [
  new Shape('9x9'),
  new Given('R5C7', 3),

  new RegionSumLine('R8C7', 'R9C7', 'R9C6', 'R9C5'),
  new RegionSumLine('R8C3', 'R9C3', 'R9C4', 'R8C4', 'R8C5', 'R8C6'),
  new RegionSumLine('R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2'),
  new RegionSumLine('R2C2', 'R3C2', 'R3C3', 'R4C3'),
  new RegionSumLine('R2C3', 'R1C3', 'R1C4', 'R2C5'),
  new RegionSumLine(
    'R4C5', 'R5C5', 'R5C6', 'R4C7', 'R4C8', 'R4C9',
    'R3C9', 'R2C9', 'R1C9', 'R1C8'),
  // Leaves box 2 for box 3 and returns to box 2, so it has five segments, not
  // four; RegionSumLine treats each visit to a box as its own segment.
  new RegionSumLine(
    'R2C6', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R3C6', 'R3C5', 'R3C4',
    'R4C4', 'R5C4', 'R6C3', 'R6C2', 'R6C1'),

  // The one blue line that branches: a horizontal run R6C4-R6C9 with an arm
  // dropping from R6C8 to R8C8, drawn as two strokes of the same colour and
  // thickness meeting at the centre of R6C8, so the ink is one connected blue
  // figure. A branched line has no single path order, so its three segments --
  // the maximal connected pieces the box borders cut the figure into -- are
  // listed explicitly rather than walked by RegionSumLine. R6C8 is interior to
  // the box 6 piece: the ink inside box 6 is one connected run of three cells.
  new EqualSum(
    ['R6C4', 'R6C5', 'R6C6'],
    ['R6C7', 'R6C8', 'R6C9'],
    ['R7C8', 'R8C8'],
  ),
];
