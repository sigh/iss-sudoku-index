// Title: 333k Sudoku
// Author: Olima
// Video: https://www.youtube.com/watch?v=-znpJX9PITw
// Source: https://app.crackingthecryptic.com/sudoku/3BG9gD6m2H

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Thermometers: digits increase from the bulb -> Thermo.
// Coloured lines: palindromes -> Palindrome.
// Arrows: digits along an arrow sum to the 2-digit pill number -> PillArrow.
// Zero clues: sum of digits strictly between the 1 and the 9 in that row is
// 0 -> Sandwich(0, row). Sandwich's cell list is order-independent (it also
// matches the reversed row), so the clue's on-screen side (right, not the
// left/top the class doc mentions) does not change the encoding.
// "33"/"3": sum of digits on the indicated diagonal, repeats allowed -> Sum
// (not Cage: the rules text explicitly allows repeats on these diagonals).

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Y-shaped ("branching") thermometer: source draws one bulb (R6C5) feeding a
// shared stem (R6C6) that then splits into two arms. Both Thermo calls below
// repeat the shared bulb+stem prefix so the increasing constraint applies
// consistently across the whole branching figure (drawn as two same-colour
// line entries meeting at an interior cell of the longer one).
const thermoUpArm = ['R6C5', 'R6C6', 'R5C6', 'R4C6', 'R3C6', 'R3C5'];
const thermoDownArm = ['R6C5', 'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R9C5'];

// Palindrome lines, cells in drawn order (source `lines` array).
const palindromeGreen = ['R3C2', 'R3C3', 'R4C4', 'R5C4', 'R6C3'];
const palindromeGold = [
  'R6C2', 'R6C3', 'R7C4', 'R8C4', 'R9C3', 'R9C2', 'R8C1', 'R7C1',
];

// Shared pill (rounded 2-cell mark at R6C7/R6C8): tens digit left, ones
// digit right, per PillArrow's "read left to right" convention.
const pillTens = 'R6C7';
const pillOnes = 'R6C8';
const arm1 = ['R5C9', 'R4C9', 'R3C8', 'R3C7'];
const arm2 = ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7'];

// Outside diagonal-sum cells, resolved from the drawn arrow direction
// (down-right for "33" starting at R3C1, up-right for "3" starting at R2C1).
const diagonal33 = ['R3C1', 'R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6', 'R9C7'];
const diagonal3 = ['R2C1', 'R1C2'];

return [
  new Shape('9x9'),

  new Thermo(...thermoUpArm),
  new Thermo(...thermoDownArm),

  new Palindrome(...palindromeGreen),
  new Palindrome(...palindromeGold),

  new PillArrow(2, pillTens, pillOnes, ...arm1),
  new PillArrow(2, pillTens, pillOnes, ...arm2),

  new Sum(33, ...diagonal33),
  new Sum(3, ...diagonal3),

  Sandwich.fromCells(0, graph.row(6), geometry),
  Sandwich.fromCells(0, graph.row(7), geometry),
  Sandwich.fromCells(0, graph.row(8), geometry),
];
