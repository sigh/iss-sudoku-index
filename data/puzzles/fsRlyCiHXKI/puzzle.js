// Title: Silent Killer
// Author: Luda3
// Video: https://www.youtube.com/watch?v=fsRlyCiHXKI
// Source: https://app.crackingthecryptic.com/sudoku/f73T963tbD

// Normal sudoku (default 9x9 with standard boxes; the payload's regions are
// exactly the 9 default boxes). Green lines require adjacent-cell difference
// >= 5 (Whisper(5)). White dots require consecutive digits (WhiteDot). Black
// dots require a 1:2 ratio (BlackDot). The five outside-diagonal badges are a
// non-standard rule with no dedicated ISS class: the total is the sum of the
// diagonal's digits omitting the digit at position N (1-indexed from the
// first/nearest cell), where N is itself the digit placed in that first
// cell, and N may not exceed the diagonal's length. `diagonalOmitNfa` below
// encodes that directly as a state machine over each diagonal's own cells.

// Diagonal cell lists and badge totals are transcribed from the drawn
// off-grid arrow rays paired with their nearest outside-clue text overlay.
function diagonalOmitNfa(total, cells) {
  const length = cells.length;
  const spec = NFA.encodeSpec({
    // pos: cells consumed so far; n: digit read at the first cell (the
    // omitted position), null until read; sum: running total of all
    // consumed digits except the one at position n, saturated at total+1
    // once it can only fail (a standard bounded-counting clamp).
    startState: { pos: 0, n: null, sum: 0 },
    transition: ({ pos, n, sum }, value) => {
      // "N cannot be larger than the length of the diagonal": reject first
      // digits above the diagonal's own length.
      if (n === null && value > length) return undefined;
      const curN = (n === null) ? value : n;
      const nextPos = pos + 1;
      const omit = nextPos === curN;
      const nextSum = omit ? sum : Math.min(sum + value, total + 1);
      return { pos: nextPos, n: curN, sum: nextSum };
    },
    accept: ({ pos, sum }) => pos === length && sum === total,
    maxDepth: length,
  }, 9);
  return new NFA(spec, `diagonal-omit-sum-${total}`, ...cells);
}

// The length-2 diagonal (D4 below) is a two-cell relation, so it is
// expressed as a Pair predicate instead of a one-machine NFA: N is the
// first cell's own digit (capped at length 2 per the same rule), and the
// sum omits whichever of the two cells sits at position N.
function diagonalOmitPair(total) {
  return (a, b) => {
    if (a > 2) return false;
    const digits = [a, b];
    const omitIndex = a - 1;
    const sum = digits.reduce((s, v, i) => (i === omitIndex ? s : s + v), 0);
    return sum === total;
  };
}

const diagonals = [
  // [total, cells...]
  [0, ['R1C1']],
  [17, ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [31, ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1']],
  [13, ['R9C6', 'R8C7', 'R7C8', 'R6C9']],
];

const greenLines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2'],
  ['R7C1', 'R8C1', 'R9C2', 'R9C3'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
];

return [
  new Shape('9x9'),

  ...greenLines.map(cells => new Whisper(5, ...cells)),

  new BlackDot('R4C5', 'R4C6'),
  new BlackDot('R6C4', 'R6C5'),
  new WhiteDot('R8C7', 'R8C8'),

  ...diagonals.map(([total, cells]) => diagonalOmitNfa(total, cells)),
  new Pair(
    Pair.fnToKey(diagonalOmitPair(2), 9), 'diagonal-omit-sum-2',
    'R8C9', 'R9C8'),
];
