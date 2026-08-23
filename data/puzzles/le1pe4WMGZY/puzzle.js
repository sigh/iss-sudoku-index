// Title: Sunflower
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=le1pe4WMGZY
// Source: https://app.crackingthecryptic.com/sudoku/mnPm37QtDd

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// No digits are given. Anti-knight: AntiKnight. Twelve two-cell cages carry
// no printed total; all cages must share one common (unknown) total --
// EqualSum over the twelve segments. Every cage pair sits in the same row
// or column, so cage-internal distinctness is already forced by the
// baseline row/column constraints regardless of the "cage" convention.
// Orange dots mark pairs that are consecutive, in a 1:2 ratio, or both (an
// inclusive "or", not a choice of exactly one) -- a custom Pair relation
// combining the WhiteDot and BlackDot predicates.
const cages = [
  ['R2C3', 'R2C4'],
  ['R1C6', 'R2C6'],
  ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'],
  ['R5C6', 'R5C7'],
  ['R5C3', 'R5C4'],
  ['R4C1', 'R4C2'],
  ['R6C2', 'R7C2'],
  ['R8C4', 'R9C4'],
  ['R8C6', 'R8C7'],
  ['R6C8', 'R6C9'],
  ['R3C8', 'R4C8'],
];

const dotCells = [
  ['R1C1', 'R2C1'],
  ['R1C5', 'R2C5'],
  ['R8C5', 'R9C5'],
  ['R1C9', 'R2C9'],
  ['R3C6', 'R4C6'],
  ['R7C7', 'R7C8'],
];

const shape = new Shape('9x9');
const dotKey = Pair.fnToKey(
  (a, b) => a === b + 1 || a === b - 1 || a === 2 * b || b === 2 * a,
  shape);
const dots = dotCells.map(
  ([a, b]) => new Pair(dotKey, 'orange dot', a, b));

return [
  shape,
  new AntiKnight(),
  new EqualSum(...cages),
  ...dots,
];
