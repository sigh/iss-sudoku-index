// Title: Delta Line
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=GgmXRnvENZ8
// Source: https://sudokupad.app/07innbtid1

// Rules: Normal sudoku rules apply. The 3x3 box borders divide the blue line
// into segments with the same sum. Adjacent digits along the line have a
// difference of at most 2.
//
// The blue line branches (it draws a "delta") and one part of it forms a
// closed 6-cell loop inside box 5, so it is not a single ordered path.
// Reconstructed from the raw waypoints as a cell-adjacency graph it has 35
// edges over 35 cells. SudokuPad splits a self-touching line into separate
// polyline entries at each cell the line revisits; each piece below is one
// of those entries, still a genuine ordered sub-path of the whole line, so a
// `Pair` per piece covers every adjacent-pair edge exactly once with no
// double-counting and no missing edge.
const lineDiffKey = Pair.fnToKey((a, b) => Math.abs(a - b) <= 2, 9);
const linePieces = [
  // Loops back through R4C5, closing the loop
  // R4C5-R4C6-R5C6-R6C5-R6C4-R5C4-R4C5.
  ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R2C5', 'R3C5',
    'R4C5', 'R4C6', 'R5C6', 'R6C5', 'R6C4', 'R5C4', 'R4C5'],
  ['R1C5', 'R1C4', 'R1C3', 'R2C3'],
  ['R5C4', 'R5C3', 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R9C2'],
  ['R5C6', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R5C7', 'R4C7'],
  ['R1C3', 'R1C2'],
  ['R8C9', 'R8C8'],
];

// The line cells lying in each 3x3 box, in reading order of the boxes
// (box 8 has no line cells and is omitted). Each box's line cells must sum
// to the same total; all eight sum to 21 in the known solution.
const boxSegments = [
  ['R1C3', 'R2C3', 'R1C2'],                                  // box 1
  ['R1C6', 'R1C5', 'R2C5', 'R3C5', 'R1C4'],                  // box 2
  ['R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'],                  // box 3
  ['R5C3', 'R5C2', 'R6C2'],                                  // box 4
  ['R4C5', 'R4C6', 'R5C6', 'R6C5', 'R6C4', 'R5C4'],          // box 5 (loop)
  ['R5C7', 'R6C7', 'R6C8', 'R6C9', 'R4C7'],                  // box 6
  ['R7C2', 'R7C3', 'R8C3', 'R9C2'],                          // box 7
  ['R7C9', 'R8C9', 'R9C9', 'R8C8'],                          // box 9
];

return [
  new Shape('9x9'),
  ...linePieces.map(cells => new Pair(lineDiffKey, 'Delta line', ...cells)),
  new EqualSum(...boxSegments),
];
