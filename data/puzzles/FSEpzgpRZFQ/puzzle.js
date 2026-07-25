// Title: Bliss
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=FSEpzgpRZFQ
// Source: https://sudokupad.app/sz7ay5iw6l

// Normal sudoku rules apply. No given digits.
//
// Region sum lines: the 3x3 box borders divide each blue line into segments;
// the digits on each segment of the same line sum to the same total.

const regionSumLines = [
  // Cell paths transcribed from the drawn blue lines.
  new RegionSumLine('R5C1', 'R4C1', 'R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5'),
  new RegionSumLine(
    'R1C7', 'R1C6', 'R2C5', 'R3C4', 'R4C4', 'R4C3', 'R5C2', 'R6C1', 'R7C1'),
  new RegionSumLine('R7C2', 'R6C2', 'R5C3', 'R5C4'),
  new RegionSumLine('R4C5', 'R3C5', 'R2C6', 'R2C7'),
  new RegionSumLine('R9C6', 'R9C7', 'R8C8', 'R7C9', 'R6C9'),
  new RegionSumLine(
    'R8C2', 'R8C3', 'R7C4', 'R6C4', 'R5C5', 'R4C6', 'R4C7', 'R3C8', 'R3C9'),
  // This line is drawn as a closed loop that returns to its start cell:
  // R7C6-R7C7-R6C7-R5C7-R6C6-R7C5-R7C6. RegionSumLine takes a flat
  // cell list with no loop concept, and splits into a new segment whenever
  // the box changes -- so listing the drawn order verbatim (starting and
  // ending on R7C6) would count R7C6 twice, once alone and once merged into
  // a wrap-around segment with R7C5, corrupting the box-4,1 segment. The
  // loop only revisits one box (the one containing R7C5 and R7C6, which are
  // adjacent via the closing edge), so rotating the start away from that
  // box keeps the R7C5/R7C6 pair contiguous and each box crossing forms
  // exactly one segment.
  new RegionSumLine('R7C7', 'R6C7', 'R5C7', 'R6C6', 'R7C5', 'R7C6'),
];

return [
  new Shape('9x9'),
  ...regionSumLines,
];
