// Title: Uniquely paired dots
// Author: vidarino
// Video: https://www.youtube.com/watch?v=vEWMOcLCnqo
// Source: https://app.crackingthecryptic.com/sudoku/bQgrmRR4HD
//
// Normal sudoku rules apply (default 3x3 boxes, matching the payload's
// explicit `regions`). White dots (WhiteDot) mark consecutive pairs. Black
// dots (BlackDot) mark 1:2 ratio pairs. Green dots mark pairs differing by
// at least 5, which has no dedicated class, so it is a custom Pair relation.
// Every dot cell pair is transcribed from the source payload's overlay
// entries by their edge fill colour (white/black/#A3E048).
//
// "A pair of digits can only appear once for each dot colour": for every
// two same-coloured dots, the unordered pair of digits they carry must
// differ. noRepeatedPair below expresses this directly: for dots (a1,b1)
// and (a2,b2), it forbids both the same-order match (a1=a2 and b1=b2) and
// the swapped-order match (a1=b2 and b1=a2), using a 2-cell AllDifferent
// (values differ) combined with Or/And so neither correspondence of cells
// to the unordered pair is missed. Some same-coloured dots share a drawn
// cell (a chain of dots along one line of edges); orNeq drops a pairing
// naming that same cell twice instead of asserting the cell differs from
// itself, since the shared cell trivially carries one equal value.

const greenDiffKey = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);

function orNeq(cellPairs) {
  const distinguishing = cellPairs
    .filter(([x, y]) => x !== y)
    .map(([x, y]) => new AllDifferent(x, y));
  if (distinguishing.length === 0) {
    throw new Error('Degenerate dot-pair comparison: no distinguishing cells');
  }
  return new Or(distinguishing);
}

function noRepeatedPair(dots) {
  const out = [];
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const [a1, b1] = dots[i];
      const [a2, b2] = dots[j];
      out.push(new And([
        orNeq([[a1, a2], [b1, b2]]),
        orNeq([[a1, b2], [b1, a2]]),
      ]));
    }
  }
  return out;
}

// White dots: edge(...) resolutions with backgroundColor #FFFFFF.
const whiteDots = [
  ['R2C4', 'R3C4'], ['R3C4', 'R4C4'], ['R4C6', 'R4C7'], ['R4C7', 'R4C8'],
  ['R6C6', 'R7C6'], ['R7C6', 'R8C6'], ['R6C3', 'R6C4'], ['R6C2', 'R6C3'],
];

// Black dots: edge(...) resolutions with backgroundColor #000000.
const blackDots = [
  ['R3C3', 'R3C4'], ['R3C7', 'R4C7'], ['R7C6', 'R7C7'], ['R6C3', 'R7C3'],
];

// Green dots: edge(...) resolutions with backgroundColor #A3E048.
const greenDots = [
  ['R2C1', 'R2C2'], ['R2C3', 'R3C3'], ['R2C3', 'R2C4'], ['R2C6', 'R2C7'],
  ['R6C5', 'R6C6'], ['R8C8', 'R9C8'], ['R9C5', 'R9C6'], ['R7C2', 'R7C3'],
  ['R6C2', 'R7C2'], ['R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),

  ...whiteDots.map(([x, y]) => new WhiteDot(x, y)),
  ...blackDots.map(([x, y]) => new BlackDot(x, y)),
  ...greenDots.map(([x, y]) => new Pair(greenDiffKey, 'green dot: differ by >= 5', x, y)),

  ...noRepeatedPair(whiteDots),
  ...noRepeatedPair(blackDots),
  ...noRepeatedPair(greenDots),
];
