// Title: TomTom Sudoku
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=iRkA0we43Og
// Source: https://tinyurl.com/2p8j8evm

// Normal sudoku rules apply (rows, columns, 3x3 boxes all-different -- the
// ISS default; no jigsaw regions). Each cage's clue is the value obtained by
// applying one arithmetic operation iteratively to the digits in its cells.
// A clue with an operator symbol (x/+/-) fixes that operation; a bare-number
// clue may be realized by any of +, -, x, or / (rules text) -- encoded as a
// disjunction over the four readings, not a choice among them. For a cage of
// more than two cells, subtraction/division take the largest digit and
// subtract/divide all the others -- this is order-independent, since it only
// depends on the largest digit and the sum/product of the rest. The rules
// state no separate cage-internal distinctness, so cage cells may repeat a
// digit (subject to the row/column/box all-different already in force).

// Per-operation predicates for a 2-cell cage.
const PAIR_OP = {
  '+': target => (a, b) => a + b === target,
  '-': target => (a, b) => Math.abs(a - b) === target,
  'x': target => (a, b) => a * b === target,
  '/': target => (a, b) => {
    const [hi, lo] = a >= b ? [a, b] : [b, a];
    return hi % lo === 0 && hi / lo === target;
  },
};

// Per-operation NFAs for a cage of any size, used here for 3-cell cages
// (Pair only covers 2 cells). Each tracks only what its accept check needs,
// and rejects (returns undefined) as soon as a branch can only overshoot.
// `maxDepth` (cell count) additionally bounds compile-time state creation --
// without it, a field the accept check reads only at the end (sum, product)
// is unbounded during compilation.
const CAGE_NFA = {
  '+': (target, maxDepth) => NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => {
      const next = sum + value;
      if (next > target) return;
      return next;
    },
    accept: sum => sum === target,
    maxDepth,
  }, 9),
  'x': (target, maxDepth) => NFA.encodeSpec({
    startState: 1,
    transition: (product, value) => {
      const next = product * value;
      if (next > target) return;
      return next;
    },
    accept: product => product === target,
    maxDepth,
  }, 9),
  // "largest minus all the others" = max - (sum - max) = 2*max - sum.
  '-': (target, maxDepth) => NFA.encodeSpec({
    startState: { max: 0, sum: 0 },
    transition: ({ max, sum }, value) =>
      ({ max: Math.max(max, value), sum: sum + value }),
    accept: ({ max, sum }) => (2 * max - sum) === target,
    maxDepth,
  }, 9),
  // "largest divided by all the others" = max / (product / max).
  '/': (target, maxDepth) => NFA.encodeSpec({
    startState: { max: 0, product: 1 },
    transition: ({ max, product }, value) =>
      ({ max: Math.max(max, value), product: product * value }),
    accept: ({ max, product }) => max === target * (product / max),
    maxDepth,
  }, 9),
};

const OPS = ['+', '-', 'x', '/'];

function cageConstraint(op, target, cells, label) {
  if (cells.length === 2) {
    // A single Pair: either the one relation named by the clue's operator,
    // or (op === null) the disjunction of all four -- combined into one
    // predicate rather than an Or of Pairs, since an Or branch's truth
    // table can coincide with a differently-named native relation (e.g.
    // the target-10 "+" branch alone reads as the built-in X constraint,
    // which is misleading here: this clue is satisfied by + OR x OR /).
    const ops = op ? [op] : OPS;
    const pred = (a, b) => ops.some(o => PAIR_OP[o](target)(a, b));
    const name = op ? `${label} ${op}${target}` : `${label} ${target}`;
    return new Pair(Pair.fnToKey(pred, 9), name, ...cells);
  }
  if (op) {
    return new NFA(
      CAGE_NFA[op](target, cells.length), `${label} ${op}${target}`, ...cells);
  }
  return new Or(OPS.map(o => new NFA(
    CAGE_NFA[o](target, cells.length), `${label} ${o}${target}`, ...cells)));
}

// cages: [op, target, cells, label]. op is null when the printed clue was a
// bare number (no operator symbol), meaning any of +, -, x, / may realize
// it. Cell lists and clue text are transcribed from the drawn cages.
const cages = [
  ['x', 6, ['R2C5', 'R2C6', 'R3C6'], 'A'],
  ['+', 4, ['R1C1', 'R2C1'], 'B'],
  ['x', 35, ['R2C8', 'R2C9', 'R3C9'], 'C'],
  ['+', 6, ['R8C8', 'R8C9', 'R9C9'], 'D'],
  [null, 17, ['R7C7', 'R8C7'], 'E'],
  [null, 10, ['R1C7', 'R2C7'], 'F'],
  [null, 9, ['R1C4', 'R2C4'], 'G'],
  [null, 23, ['R2C2', 'R2C3', 'R3C3'], 'H'],
  ['-', 6, ['R4C1', 'R5C1'], 'I'],
  [null, 120, ['R5C2', 'R5C3', 'R6C3'], 'J'],
  [null, 5, ['R4C7', 'R5C7'], 'K'],
  [null, 5, ['R7C1', 'R8C1'], 'L'],
  [null, 24, ['R8C2', 'R8C3', 'R9C3'], 'M'],
  [null, 18, ['R4C4', 'R5C4'], 'N'],
  [null, 14, ['R7C4', 'R8C4'], 'O'],
  [null, 20, ['R5C5', 'R5C6', 'R6C6'], 'P'],
  [null, 15, ['R8C5', 'R8C6', 'R9C6'], 'Q'],
  ['-', 3, ['R5C8', 'R5C9', 'R6C9'], 'R'],
];

return [
  new Shape('9x9'),
  ...cages.map(([op, target, cells, label]) =>
    cageConstraint(op, target, cells, label)),
];
