// Title: The Mystery Of The Three Chameleons
// Author: The Pi Guy
// Video: https://www.youtube.com/watch?v=njbxaVs-HgA
// Source: https://sudokupad.app/5or0u7cv0o

// Normal sudoku rules apply.
//
// Every digit has a "value" equal to itself, except 7, 8, and 9 (the
// chameleons): a 7's value is its own row (1-9), an 8's value is its own
// column (1-9), a 9's value is its own box (1-9, boxes numbered left to
// right, top to bottom). Arrows, black dots, German whispers lines, and
// renban lines all constrain these derived values, not the raw digits.
//
// Encoding: give every cell touched by a value-based clue a parallel
// "chameleon value" Var, bound to the grid digit by a custom Pair keyed on
// that cell's own row/column/box (row/col/box each differ per cell, so each
// binding is its own truth table). Native Arrow/Whisper/Renban accept Var
// ids directly (they only walk cells in argument order, no adjacency
// check), so they can be re-pointed at the value Vars unchanged. BlackDot
// cannot: it requires real grid adjacency (VALIDATE_CELLS_FN checks
// geometry.cellGraph()) and Var cells aren't part of that graph, so black
// dots are hand-decomposed with the same Pair primitive instead.

const graph = cellGraph('9x9');
const boxOf = (row, col) => 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;

// Every cell referenced by an arrow, dot, whisper, or renban clue, in
// row-major order (only these need a chameleon-value Var).
const clueCells = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8',
  'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C8',
  'R3C1', 'R3C2', 'R3C6', 'R3C8',
  'R4C2', 'R4C3', 'R4C7', 'R4C8', 'R4C9',
  'R5C2', 'R5C3', 'R5C4', 'R5C5',
  'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6',
  'R7C2', 'R7C6',
  'R8C4', 'R8C5', 'R8C7', 'R8C8', 'R8C9',
  'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];
const values = graph.makeOverlay('VV', clueCells);
const val = cell => values.at(cell);

// Bind each clue cell's value Var to its digit: 1-6 keep their digit, 7/8/9
// take the cell's own row/column/box number.
const chameleonBindings = clueCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const box = boxOf(row, col);
  const key = Pair.fnToKey(
    (digit, value) => value === (
      digit === 7 ? row : digit === 8 ? col : digit === 9 ? box : digit),
    9);
  return new Pair(key, `chameleon value ${cell}`, cell, val(cell));
});

// Arrows: shaft values sum to the circle's value. (circle cell, then shaft)
const arrows = [
  new Arrow(val('R3C1'), val('R2C1'), val('R1C1')),
  new Arrow(val('R6C3'), val('R5C3'), val('R4C3')),
  new Arrow(val('R8C7'), val('R8C8'), val('R8C9')),
];

// Black dots: one value double the other. Decomposed by hand (see header)
// since BlackDot requires real grid adjacency, which Var cells don't have.
const doubleKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const dots = [
  ['R1C3', 'R2C3'],
  ['R1C4', 'R2C4'],
  ['R1C5', 'R2C5'],
  ['R1C7', 'R1C8'],
  ['R5C4', 'R5C5'],
  ['R6C4', 'R6C5'],
];
const blackDots = dots.map(([a, b]) =>
  new Pair(doubleKey, `chameleon black dot ${a}/${b}`, val(a), val(b))
);

// German whispers lines: adjacent values at least 5 apart (default difference).
const whispers = [
  new Whisper(
    val('R9C2'), val('R9C3'), val('R9C4'), val('R9C5'),
    val('R9C6'), val('R9C7'), val('R9C8'), val('R9C9')),
  new Whisper(val('R4C7'), val('R4C8'), val('R4C9')),
  new Whisper(val('R6C6'), val('R7C6')),
];

// Renban lines: consecutive run, no repeats, in any order.
const renbans = [
  new Renban(
    val('R1C2'), val('R2C2'), val('R3C2'), val('R4C2'),
    val('R5C2'), val('R6C2'), val('R7C2')),
  new Renban(val('R1C6'), val('R2C6'), val('R3C6')),
  new Renban(val('R2C8'), val('R3C8')),
  new Renban(val('R8C4'), val('R8C5')),
];

return [
  new Shape('9x9'),
  new Given('R4C6', 5),
  values.toVar('chameleon value'),

  ...chameleonBindings,

  ...arrows,

  ...blackDots,

  ...whispers,

  ...renbans,
];
