// Title: Einstein Sudoku
// Author: Synergenesis and mbumbee
// Video: https://www.youtube.com/watch?v=oyjQPDL4BjE
// Source: https://sudokupad.app/dyg2otjpgb

// Rules:
//   Normal sudoku rules apply. Cells separated by a V sum to 5, cells separated
//   by an X sum to 10. Cells along a green German whisper line are at least 5
//   apart. Cells along a purple renban line are consecutive digits in some
//   order. On a thermometer, digits increase from the bulb. Cells along an arrow
//   sum to the digit in the connected circle. Cells separated by a black kropki
//   dot are in ratio 1:2. The quadruple circle containing a 9 means one of the
//   four surrounding cells contains a 9.
//
//   In addition, every digit has a unique favourite colour and a unique
//   favourite shape. Colours are red, orange, yellow, green, blue, purple, pink,
//   brown and silver. Shapes are circle, triangle, square, star, diamond, heart,
//   crescent, cross and pentagon. A digit will only share a cell with its
//   favourite colour and/or shape. Six further clues:
//     1. The digit one's favourite shape is not a heart.
//     2. There are four digits whose value equals the number of letters in their
//        favourite colour.
//     3. The digit whose favourite colour is yellow has the star as its
//        favourite shape.
//     4. The pentagon is the favourite shape of an even digit.
//     5. The digit whose favourite colour is silver is greater than six.
//     6. The digit whose favourite colour is purple is never orthogonally
//        adjacent to two of the same number at once.
//   For clarity, R9C2 is a pink cell; the circles in the thermometer and arrow
//   are not shapes; a true circle is displayed in R4C5.
//
//   Nothing is omitted. There are no given digits.

const graph = cellGraph('9x9');

const COLOURS = [
  'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown',
  'silver',
];
const SHAPES = [
  'circle', 'triangle', 'square', 'star', 'diamond', 'heart', 'crescent',
  'cross', 'pentagon',
];

// Inverted mapping: one Var per colour / per shape, holding the digit that owns
// it. Drawn clues then read as a plain equality between a grid cell and a Var,
// and "unique favourite" is one AllDifferent over each group.
const colourOwner = new Var('VC', 'digit owning each colour', COLOURS.length);
const shapeOwner = new Var('VS', 'digit owning each shape', SHAPES.length);
const ownerOf = (list, group) => name => group.cell(list.indexOf(name) + 1);
const colour = ownerOf(COLOURS, colourOwner);
const shape = ownerOf(SHAPES, shapeOwner);

// Drawn full-cell background fills, read off the payload's underlays.
const COLOURED_CELLS = [
  ['R1C1', 'red'],
  ['R1C5', 'blue'],
  ['R2C7', 'green'],
  ['R2C8', 'orange'],
  ['R3C6', 'brown'],
  ['R6C1', 'blue'],
  ['R7C9', 'red'],
  ['R9C2', 'pink'],   // named as pink by the rules text
];

// Drawn cell-centred shape glyphs. The thermometer bulb (R5C8), the arrow bulb
// (R6C5) and the quadruple circle are excluded by the rules text; the remaining
// two circle glyphs, R4C5 and R9C6, are drawn identically to each other.
const SHAPE_CELLS = [
  ['R1C4', 'crescent'],
  ['R3C7', 'pentagon'],
  ['R4C1', 'crescent'],
  ['R4C5', 'circle'],
  ['R4C9', 'star'],
  ['R5C1', 'cross'],
  ['R5C9', 'diamond'],
  ['R6C9', 'heart'],
  ['R9C5', 'square'],
  ['R9C6', 'circle'],
  ['R9C9', 'triangle'],
];

// Clue 2: exactly four colours whose owning digit equals the colour's letter
// count. The machine reads the colour Vars in COLOURS order, so the state's
// `pos` names which colour's letter count the next value is compared against;
// `count` is clamped by rejecting a fifth match outright.
const LETTER_COUNTS = COLOURS.map(name => name.length);
const fourLetterCountMatches = NFA.encodeSpec({
  startState: { pos: 0, count: 0 },
  transition: ({ pos, count }, value) => {
    const next = count + (value === LETTER_COUNTS[pos] ? 1 : 0);
    return next > 4 ? undefined : { pos: pos + 1, count: next };
  },
  accept: ({ pos, count }) => pos === COLOURS.length && count === 4,
  maxDepth: COLOURS.length,
}, 9);

// Clue 6, stated per cell: whenever a cell holds the purple digit, no two of its
// orthogonal neighbours may be equal.
const notPurple = Pair.fnToKey((cellValue, purpleDigit) =>
  cellValue !== purpleDigit, 9);
const purpleNeighbourRule = cell => new Or([
  new Pair(notPurple, 'not the purple digit', cell, colour('purple')),
  new AllDifferent(...graph.neighbours(cell)),
]);

return [
  new Shape('9x9'),

  // --- sudoku layer ---
  new V('R2C1', 'R2C2'),
  new X('R1C4', 'R1C5'),
  new BlackDot('R8C2', 'R9C2'),
  new Quad('R8C5', 9),
  new Whisper(5, 'R2C8', 'R2C7', 'R3C7'),
  new Renban('R4C1', 'R5C1', 'R6C1', 'R7C1'),
  new Thermo('R5C8', 'R4C8'),        // bulb first; drawn tip-first in the source
  new Arrow('R6C5', 'R5C5', 'R5C6'), // bulb first, then the shaft

  // --- Einstein layer ---
  colourOwner,
  shapeOwner,
  new AllDifferent(...COLOURS.map(colour)),
  new AllDifferent(...SHAPES.map(shape)),

  ...COLOURED_CELLS.map(([cell, name]) => new SameValues(2, cell, colour(name))),
  ...SHAPE_CELLS.map(([cell, name]) => new SameValues(2, cell, shape(name))),

  new Given(shape('heart'), 2, 3, 4, 5, 6, 7, 8, 9),          // clue 1
  new NFA(fourLetterCountMatches, 'four letter-count matches', // clue 2
    ...COLOURS.map(colour)),
  new SameValues(2, colour('yellow'), shape('star')),          // clue 3
  new Given(shape('pentagon'), 2, 4, 6, 8),                    // clue 4
  new Given(colour('silver'), 7, 8, 9),                        // clue 5
  ...graph.cells().map(purpleNeighbourRule),                   // clue 6
];
