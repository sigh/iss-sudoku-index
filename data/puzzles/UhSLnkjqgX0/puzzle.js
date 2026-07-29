// Title: Close Enough
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=UhSLnkjqgX0
// Source: https://sudokupad.app/ay6r6mmu5w

// Standard Sudoku. Cage digits are distinct. A printed cage total is the true
// digit sum rounded to the nearest multiple of five, so each clue permits the
// five integer totals from clue - 2 through clue + 2. Cage data is drawn data.
const cages = [
  [15,['R7C1','R8C1']],[20,['R9C1','R9C2','R9C3']],[10,['R8C2']],
  [30,['R1C1','R1C2','R2C1','R2C2']],[5,['R7C8','R7C9']],[20,['R7C5','R7C6','R7C7','R8C7','R9C7']],
  [20,['R1C7','R1C8','R2C8']],[20,['R1C9','R2C9','R3C9']],[10,['R5C7','R6C7']],
  [10,['R3C2','R3C3','R4C2','R4C3']],[15,['R2C3','R2C4','R3C4']],[15,['R5C9','R6C9']],[10,['R5C8','R6C8']],
  [10,['R9C5','R9C6']],[5,['R8C5','R8C6']],[30,['R4C4','R4C5','R5C4','R5C5']],
  [10,['R1C5','R2C5']],[10,['R4C6','R5C6']],[10,['R6C4','R6C5']],[10,['R5C1','R5C2']],
];
function roundedCage(total, cells) {
  return [new AllDifferent(...cells), new Or([-2,-1,0,1,2].map(offset => new Sum(total + offset, ...cells)))];
}
return [new Shape('9x9'), ...cages.flatMap(([total,cells]) => roundedCage(total,cells))];
