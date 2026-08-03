// Title: Badminton
// Author: Qodec
// Video: https://www.youtube.com/watch?v=t-SnwjwJD88
// Source: https://app.crackingthecryptic.com/sudoku/N3fP8JrF2L

// Normal sudoku rules apply; the drawn regions are the default 3x3 boxes, so
// no Jigsaw/NoBoxes override is needed.
// The thin SW-NE diagonal (blue, R1C9..R9C1) holds digits 1-9 once each --
// that is ISS's '/' diagonal.
// Odd-even parity is reflected across the NW-SE diagonal (red, R1C1..R9C9):
// for every cell pair mirrored across it, RxCy and RyCx share the same
// parity. The rules only use the red diagonal as a mirror axis and never
// require it to hold each digit once, so it gets no all-different constraint
// of its own.
// Digits along an arrow sum to the digit in that arrow's circle. Two circles
// (R4C4 and R7C5) anchor two arrows each, extending in different directions;
// each arm sums to its circle independently.

const sameParity = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);

// Every cell reflected across the main (NW-SE) diagonal, one Pair per mirror
// pair; r === c cells lie on the axis itself and need no pairing.
const parityMirrors = [];
for (let r = 1; r <= 9; r++) {
  for (let c = r + 1; c <= 9; c++) {
    parityMirrors.push(
      new Pair(sameParity, 'parity mirror', makeCellId(r, c), makeCellId(c, r)));
  }
}

// Arrow bulb/circle cell first, then arm cells, per the drawn paths.
const arrows = [
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R1C3', 'R1C4', 'R1C5'),
  new Arrow('R4C4', 'R3C3', 'R2C2', 'R1C2'),
  new Arrow('R4C4', 'R5C3'),
  new Arrow('R7C3', 'R6C4', 'R5C5', 'R4C6'),
  new Arrow('R7C5', 'R6C6'),
  new Arrow('R7C5', 'R7C4', 'R8C5', 'R9C5'),
  new Arrow('R8C8', 'R9C8', 'R9C9'),
  new Arrow('R5C8', 'R5C9', 'R4C9'),
  new Arrow('R6C1', 'R5C1', 'R5C2'),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...parityMirrors,
  ...arrows,
];
