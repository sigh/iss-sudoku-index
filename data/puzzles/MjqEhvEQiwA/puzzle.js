// Title: Pressure Cooker
// Author: bellal
// Video: https://www.youtube.com/watch?v=MjqEhvEQiwA
// Source: https://sudokupad.app/jfpflqk7pr

// Each gold cage is equal-pressure: the sum of inside cells equals the sum of
// unique outside edge-neighbour cells. Cage digits may repeat, so use Sum rather
// than Cage.

const cages = [
  {
    name: "A",
    inside: ["R5C4", "R6C4", "R6C5", "R7C5", "R7C6"],
    outside: ["R4C4", "R5C3", "R5C5", "R6C3", "R6C6", "R7C4", "R7C7", "R8C5", "R8C6"],
  },
  {
    name: "B",
    inside: ["R7C8", "R8C8", "R9C8"],
    outside: ["R6C8", "R7C7", "R7C9", "R8C7", "R8C9", "R9C7", "R9C9"],
  },
  {
    name: "C",
    inside: ["R8C1", "R8C2", "R8C3"],
    outside: ["R7C1", "R7C2", "R7C3", "R8C4", "R9C1", "R9C2", "R9C3"],
  },
  {
    name: "D",
    inside: ["R6C1", "R7C1", "R7C2"],
    outside: ["R5C1", "R6C2", "R7C3", "R8C1", "R8C2"],
  },
  {
    name: "E",
    inside: ["R4C8", "R4C9"],
    outside: ["R3C8", "R3C9", "R4C7", "R5C8", "R5C9"],
  },
  {
    name: "F",
    inside: ["R3C7"],
    outside: ["R2C7", "R3C6", "R3C8", "R4C7"],
  },
  {
    name: "G",
    inside: ["R4C6", "R5C6"],
    outside: ["R3C6", "R4C5", "R4C7", "R5C5", "R5C7", "R6C6"],
  },
  {
    name: "H",
    inside: ["R2C4", "R2C5", "R3C4", "R3C5"],
    outside: ["R1C4", "R1C5", "R2C3", "R2C6", "R3C3", "R3C6", "R4C4", "R4C5"],
  },
  {
    name: "I",
    inside: ["R4C1"],
    outside: ["R3C1", "R4C2", "R5C1"],
  },
  {
    name: "J",
    inside: ["R3C2"],
    outside: ["R2C2", "R3C1", "R3C3", "R4C2"],
  },
  {
    name: "K",
    inside: ["R1C1", "R1C2", "R1C3", "R1C4", "R1C5", "R2C1", "R2C3"],
    outside: ["R1C6", "R2C2", "R2C4", "R2C5", "R3C1", "R3C3"],
  },
];

function equalPressure({ inside, outside }) {
  const coeffs = [
    ...inside.map(() => 1),
    ...outside.map(() => -1),
  ].join("_");
  return new Sum(`0_=_${coeffs}`, ...inside, ...outside);
}

return [
  new Shape("9x9"),
  ...cages.map(equalPressure),
];
