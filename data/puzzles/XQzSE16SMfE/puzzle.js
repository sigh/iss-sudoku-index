// Title: Sigma (U+03A3)
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=XQzSE16SMfE
// Source: https://sudokupad.app/91jlsoujs1

// Normal sudoku rules apply. Each pink line is a renban: it contains a set of
// consecutive digits (in any order). No two pink lines have the same digit
// sum.

// Pink renban lines, read off the drawn waypoints.
const lines = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C7', 'R1C8', 'R1C9'],
  ['R8C4', 'R8C3', 'R8C2', 'R8C1'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R2C5', 'R2C6', 'R2C7'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R6C3', 'R6C4'],
  ['R4C3', 'R4C4'],
  ['R5C3', 'R5C4'],
  ['R4C7', 'R5C7'],
  ['R3C6', 'R4C6'],
  ['R5C8', 'R6C8'],
];

// A renban line's digit sum is a linear function of its lowest digit m and
// its length L: sum = L*m + L*(L-1)/2. Track each line's m in an auxiliary
// Var (domain 1-9, same as the main grid) rather than the sum itself, since
// sums can reach 30, above the grid's max representable value (16).
const sumOf = (L, m) => L * m + (L * (L - 1)) / 2;

const mVar = new Var('M', 'renban start digit', lines.length);

// Pin each mVar to the actual lowest digit of its line.
const linkStartToCells = lines.map((cells, i) => {
  const L = cells.length;
  const offset = (L * (L - 1)) / 2;
  return new Sum(offset, ...cells, [mVar.cell(i + 1), -L]);
});

// No two lines share a sum: within a length group, equal sums mean equal
// starts, so AllDifferent on that group's mVars suffices. Across length
// groups the sums must be compared directly with a length-aware Pair.
const groups = { 2: [], 3: [], 4: [] };
lines.forEach((cells, i) => groups[cells.length].push(i));

const sameLengthDistinct = Object.values(groups).map(
  idxs => new AllDifferent(...idxs.map(i => mVar.cell(i + 1))));

const crossLengthDistinct = [];
const lengths = [2, 3, 4];
for (let a = 0; a < lengths.length; a++) {
  for (let b = a + 1; b < lengths.length; b++) {
    const [La, Lb] = [lengths[a], lengths[b]];
    const key = Pair.fnToKey((x, y) => sumOf(La, x) !== sumOf(Lb, y), 9);
    for (const i of groups[La]) {
      for (const j of groups[Lb]) {
        crossLengthDistinct.push(
          new Pair(key, '', mVar.cell(i + 1), mVar.cell(j + 1)));
      }
    }
  }
}

return [
  new Shape('9x9'),

  ...lines.map(cells => new Renban(...cells)),

  mVar,
  ...linkStartToCells,
  ...sameLengthDistinct,
  ...crossLengthDistinct,
];
