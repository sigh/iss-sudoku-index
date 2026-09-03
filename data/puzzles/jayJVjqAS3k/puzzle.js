// Title: Coded Killer Sudoku
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=jayJVjqAS3k
// Source: https://cracking-the-cryptic.web.app/sudoku/j2gtNR4Mg4

// Normal Sudoku rules apply: 1-9 once each in every row, column and 3x3 box.
// Killer cages: the digits in a cage are all different and add to the cage's
// total. No total is printed as a number. Instead each cage carries a code of
// one or two letters drawn from A-F, and a code is that total written in a
// cipher where each letter stands for a digit: a one-letter code is a
// one-digit total, and a two-letter code is a two-digit total whose first
// letter is the tens digit and second letter the units digit. A panel to the
// right of the grid lists A, B, C, D, E, F down a column with an empty cell
// beside each one, which is where its digit is written; those six cells take
// the same 1-9 alphabet as the grid, and are modelled here as the six
// off-grid cells VA..VF.
//
// The puzzle as published states no rules in words, so two things it draws are
// deliberately left out of this encoding:
//  - whether the six letters must stand for six different digits. Nothing
//    drawn ties the panel entries to each other: each letter sits in its own
//    two-cell box with its digit, and no box or line joins the six. The
//    encoding therefore allows two letters to share a digit.
//  - grey shading on 22 of the 49 cage cells. Nothing gives it a meaning, and
//    it follows no pattern of the cages: 16 cages carry one shaded cell, three
//    carry two, and two carry none.

const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

// Cages transcribed from the drawn cage outlines and their printed codes,
// in the source's own cage order.
const cages = [
  [['R1C1', 'R1C2'], 'A'],
  [['R3C1', 'R3C2'], 'A'],
  [['R7C1', 'R8C1'], 'A'],
  [['R2C2', 'R2C3'], 'C'],
  [['R1C5', 'R2C5', 'R2C6'], 'EC'],
  [['R1C7', 'R2C7', 'R3C7'], 'ED'],
  [['R1C8', 'R1C9'], 'EA'],
  [['R2C8', 'R3C8'], 'C'],
  [['R4C1', 'R5C1'], 'EA'],
  [['R4C3', 'R5C3'], 'EE'],
  [['R4C5', 'R5C5'], 'B'],
  [['R6C4', 'R6C5'], 'ED'],
  [['R4C6', 'R5C6', 'R5C7'], 'EB'],
  [['R4C7', 'R4C8'], 'B'],
  [['R6C7', 'R6C8', 'R5C8', 'R5C9', 'R6C9'], 'FE'],
  [['R7C2', 'R7C3'], 'C'],
  [['R8C3', 'R8C4'], 'C'],
  [['R7C5', 'R8C5'], 'C'],
  [['R7C6', 'R8C6', 'R9C6'], 'EC'],
  [['R7C7', 'R7C8'], 'C'],
  [['R8C8', 'R8C9'], 'C'],
];

// A one-letter code is the cage total read off that letter's cell directly.
const oneLetterTotal = (cells, code) => new EqualSum(cells, ['V' + code]);

// A two-letter code is the total read as a decimal numeral, i.e. the linear
// equation sum(cage cells) - 10*(tens letter) - 1*(units letter) = 0. Place
// values are taken right to left. A letter repeated in a code (EE) appears
// twice with different coefficients, which add.
const twoLetterTotal = (cells, code) => new Sum(
  0, ...cells,
  ...code.split('').reverse().map(
    (letter, place) => ['V' + letter, -Math.pow(10, place)]));

return [
  new Shape('9x9'),
  ...letters.map(letter => new Var(letter, 'code letter ' + letter, 1)),
  // Cage total 0 is "no printed total", leaving the all-different half of the
  // killer rule; the sum half is the coded equation beside it.
  ...cages.flatMap(([cells, code]) => [
    new Cage(0, ...cells),
    code.length === 1
      ? oneLetterTotal(cells, code)
      : twoLetterTotal(cells, code),
  ]),
];
