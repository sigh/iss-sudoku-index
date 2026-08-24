// Title: Cage Escape
// Author: Stavros96
// Video: https://www.youtube.com/watch?v=-pW3PShpOUw
// Source: https://app.crackingthecryptic.com/sudoku/RFjJmQ9fPG

// Normal sudoku rules apply (default row/column/box all-different).
// Along thermometers, digits increase from the bulb end -> Thermo(bulb, ..., tip).
// In cages, digits sum to the cage total and cannot repeat -> Cage(sum, ...cells),
// which enforces both the sum and all-different by default. No given digits.

const cages = [
  // provenance: the payload's 7 drawn killer cages, converted to 1-indexed
  // R#C#. An 8th cage entry has no cells and no total (a metadata stub) and
  // is not encoded.
  { sum: 10, cells: ['R1C5', 'R2C5', 'R2C6'] },
  { sum: 11, cells: ['R2C8', 'R3C8', 'R2C9'] },
  { sum: 14, cells: ['R3C1', 'R4C1', 'R4C2', 'R4C3'] },
  { sum: 20, cells: ['R5C8', 'R5C9', 'R6C9', 'R7C9'] },
  { sum: 13, cells: ['R6C7', 'R7C7'] },
  { sum: 10, cells: ['R7C5', 'R7C6'] },
  { sum: 15, cells: ['R7C2', 'R8C2', 'R8C3', 'R8C4'] },
];

const thermos = [
  // provenance: the payload's 7 drawn thermometers, converted to 1-indexed
  // R#C#, bulb first. Each bulb end is confirmed against that line's own
  // drawn circle overlay, which sits at the bulb-end waypoint in every case.
  // An 8th line entry has no waypoints (styling only) and is not encoded.
  ['R1C3', 'R1C4', 'R1C5'],
  ['R5C7', 'R6C7'],
  ['R5C6', 'R4C7', 'R3C8'],
  ['R5C4', 'R5C3', 'R4C3', 'R4C2'],
  ['R9C1', 'R8C1', 'R7C2', 'R8C2'],
  ['R8C6', 'R7C5'],
  ['R8C8', 'R8C9', 'R7C9', 'R6C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(({ sum, cells }) => new Cage(sum, ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
];
