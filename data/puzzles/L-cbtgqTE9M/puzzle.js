// Title: Let's Build a Snowman
// Author: Nordy
// Video: https://www.youtube.com/watch?v=L-cbtgqTE9M
// Source: https://app.crackingthecryptic.com/HmMdQDq98p

// Rules encoded: 0-8 Sudoku; each arrow circle is the sum of its arm; the
// orange thermo increases; white dots are consecutive; black dots are 2:1;
// adjacent cells on each green line differ by at least 5; and each blue
// snowflake domino is unique among all orthogonal grid adjacencies.

// The arrow arms and coloured-line pairs are transcribed from the drawn paths.
const arrows = [
  ['R5C3', 'R4C4', 'R3C3', 'R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C6', 'R5C7'],
  ['R7C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3'],
];
const greenEdges = [
  ['R6C3', 'R5C2'], ['R5C2', 'R4C1'], ['R5C1', 'R5C2'],
  ['R6C7', 'R5C8'], ['R5C8', 'R4C9'], ['R4C8', 'R5C8'],
];

// The blue edge list is transcribed from the two snowflake marks.
const blueDominoes = [['R6C1', 'R6C2'], ['R6C9', 'R7C9']];
const shape = new Shape('9x9', '0-8');
const gridEdges = Array.from({length: 9}, (_, rowIndex) => {
  const row = rowIndex + 1;
  return Array.from({length: 9}, (_, colIndex) => {
    const col = colIndex + 1;
    return [
    ...(col < 9 ? [[makeCellId(row, col), makeCellId(row, col + 1)]] : []),
    ...(row < 9 ? [[makeCellId(row, col), makeCellId(row + 1, col)]] : []),
    ];
  });
}).flat(2);

// For each other edge p/q, enforce p!=a or q!=b, and p!=b or q!=a. A term
// whose other inequality is already false is simplified to one AllDifferent.
const notBoth = (p, q, a, b) => {
  if (p === a && q === b) return null;
  if (p === a) return new AllDifferent(q, b);
  if (q === b) return new AllDifferent(p, a);
  return new Or([new AllDifferent(p, a), new AllDifferent(q, b)]);
};
const uniqueDominoes = blueDominoes.flatMap(([a, b]) => gridEdges
  .flatMap(([p, q]) => [notBoth(p, q, a, b), notBoth(p, q, b, a)])
  .filter(constraint => constraint !== null));

return [
  shape,
  ...arrows.map(cells => new Arrow(...cells)),
  new Thermo('R3C5', 'R3C6'),
  new WhiteDot('R2C4', 'R2C5'),
  new WhiteDot('R2C5', 'R2C6'),
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R5C5', 'R6C5'),
  new BlackDot('R6C5', 'R7C5'),
  ...greenEdges.map(cells => new Whisper(5, ...cells)),
  ...uniqueDominoes,
];
