// Title: Ballad of The Singing Cage
// Author: Altess
// Video: https://www.youtube.com/watch?v=hOxJ3pVvAqw
// Source: https://sudokupad.app/49741zlqcn

// Normal sudoku rules (rows, columns, boxes all-different).
// Some drawn cages carry a look-and-say clue in their top-left cell: a
// clue's digits are (count, value) pairs, e.g. 4253 means four 2s and five
// 3s; values not named by the clue are unrestricted, repeats among them
// allowed. LookAndSay(clue, ...cells) reads the printed clue directly.
// Four other drawn cages carry no printed clue and the rules give cage
// outlines no other meaning (no sum, no stated all-different), so they are
// left as pure geometry and are not encoded.

const lookAndSayCages = [
  ['1629', 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  ['2324', 'R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['171118', 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['1726', 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  ['1613', 'R9C4', 'R9C5', 'R9C6'],
  ['16', 'R4C1', 'R5C1', 'R6C1'],
  ['1119', 'R4C9', 'R5C9', 'R6C9'],
  ['212245', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C5', 'R3C8', 'R4C5', 'R4C8',
    'R5C6', 'R5C7', 'R5C8'],
  ['3432', 'R5C2', 'R5C3', 'R5C4', 'R6C2', 'R6C5', 'R7C2', 'R7C5', 'R8C2',
    'R8C3', 'R8C4', 'R8C5'],
  ['29', 'R6C8', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
  ['19', 'R5C5'],
  ['1314', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['1815', 'R7C9', 'R8C9', 'R9C8', 'R9C9'],
  ['17', 'R1C3'],
  ['11', 'R9C7'],
  ['15', 'R7C1'],
  ['18', 'R3C9'],
];

return [
  new Shape('9x9'),
  ...lookAndSayCages.map(([clue, ...cells]) => new LookAndSay(clue, ...cells)),
];
