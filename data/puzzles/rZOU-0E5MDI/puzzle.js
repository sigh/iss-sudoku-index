// Title: Everything Is Wrogn
// Author: DiMono
// Video: https://www.youtube.com/watch?v=rZOU-0E5MDI
// Source: https://app.crackingthecryptic.com/sudoku/jL24HLphHb

// Normal sudoku rules (default rows/cols/boxes). Every named clue type is
// lying about the one property the video's rules text calls out; a family's
// other baseline properties (e.g. a cage's own distinctness) are not named as
// lies and are kept:
//   - Killer cage: digits stay distinct, but do NOT sum to the corner clue.
//   - Little killer: the diagonal does NOT sum to the outside clue.
//   - X / V: the joined cells do NOT sum to 10 / 5.
//   - Black kropki dot: neither joined cell is double the other.
//   - Maximum cell (blue): the cell is NOT greater than all 4 neighbours,
//     i.e. at least one neighbour is >= it.
//   - Quadruple circle: the 4 corner cells do NOT contain every printed
//     digit -- at least one printed digit is missing from the four cells
//     (they may still contain some of them).
//   - Palindrome line: the sequence does NOT equal its own reverse -- at
//     least one of the two mirrored cell pairs differs (the direct
//     grammatical negation of "reads the same forwards and backwards"; a
//     stronger "every mirrored pair differs" reading is not asserted by the
//     text and is not encoded).
//
// Thermometer: the rules explicitly restate that the therm still carries no
// repeated digit, but do not restate or relocate the monotonic-increase
// property once the drawn bulb is false -- and "still on the thermo" does not
// pin the true bulb to the opposite end, an interior cell, or any other
// specific cell. No digit or other clue settles which cell the true bulb is,
// so only the stated, direction-independent fact (all-different along the
// path) is encoded; the direction/order property is a declared omission.

// Wrong-sum NFA: the running sum, clamped at target+1, must NOT land on
// target once every cell in the clue is consumed (accepts every sum except
// the printed one). A 2-cell clue is just a Pair instead.
function notSumNFA(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, target + 1),
    accept: (sum) => sum !== target,
  }, 9);
}
function notSum(target, cells, name) {
  if (cells.length === 2) {
    const key = Pair.fnToKey((a, b) => a + b !== target, 9);
    return new Pair(key, name, ...cells);
  }
  return new NFA(notSumNFA(target), name, ...cells);
}

// Killer cages (cells transcribed from the drawn `cages` array; corner sum is
// the lie).
const cages = [
  [12, ['R1C5', 'R1C6']],
  [14, ['R2C7', 'R2C8']],
  [8, ['R3C8', 'R3C9']],
  [19, ['R8C8', 'R8C9', 'R9C8', 'R9C9']],
  [20, ['R7C5', 'R8C5', 'R9C5']],
  [9, ['R8C3', 'R8C4']],
  [9, ['R9C1', 'R9C2']],
  [24, ['R5C1', 'R5C2', 'R5C3']],
];

// Little killer diagonals (cells walked from the drawn off-grid arrow to the
// grid edge; printed total is the lie).
const littleKillers = [
  [5, ['R1C3', 'R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8', 'R7C9']],
  [13, ['R1C7', 'R2C8', 'R3C9']],
  [10, ['R1C8', 'R2C9']],
  [44, ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3']],
  [7, ['R9C2', 'R8C1']],
  [12, ['R9C3', 'R8C2', 'R7C1']],
  [10, ['R2C1', 'R1C2']],
];

// Thermometers (path cells transcribed from the drawn `lines`, walked from
// the drawn -- false -- bulb; only all-different is encoded, see header).
const thermos = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R3C4', 'R3C3', 'R3C2'],
  ['R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R5C5', 'R5C4', 'R4C4'],
];

// Palindrome line's two mirrored cell pairs (5-cell line, centre R6C3 unpaired).
const palindromePairs = [
  ['R4C2', 'R8C1'],
  ['R5C3', 'R7C2'],
];

// Maximum cells (blue) with their 4 orthogonal neighbours.
const maxCells = [
  ['R5C2', ['R4C2', 'R6C2', 'R5C1', 'R5C3']],
  ['R5C8', ['R4C8', 'R6C8', 'R5C7', 'R5C9']],
  ['R7C5', ['R6C5', 'R8C5', 'R7C4', 'R7C6']],
];

// X-marked edges (sum-to-10 is the lie).
const xEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R2C2'], ['R2C4', 'R2C5'], ['R2C5', 'R2C6'],
  ['R2C7', 'R3C7'], ['R3C8', 'R4C8'], ['R2C9', 'R3C9'], ['R1C9', 'R2C9'],
  ['R6C6', 'R7C6'], ['R7C6', 'R7C7'], ['R8C5', 'R8C6'], ['R9C6', 'R9C7'],
  ['R7C4', 'R8C4'], ['R8C4', 'R9C4'], ['R7C2', 'R8C2'], ['R8C2', 'R9C2'],
];

// V-marked edges (sum-to-5 is the lie).
const vEdges = [
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R2C3', 'R3C3'], ['R4C3', 'R4C4'],
  ['R6C3', 'R6C4'], ['R7C6', 'R8C6'], ['R9C5', 'R9C6'],
];

// Black kropki dot edges (2x-ratio is the lie). The payload draws two
// overlapping dot marks at the same centre on R1C3|R2C3 (same colour and
// position, only a size difference) -- read as one drawn dot.
const dotEdges = [
  ['R1C3', 'R2C3'], ['R3C5', 'R4C5'], ['R4C5', 'R5C5'], ['R4C5', 'R4C6'],
  ['R4C7', 'R5C7'], ['R6C4', 'R7C4'], ['R9C3', 'R9C4'], ['R8C2', 'R8C3'],
];

// Quadruple circles (contain-all is the lie): 4 corner cells, printed digits.
const quads = [
  [['R3C1', 'R3C2', 'R4C1', 'R4C2'], [3, 8, 9]],
  [['R5C1', 'R5C2', 'R6C1', 'R6C2'], [7, 8]],
  [['R5C6', 'R5C7', 'R6C6', 'R6C7'], [4, 7, 9]],
  [['R6C8', 'R6C9', 'R7C8', 'R7C9'], [3, 5, 7]],
  [['R4C8', 'R4C9', 'R5C8', 'R5C9'], [6, 7]],
  [['R8C6', 'R8C7', 'R9C6', 'R9C7'], [1, 2, 7]],
];

const notEqualKey = Pair.fnToKey((a, b) => a !== b, 9);
const notSum10Key = Pair.fnToKey((a, b) => a + b !== 10, 9);
const notSum5Key = Pair.fnToKey((a, b) => a + b !== 5, 9);
const notDoubleKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const leKey = Pair.fnToKey((a, b) => a <= b, 9);

const allValuesExcept = (d) => [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => v !== d);

return [
  new Shape('9x9'),

  // Killer cages: distinct, sum != corner clue.
  ...cages.flatMap(([sum, cells], i) => [
    new AllDifferent(...cells),
    notSum(sum, cells, `cage${i}-not-${sum}`),
  ]),

  // Little killers: diagonal sum != printed clue.
  ...littleKillers.map(([total, cells], i) =>
    notSum(total, cells, `lk${i}-not-${total}`)),

  // Thermometers: all-different only (order/direction omitted, see header).
  ...thermos.map((cells) => new AllDifferent(...cells)),

  // Palindrome: at least one mirrored pair differs.
  new Or(palindromePairs.map(([a, b]) =>
    new Pair(notEqualKey, 'palindrome-fails', a, b))),

  // Maximum cells: not greater than all 4 neighbours, i.e. some neighbour >=
  // the marked cell.
  ...maxCells.map(([cell, neighbours]) =>
    new Or(neighbours.map((n) =>
      new Pair(leKey, 'not-max', cell, n)))),

  // X marks: joined cells do not sum to 10.
  ...xEdges.map(([a, b]) => new Pair(notSum10Key, 'not-X', a, b)),

  // V marks: joined cells do not sum to 5.
  ...vEdges.map(([a, b]) => new Pair(notSum5Key, 'not-V', a, b)),

  // Black kropki dots: neither joined cell is double the other.
  ...dotEdges.map(([a, b]) => new Pair(notDoubleKey, 'not-double', a, b)),

  // Quadruple circles: at least one printed digit is absent from all 4 cells.
  ...quads.map(([cells, digits]) =>
    new Or(digits.map((d) =>
      new And(cells.map((c) => new Given(c, ...allValuesExcept(d))))))),
];
