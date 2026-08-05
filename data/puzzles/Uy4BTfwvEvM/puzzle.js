// Title: Lucky 7
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=Uy4BTfwvEvM
// Source: https://app.crackingthecryptic.com/sudoku/NHQNdgPTQ6

// Normal Sudoku rules apply. Equal digits may not be a chess knight's move apart.
// Purple segments are renban lines. Grey connectors group purple segments whose sums are equal.
// Omitted: the top-row grey-linked family is ambiguous where its horizontal segment meets a vertical purple segment at R1C5.
// Purple segment cells and grey-connector families are transcribed from the drawn line layer.
const renbans = [
  new Renban('R9C1', 'R9C2', 'R9C3'),
  new Renban('R8C4', 'R8C5'),
  new Renban('R8C3', 'R7C2'),
  new Renban('R6C3', 'R5C3', 'R4C3'),
  new Renban('R5C5', 'R4C4'),
  new Renban('R5C7', 'R6C8'),
  new Renban('R7C9', 'R8C8'),
  new Renban('R2C8', 'R2C7', 'R3C7', 'R3C8'),
  new Renban('R1C3', 'R1C2', 'R2C2', 'R2C3'),
  new Renban('R1C6', 'R1C5', 'R1C4'),
  new Renban('R1C5', 'R2C5', 'R3C5'),
];

const equalSumFamilies = [
  new EqualSum(['R7C9', 'R8C8'], ['R5C7', 'R6C8']),
  new EqualSum(
    ['R5C5', 'R4C4'],
    ['R6C3', 'R5C3', 'R4C3'],
    ['R8C3', 'R7C2'],
  ),
  new EqualSum(['R8C4', 'R8C5'], ['R9C1', 'R9C2', 'R9C3']),
];

return [
  new Shape('9x9'),
  new Given('R9C9', 7),
  new AntiKnight(),
  ...renbans,
  ...equalSumFamilies,
];
