// Title: Thermal Equilibrium
// Author: Flinty
// Video: https://www.youtube.com/watch?v=k-djoW_GVmI
// Source: https://sudokupad.app/z1xpy7lrl5

// Standard diagonal Sudoku. Grey thermos increase bulb-to-tip and have equal sums.

const thermos = [
  ['R1C1','R2C1','R3C1','R4C1'],['R5C1','R6C1','R7C1'],['R8C1','R9C1','R9C2','R9C3'],
  ['R9C4','R9C5','R9C6'],['R9C7','R9C8','R9C9','R8C9'],['R7C9','R6C9','R5C9','R4C9'],
  ['R3C9','R2C9','R1C9','R1C8'],['R1C7','R1C6','R1C5'],['R1C2','R1C3','R1C4','R2C3'],
];
return [new Shape('9x9'), new Diagonal(), ...thermos.map(cells => new Thermo(...cells)), new EqualSum(...thermos)];
