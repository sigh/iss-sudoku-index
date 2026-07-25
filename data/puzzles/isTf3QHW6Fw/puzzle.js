// Title: Belt Buckle
// Author: Freegerator
// Video: https://www.youtube.com/watch?v=isTf3QHW6Fw
// Source: https://sudokupad.app/tudu3ha5wh

// Normal sudoku rules (standard 3x3 boxes). Texas Hollers: adjacent digits
// along a gold line differ by at least 6. Kropki dots: a black dot marks a
// 1:2 ratio pair, a white dot marks a consecutive pair; not all possible
// dots are marked (no negative inference from an absent dot).
//
// The gold drawing is five separate strokes; two of them (lines 0 and 1)
// meet end-to-end at R7C7, making that stroke pair one Y-branching line
// rather than a single path. Whisper only binds consecutive pairs within
// the cell list passed to it, so each drawn stroke is encoded as its own
// Whisper -- this reproduces every edge of the branch (R6C8-R7C7, R7C7-R8C6,
// R7C7-R6C6) without needing a merged cell order.

// Gold "Texas Hollers" strokes, one array per drawn line stroke.
const goldLines = [
  ['R2C8', 'R3C7', 'R4C7', 'R5C7', 'R6C8', 'R7C7', 'R8C6', 'R7C5', 'R7C4', 'R8C3'],
  ['R7C7', 'R6C6'],
  ['R8C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R5C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C5'],
  ['R1C1', 'R2C2', 'R3C3'],
];

// Kropki dot edges, split by drawn fill: solid-black fill = black dot,
// white fill with black border = white dot.
const blackDotEdges = [
  ['R6C1', 'R7C1'],
  ['R7C2', 'R7C3'],
];
const whiteDotEdges = [
  ['R3C4', 'R3C5'],
  ['R3C2', 'R4C2'],
  ['R4C6', 'R5C6'],
  ['R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),

  ...goldLines.map(cells => new Whisper(6, ...cells)),

  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
];
