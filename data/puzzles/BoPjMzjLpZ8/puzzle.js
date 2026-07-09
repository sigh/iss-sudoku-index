// Title: SVS #470 - Harmonious Thermos
// Author: Richard
// Video: https://www.youtube.com/watch?v=BoPjMzjLpZ8
// Source: https://sudokupad.app/0wffw5dssm

const thermos = [
  ["R4C6", "R5C5", "R6C5", "R6C4", "R5C3", "R5C4", "R4C5", "R4C4"],
  ["R6C8", "R5C7", "R5C8", "R4C7"],
  ["R8C8", "R7C7", "R6C6", "R7C5"],
  ["R1C1", "R1C2", "R1C3", "R2C3", "R3C3"],
  ["R3C1", "R2C1", "R2C2", "R3C2"],
  ["R9C6", "R8C6", "R8C5", "R9C5", "R9C4", "R8C3", "R7C2"],
  ["R2C5", "R3C6", "R2C6"],
  ["R4C8", "R3C9"],
];

function divisibleSums(cells) {
  const len = cells.length;
  const branches = [];
  for (let sum = len; sum <= 9 * len; sum += len) {
    branches.push(new Sum(sum, ...cells));
  }
  return new Or(branches);
}

return [
  new Shape("9x9"),
  ...thermos.map(cells => new Thermo(...cells)),
  ...thermos.map(divisibleSums),
];
