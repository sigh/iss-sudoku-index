// Title: German Penpalindromes
// Author: Cygne
// Video: https://www.youtube.com/watch?v=7xEkKTSLkfw
// Source: https://sudokupad.app/593usw1noe

// Normal Sudoku rules apply. Each green-and-gray line is both a palindrome
// and a German whisper (adjacent digits differ by at least 5). Digits on a
// slow thermometer do not decrease from bulb to tip.

const palindromeLines = [
  [
    'R8C2', 'R7C2', 'R6C3', 'R6C2', 'R5C2', 'R5C1', 'R4C1', 'R3C1',
    'R2C2', 'R1C3', 'R1C4', 'R2C5', 'R2C6', 'R3C7', 'R4C7', 'R5C6',
    'R6C5', 'R6C4', 'R7C3', 'R8C3', 'R9C4', 'R8C4', 'R7C5', 'R6C6',
    'R5C7', 'R4C8', 'R4C9', 'R5C8', 'R6C9', 'R7C9', 'R8C9', 'R9C8',
    'R8C7', 'R8C6', 'R9C7',
  ],
  ['R1C6', 'R2C7', 'R3C8'],
  ['R3C3', 'R4C3', 'R5C4'],
];

const slowThermos = [
  ['R6C8', 'R7C7'],
  ['R7C6', 'R6C7'],
  ['R4C5', 'R3C6'],
  ['R3C5', 'R4C4'],
];

const nondecreasingKey = Pair.fnToKey((bulbward, tipward) => bulbward <= tipward, 9);

return [
  new Shape('9x9'),

  ...palindromeLines.map(cells => new Palindrome(...cells)),
  ...palindromeLines.map(cells => new Whisper(5, ...cells)),

  ...slowThermos.map(cells => new Pair(
    nondecreasingKey,
    'slow thermometer',
    ...cells,
  )),
];
