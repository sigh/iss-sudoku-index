// Title: Repeat Offenders
// Author: Witness-Spoiling Idiot
// Video: https://www.youtube.com/watch?v=fp8kgYvhBVw
// Source: https://app.crackingthecryptic.com/sudoku/DjqHD2n3jg
//
// Normal sudoku rules apply (standard 3x3 boxes, all givens below).
// 13 real cages (drawn cage outlines), none carrying a printed total:
// "all cages sum to a perfect square or cube, and these sums are allowed to
// repeat once each" is what fixes each total, so every cage's total is
// encoded as an unknown value restricted to the square/cube totals its own
// cell count and repeat rule can reach, and the once-each clause becomes a
// global constraint that no total is shared by three or more of the 13
// cages.
// "Digits cannot repeat in cages, except blue ones": the deepskyblue
// shading covers exactly the 28 cells of the two 14-cell cages below and no
// others, so those two are the blue (repeats allowed) cages; every other
// cage gets AllDifferent.

const graph = cellGraph('9x9');

// cells: drawn cage outlines, converted to R#C#. blue: matches the drawn
// deepskyblue shading (28 cells, exactly these two cages) per the "except
// blue ones" clause above.
const CAGES = [
  { cells: ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C5', 'R2C6', 'R3C4', 'R3C5',
    'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'], blue: true },
  { cells: ['R4C9', 'R5C9'], blue: false },
  { cells: ['R7C7', 'R7C8', 'R8C8', 'R7C9'], blue: false },
  { cells: ['R9C9'], blue: false },
  { cells: ['R5C7', 'R5C6', 'R6C6'], blue: false },
  { cells: ['R4C5'], blue: false },
  { cells: ['R4C4'], blue: false },
  { cells: ['R5C4'], blue: false },
  { cells: ['R6C4'], blue: false },
  { cells: ['R7C6', 'R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C3', 'R9C2',
    'R9C1', 'R8C2', 'R7C2', 'R6C2', 'R7C3', 'R8C3'], blue: true },
  { cells: ['R5C2', 'R5C1'], blue: false },
  { cells: ['R3C2', 'R4C2', 'R4C3', 'R3C3'], blue: false },
  { cells: ['R2C3', 'R1C3'], blue: false },
];

// The merged palette of every square/cube total any cage above can reach
// (cage sizes 1, 2, 3, 4, 14; blue cages allow repeats, others don't), sorted.
// Squares <=126: 1,4,9,16,25,36,49,64,81,100,121. Cubes <=126: 1,8,27,64,125.
const VALUE_TABLE = [1, 4, 8, 9, 16, 25, 27, 36, 49, 64, 81, 100, 121, 125];

// For a cage of `size` cells with `blue` repeats-allowed, its total ranges
// over [min, max]: with repeats allowed min=size*1, max=size*9; all-different
// min=size*(size+1)/2 (1..size), max=size*(19-size)/2 ((9-size+1)..9).
function allowedIndices(size, blue) {
  const min = blue ? size * 1 : size * (size + 1) / 2;
  const max = blue ? size * 9 : size * (19 - size) / 2;
  const indices = [];
  VALUE_TABLE.forEach((v, i) => {
    if (v >= min && v <= max) indices.push(i + 1); // Var values are 1-indexed
  });
  return indices;
}

// One index Var per cage, holding which VALUE_TABLE entry (1..14) its total
// equals. This both ties the total to a square/cube value (branch i asserts
// Sum == VALUE_TABLE[i-1]) and gives the once-each rule below a small,
// uniform domain to compare across all 13 cages regardless of cage size.
const totalVar = new Var('S', 'cage total index', CAGES.length);

// Each cage's total is one of the square/cube values it can reach: Given
// pins the index Var to one candidate, Sum ties that same candidate's value
// to the cage's actual total, and Or lets any one candidate satisfy it.
const totalConstraints = CAGES.map((cage, i) => new Or(
  allowedIndices(cage.cells.length, cage.blue).map(idx => new And([
    new Given(totalVar.cell(i + 1), idx),
    new Sum(VALUE_TABLE[idx - 1], ...cage.cells),
  ]))
));

// "Except blue ones": AllDifferent on every non-blue cage with >1 cell.
// (A 1-cell cage needs no AllDifferent; blue cages 0 and 9 allow repeats.)
const distinctConstraints = CAGES
  .filter(cage => !cage.blue && cage.cells.length > 1)
  .map(cage => new AllDifferent(...cage.cells));

// "Sums are allowed to repeat once each": no VALUE_TABLE index may be shared
// by 3+ of the 13 cages. Equivalent to: every 3-subset of the 13 index Vars
// has at least one differing pair. Generated over all C(13,3) triples rather
// than hand-enumerated.
const neqKey = Pair.fnToKey((a, b) => a !== b, VALUE_TABLE.length);
function pair(a, b) {
  return new Pair(neqKey, 'cage total repeat-limit', a, b);
}
const repeatLimitConstraints = [];
const totalCells = totalVar.cells();
for (let i = 0; i < totalCells.length; i++) {
  for (let j = i + 1; j < totalCells.length; j++) {
    for (let k = j + 1; k < totalCells.length; k++) {
      const [a, b, c] = [totalCells[i], totalCells[j], totalCells[k]];
      repeatLimitConstraints.push(
        new Or([pair(a, b), pair(b, c), pair(a, c)]));
    }
  }
}

return [
  // Widened to 14 values so the index Vars above can hold a VALUE_TABLE
  // index; grid cells are restricted back to 1-9 immediately below (one
  // shifted-copy template via Replicate, since it is the same Given applied
  // to every grid cell).
  new Shape('9x9', VALUE_TABLE.length),
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8, 9)),

  // Givens (drawn digits).
  new Given('R1C1', 2), new Given('R1C5', 6), new Given('R1C7', 5),
  new Given('R2C2', 7), new Given('R2C8', 6),
  new Given('R3C4', 5), new Given('R3C6', 7),
  new Given('R4C3', 2),
  new Given('R5C1', 3), new Given('R5C6', 5), new Given('R5C9', 6),
  new Given('R6C3', 8), new Given('R6C9', 5),
  new Given('R7C5', 2), new Given('R7C6', 4),
  new Given('R8C1', 6), new Given('R8C8', 7),
  new Given('R9C2', 2), new Given('R9C5', 5), new Given('R9C8', 3),

  totalVar,
  ...totalConstraints,
  ...distinctConstraints,
  ...repeatLimitConstraints,
];
