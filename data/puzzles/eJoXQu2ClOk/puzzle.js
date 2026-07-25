// Title: Framed in Purple
// Author: Enpee
// Video: https://www.youtube.com/watch?v=eJoXQu2ClOk
// Source: https://sudokupad.app/42yicjzflt

// Normal sudoku. Renban: each purple line's digits form a non-repeating
// consecutive set, any order. Kropki: white dot = consecutive digits, black
// dot = one digit double the other; not all possible dots are drawn (no
// negative inference from an absent dot).

const renbanLines = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R3C2', 'R2C2', 'R2C3'],
  ['R2C7', 'R2C8', 'R3C8'],
  ['R7C8', 'R8C8', 'R8C7'],
  ['R7C2', 'R8C2', 'R8C3'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C4', 'R5C4', 'R5C3', 'R5C2'],
  ['R5C1', 'R6C2', 'R6C3'],
  ['R4C7', 'R4C8', 'R5C9'],
  ['R1C5', 'R2C5'],
  ['R1C4', 'R2C4'],
  ['R8C5', 'R9C5'],
  ['R8C6', 'R9C6'],
  ['R5C8', 'R5C7', 'R5C6', 'R6C6'],
];

// Dot colour read from each overlay's fill/background (white fill + black
// border = white dot; black fill = black dot). Two of the four sit on a
// renban line; that is incidental overlap, not a merge of clues.
const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R8C2', 'R8C3'],
  ['R6C5', 'R7C5'],
];
const blackDots = [
  ['R2C6', 'R2C7'],
];

return [
  new Shape('9x9'),
  new Given('R4C6', 8),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
