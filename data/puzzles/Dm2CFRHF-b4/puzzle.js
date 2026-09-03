// Title: The Skyscraper Miracle
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Dm2CFRHF-b4
// Source: https://app.crackingthecryptic.com/sudoku/3M6L2364h2

// Rules:
//   Normal sudoku rules apply. Numbers in the grid represent the heights of
//   skyscrapers, and clues outside the grid indicate the number of skyscrapers
//   visible in that row or column, looking in that direction. The purple line
//   contains a non-repeating set of consecutive digits, in any order. On
//   thermometers, digits increase from the bulb. The gray line is a palindrome,
//   which contains the same sequence of digits in either direction. Digits in
//   cells separated by a V sum to 5. Digits in cells separated by an X sum to
//   10. Digits in cells separated by a white dot are consecutive. Digits in
//   cells separated by a black dot have a 1:2 ratio.
//
// No outside clue is printed: the clue cells themselves are empty, and every
// drawn marking (purple line, thermometer, palindrome, V, X, white dot, black
// dot) joins clue cells to each other or to the grid cell beside them. The
// clue cells are therefore modelled as two 9-cell Var columns, VL (left of the
// grid, each looking rightwards along its row) and VR (right of the grid, each
// looking leftwards). Only the left and right margins are drawn on; the top
// and bottom margins carry nothing but the four black corner squares, so no
// column clues exist.
//
// Nothing is omitted.

const shape = new Shape('9x9');
const leftClues = new Var('L', 'left skyscraper clues', 9);
const rightClues = new Var('R', 'right skyscraper clues', 9);

const rowCells = (row) => Array.from(
  { length: 9 }, (_, i) => makeCellId(row, i + 1));

// Skyscraper visibility with the clue as an unknown digit rather than a
// literal, so `Skyscraper` (which parseInts its clue) cannot be used.  The
// machine reads the clue cell first and then the row in viewing order.
// `need` counts down the still-unseen visible buildings, `max` is the tallest
// so far; a building is visible exactly when it beats `max`.  A visible
// building with `need` already 0 rejects, and `accept` demands `need === 0`,
// so the clue is matched exactly.
const skyscraperSpec = NFA.encodeSpec({
  startState: { need: null, max: 0 },
  transition: ({ need, max }, value) => {
    if (need === null) return { need: value, max: 0 };  // the clue cell
    if (value <= max) return { need, max };             // hidden behind `max`
    if (need === 0) return undefined;                   // one visible too many
    return { need: need - 1, max: value };
  },
  accept: ({ need }) => need === 0,
  maxDepth: 10,  // clue cell + 9 row cells
}, shape);

const skyscrapers = Array.from({ length: 9 }, (_, i) => {
  const row = i + 1;
  return [
    new NFA(skyscraperSpec, `left R${row}`,
      [leftClues.cell(row), ...rowCells(row)]),
    new NFA(skyscraperSpec, `right R${row}`,
      [rightClues.cell(row), ...rowCells(row).reverse()]),
  ];
}).flat();

// Drawn markings, read off the source geometry.  The grid occupies source
// R2C2-R10C10 of an 11x11 canvas, so source R<r>C1 is VL<r-1> and source
// R<r>C11 is VR<r-1>.
//   purple line   source R2C1-R10C1        all nine left clue cells
//   grey line     source R9C11-R9C10       VR8 with grid R8C9
//   grey thermo   bulb source R6C11-R5C11  VR5 to VR4
//   X             source R8C10|R8C11       grid R7C9 with VR7
//   v             source R7C10|R7C11       grid R6C9 with VR6
//   white dot     source R4C10|R4C11       grid R3C9 with VR3
//   black dot     source R3C10|R3C11       grid R2C9 with VR2
// The two grey lines are told apart by the bulb: only the R6C11-R5C11 line
// carries the grey circle at one end, so it is the thermometer and the
// bulbless R9C11-R9C10 line is the palindrome named in the rules.

// The dot/V/X classes accept adjacent cells only, and a clue cell is not
// adjacent to the grid, so each mark is a `Pair` over the same relation.
const pairKey = (fn) => Pair.fnToKey(fn, shape);

return [
  shape,
  leftClues,
  rightClues,
  ...skyscrapers,
  new Renban(...leftClues.cells()),
  new Palindrome(rightClues.cell(8), 'R8C9'),
  new Thermo(rightClues.cell(5), rightClues.cell(4)),
  new Pair(pairKey((a, b) => a + b === 10), 'X', 'R7C9', rightClues.cell(7)),
  new Pair(pairKey((a, b) => a + b === 5), 'V', 'R6C9', rightClues.cell(6)),
  new Pair(pairKey((a, b) => Math.abs(a - b) === 1), 'white dot',
    'R3C9', rightClues.cell(3)),
  new Pair(pairKey((a, b) => a === 2 * b || b === 2 * a), 'black dot',
    'R2C9', rightClues.cell(2)),
];
