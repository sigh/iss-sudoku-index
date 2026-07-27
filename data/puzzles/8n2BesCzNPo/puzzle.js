// Title: Xmas
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=8n2BesCzNPo
// Source: https://sudokupad.app/vo44xbbb7i

// Normal sudoku rules apply (givens + default row/column/box constraints).
//
// Blue lines: RegionSumLine gives "equal sum in each box the line visits",
// splitting into separate same-box segments where a line re-enters a box.
// Green lines: Whisper(5) gives "adjacent difference >= 5" (the puzzle's
// stated minimum matches Whisper's default of 5).
//
// Cell orders below are transcribed in stroke-path order from the 10 drawn
// line strokes (order matters for RegionSumLine's same-box-segment
// grouping). Several strokes share an endpoint and together sketch the
// letters X, M, A, S -- a decorative flourish, not itself a rule. Two of
// the blue strokes (the ones sketching the top of the "X") meet at R3C5:
// since both are blue, they form one blue line split across two drawn
// strokes, so their cells are merged into a single RegionSumLine below
// (R2C4, from the second stroke, is spliced in right after R3C5, the
// shared vertex, landing it in the same box(0,1) run as R3C5/R2C6).
// Every other stroke only ever touches a stroke of the *other* colour, so
// it stays its own independent line.

const blueLines = [
  ['R6C9', 'R5C8', 'R6C7', 'R7C8'],                            // lines[0]
  ['R5C3', 'R4C4', 'R3C5', 'R2C4', 'R2C6', 'R1C7'],            // lines[1]+lines[2]
  ['R6C5', 'R7C4', 'R8C4', 'R9C4'],                            // lines[3]
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R7C2'],                    // lines[4]
];

const greenLines = [
  ['R1C3', 'R2C4'],                                    // lines[5]
  ['R3C5', 'R4C6', 'R5C7'],                            // lines[6]
  ['R7C8', 'R8C9', 'R9C8', 'R8C7'],                   // lines[7]
  ['R6C5', 'R7C6', 'R8C6', 'R9C6'],                   // lines[8]
  ['R7C2', 'R6C3', 'R7C3', 'R8C3', 'R9C3'],           // lines[9]
];

return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R5C2', 4),
  new Given('R8C8', 7),

  ...blueLines.map(cells => new RegionSumLine(...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
