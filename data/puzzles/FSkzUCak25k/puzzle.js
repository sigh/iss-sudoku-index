// Title: The Hare and the Tortoise
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=FSkzUCak25k
// Source: https://sudokupad.app/qes8ggvsi4

// Normal sudoku rules apply. The Duck's blue pond is R4C1-R4C2, and its
// digits sum to 5. The solver-discovered Hare and Tortoise route rules are
// not represented in this script.
return [
  new Shape('9x9'),
  new Sum(5, 'R4C1', 'R4C2'),
];
