// Title: One with the Circus
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=39OGqArhPFY
// Source: https://sudokupad.app/5luwmmvgku

// Normal Sudoku, the given, and the 38 circles from the drawn circle markers.
// Each circle is red (1), green (2), or blue (3). Adjacent circles differ;
// a circle's digit counts matching digits among all circles of its own colour.
const circleCells = [
  'R2C6', 'R2C8',
  'R3C6', 'R3C7', 'R3C8', 'R3C9',
  'R4C6', 'R4C7', 'R4C9',
  'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C5', 'R6C6', 'R6C8', 'R6C9',
  'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8',
  'R9C6', 'R9C7', 'R9C8', 'R9C9',
];
const circleColourVars = new Var('VC', 'circle colours', circleCells.length);
const colourOf = Object.fromEntries(circleCells.map((cell, i) => [cell, circleColourVars.cell(i + 1)]));
const circleColours = circleCells.map(cell => colourOf[cell]);
const circlePairs = circleCells.flatMap((cell, i) => {
  const { row, col } = parseCellId(cell);
  return circleCells.slice(i + 1).filter(other => {
    const point = parseCellId(other);
    return Math.abs(point.row - row) + Math.abs(point.col - col) === 1;
  }).map(other => [cell, other]);
});

// The NFA reads a circle's digit and colour, then every digit/colour pair.
// Its state stores the requested digit and colour, and counts only matching pairs.
const colourCountNFA = NFA.encodeSpec({
  startState: { digit: null, colour: null, pendingDigit: null, count: 0 },
  transition: (state, value) => {
    if (state.digit === null) return { ...state, digit: value };
    if (state.colour === null) return value <= 3 ? { ...state, colour: value } : undefined;
    if (state.pendingDigit === null) return { ...state, pendingDigit: value };
    if (value > 3) return undefined;
    const count = state.count + +(state.pendingDigit === state.digit && value === state.colour);
    return count <= state.digit ? { ...state, pendingDigit: null, count } : undefined;
  },
  accept: state => state.pendingDigit === null && state.count === state.digit,
}, 9);
const colourCounts = circleCells.map(cell => new NFA(
  colourCountNFA,
  'circle colour count',
  cell, colourOf[cell], ...circleCells.flatMap(other => [other, colourOf[other]]),
));

return [
  new Shape('9x9'),
  circleColourVars,
  new Given('R2C2', 1),
  ...circleColours.map(cell => new Given(cell, 1, 2, 3)),
  // The red and green fills on these three drawn circles are pre-coloured clues.
  new Given(colourOf.R3C7, 1), new Given(colourOf.R3C9, 1), new Given(colourOf.R6C9, 2),
  ...circlePairs.map(([a, b]) => new AllDifferent(colourOf[a], colourOf[b])),
  ...colourCounts,
];
