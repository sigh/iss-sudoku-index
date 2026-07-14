// Title: Sliced Magic
// Author: bene
// Video: https://www.youtube.com/watch?v=UNJGzbTPTlA
// Source: https://sudokupad.app/zyx44fv3rj

// Killer cages are the torn pieces. The nine horizontal trominoes must be
// partitionable into three unrotated normal 3x3 magic squares. A normal 3x3
// magic square has one of four possible ordered-row families (up to reversing
// the order of its rows). The balance NFAs require equal numbers of all three
// row roles in each family, which is exactly the required partition.
const horizontalPieces = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C3', 'R2C4', 'R2C5'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R4C7', 'R4C8', 'R4C9'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R7C3', 'R7C4', 'R7C5'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R9C1', 'R9C2', 'R9C3'],
];

const rowFamilies = [
  [[8, 1, 6], [3, 5, 7], [4, 9, 2]],
  [[6, 1, 8], [7, 5, 3], [2, 9, 4]],
  [[4, 3, 8], [9, 5, 1], [2, 7, 6]],
  [[8, 3, 4], [1, 5, 9], [6, 7, 2]],
];
const allMagicRows = rowFamilies.flat();
const horizontalCells = horizontalPieces.flat();

function balanceMachine(familyIndex, positiveRole, negativeRole) {
  const prefixes = new Set(allMagicRows.flatMap(row => [
    String(row[0]),
    `${row[0]},${row[1]}`,
  ]));

  return NFA.encodeSpec({
    startState: { prefix: '', difference: 0 },
    transition: ({ prefix, difference }, value) => {
      const nextPrefix = prefix ? `${prefix},${value}` : String(value);
      const values = nextPrefix.split(',').map(Number);
      if (values.length < 3) {
        if (!prefixes.has(nextPrefix)) return undefined;
        return { prefix: nextPrefix, difference };
      }

      const role = rowFamilies[familyIndex]
        .findIndex(row => row.every((digit, i) => digit === values[i]));
      const isSomeMagicRow = allMagicRows
        .some(row => row.every((digit, i) => digit === values[i]));
      if (!isSomeMagicRow) return undefined;

      const delta = role === positiveRole ? 1 : role === negativeRole ? -1 : 0;
      return { prefix: '', difference: difference + delta };
    },
    accept: ({ prefix, difference }) => prefix === '' && difference === 0,
    // The machine scans exactly the nine three-cell pieces.
    maxDepth: 27,
  }, 9);
}

const rowBalanceConstraints = rowFamilies.flatMap((_, familyIndex) => [
  new NFA(
    balanceMachine(familyIndex, 0, 1),
    `magic row family ${familyIndex + 1}: roles 1 and 2 balance`,
    ...horizontalCells,
  ),
  new NFA(
    balanceMachine(familyIndex, 1, 2),
    `magic row family ${familyIndex + 1}: roles 2 and 3 balance`,
    ...horizontalCells,
  ),
]);

const cages = [
  [7, 'R1C2', 'R1C3'],
  [15, 'R1C4', 'R1C5', 'R1C6'],
  [15, 'R2C3', 'R2C4', 'R2C5'],
  [14, 'R3C4', 'R3C5'],
  [15, 'R3C6', 'R3C7', 'R3C8'],
  [15, 'R4C7', 'R4C8', 'R4C9'],
  [9, 'R5C6', 'R5C7'],
  [15, 'R5C2', 'R5C3', 'R5C4'],
  [15, 'R6C2', 'R6C3', 'R6C4'],
  [15, 'R7C3', 'R7C4', 'R7C5'],
  [15, 'R8C4', 'R8C5', 'R8C6'],
  [15, 'R6C7', 'R7C7', 'R8C7'],
  [15, 'R9C1', 'R9C2', 'R9C3'],
  [11, 'R4C2', 'R4C3'],
];

// The fourth square consists of the vertical tromino and exactly three of the
// four horizontal dominoes. Without rotation, the tromino is an outside column
// and one domino occupies each row. Enumerating the 48 arrangements also picks
// the single decoy cage.
const verticalPiece = ['R6C7', 'R7C7', 'R8C7'];
const dominoes = [
  ['R1C2', 'R1C3'],
  ['R3C4', 'R3C5'],
  ['R5C6', 'R5C7'],
  ['R4C2', 'R4C3'],
];

function permutations(values) {
  if (values.length === 0) return [[]];
  return values.flatMap((value, i) => permutations([
    ...values.slice(0, i),
    ...values.slice(i + 1),
  ]).map(rest => [value, ...rest]));
}

function magicSquareConstraints(rows) {
  const columns = [0, 1, 2].map(col => rows.map(row => row[col]));
  const diagonals = [
    [rows[0][0], rows[1][1], rows[2][2]],
    [rows[0][2], rows[1][1], rows[2][0]],
  ];
  return new And([
    new AllDifferent(...rows.flat()),
    new EqualSum(...rows, ...columns, ...diagonals),
  ]);
}

const fourthSquareArrangements = dominoes.flatMap((_, decoyIndex) => {
  const usedDominoes = dominoes.filter((__, i) => i !== decoyIndex);
  return permutations(usedDominoes).flatMap(rowsOfDominoes => [
    magicSquareConstraints(rowsOfDominoes.map((domino, row) => [
      verticalPiece[row], ...domino,
    ])),
    magicSquareConstraints(rowsOfDominoes.map((domino, row) => [
      ...domino, verticalPiece[row],
    ])),
  ]);
});

return [
  new Shape('9x9'),
  new Given('R1C9', 9),
  new Given('R4C1', 3),
  new Given('R4C4', 8),
  new Given('R4C5', 6),
  new Given('R9C3', 3),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...rowBalanceConstraints,
  new Or(fourthSquareArrangements),
];
