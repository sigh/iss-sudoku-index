// Title: Which Line Is It Anyway?
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=RxMgPBjUah8
// Source: https://app.crackingthecryptic.com/sudoku/GLtpHJ9MhF

// Normal sudoku rules apply. Seven lines are drawn, each is exactly one of
// the seven types below, each type used on exactly one line, and which line
// is which is not given -- it is deduced alongside the digits:
//   1 Renban          non-repeating consecutive digits, any order
//   2 German Whisper   adjacent digits differ by >= 5
//   3 Thermometer      ascending from one end to the other (no bulb is
//                      drawn on any line, so the direction is undetermined
//                      too -- both readings are offered)
//   4 Region Sum Line  equal total per box segment visited, walked in the
//                      cell order below (line 4 dips from box 8 into the
//                      single box-7 cell R8C3 and back, so it contributes
//                      two separate box-8 segments either side of it). Its
//                      own clause requires visiting >= 2 boxes, which rules
//                      this reading out for any line confined to one box.
//   5 Palindrome       reads the same from either end
//   6 Parity           every digit on the line shares one parity
//   7 Unlucky          adjacent digits sum to >= 13
// A LineType Var per line (VLT1..VLT7, restricted to 1-7) records which type
// that line uses; AllDifferent over the seven Vars forces the "each type
// once" bijection. Each line is an Or over all seven readings, each reading
// paired with the Given that pins its LineType Var to the matching index --
// so only the reading matching the actual assignment applies.

const lines = [
  ['R1C5', 'R1C6', 'R2C7', 'R2C8', 'R1C8', 'R2C9', 'R1C9'],
  ['R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9', 'R6C8', 'R6C7', 'R7C8'],
  ['R8C8', 'R8C9', 'R7C9'],
  ['R7C5', 'R7C6', 'R8C5', 'R7C4', 'R8C4', 'R8C3', 'R9C4', 'R9C5', 'R8C6'],
  ['R5C2', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R7C3', 'R6C2', 'R6C3', 'R6C4', 'R5C4', 'R4C4', 'R3C4'],
  ['R2C1', 'R2C2', 'R1C3', 'R2C4', 'R2C5', 'R2C6', 'R3C7', 'R4C6', 'R5C6', 'R5C7', 'R5C8'],
];

const TYPE_COUNT = lines.length; // 7 lines, 7 types -- one each

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

// Shared relation key for "adjacent digits sum to at least 13" (Unlucky Line).
const unluckyKey = Pair.fnToKey((a, b) => a + b >= 13, 9);

function boxOf(cell) {
  const { row, col } = parseCellId(cell);
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3);
}

// "The line visits at least two different boxes" (Region Sum Line's own
// clause): lines 3 and 5 sit entirely inside one box (R8C8/R8C9/R7C9 in box
// 9; R5C2/R6C1/R5C1/R4C1/R4C2/R4C3/R5C3 in box 4), so the Region Sum Line
// reading is geometrically impossible for them, not merely vacuous.
function spansTwoBoxes(cells) {
  return new Set(cells.map(boxOf)).size >= 2;
}

const lineTypeVar = new Var('LT', 'LineType', TYPE_COUNT);

// The single constraint expressing "this cell list is a <typeIdx> line".
function readingFor(cells, typeIdx) {
  switch (typeIdx) {
    case 1:
      return new Renban(...cells);
    case 2:
      return new Whisper(5, ...cells);
    case 3:
      // Direction is not drawn; either end may be the bulb.
      return new Or([
        new Thermo(...cells),
        new Thermo(...[...cells].reverse()),
      ]);
    case 4:
      return new RegionSumLine(...cells);
    case 5:
      return new Palindrome(...cells);
    case 6:
      return new Or([
        new And(cells.map(c => new Given(c, ...ODD))),
        new And(cells.map(c => new Given(c, ...EVEN))),
      ]);
    case 7:
      return new Pair(unluckyKey, `Unlucky-${cells[0]}`, ...cells);
  }
}

const lineConstraints = lines.map((cells, i) => {
  const candidateTypes = Array.from({ length: TYPE_COUNT }, (_, k) => k + 1)
    .filter(typeIdx => typeIdx !== 4 || spansTwoBoxes(cells));
  return new Or(candidateTypes.map(typeIdx => new And([
    readingFor(cells, typeIdx),
    new Given(lineTypeVar.cell(i + 1), typeIdx),
  ])));
});

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  lineTypeVar,
  // Restrict the LineType Vars to the 7 real type indices (Var domain
  // otherwise defaults to the grid's 1-9 range).
  ...lineTypeVar.cells().map(cell => new Given(cell, ...Array.from({ length: TYPE_COUNT }, (_, k) => k + 1))),
  new AllDifferent(...lineTypeVar.cells()),
  ...lineConstraints,
];
