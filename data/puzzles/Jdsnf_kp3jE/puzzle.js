// Title: Fractured Flow
// Author: Sotehr
// Video: https://www.youtube.com/watch?v=Jdsnf_kp3jE
// Source: https://sudokupad.app/yuy1odkshr

// The first renban is stored as two overlapping strokes; its cell set is the
// union of those strokes because renban order is immaterial.
const renbans = [
  ['R9C2', 'R8C2', 'R7C2', 'R6C3', 'R6C4', 'R5C2', 'R4C2', 'R3C2'],
  ['R9C8', 'R9C7', 'R8C6', 'R7C6', 'R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C5', 'R5C4', 'R6C5', 'R7C4', 'R8C4'],
];

const regionSumLines = [
  ['R1C2', 'R1C3', 'R2C4', 'R3C4', 'R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R7C9', 'R6C9', 'R5C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R6C5', 'R5C6', 'R4C5', 'R3C6', 'R2C6'],
];

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  // Two source strokes form one branched blue line. EqualSum directly relates
  // its four contiguous box segments without inventing an ordering at the fork.
  new EqualSum(
    ['R4C6'],
    ['R4C7', 'R5C8', 'R6C8'],
    ['R7C8'],
    ['R3C8', 'R2C8', 'R1C8'],
  ),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
];
