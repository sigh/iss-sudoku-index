// Title: Monopoly Sudoku
// Author: Trevor Nicholas
// Video: https://www.youtube.com/watch?v=iG9dyK8RoD0
// Source: https://sudokupad.app/MONOPOLYSUDOKU

// Normal sudoku on a 9x9 grid with standard 3x3 boxes (the payload's own
// `regions` are exactly the default boxes). One given, R3C3=9.
//
// Killer cages: three 2x2 cages, each summing to its corner total with
// distinct digits (Cage bakes in both). Cage A contains the given R3C3=9.
// The payload stores these totals as the strings "|20"/"|30"/"|10" -- the
// leading "|" has no documented meaning in the SudokuPad schema and these
// are the only cage entries in the payload carrying real cells, so they are
// read as plain totals 20/30/10 per "digits in cages add to their corner
// numbers".
//
// Arrow: the arm cells (R8C8,R7C7,R6C6) multiply to 200. The circled bulb at
// R9C9 is the "Pass Go" token (paired with the "200" text at that corner),
// not part of the arithmetic: the rule names a fixed target, not "sums/
// multiplies to the circle", so "digits on the arrow" is read as the drawn
// line only. 200 = 2^3 * 5^2, so within 1-9 every arm digit must itself
// divide 200 -- domain {1,2,4,5,8} -- and the only multiset of three such
// digits multiplying to 200 is {5,5,8} (checked by hand: a 1 or 2 or 4 in
// the arm forces the other two to multiply to >64, impossible in {1,2,4,5,8}
// squared). That is encoded directly: each arm cell restricted to {5,8},
// plus Sum=18 (only 5+5+8 and permutations reach 18 within {5,8}^3).
//
// Properties: nine sets -- the coloured/gray edge-strip groups drawn along
// the inward-facing edge of the perimeter cells they mark -- each hold a run of
// consecutive digits in any order (Renban). "Each set contains a different
// group of digits": a run of consecutive digits is determined by its
// minimum, so each set's minimum is exposed as a helper Var (tied to the
// set's digit sum, since sum = size*min + size*(size-1)/2), and same-size
// sets' helper Vars are made all-different. Different-size sets can never
// hold the same digit-set, so no link is needed across the two sizes.
//
// Chance: the three Chance-cell digits, read in some order as (row, column,
// digit), must name a real grid cell holding that digit ("some combination"
// -- the correspondence is not fixed by the rule, so every one of the 3!
// role-assignments is a live candidate). Encoded as an existential Or over
// the 6 role-permutations x 81 (row,col) grid addresses: for each branch,
// pin the row-role and column-role cells to that row/col and require the
// addressed grid cell to equal the digit-role cell's value.
//
// Omitted: Railroads (RR). The four RR cells pair up into two
// tracks; which two cells pair with which is not stated by the rule or the
// art (a genuinely open correspondence), and each track is an unknown-length
// path, self- and mutually-non-touching, confined to non-property/cage/
// Chance cells, with a start-to-end digit palindrome. Not encoded.

const given = new Given('R3C3', 9);

const cages = [
  new Cage(20, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(30, 'R2C7', 'R2C8', 'R3C7', 'R3C8'),
  new Cage(10, 'R7C2', 'R7C3', 'R8C2', 'R8C3'),
];

const arrowArm = ['R8C8', 'R7C7', 'R6C6'];
const arrow = [
  ...arrowArm.map(cell => new Given(cell, 5, 8)),
  new Sum(18, ...arrowArm),
];

// Property sets, grouped by size: [cells].
const properties3 = [
  ['R1C2', 'R1C3', 'R1C4'],   // red (top row)
  ['R9C2', 'R9C3', 'R9C4'],   // light blue (bottom row)
  ['R2C9', 'R3C9', 'R4C9'],   // green (right column)
  ['R1C1', 'R2C1', 'R4C1'],   // orange (left column, incl. top-left corner)
  ['R6C1', 'R7C1', 'R9C1'],   // hotpink (left column, incl. bottom-left corner)
  ['R1C6', 'R1C7', 'R1C9'],   // yellow (top row, incl. top-right corner)
];
const properties2 = [
  ['R9C7', 'R9C8'],           // brown (bottom row)
  ['R6C9', 'R8C9'],           // dark blue (right column)
  ['R1C8', 'R8C1'],           // utility, gray (top row + left column)
];

const winStart3 = new Var('WA', 'property window start (size 3)', properties3.length);
const winStart2 = new Var('WB', 'property window start (size 2)', properties2.length);

const propertyConstraints = [
  winStart3,
  winStart2,
  ...properties3.flatMap((cells, i) => {
    const w = winStart3.cell(i + 1);
    return [
      new Renban(...cells),
      new Given(w, 1, 2, 3, 4, 5, 6, 7),
      new Sum(3, ...cells, [w, -3]),
    ];
  }),
  ...properties2.flatMap((cells, i) => {
    const w = winStart2.cell(i + 1);
    return [
      new Renban(...cells),
      new Given(w, 1, 2, 3, 4, 5, 6, 7, 8),
      new Sum(1, ...cells, [w, -2]),
    ];
  }),
  new AllDifferent(...winStart3.cells()),
  new AllDifferent(...winStart2.cells()),
];

// Chance: existential Or over every (role-permutation x grid address).
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) out.push([arr[i], ...p]);
  }
  return out;
}
const chanceCells = ['R3C1', 'R7C9', 'R9C6'];
const chanceBranches = [];
for (const [rCell, cCell, dCell] of permutations(chanceCells)) {
  for (let r = 1; r <= 9; r++) {
    for (let c = 1; c <= 9; c++) {
      const target = makeCellId(r, c);
      chanceBranches.push(new And([
        new Given(rCell, r),
        new Given(cCell, c),
        new SameValues(2, target, dCell),
      ]));
    }
  }
}
const chance = new Or(chanceBranches);

return [
  new Shape('9x9'),
  given,
  ...cages,
  ...arrow,
  ...propertyConstraints,
  chance,
];
