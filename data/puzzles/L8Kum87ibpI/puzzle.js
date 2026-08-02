// Title: 9M
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=L8Kum87ibpI
// Source: https://app.crackingthecryptic.com/BbRDTfQDJh

// Standard Sudoku rules apply. Adjacent digits on each drawn grey line sum to 7, 8, or 9.
const greyLineKey = Pair.fnToKey((a, b) => [7, 8, 9].includes(a + b), 9);
const greyLines = [
  new Pair(greyLineKey, 'grey line',
    // Drawn grey line 1, transcribed from its waypoint path.
    'R8C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8', 'R7C8',
    'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C7', 'R1C6', 'R1C5',
    'R1C4', 'R1C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C3', 'R6C4',
    'R6C5', 'R6C6', 'R6C7', 'R5C8'),
  new Pair(greyLineKey, 'grey line',
    // Drawn grey line 2, transcribed from its waypoint path.
    'R5C3', 'R4C3', 'R3C3', 'R4C4', 'R3C5', 'R4C5', 'R5C5'),
];

return [
  new Shape('9x9'),
  new Given('R6C5', 1),
  new Given('R8C7', 7),
  new Given('R9C2', 3),
  ...greyLines,
];
