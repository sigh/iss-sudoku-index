// Title: Massive W, Little L
// Author: Mr.Menace
// Video: https://www.youtube.com/watch?v=Lw7SG_Hjg-Q
// Source: https://sudokupad.app/rdahf4598m

// Normal sudoku rules apply (standard 3x3 boxes; no jigsaw regions drawn).
//
// "Colored lines are disconnected palindromes. Identically colored lines
// contain the same sequence of digits in the same order. They may be read in
// any direction.": a same-colored pair of strokes is one palindrome split
// into two disconnected pieces. Each stroke's waypoint order in the source is
// an artifact of which end the setter happened to draw first, not a fixed
// reading direction -- confirmed by the art, since every line's two endpoints
// carry the same overlay marker (both shape-marked or both circle-marked;
// nothing distinguishes one end from the other). So which end of stroke A
// joins which end of stroke B is not recoverable, and either join is a
// legitimate way to read "same sequence... any direction": matching stroke A
// position-for-position against stroke B as stored, or against stroke B
// reversed. Both pairings are encoded per color as an `Or` of the two whole-
// line orientations (never mixed position-by-position), independently per
// pair.
//
// The two lightsteelblue lines' raw wayPoints each end by revisiting an
// interior waypoint (a SudokuPad bent-stroke export artifact). The trimmed
// path used below (dropping the trailing revisit) lands exactly on the two
// small circle overlays drawn as that line's endpoints.

const pink = [
  ['R8C1', 'R9C1', 'R8C2', 'R9C2', 'R8C3'],
  ['R1C7', 'R2C8', 'R1C8', 'R2C9', 'R1C9'],
];
const yellow = [
  ['R2C6', 'R2C7', 'R3C7', 'R4C7'],
  ['R5C4', 'R6C3', 'R7C4', 'R8C5'],
];
const blue = [
  ['R3C4', 'R2C3', 'R2C2', 'R3C1'],
  ['R7C6', 'R8C7', 'R8C8', 'R7C9'],
];

const coloredLinePairs = [pink, yellow, blue];

// Either b matches a position-for-position, or b reversed does -- see the
// header comment for why the source's stroke order does not settle which.
const pairOrientation = (a, b) => new Or([
  new And(a.map((cell, i) => new SameValues(2, cell, b[i]))),
  new And(a.map((cell, i) => new SameValues(2, cell, b[b.length - 1 - i]))),
]);

const sameSequence = coloredLinePairs.map(([a, b]) => pairOrientation(a, b));

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C4', 2),
  new Given('R3C3', 4),
  new Given('R4C3', 7),
  new Given('R5C2', 5),
  new Given('R5C8', 6),
  new Given('R6C9', 8),
  new Given('R7C7', 2),
  new Given('R9C6', 1),
  new Given('R9C9', 3),

  ...sameSequence,
];
