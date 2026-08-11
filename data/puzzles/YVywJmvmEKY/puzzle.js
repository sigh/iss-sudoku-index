// Title: Distinction
// Author: zetamath
// Video: https://www.youtube.com/watch?v=YVywJmvmEKY
// Source: https://app.crackingthecryptic.com/sudoku/mMPF2P2NqM

// Normal sudoku rules apply (9x9 grid, standard 3x3 boxes). Each purple
// line: digits are consecutive and non-repeating, in any order -- native
// Renban. Additionally, no two purple lines may contain exactly the same
// set of digits.
//
// A Renban line's digit set is exactly {m, m+1, ..., m+L-1} for its lowest
// digit m, so two lines of equal length L share a set iff they share m;
// lines of different length can never share a set (different set sizes).
// So cross-line distinctness reduces to AllDifferent on m within each
// length class. Each line's cell sum is L*m + L*(L-1)/2, which ties an
// auxiliary Var m to the line's true minimum via a linear Sum -- m's
// default domain (1-9, same as the grid) already covers every valid
// minimum (1..10-L), so no extra domain restriction is needed for the tie
// to be exact.

// Purple lines, path order from the puzzle's drawn line geometry.
const lines = [
  ['R1C4', 'R2C5'],
  ['R1C5', 'R1C6', 'R2C6'],
  ['R2C4', 'R3C4', 'R3C3'],
  ['R2C1', 'R3C1', 'R3C2', 'R4C2'],
  ['R5C1', 'R5C2'],
  ['R5C3', 'R5C4'],
  ['R5C6', 'R5C7'],
  ['R5C8', 'R5C9'],
  ['R6C8', 'R6C7', 'R6C6'],
  ['R3C5', 'R4C5'],
  ['R6C5', 'R7C5'],
  ['R8C5', 'R9C5'],
  ['R3C7', 'R3C8', 'R2C9'],
  ['R3C6', 'R4C6', 'R4C7'],
  ['R8C2', 'R7C2', 'R7C3', 'R8C3'],
  ['R9C3', 'R9C4', 'R8C4'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9'],
];

const minVar = new Var('M', 'line minimum digit', lines.length);
const minCell = i => minVar.cell(i + 1);

const sumTies = lines.map((cells, i) => {
  const L = cells.length;
  // sum(cells) - L*m = L*(L-1)/2  <=>  sum(cells) = L*m + L*(L-1)/2
  return new Sum(L * (L - 1) / 2, ...cells, [minCell(i), -L]);
});

const byLength = new Map();
lines.forEach((cells, i) => {
  const L = cells.length;
  if (!byLength.has(L)) byLength.set(L, []);
  byLength.get(L).push(minCell(i));
});
const crossLineDistinctness = Array.from(byLength.values())
  .filter(group => group.length > 1)
  .map(group => new AllDifferent(...group));

return [
  new Shape('9x9'),
  new Given('R1C2', 8),
  new Given('R6C9', 2),
  ...lines.map(cells => new Renban(...cells)),
  minVar,
  ...sumTies,
  ...crossLineDistinctness,
];
