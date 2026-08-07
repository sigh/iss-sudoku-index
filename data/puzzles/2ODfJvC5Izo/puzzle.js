// Title: Base Cages
// Author: Brian Scott
// Video: https://www.youtube.com/watch?v=2ODfJvC5Izo
// Source: https://app.crackingthecryptic.com/sudoku/mgJHLFHTpF

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits do not
// repeat within a cage: AllDifferent per cage. Each cage carries a total
// (its `value` in the source, e.g. "21", "1D") and exactly one circle
// (single cell) or pill (two adjacent cells, same row) drawn inside it. The
// cage's own digits under that circle/pill, read left-to-right, form the
// base; the printed total is that base's digit-string, so the cage's digit
// sum must equal the total's place-value expansion in that base. Letters in
// a total ("1D","1F") are the standard hex-style digit values (D=13, F=15);
// every observed letter is within that range so no extended alphabet is
// needed. A numeral is only well-formed in base b when every one of its
// digit characters is < b, so each cage's base is also bounded below by one
// more than its total's largest digit -- not a separate drawn rule, just
// what "a numeral expressed in base b" means arithmetically.

function hexVal(ch) {
  const v = parseInt(ch, 16);
  if (Number.isNaN(v)) throw new Error(`bad total digit: ${ch}`);
  return v;
}

// Place-value expansion of totalStr's characters, evaluated at base b.
function valueInBase(totalStr, b) {
  let v = 0;
  for (const ch of totalStr) v = v * b + hexVal(ch);
  return v;
}

// One more than totalStr's largest digit value: the smallest base in which
// every character of totalStr is a legal digit.
function minValidBase(totalStr) {
  return Math.max(...[...totalStr].map(hexVal)) + 1;
}

function range(lo, hi) {
  const out = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

// Cage whose base is a single circled cell (also a cage member) and whose
// 2-character total is linear in that base: total = d1*base + d0.
function baseCageSingle(cells, baseCell, totalStr) {
  const [d1, d0] = [...totalStr].map(hexVal);
  return new And([
    new Given(baseCell, ...range(minValidBase(totalStr), 9)),
    new Sum(d0, ...cells, [baseCell, -d1]),
  ]);
}

// Cage whose base is a two-cell pill (both cage members), read left-to-right
// as base = 10*tensCell + onesCell, with a 2-character total: linear in base.
function baseCagePill(cells, tensCell, onesCell, totalStr) {
  const [d1, d0] = [...totalStr].map(hexVal);
  return new And([
    basePillMin(tensCell, onesCell, minValidBase(totalStr)),
    new Sum(d0, ...cells, [tensCell, -10 * d1], [onesCell, -d1]),
  ]);
}

// Every (tens, ones) pair whose 10*tens+ones reaches minBase, grouped by
// tens value -- used to bound a pill-formed base below without a general
// linear-inequality primitive.
function basePillMin(tensCell, onesCell, minBase) {
  const branches = [];
  for (let t = 1; t <= 9; t++) {
    const validOnes = range(1, 9).filter(o => 10 * t + o >= minBase);
    if (validOnes.length) {
      branches.push(new And([
        new Given(tensCell, t),
        new Given(onesCell, ...validOnes),
      ]));
    }
  }
  return new Or(branches);
}

// Cage whose base is a single circled cell (also a cage member) and whose
// total has 3+ characters, making it non-linear (e.g. "111" = base^2 + base
// + 1). `Sum` cannot express that directly, so case-split over the base
// cell's own possible sudoku values and use a plain numeric Sum per branch.
function baseCagePoly(cells, baseCell, totalStr) {
  const branches = [];
  for (let b = minValidBase(totalStr); b <= 9; b++) {
    branches.push(new And([
      new Given(baseCell, b),
      new Sum(valueInBase(totalStr, b), ...cells),
    ]));
  }
  return new Or(branches);
}

const cageA = ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C3'];
const cageB = ['R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6'];
const cageC = ['R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R4C8', 'R5C8'];
const cageD = ['R5C6', 'R5C7'];
const cageE = ['R6C7', 'R7C6', 'R7C7'];
const cageF = ['R9C8', 'R9C9'];
const cageG = ['R6C4', 'R6C5', 'R7C5'];
const cageH = ['R4C3', 'R5C3', 'R6C3'];
const cageI = ['R4C2', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R8C4'];
const cageJ = ['R7C1', 'R8C1', 'R8C2'];
const cageK = ['R8C3', 'R9C1', 'R9C2', 'R9C3'];

const allCages = [cageA, cageB, cageC, cageD, cageE, cageF, cageG, cageH, cageI, cageJ, cageK];

return [
  new Shape('9x9'),

  // Digits do not repeat in a cage.
  ...allCages.map(cells => new AllDifferent(...cells)),

  // Circle base on R1C3.
  baseCageSingle(cageA, 'R1C3', '21'),
  // Pill base R1C5(tens),R1C6(ones).
  baseCagePill(cageB, 'R1C5', 'R1C6', '1D'),
  // Pill base R2C7(tens),R2C8(ones).
  baseCagePill(cageC, 'R2C7', 'R2C8', '1F'),
  // Circle base on R5C7.
  baseCageSingle(cageD, 'R5C7', '15'),
  // Circle base on R6C7.
  baseCageSingle(cageE, 'R6C7', '23'),
  // Circle base on R9C9.
  baseCageSingle(cageF, 'R9C9', '18'),
  // Circle base on R6C5.
  baseCageSingle(cageG, 'R6C5', '24'),
  // Circle base on R6C3 -- 3-digit total, non-linear case-split.
  baseCagePoly(cageH, 'R6C3', '111'),
  // Pill base R5C1(tens),R5C2(ones).
  baseCagePill(cageI, 'R5C1', 'R5C2', '19'),
  // Circle base on R8C2 -- 3-digit total, non-linear case-split.
  baseCagePoly(cageJ, 'R8C2', '111'),
  // Circle base on R9C3.
  baseCageSingle(cageK, 'R9C3', '24'),
];
