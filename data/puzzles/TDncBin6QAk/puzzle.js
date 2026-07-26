// Title: Quines
// Author: Manus Hand
// Video: https://www.youtube.com/watch?v=TDncBin6QAk
// Source: https://sudokupad.app/8l2cabq2sj

// Normal sudoku rules apply (default 3x3 boxes).
//
// Eight colour-shaded regions are drawn on the grid. Each contains a red
// 2-cell cage (no printed total): the region-sum rule states that the
// two-digit number the cage's two cells form (reading order: first cell
// tens, second cell ones -- confirmed by the rules' own worked example,
// "If r1c4 is a 5 and r1c5 is a 6 then ... the red area must sum to 56",
// which is exactly the R1C4,R1C5 cage) equals the sum of every digit in
// that cage's coloured region (the cage's own two cells are members of the
// region and are counted in that sum). A red-outlined cage with no total is
// still a real drawn cage; by the usual killer-cage convention it also
// forces its own two cells to be distinct, so each pair also gets
// AllDifferent. Two grid cells (R6C9, R9C1) carry no shading and are not
// part of any region-sum cage.
//
// Four arrows: the bulb cell equals the sum of the digits on its arm.
//
// Two grey opaque circles (R3C6, R3C7), each drawn in its own region's
// colour and not attached to an arrow, mark an odd digit.

function selfCluedRegion(tensCell, onesCell, regionCells) {
  // region sum (all region cells, including the two cage cells) equals the
  // two-digit number 10*tens + ones. The cage cells appear once via
  // ...regionCells (coefficient 1) and again via the [-10]/[-1] pairs; Sum
  // adds contributions per entry rather than deduplicating, so the net
  // coefficients are tens: 1-10=-9, ones: 1-1=0 -- algebraically the same
  // equation as sum(regionCells) - 10*tens - ones = 0.
  return [
    new Sum(0, ...regionCells, [tensCell, -10], [onesCell, -1]),
    new AllDifferent(tensCell, onesCell),
  ];
}

// Coloured regions and their red cage cells (tens cell, ones cell), read
// from the payload's cell background colours (cArray/c) and the `cage`
// array's cell lists.
const selfCluedRegions = [
  {
    tens: 'R1C1', ones: 'R1C2', // lavender region, cage R1C1,R1C2
    cells: [
      'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3',
      'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3',
      'R7C1',
    ],
  },
  {
    tens: 'R1C4', ones: 'R1C5', // lightpink region, cage R1C4,R1C5
    cells: [
      'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C4',
      'R4C5', 'R4C6',
    ],
  },
  {
    tens: 'R1C6', ones: 'R1C7', // limegreen region, cage R1C6,R1C7
    cells: ['R1C6', 'R1C7', 'R2C7'],
  },
  {
    tens: 'R1C8', ones: 'R1C9', // palegoldenrod region, cage R1C8,R1C9
    cells: [
      'R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9',
    ],
  },
  {
    tens: 'R4C7', ones: 'R4C8', // palegreen region, cage R4C7,R4C8
    cells: [
      'R4C7', 'R4C8', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C4', 'R6C5',
      'R6C6', 'R6C7', 'R6C8',
    ],
  },
  {
    tens: 'R7C2', ones: 'R7C3', // pink region, cage R7C2,R7C3
    cells: [
      'R7C2', 'R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R9C2', 'R9C3',
      'R9C4',
    ],
  },
  {
    tens: 'R7C5', ones: 'R7C6', // darkgray region, cage R7C5,R7C6
    cells: [
      'R7C5', 'R7C6', 'R7C7', 'R8C5', 'R8C6', 'R8C7', 'R9C5', 'R9C6', 'R9C7',
      'R9C8',
    ],
  },
  {
    tens: 'R7C8', ones: 'R7C9', // gold region, cage R7C8,R7C9
    cells: ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C9'],
  },
];

// Arrows: bulb cell first, then arm cells (arm sums to the bulb digit).
const arrows = [
  ['R5C6', 'R5C5', 'R5C4', 'R5C3'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R7C4', 'R7C3', 'R7C2', 'R7C1'],
];

// Grey opaque (non-arrow) circles: odd digit.
const oddCells = ['R3C6', 'R3C7'];

return [
  new Shape('9x9'),
  ...selfCluedRegions.flatMap(r => selfCluedRegion(r.tens, r.ones, r.cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
];
