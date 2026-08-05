// Title: Pinocchio II
// Author: thoughtbyte
// Video: https://www.youtube.com/watch?v=7pjlPuRg3NI
// Source: https://app.crackingthecryptic.com/sudoku/FpRnpjptb6

// Normal Sudoku applies. For each displayed clue type, exactly two of its three
// appearances obey that type's rule and the remaining appearance does not.
const pairsExactlyTwo = (correct, incorrect) => new Or([
  new And([correct(0), correct(1), incorrect(2)]),
  new And([correct(0), correct(2), incorrect(1)]),
  new And([correct(1), correct(2), incorrect(0)]),
]);

const antiPair = (name, predicate, a, b) => new Pair(
  Pair.fnToKey((x, y) => !predicate(x, y), 9), name, a, b);

const isWhite = (a, b) => Math.abs(a - b) === 1;
const isBlack = (a, b) => a === 2 * b || b === 2 * a;
const isX = (a, b) => a + b === 10;
const isV = (a, b) => a + b === 5;

// The NFA records the set of distinct digits as a bit mask; D is the duplicate
// sink. It accepts exactly the sequences that are not a distinct cage of total n.
const invalidCage = (n, cells) => {
  const spec = NFA.encodeSpec({
    startState: 0,
    transition: (state, value) => {
      if (state === 'D') return 'D';
      const bit = 1 << (value - 1);
      return state & bit ? 'D' : state | bit;
    },
    accept: state => state === 'D' || [...Array(9)].reduce(
      (sum, _, i) => sum + (state & (1 << i) ? i + 1 : 0), 0) !== n,
    maxDepth: cells.length,
  }, 9);
  return new NFA(spec, `not cage ${n}`, ...cells);
};

// Drawn white-dot edges.
const whiteDots = [
  ['R5C1', 'R6C1'], ['R1C2', 'R2C2'], ['R3C1', 'R4C1'],
];
// Drawn black-dot edges.
const blackDots = [
  ['R8C2', 'R8C3'], ['R5C6', 'R5C7'], ['R5C3', 'R5C4'],
];
// Drawn X edges.
const xs = [
  ['R2C8', 'R3C8'], ['R2C9', 'R3C9'], ['R8C8', 'R8C9'],
];
// Drawn V edges.
const vs = [
  ['R9C4', 'R9C5'], ['R7C8', 'R7C9'], ['R2C4', 'R2C5'],
];
// Drawn green Whispers paths, transcribed in stroke order.
const whispers = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'],
  ['R5C9', 'R6C9', 'R6C8', 'R6C7', 'R5C7', 'R4C7', 'R4C8', 'R4C9'],
];
// Grey-square and grey-circle cells from the drawn underlays.
const squares = ['R4C1', 'R6C1', 'R5C4'];
const circles = ['R5C6', 'R4C9', 'R6C9'];
// Drawn cages and their top-left totals.
const cages = [
  [30, ['R2C7', 'R2C6', 'R3C6', 'R3C7']],
  [26, ['R7C7', 'R7C6', 'R8C6', 'R8C7']],
  [11, ['R5C2', 'R5C3', 'R5C4', 'R5C5']],
];

return [
  new Shape('9x9'),
  new Given('R3C5', 5), new Given('R9C5', 1),
  pairsExactlyTwo(i => new WhiteDot(...whiteDots[i]),
    i => antiPair('not white dot', isWhite, ...whiteDots[i])),
  pairsExactlyTwo(i => new BlackDot(...blackDots[i]),
    i => antiPair('not black dot', isBlack, ...blackDots[i])),
  pairsExactlyTwo(i => new X(...xs[i]),
    i => antiPair('not X', isX, ...xs[i])),
  pairsExactlyTwo(i => new V(...vs[i]),
    i => antiPair('not V', isV, ...vs[i])),
  pairsExactlyTwo(i => new Whisper(5, ...whispers[i]),
    i => new Or(whispers[i].slice(1).map((cell, j) =>
      antiPair('not German Whispers', (a, b) => Math.abs(a - b) >= 5,
        whispers[i][j], cell)))),
  pairsExactlyTwo(i => new Given(squares[i], 2, 4, 6, 8),
    i => new Given(squares[i], 1, 3, 5, 7, 9)),
  pairsExactlyTwo(i => new Given(circles[i], 1, 3, 5, 7, 9),
    i => new Given(circles[i], 2, 4, 6, 8)),
  pairsExactlyTwo(i => new Cage(cages[i][0], ...cages[i][1]),
    i => invalidCage(cages[i][0], cages[i][1])),
];
