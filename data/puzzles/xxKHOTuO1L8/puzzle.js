// Title: Chuy the "Frisbee Detective"
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=xxKHOTuO1L8
// Source: https://sudokupad.app/sandra-and-nala/chuy-the-frisbee-detective

// Normal 9x9 sudoku, no givens. Rules encoded below:
//
// - If an arrow is present in a cell, the digit in the cell the arrow comes from
//   appears in the grid in the direction of the arrow at a distance of N cells,
//   where N is the digit in the arrow's cell.
// - Each line is a palindrome; each palindrome has its own colour, and
//   same-colour strokes are one connected palindrome. R4C2 is the only cell that
//   a line enters more than once.
// - White dot = consecutive, black dot = 1:2 ratio. Not all dots are given, so
//   there is no negative dot constraint.
//
// Not encoded, because they do not restrict the finished grid: the fog and the
// two FOGLIGHT cells (R3C4, R4C3) are reveal mechanics, and the four frisbee
// glyphs drawn over R2C1, R4C7, R6C7 and R8C1 are theme art.

const graph = cellGraph('9x9');

// The ten arrow glyphs, transcribed from the drawing. Each is drawn as an L: the
// shaft begins just inside one cell edge, naming the neighbour it comes from,
// bends once, and the head points along the perpendicular centre line. The rules'
// worked example describes the R3C4 glyph -- pointing left, taking the digit
// below it in R4C4 -- which fixes this reading of "the cell the arrow comes from".
// [arrow cell, cell it comes from, heading]
const arrows = [
  ['R1C1', 'R2C1', 'E'],
  ['R4C2', 'R4C3', 'N'],
  ['R4C3', 'R4C4', 'N'],
  ['R3C4', 'R4C4', 'W'],
  ['R4C6', 'R4C7', 'S'],
  ['R2C8', 'R3C8', 'W'],
  ['R2C9', 'R2C8', 'S'],
  ['R5C9', 'R4C9', 'W'],
  ['R7C7', 'R6C7', 'W'],
  ['R7C1', 'R8C1', 'E'],
];

const HEADINGS = { N: [-1, 0], S: [1, 0], E: [0, 1], W: [0, -1] };

// One branch per digit N whose copy lands on the grid: the arrow cell holds N and
// the cell N steps along the heading repeats the source digit. Digits that would
// put the copy off the grid get no branch, which is the "appears in the grid"
// half of the rule.
const arrowCopies = arrows.map(([cell, source, heading]) => {
  const [dR, dC] = HEADINGS[heading];
  const branches = [];
  for (let n = 1; n <= 9; n++) {
    const target = graph.step(cell, dR * n, dC * n);
    if (target === null) break;
    branches.push(new And([
      new Given(cell, n),
      new SameValues(2, target, source),
    ]));
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),

  // Light-blue palindrome. The three light-blue strokes form one closed loop:
  // the long stroke runs R3C1 to R5C3, and two stubs join those ends through
  // R4C2. The list starts and ends at R4C2 to close the loop there, which is the
  // cell the rules name as the only one entered more than once.
  new Palindrome('R4C2', 'R3C1', 'R2C2', 'R3C3', 'R2C3', 'R2C4', 'R3C5',
    'R4C4', 'R5C4', 'R5C3', 'R4C2'),
  // Pink palindrome, a single stroke.
  new Palindrome('R6C7', 'R6C8', 'R7C7', 'R8C7', 'R9C8'),

  // Kropki dots, transcribed from the edge marks: white-filled dots first.
  new WhiteDot('R3C2', 'R3C3'),
  new WhiteDot('R5C9', 'R6C9'),
  new WhiteDot('R7C3', 'R7C4'),
  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R2C1', 'R2C2'),
  new BlackDot('R3C7', 'R4C7'),
  new BlackDot('R8C7', 'R9C7'),

  ...arrowCopies,
];
