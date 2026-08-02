// Title: Effervescence
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=OdiaFCgFt0o
// Source: https://app.crackingthecryptic.com/sudoku/4mH66tpGmM

// Normal 9x9 Sudoku rules apply. A circled digit states its total number of
// occurrences among all drawn in-grid circles. The source's ten outside
// X-sum badge values are absent from the local payload, so X-sums are omitted.

// Circled cells transcribed from the payload's 36 in-grid circle underlays.
const circleCells = [
  'R3C4', 'R4C5', 'R8C2', 'R9C8', 'R2C9', 'R9C1', 'R9C2', 'R9C7',
  'R7C4', 'R7C5', 'R7C8', 'R1C6', 'R5C5', 'R4C9', 'R5C9', 'R3C8',
  'R7C7', 'R7C9', 'R3C7', 'R1C4', 'R8C4', 'R8C5', 'R6C5', 'R5C6',
  'R6C3', 'R4C3', 'R3C2', 'R3C1', 'R1C1', 'R1C3', 'R2C4', 'R2C6',
  'R6C2', 'R7C6', 'R4C7', 'R6C1',
];

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
];
