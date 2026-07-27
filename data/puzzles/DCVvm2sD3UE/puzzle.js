// Title: Bleeding Edge
// Author: Maggie & BremSter
// Video: https://www.youtube.com/watch?v=DCVvm2sD3UE
// Source: https://sudokupad.app/fdo/bleedingedge

// Normal sudoku (rows/cols/3x3 boxes all-different; regions in the payload
// are exactly the default boxes, so no explicit Region constraints needed).
//
// Arrow: digits on the arrow (line) sum to the digit in the circle; repeats
// allowed on the arrow if other rules allow (nothing else here forbids a
// repeat, so this is the default Arrow semantics -- no extra encoding).
// One circle (R5C5) has four arrows radiating from it, each with its own
// independent sum.
//
// German Whisper (green line): adjacent digits differ by >= 5 -- Whisper's
// default difference.
//
// Renban (purple line): digits on the line are a non-repeating set of
// consecutive digits, in any order.
//
// Line/arrow cell paths were recovered from the payload's wayPoints by
// interpolating through cell centres. Four short diagonal lines (three
// Whispers, one Renban, below) cover three cells each, not two: both of each
// segment's endpoints are cell centres that the stroke has been trimmed back
// from to clear arrow art -- 0.167 per axis at the start, where an arrow bends
// through that centre, and 0.333 per axis at the end, the wider clearance for
// an arrowhead glyph drawn at that centre. The same avoidance shows on the four
// long lines, which sidestep an arrowhead by a 1/6 perpendicular nudge yet
// still overshoot their terminal cell's centre. Trimming shortens a stroke, so
// a two-cell reading would need it to run nearly a full cell past the last
// claimed centre; the corner-adjacent cells carry zero stroke length and are
// genuine grazes.

const arrows = [
  new Arrow('R3C4', 'R2C3', 'R1C4'),
  new Arrow('R5C5', 'R4C6', 'R3C6', 'R2C6'),
  new Arrow('R5C5', 'R4C4', 'R4C3', 'R4C2'),
  new Arrow('R5C5', 'R6C4', 'R7C4', 'R8C4'),
  new Arrow('R5C5', 'R6C6', 'R6C7', 'R6C8'),
  new Arrow('R4C7', 'R3C8', 'R4C9'),
  new Arrow('R7C6', 'R8C7', 'R9C6'),
  new Arrow('R6C3', 'R7C2', 'R6C1'),
];

const whispers = [
  new Whisper('R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Whisper('R4C6', 'R5C7', 'R6C8'),
  new Whisper('R6C6', 'R7C5', 'R8C4'),
  new Whisper('R5C1', 'R6C1', 'R7C1', 'R8C1'),
  new Whisper('R4C4', 'R3C5', 'R2C6'),
];

const renbans = [
  new Renban('R6C4', 'R5C3', 'R4C2'),
  new Renban('R9C3', 'R9C4', 'R9C5', 'R9C6'),
  new Renban('R3C9', 'R4C9', 'R5C9', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...whispers,
  ...renbans,
];
