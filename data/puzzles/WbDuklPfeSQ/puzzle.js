// Title: Blockers
// Author: Fenners
// Video: https://www.youtube.com/watch?v=WbDuklPfeSQ
// Source: https://sudokupad.app/q6vqwmsp2k

// Normal 9x9 sudoku rules apply (standard rows/cols/boxes, no givens).

// Each drawn line has one colour and encodes one rule:
//   purple = Renban, orange = Dutch Whisper (>=4), green = German Whisper
//   (>=5), blue = Region Sum Line (equal sum per box segment).
// One drawn path (top-right to centre) changes colour partway along: it is a
// 2-cell Renban, then a 3-cell Region Sum Line, then another 2-cell Renban,
// sharing endpoints. Encode each coloured segment as its own clue.
const renbanLines = [
  ['R4C2', 'R3C2', 'R2C2', 'R2C3', 'R2C4'],
  ['R4C7', 'R5C7'],
  ['R7C4', 'R7C5'],
];
const dutchLines = [
  ['R2C6', 'R2C7', 'R3C8', 'R4C8'],
  ['R5C3', 'R4C4', 'R3C5'],
  ['R9C5', 'R9C6'],
  ['R9C8', 'R8C8', 'R8C9', 'R9C9'],
];
const germanLines = [
  ['R6C2', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R6C9', 'R7C9'],
];
const regionSumLines = [
  ['R5C7', 'R6C6', 'R7C5'],
  ['R4C9', 'R3C9', 'R2C9'],
];

// Blockers: "Digits in diamonds can never be used on a different clue type
// than the clue type the diamond lives on." Six cells carry a small diamond
// marker; each sits on one of the coloured lines above. Whatever digit ends
// up in a diamond cell may only appear, elsewhere in the grid, on cells that
// belong to a clue of that same line type -- never on a cell belonging to a
// clue of a different line type. This is a per-diamond restriction (only the
// diamond's own value is constrained), not a blanket rule for the whole line.
const diamonds = [
  { cell: 'R4C2', type: 'renban' },
  { cell: 'R2C4', type: 'renban' },
  { cell: 'R6C2', type: 'german' },
  { cell: 'R8C3', type: 'german' },
  { cell: 'R4C8', type: 'dutch' },
  { cell: 'R2C6', type: 'dutch' },
];

const typeCells = {
  renban: new Set(renbanLines.flat()),
  dutch: new Set(dutchLines.flat()),
  german: new Set(germanLines.flat()),
  regionsum: new Set(regionSumLines.flat()),
};

// For each diamond, forbid its cell from matching any cell that belongs to a
// clue of a different type. A plain 2-cell AllDifferent is a not-equal
// constraint without linking the target cells to each other. Dedupe pairs
// since two diamonds of different types can otherwise both name the same
// opposite-type target cell.
const seenPairs = new Set();
const diamondConstraints = [];
for (const { cell: diamondCell, type: diamondType } of diamonds) {
  for (const [otherType, cells] of Object.entries(typeCells)) {
    if (otherType === diamondType) continue;
    for (const otherCell of cells) {
      if (otherCell === diamondCell) continue;
      const key = [diamondCell, otherCell].sort().join('-');
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      diamondConstraints.push(new AllDifferent(diamondCell, otherCell));
    }
  }
}

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...dutchLines.map(cells => new Whisper(4, ...cells)),
  ...germanLines.map(cells => new Whisper(5, ...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...diamondConstraints,
];
