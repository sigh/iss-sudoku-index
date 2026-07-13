// Title: Einstein Sudoku
// Author: Synergenesis and mbumbee
// Video: https://www.youtube.com/watch?v=oyjQPDL4BjE
// Source: https://sudokupad.app/dyg2otjpgb

// Rules:
// Normal sudoku rules apply. V/X pairs sum to 5/10. A green line is a German
// whisper (adjacent cells differ by >= 5). A purple line is a renban
// (consecutive digits, any order). A thermometer strictly increases from its
// bulb. An arrow sums to the digit in its connected circle. A black dot is a
// 1:2 (kropki) ratio. A quadruple circle marked "9" means one of its four
// cells contains a 9.
//
// In addition, every digit 1-9 has a unique favorite color (from: red,
// orange, yellow, green, blue, purple, pink, brown, silver) and a unique
// favorite shape (from: circle, triangle, square, star, diamond, heart,
// crescent, cross, pentagon). A digit may only occupy a cell decorated with
// its favorite color and/or shape. Six clues (encoded below as constraints
// on the favorite-color/-shape assignment) and the decorated cells shown in
// the grid pin the assignment down together with the grid itself:
//   1. Digit 1's favorite shape is not a heart.
//   2. Four digits have a value equal to the letter-count of their favorite
//      color. Only digits 3-6 can ever match this (color letter-counts run
//      3..6: red=3, blue/pink=4, green/brown=5, orange/yellow/purple/silver=6)
//      so "four digits match" forces all of digits 3,4,5,6 to match.
//   3. The digit whose favorite color is yellow has the star shape.
//   4. The pentagon shape belongs to an even digit.
//   5. The digit whose favorite color is silver is greater than six.
//   6. (Omitted: the purple digit is never orthogonally adjacent to two
//      equal neighbors at once.)

const COLOR_INDEX = {
  red: 1, orange: 2, yellow: 3, green: 4, blue: 5,
  purple: 6, pink: 7, brown: 8, silver: 9,
};
const SHAPE_INDEX = {
  circle: 1, triangle: 2, square: 3, star: 4, diamond: 5,
  heart: 6, crescent: 7, cross: 8, pentagon: 9,
};

// --- Favorite color / favorite shape assignment ---
// VC1..VC9: the color index (see COLOR_INDEX) of digit d's favorite color.
// VS1..VS9: the shape index (see SHAPE_INDEX) of digit d's favorite shape.
// Both are bijections (every color/shape belongs to exactly one digit).
const colorVar = new Var('C', 'FavoriteColor', 9);
const shapeVar = new Var('S', 'FavoriteShape', 9);

// Link a decorated grid cell to the favorite-color/-shape arrays: whichever
// digit ends up in `cell`, that digit's color/shape var must equal `target`.
// Modeled as a state machine reading [cell, array[1]..array[9]]: cell's own
// value selects the position to check against `target`.
function linkCellToArray(cell, arrayVar, target, label) {
  const spec = NFA.encodeSpec({
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, i: 0, ok: true };
      // Once we're past every possible target position (1-9), nothing
      // further can change `ok`: freeze the state so the compiler's state
      // space stays finite regardless of how many cells this gets applied to.
      if (state.i >= 9) return state;
      const i = state.i + 1;
      const ok = state.ok && (i !== state.target || value === target);
      return { target: state.target, i, ok };
    },
    accept: (state) => state !== null && state.ok,
  }, 9);
  return new NFA(spec, label, cell, ...arrayVar.cells());
}

const colorGivenCells = [
  ['R1C1', 'red'], ['R7C9', 'red'],
  ['R1C5', 'blue'], ['R6C1', 'blue'],
  ['R2C7', 'green'],
  ['R2C8', 'orange'],
  ['R3C6', 'brown'],
  ['R9C2', 'pink'],
];

const shapeGivenCells = [
  ['R1C4', 'crescent'], ['R4C1', 'crescent'],
  ['R4C9', 'star'],
  ['R5C9', 'diamond'],
  ['R6C9', 'heart'],
  ['R9C9', 'triangle'],
  ['R9C5', 'square'],
  ['R9C6', 'circle'], ['R4C5', 'circle'],
  ['R5C1', 'cross'],
  ['R3C7', 'pentagon'],
];

// Clue 3: whichever digit's color is yellow has the star shape.
const yellowImpliesStarKey = Pair.fnToKey(
  (color, shape) => color !== COLOR_INDEX.yellow || shape === SHAPE_INDEX.star, 9);

return [
  new Shape('9x9'),

  new V('R2C1', 'R2C2'),
  new X('R1C4', 'R1C5'),
  new BlackDot('R8C2', 'R9C2'),
  new Quad('R8C5', 9),
  new Whisper(5, 'R2C8', 'R2C7', 'R3C7'),
  new Renban('R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Thermo('R5C8', 'R4C8'),
  new Arrow('R6C5', 'R5C5', 'R5C6'),

  colorVar,
  shapeVar,
  new AllDifferent(...colorVar.cells()),
  new AllDifferent(...shapeVar.cells()),

  // Clue 1: digit 1's shape isn't heart(6).
  new Given(shapeVar.cell(1), 1, 2, 3, 4, 5, 7, 8, 9),

  // Clue 2 (derived, see header comment): forced color for digits 3-6.
  new Given(colorVar.cell(3), COLOR_INDEX.red),
  new Given(colorVar.cell(4), COLOR_INDEX.blue, COLOR_INDEX.pink),
  new Given(colorVar.cell(5), COLOR_INDEX.green, COLOR_INDEX.brown),
  new Given(colorVar.cell(6),
    COLOR_INDEX.orange, COLOR_INDEX.yellow, COLOR_INDEX.purple, COLOR_INDEX.silver),

  ...Array.from({ length: 9 }, (_, i) => i + 1).map(d =>
    new Pair(
      yellowImpliesStarKey, 'YellowIsStar', colorVar.cell(d), shapeVar.cell(d))),

  // Clue 4: pentagon shape belongs to an even digit -- odd digits can't have it.
  ...[1, 3, 5, 7, 9].map(d =>
    new Given(shapeVar.cell(d), 1, 2, 3, 4, 5, 6, 7, 8)),

  // Clue 5: silver digit is greater than six -- digits 1-6 can't be silver.
  ...Array.from({ length: 6 }, (_, i) => i + 1).map(d =>
    new Given(colorVar.cell(d), 1, 2, 3, 4, 5, 6, 7, 8)),

  ...colorGivenCells.map(([cell, color]) =>
    linkCellToArray(cell, colorVar, COLOR_INDEX[color], `Color_${color}`)),

  ...shapeGivenCells.map(([cell, shape]) =>
    linkCellToArray(cell, shapeVar, SHAPE_INDEX[shape], `Shape_${shape}`)),
];
