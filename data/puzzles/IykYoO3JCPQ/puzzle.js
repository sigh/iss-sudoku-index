// Title: Mystery Kropki Sudoku 2
// Author: Can Erturan
// Video: https://www.youtube.com/watch?v=IykYoO3JCPQ
// Source: https://app.crackingthecryptic.com/sudoku/3gJJ7JJpGH

// Normal sudoku rules apply. No given digits.
//
// The digits joined by a white dot have a fixed difference; by a black dot a
// fixed ratio (any rational, not necessarily an integer); by a blue dot a
// fixed sum; by a red dot a fixed product. No dot carries a printed number.
// Read as a per-dot fact this is vacuous (any two digits trivially have some
// difference/ratio/sum/product), so the only reading that constrains
// anything is one shared unknown value per colour, holding across every dot
// of that colour. Each colour's value is encoded as a disjunction over every
// value it could possibly take for two distinct digits 1-9, generated below
// rather than hand-enumerated.

// Edges recovered from the payload's overlay colours, grouped by dot colour.
const whiteDots = [
  ['R3C8', 'R3C9'], ['R3C7', 'R4C7'], ['R2C6', 'R3C6'], ['R3C5', 'R3C6'],
  ['R2C5', 'R3C5'], ['R1C2', 'R2C2'], ['R5C5', 'R5C6'], ['R8C8', 'R9C8'],
  ['R1C9', 'R2C9'],
];
const blackDots = [
  ['R2C5', 'R2C6'], ['R7C6', 'R8C6'], ['R6C3', 'R6C4'], ['R7C2', 'R7C3'],
];
const redDots = [
  ['R6C3', 'R7C3'], ['R6C2', 'R7C2'], ['R1C5', 'R1C6'],
];
const blueDots = [
  ['R4C2', 'R5C2'], ['R9C1', 'R9C2'], ['R6C7', 'R6C8'], ['R4C7', 'R5C7'],
  ['R4C8', 'R4C9'], ['R5C8', 'R5C9'], ['R6C2', 'R6C3'],
];

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

// Every difference two distinct digits 1-9 can have.
const diffCandidates = [];
for (let d = 1; d <= 8; d++) diffCandidates.push(d);

// Every reduced (larger/smaller) ratio two distinct digits 1-9 can have.
const ratioCandidates = [];
{
  const seen = new Set();
  for (let a = 1; a <= 9; a++) {
    for (let b = a + 1; b <= 9; b++) {
      const g = gcd(a, b);
      const key = `${b / g}/${a / g}`;
      if (!seen.has(key)) { seen.add(key); ratioCandidates.push([b / g, a / g]); }
    }
  }
}

// Every product two distinct digits 1-9 can have.
const productCandidates = [];
{
  const seen = new Set();
  for (let a = 1; a <= 9; a++) {
    for (let b = a + 1; b <= 9; b++) {
      if (!seen.has(a * b)) { seen.add(a * b); productCandidates.push(a * b); }
    }
  }
}

// One Or-branch per candidate shared value; each branch is an And requiring
// every dot of that colour to hit that same value.
const whiteChoice = new Or(diffCandidates.map(d => {
  const key = Pair.fnToKey((a, b) => Math.abs(a - b) === d, 9);
  return new And(whiteDots.map(([x, y]) => new Pair(key, '', x, y)));
}));

const blackChoice = new Or(ratioCandidates.map(([p, q]) => {
  const key = Pair.fnToKey((a, b) => Math.max(a, b) * q === Math.min(a, b) * p, 9);
  return new And(blackDots.map(([x, y]) => new Pair(key, '', x, y)));
}));

const redChoice = new Or(productCandidates.map(p => {
  const key = Pair.fnToKey((a, b) => a * b === p, 9);
  return new And(redDots.map(([x, y]) => new Pair(key, '', x, y)));
}));

// Sum is linear, so the shared unknown blue total needs no enumeration:
// EqualSum ties every blue-dot pair's sum to the others directly.
const blueChoice = new EqualSum(...blueDots);

return [
  new Shape('9x9'),
  whiteChoice,
  blackChoice,
  redChoice,
  blueChoice,
];
