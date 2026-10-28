// Title: Divided Attention
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=8XSB6brMTyA
// Source: https://sudokupad.app/bxh43y0g90

// Normal 6x6 Sudoku, a distinct main diagonal, and the exhaustive outside
// arrows: the first N digits sum to a multiple of diagonal digit N iff marked.
// Arrow locations transcribed from the outside arrows on the board.
const marked = { left: [1, 2, 4, 6], right: [2], top: [2, 3], bottom: [1, 2, 3] };
const numbers = [1, 2, 3, 4, 5, 6];
const shape = new Shape('6x6');

// For fixed N, the NFA tracks only the running sum residue modulo N.
const residueSpecs = numbers.map(n => [false, true].map(mark => NFA.encodeSpec({
  startState: 0,
  transition: (residue, value) => (residue + value) % n,
  accept: residue => (residue === 0) === mark,
}, 6)));
// Two-cell prefixes use a pair predicate testing the same sum residue.
const pairKeys = [false, true].map(mark => Pair.fnToKey(
  (a, b) => ((a + b) % 2 === 0) === mark, shape));
const divisibility = Object.entries(marked).flatMap(([side, arrows]) => numbers.map(i => {
  const line = numbers.map(j => side === 'left' || side === 'right'
    ? makeCellId(i, j) : makeCellId(j, i));
  if (side === 'right' || side === 'bottom') line.reverse();
  const present = arrows.includes(i);
  return new Or(numbers.map(n => new And([
    new Given(makeCellId(i, i), n),
    n === 2 ? new Pair(pairKeys[Number(present)], 'prefix multiple', ...line.slice(0, n))
      : new NFA(residueSpecs[n - 1][Number(present)], 'prefix multiple', line.slice(0, n))
  ])));
}));
return [shape, new Diagonal(-1), ...divisibility];
