// Title: Lines in the Fog
// Author: apetersen
// Video: https://www.youtube.com/watch?v=Qh4LOb-qu2c
// Source: https://app.crackingthecryptic.com/sudoku/FMGPBBt24p

// Normal Sudoku. Every drawn line is a renban and a region-sum line. The grey
// circle at R9C2 is the bulb of the grey line, whose two arms increase away
// from that middle cell.
const lines = [
  ['R3C2', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C5', 'R3C6', 'R3C7', 'R2C7'],
  ['R6C2', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R6C4', 'R5C4', 'R5C3', 'R6C3', 'R7C3'],
  ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R1C7', 'R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R5C7'],
  ['R2C2', 'R2C3', 'R3C3'],
  ['R9C3', 'R9C2', 'R9C1'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new Renban(...cells)),
  ...lines.map(cells => new RegionSumLine(...cells)),
  new Thermo('R9C2', 'R9C3'),
  new Thermo('R9C2', 'R9C1'),
];
