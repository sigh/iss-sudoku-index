// Title: Czech Outsider Sudoku
// Author: Jan Vondruska
// Video: https://www.youtube.com/watch?v=xy2G6ORGnbg
// Source: https://app.crackingthecryptic.com/3141fzvlnl

// Normal Sudoku rules apply. Each outside label requires every listed digit to
// occur on its arrow's diagonal at least as often as it appears in the label.
// The arrays below transcribe the twenty diagonal rays drawn with the outside clues.
const outsider = (digits, cells) =>
  new ContainAtLeast(digits.split('').join('_'), ...cells);

const clues = [
  ['46', ['R1C2', 'R2C1']],
  ['19', ['R1C3', 'R2C2', 'R3C1']],
  ['45', ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  ['55', ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1']],
  ['5', ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2', 'R8C1']],
  ['23', ['R2C9', 'R1C8']],
  ['567', ['R3C9', 'R2C8', 'R1C7']],
  ['15', ['R4C9', 'R3C8', 'R2C7', 'R1C6']],
  ['11', ['R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4']],
  ['4', ['R8C9', 'R7C8', 'R6C7', 'R5C6', 'R4C5', 'R3C4', 'R2C3', 'R1C2']],
  ['12', ['R9C8', 'R8C9']],
  ['458', ['R9C7', 'R8C8', 'R7C9']],
  ['27', ['R9C6', 'R8C7', 'R7C8', 'R6C9']],
  ['77', ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9']],
  ['9', ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9']],
  ['36', ['R8C1', 'R9C2']],
  ['28', ['R7C1', 'R8C2', 'R9C3']],
  ['67', ['R6C1', 'R7C2', 'R8C3', 'R9C4']],
  ['35', ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6']],
  ['2', ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
];

return [
  new Shape('9x9'),
  ...clues.map(([digits, cells]) => outsider(digits, cells)),
];
