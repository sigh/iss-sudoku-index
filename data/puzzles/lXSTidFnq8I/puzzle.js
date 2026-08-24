// Title: Temple of the Kings
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=lXSTidFnq8I
// Source: https://app.crackingthecryptic.com/sudoku/JbLpJdjNhB

// Normal sudoku on standard 3x3 boxes (payload regions confirm the default
// boxes). No given digits. 12 killer cages, each summing to its clue with no
// repeated digit inside the cage (payload `cages` array). Anti-king: no two
// cells a king's move apart share a digit.
const cages = [
  [10, ['R6C1', 'R7C1']],
  [13, ['R8C3', 'R9C3']],
  [8, ['R8C4', 'R7C4', 'R7C5']],
  [14, ['R8C6', 'R9C6', 'R9C5']],
  [25, ['R6C3', 'R5C3', 'R4C3', 'R4C2']],
  [21, ['R3C3', 'R3C4', 'R2C4']],
  [14, ['R2C5', 'R3C5']],
  [21, ['R2C6', 'R3C6', 'R3C7']],
  [18, ['R4C4', 'R4C5', 'R4C6']],
  [25, ['R4C7', 'R5C7', 'R6C8', 'R6C7']],
  [10, ['R3C9', 'R4C9']],
  [13, ['R8C7', 'R9C7']],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
];
