// Title: Equal Split Lines
// Author: gdc & sujoyku
// Video: https://www.youtube.com/watch?v=DmF0aF3UdTk
// Source: https://sudokupad.app/hk23d16b6f
//
// Normal sudoku rules apply.
// Dots divide each of the 8 drawn lines into 2-3 contiguous segments. All
// segments of one line must have equal digit sums, and digits may not repeat
// within a segment. Segment cell lists below are transcribed directly from
// the payload's hidden, no-total, unique-flagged cages (each cage is exactly
// one segment); consecutive cages that partition a line's drawn path, in
// path order, are that line's segments. Single-cell segments need no
// AllDifferent constraint, so they contribute only to the EqualSum group.

const lineSegments = [
  // A: R9C6-R8C6 . R7C7-R6C8 . R5C7-R4C6-R4C5-R5C4-R6C3
  [['R9C6', 'R8C6'], ['R7C7', 'R6C8'], ['R5C7', 'R4C6', 'R4C5', 'R5C4', 'R6C3']],
  // B: R6C7-R5C6 . R6C5-R7C6-R8C5-R9C5-R9C4
  [['R6C7', 'R5C6'], ['R6C5', 'R7C6', 'R8C5', 'R9C5', 'R9C4']],
  // C: R6C4 . R7C5-R8C4-R9C3
  [['R6C4'], ['R7C5', 'R8C4', 'R9C3']],
  // D: R8C8 . R7C9-R6C9
  [['R8C8'], ['R7C9', 'R6C9']],
  // E: R5C9-R5C8 . R4C7-R3C7
  [['R5C9', 'R5C8'], ['R4C7', 'R3C7']],
  // F: R3C8-R2C8-R2C7-R2C6-R3C6 . R3C5-R3C4 . R4C3-R5C2-R5C1
  [['R3C6', 'R2C6', 'R2C7', 'R2C8', 'R3C8'], ['R3C4', 'R3C5'], ['R5C1', 'R5C2', 'R4C3']],
  // G: R4C1-R3C1-R2C2 . R2C3 . R1C4-R1C5
  [['R4C1', 'R3C1', 'R2C2'], ['R2C3'], ['R1C4', 'R1C5']],
  // H: R6C2-R7C3 . R8C3-R8C2-R8C1 . R7C1-R6C1
  [['R7C3', 'R6C2'], ['R8C1', 'R8C2', 'R8C3'], ['R6C1', 'R7C1']],
];

const equalSums = lineSegments.map(segments => new EqualSum(...segments));

const segmentAllDifferents = lineSegments
  .flat()
  .filter(segment => segment.length > 1)
  .map(segment => new AllDifferent(...segment));

return [
  new Shape('9x9'),
  ...equalSums,
  ...segmentAllDifferents,
];
