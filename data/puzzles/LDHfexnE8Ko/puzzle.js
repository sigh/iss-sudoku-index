// Title: For Clementine H
// Author: Frans Wentholt
// Video: https://www.youtube.com/watch?v=LDHfexnE8Ko
// Source: https://app.crackingthecryptic.com/sudoku/h2NFBB87fJ

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Along thermometers, digits increase from the bulb end (Thermo's first cell
// is its bulb). Each purple region contains all of the digits 1-9 (AllDifferent
// over exactly 9 cells forces a 1-9 permutation).
//
// The payload draws 9 lines, each paired with one grey circle overlay. For
// every line, the overlay's cell exactly equals the line's first drawn-path
// cell (an exceptionless 9-for-9 match), so that cell is read as the bulb and
// the rest of the path as the increasing shaft, per the rules sentence above.
//
// Purple region cells are read from the two 9-cell magenta (#D23BE7) underlay
// clusters; each is one orthogonally-connected 9-cell blob.
return [
  new Shape('9x9'),

  // Thermometers: bulb cell first, per the drawn circle overlay on each line.
  new Thermo('R1C2', 'R1C3', 'R2C2', 'R2C3'),
  new Thermo('R2C4', 'R1C5', 'R2C5', 'R2C6', 'R1C7', 'R2C7', 'R1C8', 'R1C9'),
  new Thermo('R3C8', 'R2C8', 'R2C9'),
  new Thermo('R4C9', 'R5C9', 'R6C9'),
  new Thermo('R9C9', 'R8C9', 'R9C8', 'R8C8', 'R7C9'),
  new Thermo('R4C4', 'R5C5', 'R6C4', 'R7C5', 'R8C4', 'R9C5', 'R9C6', 'R8C7'),
  new Thermo('R4C5', 'R3C5'),
  new Thermo('R4C3', 'R5C3'),
  new Thermo('R9C3', 'R8C3', 'R8C2', 'R9C1', 'R8C1'),

  // Purple regions: each is a 9-cell orthogonally-connected underlay cluster
  // (magenta #D23BE7 in the payload), listed north-west to south-east.
  new AllDifferent('R3C4', 'R3C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R7C4'),
  new AllDifferent('R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R5C7', 'R5C8', 'R6C8', 'R7C8'),
];
