// Title: Killer Whispers
// Author: David Storrs
// Video: https://www.youtube.com/watch?v=FtR_Qtg62b0
// Source: https://sudokupad.app/oi12bomld9

// Normal sudoku rules apply, no givens. GERMAN WHISPERS: adjacent digits on a
// green line must differ by at least 5. KILLER WHISPERS: digits on a green
// line sum to the number in the attached box, if given.
//
// The source draws each green line as one or more separate polyline strokes;
// at four cells two strokes meet and share that cell (a branch point), rather
// than forming a single simple path. Every stroke is encoded as its own
// Whisper so every consecutive-cell pair (including each stroke's own share
// of a branch cell) gets the difference-5 rule, exactly matching the drawn
// geometry. Where a sum badge is attached, a separate Sum constraint totals
// every cell touched by that line (all of its strokes together, without
// requiring the cells to be distinct -- the rules text does not ask for
// that, and 'Sum' vs 'Cage' lets the encoding avoid inventing an extra
// all-different rule). Validated against the known solution: all nine
// whisper-difference lines and all four attached sums are satisfied. Nothing
// is omitted.

// Each drawn stroke, exactly as it appears in the source (order along the
// stroke matters only for which pairs are "adjacent"; closed loops repeat
// their first cell at the end to include the closing edge).
const strokes = [
  // Top-left closed loop (sum 22).
  ['R1C1', 'R1C2', 'R2C2', 'R2C1', 'R1C1'],
  // Top-right corner, two strokes sharing R1C8.
  ['R2C9', 'R1C8', 'R1C9'],
  ['R1C8', 'R2C8'],
  // Bottom-right corner, two strokes sharing R9C9.
  ['R8C8', 'R9C9', 'R8C9'],
  ['R9C9', 'R9C8'],
  // Bottom-left open path (sum 23).
  ['R8C1', 'R8C2', 'R9C2', 'R9C1'],
  // Centre, two strokes sharing R5C5 (sum 18).
  ['R6C4', 'R5C5', 'R6C5'],
  ['R5C5', 'R5C4'],
  // Right side.
  ['R6C9', 'R7C9', 'R7C8'],
  // Left side.
  ['R6C1', 'R6C2', 'R7C2'],
  // Top-middle.
  ['R1C4', 'R2C4'],
  // Big ring around the centre box, closed loop (sum 88).
  ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C6',
    'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R7C4'],
];

// Attached killer sums, one per green-line group (all of its strokes'
// cells, deduplicated).
const sums = [
  [22, ['R1C1', 'R1C2', 'R2C2', 'R2C1']],
  [23, ['R8C1', 'R8C2', 'R9C2', 'R9C1']],
  [18, ['R6C4', 'R5C5', 'R6C5', 'R5C4']],
  [88, ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7',
    'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3']],
];

return [
  new Shape('9x9'),
  ...strokes.map(stroke => new Whisper(...stroke)),
  ...sums.map(([sum, cells]) => new Sum(sum, ...cells)),
];
