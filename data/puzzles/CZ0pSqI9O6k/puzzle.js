// Title: SVS 379 - Multiplarrows Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=CZ0pSqI9O6k
// Source: https://sudokupad.app/Hp97h2FtB4

// Normal sudoku rules apply (9x9, standard 3x3 boxes, no givens). Every grey
// line runs between two white circles. "The sum of the digits on a line
// between two circles is equal to the product of both digits in the
// circles" -- "between" is read as naming the interior cells only, excluding
// the two circled cells themselves. "In each calculation, digits may be
// repeated" means the line's interior cells are not otherwise constrained to
// be distinct from each other or from the circle digits; only the usual row/
// column/box rules apply, so no extra all-different constraint is added.

// Builds one NFA per line: the first cell read is one circle (a), the last
// cell read is the other circle (b), and every cell in between accumulates
// into a running sum. The last transition checks the running sum against
// a*b directly and branches to a single 'ACCEPT' sink (or rejects) instead
// of carrying b in the state -- carrying it would multiply the final layer
// by 9. The sum is clamped at 82 (one above the largest possible product,
// 9*9=81) since any higher running sum can never match a subsequent product.
function factorLineNFA(length) {
  return NFA.encodeSpec({
    startState: { pos: 0, a: null, sum: 0 },
    transition: (state, value) => {
      const { pos, a, sum } = state;
      if (pos === 0) return { pos: pos + 1, a: value, sum: 0 };
      if (pos === length - 1) return sum === a * value ? 'ACCEPT' : undefined;
      return { pos: pos + 1, a, sum: Math.min(sum + value, 82) };
    },
    accept: state => state === 'ACCEPT',
    // Bounds the position counter, which otherwise climbs forever: each
    // NFA is only ever fed exactly `length` cells.
    maxDepth: length,
  }, 9);
}

function factorLine(cells) {
  return new NFA(
    factorLineNFA(cells.length), `${cells.length}-cell factor line`, ...cells);
}

// Cell paths transcribed from the drawn grey lines, interpolated through
// their waypoints; the drawn circle endpoints match each line's first and
// last cell exactly.
const lines = [
  ['R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R1C6', 'R2C5', 'R3C4'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8'],
  ['R3C3', 'R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R3C2'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R4C2', 'R5C2', 'R6C2', 'R6C1'],
  ['R3C3', 'R4C3', 'R5C4', 'R6C3'],
  ['R6C1', 'R7C2', 'R8C3'],
  ['R8C2', 'R9C1', 'R9C2'],
  ['R9C3', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6'],
  ['R6C6', 'R6C5', 'R6C4', 'R6C3'],
  ['R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C8', 'R8C9'],
  ['R4C4', 'R5C5', 'R5C6', 'R5C7', 'R6C8', 'R5C8', 'R4C9'],
];

return [
  new Shape('9x9'),
  ...lines.map(factorLine),
];
