// Title: Copycat Confusion
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=wCkp8Yiddoo
// Source: https://sudokupad.app/hrsnhhdbno

// Normal Sudoku applies. The circled paths are, in either order, an average
// arrow and a thermometer; the uncircled paths are, in either order, a region
// sum line and a German whispers line. The four paths form two unknown pairs
// with matching digit multisets.
const circledA = ['R3C9', 'R3C8', 'R3C7', 'R3C6', 'R4C6', 'R5C6', 'R5C7', 'R5C8'];
const circledB = ['R7C6', 'R6C5', 'R7C5', 'R8C6', 'R7C7', 'R7C8', 'R8C9', 'R9C8'];
const uncircledC = ['R8C2', 'R7C2', 'R6C1', 'R5C2', 'R6C3', 'R7C3', 'R8C3', 'R9C2'];
const uncircledD = ['R2C5', 'R2C4', 'R1C3', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R3C5'];

// The first cell is the drawn circle. The remaining seven cells supply the
// average, so their sum is seven times the circled digit.
function averageArrow(cells) {
  return new Sum(0, ...cells.slice(1), [cells[0], -7]);
}

const circledRoles = new Or([
  new And([averageArrow(circledA), new Thermo(...circledB)]),
  new And([new Thermo(...circledA), averageArrow(circledB)]),
]);

const uncircledRoles = new Or([
  new And([new RegionSumLine(...uncircledC), new Whisper(5, ...uncircledD)]),
  new And([new Whisper(5, ...uncircledC), new RegionSumLine(...uncircledD)]),
]);

// These are the three possible partitions of four paths into two copycat pairs.
const copycatPairs = new Or([
  new And([
    new SameValues(2, ...circledA, ...circledB),
    new SameValues(2, ...uncircledC, ...uncircledD),
  ]),
  new And([
    new SameValues(2, ...circledA, ...uncircledC),
    new SameValues(2, ...circledB, ...uncircledD),
  ]),
  new And([
    new SameValues(2, ...circledA, ...uncircledD),
    new SameValues(2, ...circledB, ...uncircledC),
  ]),
]);

return [
  new Shape('9x9'),
  circledRoles,
  uncircledRoles,
  copycatPairs,
];
