// Title: Bent Into Shape
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=XyFPLcioEL4
// Source: https://sudokupad.app/djh35mkgjg

// Normal sudoku rules apply (standard rows/cols/boxes are the solver default).
//
// Orange lines: adjacent digits along an orange line differ by at least 4
// (Whisper(4)). Each line is drawn as a single bend, e.g. R1C2-R1C1-R2C1.
//
// White circles: each circle sits at the shared corner of a 2x2 block and
// shows 2-3 digits, drawn as small digits fanned around the corner point
// (their exact sub-position within the 2x2 is a rendering artifact, not a
// per-cell assignment). The rule "a digit in a white circle must appear
// once in the four surrounding cells" is the standard Quadruple clue: each
// listed digit is present somewhere among the 2x2's four cells.
// Quad(topLeftCell, ...values) expresses this directly; "exactly once"
// follows automatically from the box all-different, since each 2x2 lies
// inside a single box.
//
// Same-relative-position rule: "Any two cells which are in the same relative
// position within their respective 3x3 boxes must contain different digits."
// Encoded as one AllDifferent per relative position, built by transposing
// the 9 boxes (each box's cells in reading order) rather than hand-listing
// coordinates.
const graph = cellGraph('9x9');
const boxes = graph.boxes();
const relativePositionGroups = [];
for (let i = 0; i < 9; i++) {
  relativePositionGroups.push(
    new AllDifferent(...boxes.map(box => box[i])));
}

const whispers = [
  new Whisper(4, 'R1C2', 'R1C1', 'R2C1'),
  new Whisper(4, 'R2C4', 'R1C4', 'R1C5'),
  new Whisper(4, 'R1C8', 'R1C7', 'R2C7'),
  new Whisper(4, 'R4C8', 'R4C7', 'R5C7'),
  new Whisper(4, 'R4C5', 'R4C4', 'R5C4'),
  new Whisper(4, 'R4C2', 'R4C1', 'R5C1'),
  new Whisper(4, 'R7C2', 'R7C1', 'R8C1'),
  new Whisper(4, 'R7C5', 'R7C4', 'R8C4'),
  new Whisper(4, 'R7C8', 'R7C7', 'R8C7'),
];

// Quad values: taken as the unordered digit set drawn at each circle, per box:
//   R2C2 box: {3,5,6}   R8C8 box: {5,6}    R2C8 box: {4,7}
//   R8C2 box: {4,7}     R5C2 box: {1,2,9}  R5C8 box: {1,2,8}
//   R2C5 box: {2,8}     R5C5 box: {3,9}    R8C5 box: {7,9}
const quads = [
  new Quad('R2C2', 3, 5, 6),
  new Quad('R8C8', 5, 6),
  new Quad('R2C8', 4, 7),
  new Quad('R8C2', 4, 7),
  new Quad('R5C2', 1, 2, 9),
  new Quad('R5C8', 1, 2, 8),
  new Quad('R2C5', 2, 8),
  new Quad('R5C5', 3, 9),
  new Quad('R8C5', 7, 9),
];

return [
  new Shape('9x9'),
  ...relativePositionGroups,
  ...whispers,
  ...quads,
];
