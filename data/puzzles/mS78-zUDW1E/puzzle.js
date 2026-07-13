// Title: North Side
// Author: haleypro
// Video: https://www.youtube.com/watch?v=mS78-zUDW1E
// Source: https://sudokupad.app/3xdi7kf6ab

// North Side is the main 9x9 ISS grid. South Side is encoded as 81 Var cells
// with explicit domains and explicit row, column, and box constraints.

const southVar = new Var('S', 'South Side grid', 81);

function southCell(row, col) {
  return southVar.cell((row - 1) * 9 + col);
}

function southCells(cells) {
  return cells.map(([row, col]) => southCell(row, col));
}

const allDigits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// South Side domain givens: every south cell allows all nine digits. All 81
// are identical Given(cell, 1..9) stamps, so Replicate stamps the template
// instead of hand-rolling each copy. `southLocator` is a pure position
// locator (never added to `constraints`) whose 'VS1'..'VS81' ids and
// row-major ordering exactly match `southVar.cell(n)` / southCell(row, col).
const southLocator = cellGraph('9x9').makeOverlay('VS');
const southTargets = southLocator.cells();
const southOrigin = southTargets[0];

const parityKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

const southRows = Array.from({ length: 9 }, (_, row) =>
  new AllDifferent(...allDigits.map(col => southCell(row + 1, col)))
);

const southCols = Array.from({ length: 9 }, (_, col) =>
  new AllDifferent(...allDigits.map(row => southCell(row, col + 1)))
);

const southBoxes = [];
for (let row0 = 1; row0 <= 7; row0 += 3) {
  for (let col0 = 1; col0 <= 7; col0 += 3) {
    const box = [];
    for (let dr = 0; dr < 3; dr++) {
      for (let dc = 0; dc < 3; dc++) box.push(southCell(row0 + dr, col0 + dc));
    }
    southBoxes.push(new AllDifferent(...box));
  }
}

const northConstraints = [
  // North brown slow thermo, from bulb R9C9.
  new Pair(
    slowThermoKey,
    'slow thermo',
    'R9C9', 'R8C8', 'R7C8', 'R6C7', 'R5C6', 'R4C6', 'R4C5',
  ),

  // North red parity line.
  new Pair(
    parityKey,
    'alternating parity',
    'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9',
  ),

  // North blue region sum line.
  new RegionSumLine(
    'R8C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5',
    'R4C4', 'R4C3', 'R4C2', 'R4C1',
  ),

  // North green German whisper line.
  new Whisper(
    'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1',
  ),

  // North yellow Nabner line.
  new PairX(
    nabnerKey,
    'nabner',
    'R1C5', 'R2C5', 'R2C6', 'R2C7', 'R2C8',
  ),

  // North purple zipper line.
  new Zipper('R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8'),

  // North pink renban line.
  new Renban('R9C7', 'R9C8'),
];

const southConstraints = [
  // South pink renban line.
  new Renban(...southCells([
    [1, 7], [1, 6], [1, 5], [2, 5], [3, 5], [3, 4], [3, 3], [3, 2],
  ])),

  // South blue region sum line, split manually by South Side boxes.
  new EqualSum(
    southCells([[2, 1], [2, 2], [2, 3]]),
    southCells([[2, 4], [2, 5], [2, 6]]),
    southCells([[2, 7], [2, 8], [1, 8]]),
  ),

  // South orange Dutch whisper line.
  new Whisper(4, ...southCells([
    [2, 8], [3, 7], [4, 6], [5, 5], [6, 4],
    [7, 4], [8, 4], [8, 3], [8, 2], [9, 1],
  ])),

  // South red parity line.
  new Pair(
    parityKey,
    'alternating parity',
    ...southCells([
      [9, 4], [9, 5], [9, 6], [8, 6], [8, 7], [8, 8],
      [7, 8], [6, 8], [5, 8], [4, 8], [3, 8], [2, 8],
    ]),
  ),

  // South green German whisper line.
  new Whisper(...southCells([
    [7, 7], [7, 8], [7, 9], [6, 9], [5, 9], [4, 9], [3, 9],
  ])),
];

const loopOverlap = [
  // Loop overlap recovered from the source example N R9C7 = S R1C6 and the
  // loop marker alignment N R9C9 = S R1C8.
  new SameValues(2, 'R9C2', southCell(1, 1)),
  new SameValues(2, 'R9C3', southCell(1, 2)),
  new SameValues(2, 'R9C4', southCell(1, 3)),
  new SameValues(2, 'R9C5', southCell(1, 4)),
  new SameValues(2, 'R9C6', southCell(1, 5)),
  new SameValues(2, 'R9C7', southCell(1, 6)),
  new SameValues(2, 'R9C8', southCell(1, 7)),
  new SameValues(2, 'R9C9', southCell(1, 8)),

  // Airplane cells match across both puzzles.
  new SameValues(2, 'R4C1', southCell(9, 1)),
];

return [
  new Shape('9x9'),

  new Given('R1C2', 5),
  new Given('R6C2', 8),
  new Given('R7C4', 4),

  southVar,

  new Replicate(
    [new Given(southOrigin, ...allDigits)],
    Replicate.encodeTargetCells(southTargets, southOrigin, southLocator),
    southOrigin,
  ),

  new Given(southCell(5, 1), 1),
  new Given(southCell(5, 6), 2),
  new Given(southCell(8, 1), 3),

  ...southRows,

  ...southCols,

  ...southBoxes,

  ...northConstraints,

  ...southConstraints,

  ...loopOverlap,
];
