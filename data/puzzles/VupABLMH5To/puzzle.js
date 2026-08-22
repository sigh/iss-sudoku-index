// Title: Clueless
// Author: Scott Garrabrant
// Video: https://www.youtube.com/watch?v=VupABLMH5To
// Source: https://app.crackingthecryptic.com/sudoku/RLmT4jmJGM
//
// Normal sudoku rules apply. All 25 drawn cages hold no repeated digit
// (AllDifferent), and no two cages share the same sum -- no cage total is
// printed anywhere, so every cage sum is purely a derived quantity.
//
// Cage sums run from 3 (two smallest digits) to 42 (largest 7-cell cage),
// which does not fit in a single cell/Var under ISS's 16-value cap. Each
// cage's sum is instead split into a band B (0-2) and a residue L (0-15)
// with sum = 16*B + L, tied to the cage cells by one coefficient Sum. Two
// cages have equal sums iff both their B and L match, so "all sums
// distinct" becomes: for every pair of cages, its bands differ or its
// residues differ -- encoded as one Or(Pair(neq,...), Pair(neq,...)) per
// pair, using a shared "not equal" pairwise key over the widened alphabet.

// Cage cell lists, transcribed from the puzzle's drawn cages.
const cages = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C1', 'R8C2'],
  ['R9C2', 'R9C3'],
  ['R6C2', 'R7C2'],
  ['R3C2', 'R4C2'],
  ['R1C3', 'R2C3', 'R2C4', 'R3C3', 'R3C4', 'R3C5', 'R4C3'],
  ['R6C3', 'R7C3'],
  ['R1C4', 'R1C5'],
  ['R2C5', 'R2C6'],
  ['R4C4', 'R4C5', 'R5C4'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R7C4', 'R8C4'],
  ['R8C5', 'R9C4', 'R9C5'],
  ['R8C6', 'R9C6'],
  ['R7C6', 'R7C7', 'R8C7'],
  ['R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R5C9', 'R6C9'],
  ['R4C8', 'R4C9', 'R5C8'],
  ['R4C7', 'R5C7'],
  ['R3C7', 'R3C8'],
  ['R2C7', 'R2C8'],
  ['R1C6', 'R1C7', 'R1C8'],
];

const N = cages.length;

// Every cage sum s satisfies 3 <= s <= 42 (min/max over 2- to 7-cell
// all-different digit picks from 1-9). Represent s = 16*(B-1) + (L-1) with
// B in {1,2,3} and L in {1..16}, i.e. B is the stored value of a base-16
// band and L the stored value of the residue within that band -- both fit
// the widened 16-value alphabet this script uses for every cell and Var.
const shape = new Shape('9x9', 16);
const bands = new Var('B', 'cage sum band', N);
const residues = new Var('L', 'cage sum residue', N);

// Only digits 1-9 are playable on the main grid; the alphabet was widened
// to 16 solely to give the band/residue Vars room to represent sums up to 42.
const grid = cellGraph(shape);
const allCells = grid.rows().flat();
const digitRestriction = new Replicate(
  [new Given(allCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)],
  Replicate.encodeTargetCells(allCells, allCells[0], grid),
  allCells[0],
);

const bandRestriction = bands.cells().map(cell => new Given(cell, 1, 2, 3));

const sumTies = cages.map((cells, i) => new Sum(
  -17, ...cells, [bands.cell(i + 1), -16], [residues.cell(i + 1), -1]
));

// "Not equal" pairwise key over the full widened alphabet, shared by every
// band/residue comparison below.
const neqKey = Pair.fnToKey((a, b) => a !== b, shape);

const distinctSums = [];
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    distinctSums.push(new Or([
      new Pair(neqKey, null, bands.cell(i + 1), bands.cell(j + 1)),
      new Pair(neqKey, null, residues.cell(i + 1), residues.cell(j + 1)),
    ]));
  }
}

const noRepeats = cages.map(cells => new AllDifferent(...cells));

return [
  shape,
  digitRestriction,
  bands,
  residues,
  ...bandRestriction,
  ...noRepeats,
  ...sumTies,
  ...distinctSums,
];
