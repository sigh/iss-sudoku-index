// Title: Zipper Zipper
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=UdcS1sN52Cs
// Source: https://sudokupad.app/34vev6zoay

// Normal sudoku rules apply. Purple lines are zipper lines: digits an equal
// distance from a line's central cell sum to the digit in that central cell.
// The white dot marks a consecutive pair. The grid also contains nine
// 'doublers', one in each row, column, and box; each digit 1-9 is doubled
// exactly once. A doubled digit counts as double its value for zipper-line
// sums (but stays its plain value for ordinary row/column/box uniqueness).
// The doubler cells' positions are not drawn -- they are solver-discovered,
// so they are modelled with a per-cell flag overlay (1 = normal, 2 =
// doubled).

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);

// Zipper lines, low-arm..center..high-arm, transcribed from each drawn
// purple line's interpolated cell path.
const zipperLines = [
  ['R7C7', 'R8C7', 'R9C7'],
  ['R7C8', 'R8C8', 'R9C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R1C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R2C2', 'R2C3'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R7C3', 'R7C2', 'R7C1', 'R8C2', 'R9C1', 'R9C2', 'R9C3'],
  ['R3C6', 'R4C6', 'R4C7'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C4', 'R8C5'],
  ['R4C3', 'R4C4', 'R5C4', 'R5C5', 'R6C5', 'R7C5', 'R7C6'],
  ['R1C6', 'R2C6', 'R3C7'],
];

// A repeated grid cell in an EqualSum segment sums with multiplicity (ISS
// merges repeats into one coefficient per cell), so `repeat(a, 2)` is how a
// doubled digit's contribution is written without a widened value range.
const repeat = (cell, n) => Array(n).fill(cell);

// One arm pair (a, b) symmetric about a line's center c requires
// digit(a)*flag(a) + digit(b)*flag(b) == digit(c)*flag(c). The multiplier
// only takes literal values 1 or 2, so the 2x2x2 flag combinations are
// case-split into an Or of And-gated EqualSums, one per combination.
function zipperPair(a, b, c) {
  const branches = [];
  for (const fa of [1, 2]) {
    for (const fb of [1, 2]) {
      for (const fc of [1, 2]) {
        branches.push(new And([
          new Given(flag(a), fa),
          new Given(flag(b), fb),
          new Given(flag(c), fc),
          new EqualSum([...repeat(a, fa), ...repeat(b, fb)], repeat(c, fc)),
        ]));
      }
    }
  }
  return new Or(branches);
}

const zipperConstraints = zipperLines.flatMap(cells => {
  const center = cells[Math.floor(cells.length / 2)];
  const out = [];
  for (let i = 0; i < Math.floor(cells.length / 2); i++) {
    out.push(zipperPair(cells[i], cells[cells.length - 1 - i], center));
  }
  return out;
});

// Doubler placement: exactly one doubled cell per row/column/box. With flag
// in {1,2}, a house's flags sum to 10 iff exactly one of its 9 cells is
// doubled (eight 1s + one 2 == 10; any other doubler count gives a different
// total).
const houseFlagSums = [...graph.rows(), ...graph.columns(), ...graph.boxes()]
  .map(house => new Sum(10, ...flags.at(house)));

// The digit doubled in each row, used to enforce "each digit 1-9 is doubled
// exactly once" below. Each row has exactly one doubled cell (by
// houseFlagSums above), so for each row cell either it isn't the doubler
// (flag == 1) or its digit equals the row's doubled-digit Var.
const rowDoubledDigits = new Var('E', 'row doubled digits', 9);
const doublerDigitBindings = graph.rows().flatMap((row, i) => {
  const target = rowDoubledDigits.cell(i + 1);
  return row.map(c => new Or([
    new Given(flag(c), 1),
    new SameValues(2, c, target),
  ]));
});

return [
  new Shape('9x9'),
  new Given('R1C8', 3),
  new WhiteDot('R2C9', 'R3C9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  rowDoubledDigits,
  new AllDifferent(...rowDoubledDigits.cells()),
  ...doublerDigitBindings,
  ...houseFlagSums,
  ...zipperConstraints,
];
