// Title: Wrogn Answers Only
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=zihSVV9A4JM
// Source: https://app.crackingthecryptic.com/sudoku/4JT3tBgh32

// Normal sudoku rules apply and there are no given digits. Every drawn clue is
// "wrogn": the ordinary rule for that clue type must FAIL on that clue.
//   green line        at least one adjacent pair differs by less than 5
//   purple line       the digits do not form a consecutive, non-repeating set
//   thermometer       the digits do not increase from bulb to tip
//   arrow             the shaft digits do not sum to the circle digit
//   quadruple circle  at least one listed digit is absent from the four cells
//   V / X             the pair does not sum to 5 / to 10
//   white dot         the pair is not consecutive
//   black dot         the pair is not in a 1:2 ratio
// The rules allow repeats along lines and thermometers, so no all-different is
// imposed on them. Only drawn marks carry a rule; unmarked edges are free.

const NUM_VALUES = 9;
const ALL_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Adjacent cell pairs along a drawn path, in drawn order.
const stepPairs = (cells) => cells.slice(1).map((cell, i) => [cells[i], cell]);

// Pair keys. The first argument is the earlier cell of the pair.
const CLOSE = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, NUM_VALUES);
const NOT_ASCENDING = Pair.fnToKey((a, b) => a >= b, NUM_VALUES);
const NOT_SUM_5 = Pair.fnToKey((a, b) => a + b !== 5, NUM_VALUES);
const NOT_SUM_10 = Pair.fnToKey((a, b) => a + b !== 10, NUM_VALUES);
const NOT_CONSECUTIVE = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, NUM_VALUES);
const NOT_RATIO_1_2 = Pair.fnToKey(
  (a, b) => a !== 2 * b && b !== 2 * a, NUM_VALUES);

// --- Drawn clue geometry -----------------------------------------------
// Cell paths taken from the drawn strokes, in the order they are drawn.

// Green lines (#a3e048).
const GREEN_LINES = [
  ['R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R5C2', 'R6C2', 'R6C3', 'R7C3', 'R7C4'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R7C5', 'R7C6', 'R6C6', 'R6C7'],
  ['R4C7', 'R4C8', 'R3C8'],
  ['R6C8', 'R6C9', 'R7C9'],
];

// Purple lines (#d23be7).
const PURPLE_LINES = [
  ['R3C3', 'R3C4', 'R4C4', 'R4C5'],
  ['R4C3', 'R5C3', 'R5C4'],
  ['R6C8', 'R5C8', 'R5C9', 'R4C9'],
];

// Thermometers (grey strokes), bulb first.
const THERMOS = [
  ['R2C7', 'R1C7', 'R1C6', 'R1C5'],
  ['R9C7', 'R9C8', 'R9C9'],
];

// Arrows: [circle, ...shaft]. Both drawn arrows have a single shaft cell,
// one step diagonally from the circle.
const ARROWS = [
  ['R1C4', 'R2C3'],
  ['R8C6', 'R7C7'],
];

// Quadruple circles: [top-left cell of the 2x2 block, digits in the circle].
const QUADS = [
  ['R3C4', [4]],
  ['R4C1', [4]],
  ['R4C2', [4, 7]],
  ['R4C3', [1]],
  ['R4C4', [2]],
  ['R4C5', [2, 7]],
  ['R4C6', [2, 7]],
  ['R4C7', [9]],
  ['R4C8', [9]],
  ['R5C3', [9]],
  ['R5C4', [2]],
  ['R5C5', [2]],
  ['R6C1', [1]],
  ['R6C3', [1]],
  ['R6C5', [1]],
  ['R7C8', [1, 9]],
  ['R8C2', [1, 2]],
  ['R8C5', [1]],
];

// Edge marks, each as the pair of cells it separates.
const WHITE_DOTS = [
  ['R2C1', 'R3C1'], ['R5C1', 'R6C1'], ['R6C2', 'R7C2'], ['R5C3', 'R5C4'],
  ['R5C4', 'R6C4'], ['R6C4', 'R6C5'], ['R6C5', 'R6C6'], ['R5C6', 'R6C6'],
  ['R6C6', 'R7C6'], ['R3C8', 'R4C8'],
];
const BLACK_DOTS = [
  ['R1C4', 'R2C4'], ['R4C3', 'R5C3'], ['R4C5', 'R4C6'], ['R4C6', 'R5C6'],
  ['R7C3', 'R7C4'], ['R5C7', 'R5C8'], ['R5C8', 'R5C9'],
];
const V_MARKS = [
  ['R4C2', 'R4C3'], ['R5C4', 'R5C5'], ['R5C5', 'R6C5'], ['R6C6', 'R6C7'],
  ['R8C4', 'R9C4'],
];
const X_MARKS = [
  ['R6C1', 'R6C2'], ['R6C2', 'R6C3'], ['R7C2', 'R7C3'], ['R4C5', 'R5C5'],
  ['R5C5', 'R5C6'], ['R4C7', 'R4C8'], ['R4C8', 'R4C9'], ['R6C7', 'R7C7'],
  ['R6C8', 'R6C9'], ['R8C5', 'R8C6'], ['R8C6', 'R9C6'],
];

// --- Encoding ----------------------------------------------------------

// Green: some adjacent step is "close" (difference under 5).
const greenLines = GREEN_LINES.map(cells => new Or(
  stepPairs(cells).map(([a, b]) => new Pair(CLOSE, 'close', a, b))));

// Purple: the machine carries the set of digits seen so far as a bitmask.
// A repeated digit already breaks "non-repeating", so it moves to an
// absorbing state that always accepts. With no repeat the mask holds one bit
// per cell, and the line is a consecutive set exactly when those bits form a
// contiguous run -- which accept then rejects.
const isContiguous = (mask) => {
  const lowestBit = mask & -mask;
  return ((mask + lowestBit) & mask) === 0;
};
const notRenbanNFA = NFA.encodeSpec({
  startState: { mask: 0, repeated: false },
  transition: ({ mask, repeated }, value) => {
    if (repeated) return { mask: 0, repeated: true };
    const bit = 1 << (value - 1);
    if (mask & bit) return { mask: 0, repeated: true };
    return { mask: mask | bit, repeated: false };
  },
  accept: ({ mask, repeated }) => repeated || !isContiguous(mask),
}, NUM_VALUES);
const purpleLines = PURPLE_LINES.map(
  cells => new NFA(notRenbanNFA, 'not-renban', ...cells));

// Thermometer: some step from bulb to tip fails to increase.
const thermos = THERMOS.map(cells => new Or(
  stepPairs(cells).map(
    ([a, b]) => new Pair(NOT_ASCENDING, 'not-up', a, b))));

// Arrow: a one-cell shaft sums to its own digit, so the rule is that the
// shaft digit differs from the circle digit.
const arrows = ARROWS.map(
  ([circle, arm]) => new AllDifferent(circle, arm));

// Quadruple: at least one listed digit appears in none of the four cells.
// "Digit d is absent" is the four cells restricted to the other eight values.
const quadCells = (topLeft) => {
  const { row, col } = parseCellId(topLeft);
  return [
    makeCellId(row, col), makeCellId(row, col + 1),
    makeCellId(row + 1, col), makeCellId(row + 1, col + 1),
  ];
};
const digitAbsent = (cells, digit) => cells.map(
  cell => new Given(cell, ...ALL_VALUES.filter(v => v !== digit)));
const quads = QUADS.flatMap(([topLeft, digits]) => {
  const cells = quadCells(topLeft);
  // A single-digit circle leaves no choice: that digit is absent outright.
  if (digits.length === 1) return digitAbsent(cells, digits[0]);
  return [new Or(digits.map(d => new And(digitAbsent(cells, d))))];
});

const edgeMarks = [
  ...WHITE_DOTS.map(
    ([a, b]) => new Pair(NOT_CONSECUTIVE, 'not-consec', a, b)),
  ...BLACK_DOTS.map(([a, b]) => new Pair(NOT_RATIO_1_2, 'not-ratio', a, b)),
  ...V_MARKS.map(([a, b]) => new Pair(NOT_SUM_5, 'not-5', a, b)),
  ...X_MARKS.map(([a, b]) => new Pair(NOT_SUM_10, 'not-10', a, b)),
];

return [
  new Shape('9x9'),
  ...greenLines,
  ...purpleLines,
  ...thermos,
  ...arrows,
  ...quads,
  ...edgeMarks,
];
