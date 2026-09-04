// Title: ZeroTomTom
// Author: IHNN
// Video: https://www.youtube.com/watch?v=YX1P_BAjdTQ
// Source: https://app.crackingthecryptic.com/sudoku/27nqnb8Dtp

// Rules (video description): each row and column holds the digits 0-8 once
// each (no boxes are named). The grid is partitioned into cages; a cage's
// clue, when printed, is the value of adding, multiplying, subtracting or
// dividing its digits -- subtracting/dividing read largest-to-smallest and
// chain the operation (a-b-c, a/b/c). The clue's operation may or may not be
// stated. Digits may repeat inside a cage. Two cages carry no clue at all,
// so they add no arithmetic constraint.
//
// A chained "largest minus the rest" always equals max - sum(others), and a
// chained "largest divided by the rest" always equals max / product(others)
// -- both regardless of how ties or the non-max cells are ordered, since
// a-b-c-d = a-(b+c+d) and a/b/c/d = a/(b*c*d) for any real numbers. So each
// reading below is an Or over which cage cell realises the chain's leading
// (largest) digit, with no separate "is the largest" check needed: for the
// subtract reading, cell = target + sum(others) with target >= 0 and every
// other cell >= 0 already forces cell >= every individual other cell: it IS
// the max whenever the equation holds. The same holds for divide with
// target >= 1 and divisors >= 1 (dividing by zero is excluded by requiring
// every divisor cell to be 1-8, matching "starting with the largest digit"
// only being meaningful when the chain never divides by zero).
//
// Where the clue's operation is not given, the encoding is an Or across
// whichever of the four readings can produce that value at all -- exactly
// "the number ... indicates the value of adding, multiplying, subtracting or
// dividing its digits" with the operation left open, not a resolved guess.

const shape = new Shape('9x9', '0-8');

// Cage cell lists and clues, transcribed from the source's drawn cages.
// `op` is the clue's stated operation (+ - * /) or null when the clue is a
// bare number with no operation given; `target` is undefined for the two
// cages with no printed clue at all.
const CAGES = [
  { cells: ['R1C1', 'R2C1'], op: '+', target: 2 },
  { cells: ['R1C3', 'R1C2', 'R2C2', 'R3C2', 'R3C1'], op: '*', target: 0 },
  { cells: ['R2C4', 'R2C3', 'R3C3', 'R4C3', 'R4C2'], op: '-', target: 0 },
  { cells: ['R3C5', 'R3C4', 'R4C4', 'R5C4', 'R5C3'], op: '*', target: 0 },
  { cells: ['R4C5', 'R5C5', 'R6C5'], op: null, target: 24 },
  { cells: ['R5C7', 'R5C6', 'R6C6', 'R7C6', 'R7C5'], op: '*', target: 0 },
  { cells: ['R6C7', 'R6C8', 'R7C7', 'R8C7', 'R8C6'], op: '-', target: 0 },
  { cells: ['R7C9', 'R7C8', 'R8C8', 'R9C8', 'R9C7'], op: '*', target: 0 },
  { cells: ['R8C9', 'R9C9'], op: '+', target: 1 },
  { cells: ['R4C1', 'R5C1', 'R5C2', 'R6C2'], op: '+', target: 6 },
  { cells: ['R6C1', 'R7C1'], op: null, target: 1 },
  { cells: ['R8C1', 'R9C1', 'R9C2'] },
  { cells: ['R7C2', 'R8C2', 'R8C3'], op: null, target: 15 },
  { cells: ['R6C3', 'R6C4'], op: '*', target: 14 },
  { cells: ['R7C3', 'R7C4'], op: null, target: 13 },
  { cells: ['R8C4', 'R8C5'], op: null, target: 13 },
  { cells: ['R9C3', 'R9C4'] },
  { cells: ['R9C5', 'R9C6'], op: null, target: 9 },
  { cells: ['R1C4', 'R1C5'], op: null, target: 14 },
  { cells: ['R2C5', 'R2C6'], op: null, target: 7 },
  { cells: ['R3C6', 'R3C7'], op: null, target: 11 },
  { cells: ['R4C6', 'R4C7'], op: '+', target: 7 },
  { cells: ['R4C8', 'R5C8', 'R5C9', 'R6C9'], op: '/', target: 1 },
  { cells: ['R1C6', 'R1C7'], op: null, target: 2 },
  { cells: ['R2C7', 'R2C8', 'R3C8'], op: null, target: 16 },
  { cells: ['R3C9', 'R4C9'], op: null, target: 2 },
  { cells: ['R2C9', 'R1C9', 'R1C8'], op: null, target: 96 },
];

function others(cells, idx) {
  return cells.filter((_, i) => i !== idx);
}

// digits + digits + ... = target.
function sumReading(cells, target) {
  return new Sum(target, ...cells);
}

// One cell realises max = target + sum(the rest); see the header note for
// why no separate "is the largest" check is needed. A zero target is exactly
// "that cell's sum equals the rest's sum", i.e. EqualSum of the two segments;
// a nonzero target needs the constant, so it stays a coefficient Sum.
function subtractReading(cells, target) {
  return new Or(cells.map((c, i) => {
    const rest = others(cells, i);
    return target === 0
      ? new EqualSum([c], rest)
      : new Sum(target, [c, 1], ...rest.map(o => [o, -1]));
  }));
}

// Every length-k tuple of digits (0-8, or 1-8 when target !== 0, since a
// zero factor forces the product to 0) whose product is exactly target.
function productTuples(k, target) {
  const results = [];
  const lo = target === 0 ? 0 : 1;
  const acc = new Array(k);
  (function rec(i, prod) {
    if (i === k) {
      if (prod === target) results.push(acc.slice());
      return;
    }
    for (let v = lo; v <= 8; v++) {
      acc[i] = v;
      rec(i + 1, prod * v);
    }
  })(0, 1);
  return results;
}

function productReading(cells, target) {
  if (target === 0) {
    return new Or(cells.map(c => new Given(c, 0)));
  }
  const tuples = productTuples(cells.length, target);
  return new Or(tuples.map(
    t => new And(cells.map((c, i) => new Given(c, t[i])))));
}

// Every branch: one cell is the chain's dividend (max), the rest are nonzero
// divisors (1-8) whose product times target gives the dividend's value.
function divideBranches(cells, target) {
  const branches = [];
  cells.forEach((dividend, di) => {
    const divisors = others(cells, di);
    const k = divisors.length;
    const acc = new Array(k);
    (function rec(i, prod) {
      if (i === k) {
        const dividendValue = target * prod;
        if (dividendValue <= 8) {
          branches.push(new And([
            new Given(dividend, dividendValue),
            ...divisors.map((d, j) => new Given(d, acc[j]))]));
        }
        return;
      }
      for (let v = 1; v <= 8; v++) {
        acc[i] = v;
        rec(i + 1, prod * v);
      }
    })(0, 1);
  });
  return branches;
}

function divideReading(cells, target) {
  return new Or(divideBranches(cells, target));
}

function cageConstraint({ cells, op, target }) {
  if (target === undefined) return null; // no printed clue: no constraint
  if (op === '+') return sumReading(cells, target);
  if (op === '-') return subtractReading(cells, target);
  if (op === '*') return productReading(cells, target);
  if (op === '/') return divideReading(cells, target);

  // Operation not given: the value must match at least one reading.
  const candidates = [sumReading(cells, target), subtractReading(cells, target)];
  if (target === 0) {
    candidates.push(new Or(cells.map(c => new Given(c, 0))));
  } else {
    const tuples = productTuples(cells.length, target);
    if (tuples.length) candidates.push(productReading(cells, target));
  }
  const divBranches = divideBranches(cells, target);
  if (divBranches.length) candidates.push(new Or(divBranches));
  return new Or(candidates);
}

return [
  shape,
  new NoBoxes(),
  ...CAGES.map(cageConstraint).filter(c => c !== null),
];
