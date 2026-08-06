// Title: Copycat
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=AbM6qwJqfUk
// Source: https://sudokupad.app/myxmj3f1g9

// Rules encoded, in full:
//  - Normal Sudoku.
//  - The grey line is a palindrome: its digits read the same both ways.
//  - The lavender line is a zipper line: digits an equal distance from the
//    centre of the line sum to the digit in the middle of the line.
//  - Copycat: the two lines have the same composition of digits, in any order.
//  - Kropki: a white dot means the two cells differ by 1, a black dot means
//    they are in a 2:1 ratio. Not all dots are drawn, so undrawn edges are
//    unconstrained and no strict/negative Kropki rule applies.
// Nothing is omitted. The lavender circle at R5C8 sits on the middle cell of
// the lavender line and marks the zipper's centre; the rules give circles no
// meaning of their own, so it adds no constraint.

// Drawn geometry, transcribed from the grey stroke.
const palindrome = [
  'R9C1', 'R8C1', 'R8C2', 'R7C3', 'R6C3', 'R5C2', 'R4C2', 'R3C3',
  'R2C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C8', 'R2C9'];

// The lavender line is drawn as three strokes, transcribed here as drawn.
const zipperStrokes = [
  ['R4C4', 'R3C4', 'R3C5', 'R3C6', 'R2C7'],
  ['R2C7', 'R3C7', 'R4C7', 'R5C8', 'R6C8', 'R7C7', 'R8C7'],
  ['R8C3', 'R7C4', 'R8C5', 'R9C6', 'R8C7'],
];

// Chain the strokes end to end. Each later stroke shares exactly one cell with
// the growing path, at that path's current end, so it is appended in whichever
// orientation puts the shared cell first; the shared cell is not repeated. Only
// R2C7 and R8C7 are shared by any two strokes, so this join is the only one
// available and R4C4 / R8C3 are the resulting free ends.
const zipper = zipperStrokes.reduce((path, stroke) => {
  const end = path[path.length - 1];
  if (stroke[0] === end) return path.concat(stroke.slice(1));
  if (stroke[stroke.length - 1] === end) {
    return path.concat(stroke.slice(0, -1).reverse());
  }
  throw new Error(`stroke does not attach at ${end}`);
});

// The joined path has 15 cells, so Zipper's centre is its 8th cell, R5C8 --
// the circled cell. Zipper takes the whole line and pairs cells inward from
// the two ends; for an odd-length line the middle digit is the pair sum.
// SameValues splits its cell list into `numSets` equal blocks (15 cells each
// here) and requires the blocks to hold the same values with the same
// multiplicities, in any order -- the Copycat rule.
return [
  new Shape('9x9'),
  new Palindrome(...palindrome),
  new Zipper(...zipper),
  new SameValues(2, ...palindrome, ...zipper),
  new WhiteDot('R5C5', 'R5C6'),
  new BlackDot('R2C5', 'R3C5'),
  new BlackDot('R3C7', 'R3C8'),
];
