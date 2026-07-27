// Title: 80
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=2VFxX_4T4r0
// Source: https://sudokupad.app/4hca9hq4bd

// Normal sudoku rules apply. One given: R5C5=2.
//
// GREY LINES: along each separate grey line (length 3, 5, or 7) the product
// of the digits is 80. The payload draws 8 grey strokes; 4 of them
// (raw lines[2..5]) cross each other at three shared cells (R5C5, R7C3,
// R3C7) instead of being 4 independent shapes -- their raw per-entry
// lengths are 3, 4, 9, 4, and two more entries (raw lines[6..7]) resolve to
// a single cell each, none of which is a valid 3/5/7 length. Regrouping the
// 16 drawn edges by straight-line continuation through each crossing (the
// only grouping under which every edge stays collinear with its neighbour)
// yields exactly the 8 separate straight lines below, each length 3, 5, or
// 7 as the rule requires. This regrouping is forced by the stated lengths,
// never chosen to fit the solution.
const LINES = [
  ['R4C1', 'R3C2', 'R2C3'],                                  // raw lines[0], unchanged
  ['R8C7', 'R7C8', 'R6C9'],                                  // raw lines[1], unchanged
  ['R4C4', 'R5C5', 'R6C6'],                                  // raw lines[2], unchanged
  ['R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2'],  // raw lines[5]+[4]+[3], regrouped at the two crossings
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],                  // raw lines[4]+[3], regrouped at the R7C3 crossing
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],                  // raw lines[5]+[4], regrouped at the R3C7 crossing
  ['R1C3', 'R1C4', 'R1C5'],                                  // raw lines[6], extended to its full drawn width
  ['R9C5', 'R9C6', 'R9C7'],                                  // raw lines[7], extended to its full drawn width (mirror of line 7)
];

function productLineSpec(target) {
  return {
    startState: 1,
    // Reject once the running product exceeds the target; a digit is never
    // 0, so the running product only grows or stays put.
    transition: (state, value) => {
      if (state > target) return;
      return state * value;
    },
    accept: state => state === target,
  };
}
const productNFA = NFA.encodeSpec(productLineSpec(80), 9);
const productLines = LINES.map(cells =>
  new NFA(productNFA, `${cells.length}-cell product-80 line`, ...cells));

// PRIME CORNER CAGES: four 2-cell cages (payload value "A"/"B"/"C"/"D", no
// drawn total) each read left-to-right as a 2-digit prime; the four primes
// satisfy A+B = C+D = A+C = B+D = 80. A drawn cage border conventionally
// forbids a repeated digit inside even with no printed total (the ISS
// catalog treats a no-total cage as AllDifferent by default) -- that only
// excludes the repdigit prime 11 from being a cage's value.
const CAGES = {
  A: ['R1C1', 'R1C2'],
  B: ['R1C8', 'R1C9'],
  C: ['R9C1', 'R9C2'],
  D: ['R9C8', 'R9C9'],
};

const PRIMES = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
const isPrime2Digit = (tens, ones) => PRIMES.includes(10 * tens + ones);

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a);
    const B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

const primeKey = Pair.fnToKey(isPrime2Digit, 9);

const cageConstraints = Object.entries(CAGES).flatMap(([name, cells]) => {
  const [tens, ones] = rowMajor(cells);
  return [
    new AllDifferent(...cells),
    new Pair(primeKey, `cage ${name} is a 2-digit prime`, tens, ones),
  ];
});

// A+B = C+D = A+C = B+D = 80, each cage value read left-to-right.
function cageAsSumTerms(name) {
  const [tens, ones] = rowMajor(CAGES[name]);
  return [[tens, 10], [ones, 1]];
}
function cornerSum(n1, n2) {
  return new Sum(80, ...cageAsSumTerms(n1), ...cageAsSumTerms(n2));
}
const cornerSums = [
  cornerSum('A', 'B'),
  cornerSum('C', 'D'),
  cornerSum('A', 'C'),
  cornerSum('B', 'D'),
];

return [
  new Shape('9x9'),
  new Given('R5C5', 2),
  ...productLines,
  ...cageConstraints,
  ...cornerSums,
];
