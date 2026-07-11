// Title: Poison Arrows
// Author: billybeth
// Video: https://www.youtube.com/watch?v=iAkuAoIgR4o
// Source: https://sudokupad.app/ski1zlop0c

// Normal sudoku, no givens. On each poison arrow, the digit in the circle
// times the digit on the arrow tip equals the sum of the digits on the line,
// excluding the circle and including the tip (i.e. the circle shows the line
// sum divided by the tip digit).

const arrows = [
  ["R8C1", ["R8C2", "R8C3"], "R8C3"],
  ["R1C2", ["R1C1", "R2C1", "R3C1", "R2C2", "R3C2", "R3C3", "R2C3"], "R2C3"],
  ["R6C9", ["R6C8", "R6C7"], "R6C7"],
  ["R4C9", ["R4C8", "R4C7"], "R4C7"],
  ["R1C7", ["R1C6"], "R1C6"],
  ["R2C6", ["R2C7", "R2C8"], "R2C8"],
  ["R1C5", ["R2C5", "R3C5"], "R3C5"],
  ["R5C4", ["R6C4", "R6C5", "R6C6", "R5C5", "R5C6", "R4C6", "R4C5", "R4C4"], "R4C4"],
  ["R9C8", ["R9C7", "R8C7"], "R8C7"],
  ["R7C5", ["R7C4", "R8C4", "R9C4", "R9C5", "R9C6", "R8C6", "R7C6"], "R7C6"],
  ["R7C1", ["R7C2"], "R7C2"],
  ["R9C9", ["R8C9"], "R8C9"],
  ["R1C8", ["R2C9", "R3C9"], "R3C9"],
  ["R4C2", ["R5C1", "R5C2"], "R5C2"],
  ["R5C3", ["R6C2", "R6C1"], "R6C1"],
];

const poisonArrow = (circle, cells, tip) => {
  const branches = [];
  for (let circleValue = 1; circleValue <= 9; circleValue++) {
    for (let tipValue = 1; tipValue <= 9; tipValue++) {
      const total = circleValue * tipValue;
      if (total < cells.length || total > 9 * cells.length) continue;
      branches.push(new And([
        new Given(circle, circleValue),
        new Given(tip, tipValue),
        new Sum(total, ...cells),
      ]));
    }
  }
  return new Or(branches);
};

return [
  new Shape("9x9"),
  ...arrows.map(([circle, cells, tip]) => poisonArrow(circle, cells, tip)),
];
