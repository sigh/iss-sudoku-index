// Title: Mods, Quads & Odds
// Author: Marty Sears & ThePedallingPianist
// Video: https://www.youtube.com/watch?v=h1wS5XtYpWE
// Source: https://sudokupad.app/gfr7xipywo

// Normal sudoku applies. Each turquoise Same Difference line has one common
// absolute difference on its consecutive edges. A grey circle is odd. Each
// invisible quad contains the four surrounding cell digits, and every digit
// occurrence in either kind of circle says how often that digit occurs among
// all circle contents.

// Turquoise paths transcribed from the source line data.
const SAME_DIFFERENCE_LINES = [
  ['R1C2', 'R2C1', 'R3C2'],
  ['R5C4', 'R6C4', 'R6C5'],
  ['R8C7', 'R9C8', 'R8C9'],
  ['R2C6', 'R3C6', 'R3C7', 'R4C7', 'R4C8'],
];

// One NFA state remembers the preceding digit and the line's first difference.
const sameDifferenceSpec = NFA.encodeSpec({
  startState: { previous: null, difference: null },
  transition: ({ previous, difference }, value) => {
    if (previous === null) return { previous: value, difference: null };
    const nextDifference = Math.abs(value - previous);
    if (difference !== null && nextDifference !== difference) return undefined;
    return { previous: value, difference: nextDifference };
  },
  accept: ({ difference }) => difference !== null,
}, 9);

// Grey circle positions from the source odd-clue data.
const ODD_CIRCLES = [
  'R2C2', 'R2C5', 'R2C8', 'R5C8', 'R5C5', 'R5C2', 'R9C1', 'R8C5', 'R8C8',
];

// Each row is a quad's four surrounding cells, in the source's row-major order.
const QUADS = [
  ['R1C4', 'R1C5', 'R2C4', 'R2C5'],
  ['R1C5', 'R1C6', 'R2C5', 'R2C6'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8'],
  ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
  ['R8C1', 'R8C2', 'R9C1', 'R9C2'],
];
const quadCells = QUADS.flat();
const quadLabels = new Var('Q', 'invisible quad digits', quadCells.length);
const quadLabelCells = quadLabels.cells();

// A label cell is one displayed digit in a quad: it equals its corresponding
// surrounding grid cell. Separate label cells retain repeated appearances when
// quads overlap, which is required by the global circle-count rule.
const quadContents = quadCells.map(
  (cell, i) => new SameValues(2, cell, quadLabelCells[i]));

return [
  new Shape('9x9'),
  quadLabels,
  ...SAME_DIFFERENCE_LINES.map(
    (cells, i) => new NFA(sameDifferenceSpec, `same difference ${i + 1}`, ...cells)),
  ...ODD_CIRCLES.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...quadContents,
  new CountingCircles(...ODD_CIRCLES, ...quadLabelCells),
];
