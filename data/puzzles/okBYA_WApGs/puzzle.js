// Title: Is V Greater Than, Less Than, or Equal to 5?
// Author: HalfBakedLunatic
// Video: https://www.youtube.com/watch?v=okBYA_WApGs
// Source: https://app.crackingthecryptic.com/pn5mirfnyl

// Normal Sudoku, anti-knight, and the two drawn killer cages.
// Each drawn V is directed from the first listed cell to the second: the first
// digit is greater, or the two digits sum to 5. The list is transcribed from
// the 76 directed V marks in the source artwork.
const vMarkers = [
  ['R2C1', 'R3C1'], ['R3C1', 'R3C2'], ['R3C2', 'R2C2'], ['R2C2', 'R2C1'],
  ['R1C6', 'R2C6'], ['R2C6', 'R2C7'], ['R2C7', 'R1C7'], ['R1C7', 'R1C6'],
  ['R8C5', 'R8C6'], ['R8C6', 'R9C6'], ['R9C6', 'R9C5'], ['R9C5', 'R8C5'],
  ['R8C9', 'R8C8'], ['R8C8', 'R7C8'], ['R7C8', 'R7C9'], ['R7C9', 'R8C9'],
  ['R1C3', 'R1C2'], ['R1C3', 'R2C3'], ['R1C3', 'R1C4'], ['R2C4', 'R2C3'],
  ['R2C4', 'R1C4'], ['R2C4', 'R2C5'], ['R2C4', 'R3C4'], ['R3C4', 'R3C5'],
  ['R3C7', 'R3C6'], ['R3C7', 'R2C7'], ['R3C7', 'R3C8'], ['R3C7', 'R4C7'],
  ['R4C7', 'R4C8'], ['R3C8', 'R4C8'], ['R4C9', 'R4C8'], ['R5C8', 'R4C8'],
  ['R4C9', 'R5C9'], ['R5C8', 'R5C9'], ['R6C9', 'R5C9'], ['R6C9', 'R6C8'],
  ['R6C9', 'R7C9'], ['R9C8', 'R8C8'], ['R9C8', 'R9C9'], ['R9C8', 'R9C7'],
  ['R7C5', 'R8C5'], ['R7C5', 'R7C4'], ['R7C5', 'R7C6'], ['R7C5', 'R6C5'],
  ['R8C2', 'R8C1'], ['R8C2', 'R9C2'], ['R8C2', 'R8C3'], ['R8C2', 'R7C2'],
  ['R7C2', 'R7C1'], ['R7C2', 'R6C2'], ['R7C2', 'R7C3'], ['R6C1', 'R6C2'],
  ['R5C2', 'R6C2'], ['R6C3', 'R6C2'], ['R5C1', 'R6C1'], ['R5C1', 'R5C2'],
  ['R5C1', 'R4C1'], ['R5C2', 'R5C3'], ['R5C3', 'R4C3'], ['R5C3', 'R5C4'],
  ['R5C4', 'R5C5'], ['R5C4', 'R4C4'], ['R6C5', 'R6C4'], ['R6C7', 'R6C8'],
  ['R6C7', 'R5C7'], ['R3C1', 'R4C1'], ['R7C8', 'R6C8'], ['R4C6', 'R4C7'],
  ['R4C6', 'R5C6'], ['R4C6', 'R4C5'], ['R4C6', 'R3C6'], ['R9C7', 'R8C7'],
  ['R7C4', 'R8C4'], ['R2C8', 'R1C8'], ['R3C3', 'R3C4'], ['R4C4', 'R4C3'],
];
const vKey = Pair.fnToKey((tail, point) => tail > point || tail + point === 5, 9);
const vConstraints = vMarkers.map(([tail, point]) =>
  new Pair(vKey, 'directed V or sum 5', tail, point));

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Cage(7, 'R1C8', 'R1C9'),
  new Cage(11, 'R2C9', 'R3C9'),
  ...vConstraints,
];
