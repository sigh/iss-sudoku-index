// Title: In Bocca al Lupo
// Author: Jonny Kaufman
// Video: https://www.youtube.com/watch?v=vNl5-nyZIvA
// Source: https://app.crackingthecryptic.com/sudoku/NQ8tN82JH6

// Standard 9x9 sudoku, no givens. Digits along an arrow sum to the digit in
// its circle (Arrow, bulb cell first). Along a thermometer, digits strictly
// increase away from the bulb (Thermo, bulb cell first). Exactly one of the
// 9 boxes is a magic square: its 3 rows, 3 columns and 2 diagonals all sum
// to one common total. Which box is magic is not drawn or stated, so it is
// part of what the solver works out -- every box is a candidate, encoded as
// an Or over all 9. "Exactly one" (not "at least one") also requires every
// other box to fail the magic condition in that branch.
//
// A box's own all-different already forces its 9 cells to total 45, so if
// its 3 rows have one common sum S, 3S = 45 and S = 15; tying all 8
// segments together with one EqualSum therefore already forces the shared
// total to 15 without a separate assertion. The converse also holds: a box
// is NOT magic iff at least one of its 8 segments sums to something other
// than 15 -- encoded per segment as a 3-cell NFA over the running sum that
// accepts every total except 15, one Or of 8 such NFAs per box.

const graph = cellGraph('9x9');

// -- Arrows: bulb (white circle) cell first, per the drawn shaft direction
// and the white bulb overlay at each arrow's first path cell. --
const arrows = [
  new Arrow('R4C4', 'R4C3', 'R4C2'),
  new Arrow('R4C6', 'R4C7', 'R4C8'),
];

// -- Thermometers: bulb cell first. Transcribed from the drawn grey lines
// (interpolating each straight multi-cell run) and cross-checked against
// the grey bulb overlay sitting on every line's first cell. --
const thermoCells = [
  ['R1C1', 'R2C1'],
  ['R2C4', 'R1C4'],
  ['R2C5', 'R1C5'],
  ['R2C6', 'R1C6'],
  ['R1C9', 'R2C9'],
  ['R4C1', 'R3C2', 'R2C2', 'R1C2', 'R2C3', 'R3C4'],
  ['R4C9', 'R3C8', 'R2C8', 'R1C8', 'R2C7', 'R3C6'],
  ['R7C5', 'R6C5', 'R5C5', 'R4C5'],
  ['R5C8', 'R6C7', 'R7C6'],
  ['R6C8', 'R5C9', 'R6C9'],
  ['R6C1', 'R5C1', 'R6C2'],
  ['R8C5', 'R7C4', 'R6C3', 'R5C2'],
  ['R8C3', 'R7C2', 'R8C2'],
  ['R9C2', 'R8C1', 'R7C1'],
  ['R9C4', 'R9C3'],
  ['R9C7', 'R9C6', 'R9C5'],
  ['R8C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R8C8'],
];
const thermos = thermoCells.map(cells => new Thermo(...cells));

// -- Magic square (exactly one box) --

// A box's 3 rows, 3 columns and 2 diagonals, row-major from graph.box().
function boxSegments(boxIndex) {
  const b = graph.box(boxIndex);
  const rows = [b.slice(0, 3), b.slice(3, 6), b.slice(6, 9)];
  const cols = [0, 1, 2].map(c => [b[c], b[c + 3], b[c + 6]]);
  const diags = [[b[0], b[4], b[8]], [b[2], b[4], b[6]]];
  return [...rows, ...cols, ...diags];
}

// "This 3-cell segment's sum is not 15": running-sum NFA, depth-bounded to
// the 3 cells it is ever called with -- an unbounded running sum otherwise
// keeps generating new states forever and blows the compiler's state cap.
const sumNeq15Spec = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => sum + value,
  accept: sum => sum !== 15,
  maxDepth: 3,
}, 9);

function boxIsMagic(boxIndex) {
  return new EqualSum(...boxSegments(boxIndex));
}

// At least one of the 8 segments differs from 15 -- the sound complement of
// "all 8 equal 15" (== magic, given the box all-different forces the common
// sum to 15; see header comment).
function boxIsNotMagic(boxIndex) {
  const segments = boxSegments(boxIndex);
  return new Or(segments.map(
    (seg, i) => new NFA(sumNeq15Spec, 'segNeq15', ...seg)));
}

const BOXES = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const magicSquare = new Or(BOXES.map(magicBox => new And([
  boxIsMagic(magicBox),
  ...BOXES.filter(b => b !== magicBox).map(boxIsNotMagic),
])));

return [
  new Shape('9x9'),
  ...arrows,
  ...thermos,
  magicSquare,
];
