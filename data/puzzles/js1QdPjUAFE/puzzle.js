// Title: Border Square Difference
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=js1QdPjUAFE
// Source: https://sudokupad.app/6maya5z2ou

// Rules:
// - Normal sudoku.
// - Digits along an arrow sum to the digit in that arrow's circle.
// - A border square is any 2x2 square crossing at least one box border
//   (it spans rows 3-4 or 6-7, or columns 3-4 or 6-7). In every border
//   square the two diagonal sums differ by a multiple of 4 (0 allowed).

// Arrows as drawn: circle cell first, then the arm cells.
const arrows = [
  ['R1C4', 'R1C3', 'R2C2'],
  ['R9C4', 'R9C3', 'R8C2'],
  ['R3C3', 'R4C4', 'R3C5'],
  ['R4C7', 'R4C8', 'R3C9'],
  ['R1C2', 'R1C1', 'R2C1'],
];

// Cells are read as [TL, BR, TR, BL]; the state is the position read so far
// and (TL + BR - TR - BL) mod 4. Accept when the residue is 0.
const diagonalDiffSpec = NFA.encodeSpec({
  startState: { pos: 0, r: 0 },
  transition: ({ pos, r }, value) => {
    const sign = pos < 2 ? 1 : -1;
    return { pos: pos + 1, r: (((r + sign * value) % 4) + 4) % 4 };
  },
  accept: ({ pos, r }) => pos === 4 && r === 0,
  maxDepth: 4,
}, 9);

// Top-left corners (r, c) of every 2x2 square whose row pair or column pair
// straddles a box boundary (r or c in {3, 6}).
const crossesBorder = (i) => i === 3 || i === 6;
const borderSquares = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    if (!crossesBorder(r) && !crossesBorder(c)) continue;
    borderSquares.push(new NFA(
      diagonalDiffSpec, 'border-square-diagonal-diff',
      makeCellId(r, c), makeCellId(r + 1, c + 1),
      makeCellId(r, c + 1), makeCellId(r + 1, c)));
  }
}

return [
  new Shape('9x9'),
  ...arrows.map((cells) => new Arrow(...cells)),
  ...borderSquares,
];
