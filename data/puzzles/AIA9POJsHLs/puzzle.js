// Title: Sorry, Wrong Number Again
// Author: billybeth
// Video: https://www.youtube.com/watch?v=AIA9POJsHLs
// Source: https://sudokupad.app/f5dsxd9gfb

// Normal Sudoku; every pink number is wrong; anti-knight, anti-king,
// nonconsecutive orthogonal neighbours, and disjoint sets. No omissions.

// Pink printed numbers, in row order.
const wrongNumbers = [
  "644664664",
  "466444446",
  "664664644",
  "664664644",
  "646446446",
  "644646666",
  "644646464",
  "446446446",
  "464644666"
];
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const wrongClues = wrongNumbers.flatMap((row, r) =>
  [...row].map((number, c) =>
    new Given(makeCellId(r + 1, c + 1),
      ...digits.filter(digit => digit !== Number(number)))));

return [
  new Shape('9x9'),
  ...wrongClues,
  new AntiKnight(),
  new AntiKing(),
  new AntiConsecutive(),
  new DisjointSets(),
];
