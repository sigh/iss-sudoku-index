// Title: Starry Night Sudoku
// Author: Ryan Oswald
// Video: https://www.youtube.com/watch?v=C8vQGS7Bb6Y
// Source: https://cracking-the-cryptic.web.app/sudoku/d4jdjr9g8f

// Rules encoded (the puzzle ships no prose; every clue below is read off the
// drawn board):
//
// 1. Normal sudoku: 1-9 once each per row, column and 3x3 box.
// 2. Eighteen cells hold a letter in place of a digit. Nine distinct letters
//    appear -- A G H I N O S T V -- and each stands for one of the digits 1-9:
//    the same letter is the same digit, different letters are different
//    digits. (The margin right of the grid lists exactly those nine letters
//    against nine blank cells, a key table for the correspondence; with nine
//    letters and nine digits it is one-to-one.)
// 3. Every killer cage total is written as a letter word read as an ordinary
//    decimal numeral: "VN" is 10*V + N, the one-letter total "A" is A.
// 4. Four equations below the grid, each a colour swatch, an "=" and a letter
//    word, give the total of all cells shaded in that colour.
//
// Nothing is omitted. The blank key column beside the grid is somewhere to
// write the letter/digit correspondence and carries no further rule; the short
// bars joining same-coloured cells sit on cell borders and cover no cells.

const LETTERS = 'AGHINOSTV';

// Transcribed from the letters drawn in the grid: cell list per letter, in
// reading order. R1C3-R1C5 "VIN", R4C4-R4C6 "VAN", R6C6-R6C7 + R5C8-R5C9
// "GOGH", R8C2-R8C4 "STA", R9C1-R9C5 "NIGHT".
const LETTER_CELLS = {
  A: ['R8C4', 'R4C5'],
  G: ['R5C8', 'R6C6', 'R9C3'],
  H: ['R5C9', 'R9C4'],
  I: ['R1C4', 'R9C2'],
  N: ['R1C5', 'R4C6', 'R9C1'],
  O: ['R6C7'],
  S: ['R8C2'],
  T: ['R8C3', 'R9C5'],
  V: ['R1C3', 'R4C4'],
};

// Every letter occupies at least one grid cell, so its first cell can carry
// that letter's digit for the rest of the script.
const letterCell = (letter) => LETTER_CELLS[letter][0];

// sum(cells) = the decimal numeral spelled by `word`. Emitted as the single
// linear equation sum(cells) - sum over places of placeValue * letterDigit = 0,
// with one coefficient per distinct cell so that a cell which is both shaded
// and carrying a letter of the word contributes its two terms once.
const wordSum = (word, cells) => {
  const coeffs = new Map(cells.map((cell) => [cell, 1]));
  [...word].forEach((letter, i) => {
    const place = 10 ** (word.length - 1 - i);
    const cell = letterCell(letter);
    coeffs.set(cell, (coeffs.get(cell) || 0) - place);
  });
  const terms = [...coeffs].filter(([, c]) => c !== 0);
  // A one-letter word leaves every coefficient +1 or -1: the equation is then
  // just two cell sets of equal sum, which EqualSum states directly.
  const side = (sign) => terms.filter(([, c]) => c === sign).map(([cell]) => cell);
  if (terms.every(([, c]) => c === 1 || c === -1)) {
    return new EqualSum(side(1), side(-1));
  }
  return new Sum(0, ...terms.map(([cell, c]) => (c === 1 ? cell : [cell, c])));
};

// Drawn cages, each with the letter word printed on it. The NH word is printed
// in the corner of R9C9 rather than of the cage's leftmost cell R9C5, whose
// corner already holds the letter T.
const CAGES = [
  ['VN', ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2']],
  ['GO', ['R6C3', 'R7C3', 'R8C3', 'R9C3', 'R8C4', 'R9C4']],
  ['NH', ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9']],
  ['OV', ['R8C7', 'R8C8', 'R8C9']],
  ['OO', ['R7C8', 'R7C9']],
  ['OO', ['R2C8', 'R2C9', 'R3C8', 'R3C9']],
  ['A', ['R7C6', 'R8C6']],
];

// The four shaded sets, each with the letter word its swatch is equated to
// below the grid. Cells transcribed from the drawn squares.
const COLOUR_SUMS = [
  // grey
  ['SG', ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2',
          'R6C3', 'R7C3', 'R8C3', 'R9C3', 'R8C4', 'R9C4']],
  // yellow-green
  ['GO', ['R5C8', 'R5C9', 'R6C6', 'R6C7', 'R7C1', 'R7C4', 'R7C5']],
  // gold
  ['OG', ['R2C8', 'R2C9', 'R3C8', 'R3C9', 'R5C3']],
  // sky blue
  ['HA', ['R2C4', 'R2C5', 'R2C6', 'R3C1', 'R3C3', 'R3C5', 'R4C5', 'R4C6',
          'R4C7', 'R5C6', 'R5C7']],
];

return [
  new Shape('9x9'),

  // Rule 2: same letter, same digit.
  ...Object.values(LETTER_CELLS)
    .filter((cells) => cells.length > 1)
    .map((cells) => new SameValues(cells.length, ...cells)),
  // Rule 2: different letters, different digits.
  new AllDifferent(...[...LETTERS].map(letterCell)),

  // Rule 3: cage cells are distinct, and total the cage's letter word.
  ...CAGES.map(([, cells]) => new Cage(0, ...cells)),
  ...CAGES.map(([word, cells]) => wordSum(word, cells)),

  // Rule 4.
  ...COLOUR_SUMS.map(([word, cells]) => wordSum(word, cells)),
];
