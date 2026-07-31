// Title: My First Soduko
// Author: Marty and Nordy (aged 5)
// Video: https://www.youtube.com/watch?v=O_QhIyedk8w
// Source: https://sudokupad.app/iutvqv1ht8

// Normal Sudoku. Every drawn clue below is an ordinary variant clue EXCEPT that
// exactly five of the 49 clue instances are lying: a lying clue is one whose own
// rule fails ("if a clue doesnt completly work like it should, then it is
// lying"). Which five lie is the puzzle, so no clue's truth may be assumed.
//
// Clue types, as stated in the rules:
//   pink line          renban - consecutive set, no repeats
//   green line         German whisper - adjacent digits differ by >= 5
//   red outside arrow  sum of the digits on the diagonal it points along
//   dashed cage        killer cage - distinct digits summing to the corner label
//   light grey line    thermometer - increases away from the bulb
//   light blue arrow   digits on the arrow sum to the digit in its circle
//   dark grey line     ten line - splits into consecutive groups each summing 10
//   white dot          the two digits are consecutive
//   small purple arrow points at the smaller of the two digits it sits between
//   X                  the two digits sum to 10
//   red speech bubble  each character's sentence is itself one clue
//
// Every clue therefore needs both its rule and the rule's negation. Negations
// that no named class covers are written as an Or of pairwise failures or as a
// small NFA; see the builders below.
//
// The clue geometry is hand-drawn in the puzzle's background artwork, not in any
// clue array. Each table below records what that artwork shows.

const NUMV = 9;
const TRUTH = 1;   // flag value meaning "this clue tells the truth"
const LIE = 2;     // flag value meaning "this clue lies"
const NUM_LIARS = 5;

const geometry = cellGeometry('9x9');

// ---------------------------------------------------------------- pair keys

const keyNotConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, NUMV);
const keyNotTen = Pair.fnToKey((a, b) => a + b !== 10, NUMV);
// A whisper edge fails when the two digits are closer together than 5.
const keyWhisperFails = Pair.fnToKey((a, b) => Math.abs(a - b) < 5, NUMV);
// A thermo edge fails when it does not increase.
const keyNotIncreasing = Pair.fnToKey((a, b) => a >= b, NUMV);
// A purple arrow fails when the cell it points at is not the smaller one.
const keyNotSmaller = Pair.fnToKey((a, b) => a >= b, NUMV);
const keyNotSum = (total) => Pair.fnToKey((a, b) => a + b !== total, NUMV);

// ---------------------------------------------------------------- negations

// Running total clamped at total+1, which is a sink meaning "already too big",
// so the final state equals `total` only when the cells really sum to it.
const sumIsNot = (total, cells) => new NFA(
  NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, total + 1),
    accept: (sum) => sum !== total,
  }, NUMV),
  `sum is not ${total}`, cells);

// A ten line's split is forced: digits are positive, so at most one prefix of a
// segment reaches exactly 10. State is the current segment's partial total, 0 at
// a segment boundary; DEAD is entered when a segment overshoots 10. The line
// splits correctly only if the walk ends on a boundary, so the failure machine
// accepts every other outcome.
const TEN_DEAD = -1;
const tenLineFailsSpec = NFA.encodeSpec({
  startState: 0,
  transition: (partial, value) => {
    if (partial === TEN_DEAD) return TEN_DEAD;
    const next = partial + value;
    if (next > 10) return TEN_DEAD;
    return next === 10 ? 0 : next;
  },
  accept: (partial) => partial !== 0,
}, NUMV);

// Renban failure. Every renban here lies along a single row or column, so its
// digits are already distinct and the rule reduces to "the span is len-1"; the
// failure machine tracks only the running min and max.
const spanIsNot = (len, cells) => new NFA(
  NFA.encodeSpec({
    startState: { lo: null, hi: null },
    transition: ({ lo, hi }, value) => ({
      lo: lo === null ? value : Math.min(lo, value),
      hi: hi === null ? value : Math.max(hi, value),
    }),
    accept: ({ lo, hi }) => hi - lo !== len - 1,
  }, NUMV),
  `span is not ${len - 1}`, cells);

// Arrow failure over [circle, ...arm]: the circle sets the remainder, each arm
// digit is subtracted, and -1 is a sink for "the arm already overshot".
const arrowFailsSpec = NFA.encodeSpec({
  startState: { rem: null },
  transition: ({ rem }, value) => (
    rem === null ? { rem: value } : { rem: Math.max(rem - value, -1) }),
  accept: ({ rem }) => rem !== 0,
}, NUMV);

// Cage failure = the digits repeat, or the total is wrong. Sudoku already forces
// distinctness within a row, column or box, so only cage pairs that share none
// of those can repeat; the rest of the negation is the wrong total.
const sameGroup = (a, b) => {
  const [p, q] = [a, b].map(parseCellId);
  return p.row === q.row || p.col === q.col ||
    ((p.row - 1) / 3 | 0) === ((q.row - 1) / 3 | 0) &&
    ((p.col - 1) / 3 | 0) === ((q.col - 1) / 3 | 0);
};
const cageFails = (total, cells) => {
  const freePairs = cells.flatMap(
    (a, i) => cells.slice(i + 1).filter(b => !sameGroup(a, b)).map(b => [a, b]));
  return new Or([
    sumIsNot(total, cells),
    // Two one-cell sets holding the same values, i.e. this pair repeats.
    ...freePairs.map(([a, b]) => new SameValues(2, a, b)),
  ]);
};

const edges = (cells) => cells.slice(1).map((c, i) => [cells[i], c]);
const someEdge = (key, name, cells) => new Or(
  edges(cells).map(([a, b]) => new Pair(key, name, a, b)));

const allBut = (value) => geometry.allValues().filter(v => v !== value);

// ------------------------------------------------------------- drawn clues

// Pink renban strokes.
const RENBANS = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R5C4', 'R5C5'],
];

// Green whisper strokes. The two long strokes across row 9 are drawn as a
// separate pair of parallel lines with a clear gap, so they are two clues.
const WHISPERS = [
  ['R4C2', 'R5C2', 'R6C3'],
  ['R5C6', 'R5C7'],
  ['R8C3', 'R8C4'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

// Dark grey ten lines, in drawn stroke order.
const TEN_LINES = [
  ['R2C2', 'R3C2', 'R3C3'],
  ['R2C5', 'R3C5'],
  ['R4C4', 'R4C5'],
  ['R4C8', 'R5C8'],
  ['R6C4', 'R6C5'],
  ['R6C6', 'R6C7', 'R7C7', 'R8C7', 'R8C8', 'R7C8'],
];

// The single light grey thermometer, bulb (the drawn disc in R2C9) first.
const THERMO = ['R2C9', 'R1C9', 'R1C8', 'R2C8', 'R2C7', 'R3C7', 'R3C8'];

// Light blue arrows as [circle, ...arm]. The first arrow's shaft leaves its
// circle diagonally and ends in R7C2, clipping only the shared corner of R6C2.
const ARROWS = [
  ['R6C1', 'R7C2'],
  ['R9C1', 'R8C1', 'R7C1'],
  ['R8C5', 'R8C6', 'R7C6'],
];

// Dashed cages as [total, ...cells], read from the drawn dash outlines and the
// small number in each cage's top-left corner.
const CAGES = [
  [9, 'R1C2'],
  [42, 'R1C7', 'R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  [34, 'R4C4', 'R4C5', 'R5C4', 'R5C5', 'R6C4', 'R6C5'],
  [16, 'R6C6', 'R6C7', 'R6C8', 'R7C7', 'R8C7'],
  [18, 'R7C6', 'R8C5', 'R8C6'],
  [10, 'R7C8', 'R8C8'],
  [5, 'R7C1', 'R8C1'],
];

// White dots. Both are also structured dot markers in the puzzle data.
const DOTS = [
  ['R5C3', 'R6C3'],
  ['R5C4', 'R5C5'],
];

// X markers.
const XS = [
  ['R2C5', 'R3C5'],
  ['R4C4', 'R4C5'],
  ['R4C8', 'R5C8'],
  ['R5C2', 'R5C3'],
  ['R6C1', 'R7C1'],
  ['R7C1', 'R7C2'],
  ['R7C8', 'R8C8'],
];

// Small purple arrows as [cell pointed at, other cell]: the arrow claims the
// first is smaller.
const LESS_THANS = [
  ['R1C9', 'R1C8'],
  ['R1C8', 'R2C8'],
  ['R2C8', 'R2C7'],
  ['R2C7', 'R3C7'],
  ['R3C7', 'R3C8'],
  ['R7C2', 'R7C3'],
  ['R8C2', 'R7C2'],
  ['R7C3', 'R8C3'],
  ['R8C3', 'R8C2'],
  ['R9C5', 'R8C5'],
];

// Red outside arrows as [total, ...diagonal cells]. Each arrow's 45-degree line
// runs along the centre diagonal of a single corner cell (measured on the
// artwork: the "3" arrow's line lies on R1C9's own diagonal, a full cell away
// from the R2C9/R1C8 diagonal, and the "5" arrow's on R9C1's), so each clue
// covers a one-cell diagonal.
const DIAGONALS = [
  [3, 'R1C9'],
  [5, 'R9C1'],
];

const clues = [
  ...RENBANS.map(cells => ({
    cells,
    yes: [new Renban(...cells)],
    no: [cells.length === 2
      ? new Pair(keyNotConsecutive, 'renban fails', ...cells)
      : spanIsNot(cells.length, cells)],
  })),
  ...WHISPERS.map(cells => ({
    cells,
    yes: [new Whisper(5, ...cells)],
    no: [someEdge(keyWhisperFails, 'whisper fails', cells)],
  })),
  ...TEN_LINES.map(cells => ({
    cells,
    yes: [new SumLine(10, ...cells)],
    no: [new NFA(tenLineFailsSpec, 'ten line fails', cells)],
  })),
  {
    cells: THERMO,
    yes: [new Thermo(...THERMO)],
    no: [someEdge(keyNotIncreasing, 'thermo fails', THERMO)],
  },
  ...ARROWS.map(cells => ({
    cells,
    yes: [new Arrow(...cells)],
    no: [new NFA(arrowFailsSpec, 'arrow fails', cells)],
  })),
  ...CAGES.map(([total, ...cells]) => ({
    cells,
    yes: [new Cage(total, ...cells)],
    no: [cells.length === 1
      ? new Given(cells[0], ...allBut(total))
      : cells.length === 2
        ? new Pair(keyNotSum(total), 'cage total wrong', ...cells)
        : cageFails(total, cells)],
  })),
  ...DOTS.map(cells => ({
    cells,
    yes: [new WhiteDot(...cells)],
    no: [new Pair(keyNotConsecutive, 'dot fails', ...cells)],
  })),
  ...XS.map(cells => ({
    cells,
    yes: [new X(...cells)],
    no: [new Pair(keyNotTen, 'X fails', ...cells)],
  })),
  ...LESS_THANS.map(cells => ({
    cells,
    yes: [new GreaterThan(cells[1], cells[0])],
    no: [new Pair(keyNotSmaller, 'purple arrow fails', ...cells)],
  })),
  ...DIAGONALS.map(([total, ...cells]) => ({
    cells,
    yes: [new Cage(total, ...cells)],
    no: [new Given(cells[0], ...allBut(total))],
  })),
];

// -------------------------------------------------------- the speech clues

// Three characters speak in red, and each sentence counts as one clue that may
// itself lie. Their flags follow the drawn clues, in this order.
const NUM_DRAWN = clues.length;
const SIMMON = NUM_DRAWN, MARK = NUM_DRAWN + 1, BOBBINS = NUM_DRAWN + 2;
const flags = new Var('F', 'clue truth flags', NUM_DRAWN + 3);
const flagOf = (i) => flags.cell(i + 1);

// Simmon: "The grey line in box 2 has a 3 on it." The only grey line drawn in
// box 2 is the ten line R2C5-R3C5.
const SIMMON_LINE = TEN_LINES[1];

// Mark: "Box 5 contains a lying clue." Which clues count as being in box 5 is
// open: six clues are drawn wholly inside it, and four more have a single cell
// there. Neither scope is decidable from the sentence, so the clue is encoded as
// the disjunction over both readings.
const inBox5 = (cell) => {
  const { row, col } = parseCellId(cell);
  return row >= 4 && row <= 6 && col >= 4 && col <= 6;
};
const box5Inside = clues
  .map((c, i) => i).filter(i => clues[i].cells.every(inBox5));
const box5Touching = clues
  .map((c, i) => i).filter(i => clues[i].cells.some(inBox5));

const speech = [
  {
    cells: SIMMON_LINE,
    yes: [new ContainAtLeast('3', ...SIMMON_LINE)],
    no: SIMMON_LINE.map(cell => new Given(cell, ...allBut(3))),
  },
  {
    cells: [],
    // Truthful under either scope reading iff some clue touching box 5 lies;
    // lying under either reading iff no clue wholly inside box 5 lies.
    yes: [new ContainAtLeast(String(LIE), ...box5Touching.map(flagOf))],
    no: box5Inside.map(i => new Given(flagOf(i), TRUTH)),
  },
  {
    cells: [],
    // "Simmon is lying": true exactly when Simmon's flag says he lies.
    yes: [new Given(flagOf(SIMMON), LIE)],
    no: [new Given(flagOf(SIMMON), TRUTH)],
  },
];

const allClues = [...clues, ...speech];

return [
  new Shape('9x9'),
  flags,
  ...allClues.map((c, i) => new Given(flagOf(i), TRUTH, LIE)),
  ...allClues.map((c, i) => new Or([
    new And([new Given(flagOf(i), TRUTH), ...c.yes]),
    new And([new Given(flagOf(i), LIE), ...c.no]),
  ])),
  new ContainExact(
    Array(NUM_LIARS).fill(LIE).join('_'), ...allClues.map((c, i) => flagOf(i))),
];
