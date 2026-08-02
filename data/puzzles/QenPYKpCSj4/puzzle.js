// Title: What Lies Beyond the Fog
// Author: ViKingPrime
// Video: https://www.youtube.com/watch?v=QenPYKpCSj4
// Source: https://sudokupad.app/Gr6P42rgHH

// Rules encoded here:
//  * Digits 0-9 go once each into every row, column and box. A row has nine
//    cells and ten digits, so exactly one cell per row, column and box is a
//    Schrodinger cell holding two digits.
//  * A cell's value is the sum of its digit(s). Every clue below except the
//    counting circles reads values, not digits.
//  * Eight clue kinds are drawn three times each; for each kind exactly two of
//    its three appearances hold and the third one fails:
//      - counting circles: each circled digit equals the number of circles
//        containing that digit;
//      - Dutch whisper (orange line): adjacent values differ by >= 4;
//      - German whisper (green line): adjacent values differ by >= 5;
//      - killer cage: values sum to the corner clue, digits do not repeat;
//      - white Kropki dot: consecutive values;
//      - black Kropki dot: values in a 1:2 ratio;
//      - X: values sum to 10;
//      - V: values sum to 5.
//    The rules text names six clue types but says each occurs exactly three
//    times; the drawing holds three orange lines, three green lines, three
//    cages, three circles, three white dots, three black dots, three X marks
//    and three V marks, so "Kropki" and "X/V" each cover two kinds of three.
//  * The fog and the fog light are display only and are not encoded.

// Model. The alphabet is widened to 0-15 to carry the auxiliary overlays:
//   main grid : one digit of the cell, 0-9.
//   VS        : the cell's other digit, or sentinel 10 when it has only one.
//   VH, VL    : the cell's value split as 9*VH + VL, so values up to 17 fit in
//               the alphabet and every value clue stays a linear Sum or a
//               small state machine.
//   VF        : one truth flag per drawn clue, 1 = this appearance holds.
//   VC        : how many circles contain digit 1, 2 and 3 respectively.

const shape = new Shape('9x9', '0-15');
const SENTINEL = 10;         // VS value meaning "this cell has one digit"
const graph = cellGraph(shape);
const cells = graph.cells();
const VS = graph.makeOverlay('VS');
const VH = graph.makeOverlay('VH');
const VL = graph.makeOverlay('VL');
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// --- Schrodinger base -------------------------------------------------------

// Each house scans [digit, VS, digit, VS, ...] and sets one bit per digit seen.
// The nine main-grid digits are never the sentinel, so demanding all ten bits
// forces exactly one non-sentinel VS: one two-digit cell per house.
const houseSpec = NFA.encodeSpec({
  startState: { mask: 0, second: false },
  transition: (s, x) => {
    if (!s.second) {
      if (x > 9) return undefined;
      const bit = 1 << x;
      return s.mask & bit ? undefined : { mask: s.mask | bit, second: true };
    }
    if (x === SENTINEL) return { mask: s.mask, second: false };
    if (x > 9) return undefined;
    const bit = 1 << x;
    return s.mask & bit ? undefined : { mask: s.mask | bit, second: false };
  },
  accept: s => !s.second && s.mask === 1023,
}, shape);

// Ties [digit, VS, VH, VL]: value = digit, or digit + VS for a two-digit cell.
const valueSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 9 ? { k: 1, a: x } : undefined;
    if (s.k === 1) return x === SENTINEL || x <= 9
      ? { k: 2, value: x === SENTINEL ? s.a : s.a + x } : undefined;
    if (s.k === 2) return x <= 1 ? { k: 3, value: s.value, high: x } : undefined;
    if (s.k === 3) return x === s.value - 9 * s.high ? { done: true } : undefined;
    return undefined;
  },
  accept: s => s.done === true,
}, shape);

// The two digits of a cell are unordered. Keeping the smaller one in VS picks
// one of the two encodings of the same cell; it removes no puzzle solution.
const canonicalPair = Pair.fnToKey((a, b) => b === SENTINEL || b < a, shape);

const houses = graph.rowsColumnsBoxes().map(
  house => new NFA(houseSpec, 'schrodinger-house',
    ...house.flatMap(cell => [cell, VS.at(cell)])));
const valueTies = cells.map(
  cell => new NFA(valueSpec, 'cell-value', cell, VS.at(cell), VH.at(cell), VL.at(cell)));
const canonicalPairs = cells.map(
  cell => new Pair(canonicalPair, 'canonical-pair', cell, VS.at(cell)));

// --- Drawn clues ------------------------------------------------------------

// Line paths are the three orange and three green stroke entries of the source,
// interpolated cell by cell. The two long orange strokes and the two row-4 green
// strokes run through shared cells at different offsets; the rules text ("
// disconnected lines within the same cell indicate two separate lines") and the
// "exactly three appearances" count both make them separate clues.
const DUTCH_LINES = [
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R3C8',
    'R3C9', 'R2C9', 'R1C9', 'R1C8'],
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9',
    'R2C9', 'R1C9', 'R1C8'],
  ['R4C7', 'R4C8'],
];
const GERMAN_LINES = [
  ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R4C6', 'R4C5', 'R4C4', 'R4C3'],
  ['R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C1',
    'R7C2'],
];
// Cage cell lists and totals from the drawn cage outlines. The fourth cage
// entry in the source carries the value "foglight" and is a display directive,
// not a killer cage.
const CAGES = [
  { total: 15, cells: ['R2C4'] },
  { total: 15, cells: ['R2C6'] },
  { total: 6, cells: ['R6C5', 'R6C6', 'R6C7', 'R7C7'] },
];
// Edge marks, from the overlay coordinates. The white and black dots on the
// R3C4/R3C5 and R3C5/R3C6 edges are drawn as offset pairs on one shared edge.
const WHITE_DOTS = [['R3C5', 'R4C5'], ['R3C4', 'R3C5'], ['R3C5', 'R3C6']];
const BLACK_DOTS = [['R3C4', 'R3C5'], ['R3C5', 'R3C6'], ['R2C5', 'R3C5']];
const X_MARKS = [['R5C7', 'R6C7'], ['R1C5', 'R2C5'], ['R1C3', 'R2C3']];
const V_MARKS = [['R4C5', 'R5C5'], ['R4C4', 'R4C5'], ['R4C5', 'R4C6']];
// The three purple circles.
const CIRCLES = ['R5C7', 'R6C7', 'R7C3'];

// --- Truth flags ------------------------------------------------------------

// One flag per drawn clue, in the order the clue groups are listed below.
const CLUE_GROUPS = [
  DUTCH_LINES, GERMAN_LINES, CAGES, WHITE_DOTS, BLACK_DOTS, X_MARKS, V_MARKS,
  CIRCLES,
];
const flags = new Var('F', 'clue holds', 3 * CLUE_GROUPS.length);
const flag = (group, i) => flags.cell(3 * CLUE_GROUPS.indexOf(group) + i + 1);
// Exactly two appearances of each clue kind hold, so its three flags sum to 2.
const twoOfThree = CLUE_GROUPS.map(
  group => new Sum(2, ...group.map((_, i) => flag(group, i))));

// --- Clue state machines ----------------------------------------------------
// Each machine reads its clue's truth flag first, then the cells it needs, and
// accepts when the flag agrees with whether the clue holds. Values arrive as
// consecutive VH, VL pairs.

// Adjacent values along a line differ by at least minDiff.
const whisperSpec = (minDiff) => NFA.encodeSpec({
  startState: null,
  transition: (s, x) => {
    if (s === null) return x <= 1 ? { f: x, bad: false, prev: null, h: null } : undefined;
    if (s.h === null) return x <= 1 ? { f: s.f, bad: s.bad, prev: s.prev, h: x } : undefined;
    if (x > 8) return undefined;
    const value = 9 * s.h + x;
    let bad = s.bad;
    if (s.prev !== null && Math.abs(value - s.prev) < minDiff) {
      if (s.f === 1) return undefined;   // a holding line has no short step
      bad = true;
    }
    return { f: s.f, bad, prev: value, h: null };
  },
  accept: s => s !== null && s.h === null && (s.f === 1) === !s.bad,
}, shape);

// A relation between the two values of a domino.
const dominoSpec = (relation) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 1 ? { k: 1, f: x } : undefined;
    if (s.k === 1) return x <= 1 ? { k: 2, f: s.f, h: x } : undefined;
    if (s.k === 2) return x <= 8 ? { k: 3, f: s.f, a: 9 * s.h + x } : undefined;
    if (s.k === 3) return x <= 1 ? { k: 4, f: s.f, a: s.a, h: x } : undefined;
    if (s.k === 4) {
      if (x > 8) return undefined;
      return { k: 5, ok: relation(s.a, 9 * s.h + x) === (s.f === 1) };
    }
    return undefined;
  },
  accept: s => s.ok === true,
}, shape);

// A one-cell cage: the cell's value is the cage total.
const singleCageSpec = (total) => NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 1 ? { k: 1, f: x } : undefined;
    if (s.k === 1) return x <= 1 ? { k: 2, f: s.f, h: x } : undefined;
    if (s.k === 2) {
      if (x > 8) return undefined;
      return { k: 3, ok: (9 * s.h + x === total) === (s.f === 1) };
    }
    return undefined;
  },
  accept: s => s.ok === true,
}, shape);

// The values of a multi-cell cage do (wantEqual) or do not sum to the total.
const cageSumSpec = (total, wantEqual) => NFA.encodeSpec({
  startState: { sum: 0, h: null },
  transition: (s, x) => {
    if (s.h === null) return x <= 1 ? { sum: s.sum, h: x } : undefined;
    if (x > 8) return undefined;
    // Clamping above the total keeps the state count finite; the machine only
    // ever compares the running sum with the total.
    return { sum: Math.min(s.sum + 9 * s.h + x, total + 1), h: null };
  },
  accept: s => s.h === null && ((s.sum === total) === wantEqual),
}, shape);

// The digits of a cage, scanned as [digit, VS, ...], are (wantDistinct) all
// different, or else contain a repeat. Once a repeat is seen the mask is
// dropped, so the machine stays small.
const cageDigitSpec = (wantDistinct) => NFA.encodeSpec({
  startState: { mask: 0, dup: false, second: false },
  transition: (s, x) => {
    if (s.second && x === SENTINEL) {
      return { mask: s.mask, dup: s.dup, second: false };
    }
    if (x > 9) return undefined;
    if (s.dup) return { mask: 0, dup: true, second: !s.second };
    const bit = 1 << x;
    if (s.mask & bit) {
      if (wantDistinct) return undefined;
      return { mask: 0, dup: true, second: !s.second };
    }
    return { mask: s.mask | bit, dup: false, second: !s.second };
  },
  accept: s => !s.second && s.dup === !wantDistinct,
}, shape);

// VC1..VC3 count the circles holding digit 1, 2 and 3. Only those three digits
// can ever satisfy the circle rule: there are three circles, so a count is at
// most 3, and a circled 0 is contained by at least its own circle.
const circleCountSpec = (digit) => NFA.encodeSpec({
  startState: { target: null, count: 0, second: false },
  transition: (s, x) => {
    if (s.target === null) return x <= 3 ? { target: x, count: 0, second: false } : undefined;
    if (s.second && x === SENTINEL) {
      return { target: s.target, count: s.count, second: false };
    }
    if (x > 9) return undefined;
    // A cell's two digits differ, so a circle adds at most one to a count.
    // Clamping above 3 keeps the state count finite.
    return {
      target: s.target,
      count: Math.min(s.count + (x === digit ? 1 : 0), 4),
      second: !s.second,
    };
  },
  accept: s => s.target !== null && !s.second && s.count === s.target,
}, shape);

// A circle holds when each of its digits equals its own circle count. Reads
// [flag, digit, VS, VC1, VC2, VC3]; `need` is the set of counts to check.
const circleSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return x <= 1 ? { k: 1, f: x } : undefined;
    if (s.k === 1) {
      if (x > 9) return undefined;
      const counted = x >= 1 && x <= 3;
      return { k: 2, f: s.f, need: counted ? 1 << (x - 1) : 0, bad: !counted };
    }
    if (s.k === 2) {
      if (x === SENTINEL) return { k: 3, f: s.f, need: s.need, bad: s.bad, pos: 1 };
      if (x > 9) return undefined;
      const counted = x >= 1 && x <= 3;
      return {
        k: 3, f: s.f,
        need: counted ? s.need | (1 << (x - 1)) : s.need,
        bad: s.bad || !counted, pos: 1,
      };
    }
    if (s.k === 3) {
      if (x > 3) return undefined;
      const bad = s.bad || (((s.need >> (s.pos - 1)) & 1) === 1 && x !== s.pos);
      if (s.pos === 3) return { k: 4, ok: (s.f === 1) === !bad };
      return { k: 3, f: s.f, need: s.need, bad, pos: s.pos + 1 };
    }
    return undefined;
  },
  accept: s => s.ok === true,
}, shape);

// --- Clue constraints -------------------------------------------------------

const valueCells = cell => [VH.at(cell), VL.at(cell)];
const dutchSpec = whisperSpec(4);
const germanSpec = whisperSpec(5);

const whispers = [
  ...DUTCH_LINES.map((line, i) => new NFA(dutchSpec, 'dutch-whisper',
    flag(DUTCH_LINES, i), ...line.flatMap(valueCells))),
  ...GERMAN_LINES.map((line, i) => new NFA(germanSpec, 'german-whisper',
    flag(GERMAN_LINES, i), ...line.flatMap(valueCells))),
];

const dominoes = [
  [WHITE_DOTS, 'white-dot', dominoSpec((a, b) => Math.abs(a - b) === 1)],
  [BLACK_DOTS, 'black-dot', dominoSpec((a, b) => a === 2 * b || b === 2 * a)],
  [X_MARKS, 'x-mark', dominoSpec((a, b) => a + b === 10)],
  [V_MARKS, 'v-mark', dominoSpec((a, b) => a + b === 5)],
].flatMap(([group, name, spec]) => group.map(([p, q], i) =>
  new NFA(spec, name, flag(group, i), ...valueCells(p), ...valueCells(q))));

// A cage holds when its values sum to the total and its digits are all
// different, so it fails when either half fails.
const cageConstraint = (cage, i) => {
  const holds = flag(CAGES, i);
  if (cage.cells.length === 1) {
    return new NFA(singleCageSpec(cage.total), 'cage-total',
      holds, ...valueCells(cage.cells[0]));
  }
  const values = cage.cells.flatMap(valueCells);
  const digits = cage.cells.flatMap(cell => [cell, VS.at(cell)]);
  return new Or([
    new And([
      new Given(holds, 1),
      new NFA(cageSumSpec(cage.total, true), 'cage-total', ...values),
      new NFA(cageDigitSpec(true), 'cage-digits', ...digits),
    ]),
    new And([
      new Given(holds, 0),
      new Or([
        new NFA(cageSumSpec(cage.total, false), 'cage-total-fails', ...values),
        new NFA(cageDigitSpec(false), 'cage-digits-repeat', ...digits),
      ]),
    ]),
  ]);
};
const cageConstraints = CAGES.map(cageConstraint);

const counts = new Var('C', 'circles holding digit 1, 2, 3', 3);
const countCells = counts.cells();
const circleDigits = CIRCLES.flatMap(cell => [cell, VS.at(cell)]);
const circleConstraints = [
  ...countCells.map((countCell, i) =>
    new NFA(circleCountSpec(i + 1), 'circle-count', countCell, ...circleDigits)),
  ...CIRCLES.map((cell, i) => new NFA(circleSpec, 'counting-circle',
    flag(CIRCLES, i), cell, VS.at(cell), ...countCells)),
];

return [
  shape,
  VS.toVar('second digit'), VH.toVar('value high'), VL.toVar('value low'),
  flags, counts,
  graph.makeReplicate(new Given(cells[0], ...range(0, 9))),
  VS.makeReplicate(new Given(VS.at(cells[0]), ...range(0, 10))),
  VH.makeReplicate(new Given(VH.at(cells[0]), 0, 1)),
  VL.makeReplicate(new Given(VL.at(cells[0]), ...range(0, 8)), VL.at(cells)),
  ...flags.cells().map(cell => new Given(cell, 0, 1)),
  ...countCells.map(cell => new Given(cell, ...range(0, 3))),
  ...houses, ...valueTies, ...canonicalPairs,
  ...whispers, ...dominoes, ...cageConstraints, ...circleConstraints,
  ...twoOfThree,
];
