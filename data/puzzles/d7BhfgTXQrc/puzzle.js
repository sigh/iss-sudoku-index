// Title: This is Sparta!
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=d7BhfgTXQrc
// Source: https://sudokupad.app/oiqfym9ehw

// Normal sudoku rules apply.
// The product of the digits along a hollow orange line is equal to 300.
// Every set of three sequential digits along a teal modular line contains
// digits with three different remainders when divided by 3 (i.e. one digit
// from {1,4,7}, one from {2,5,8}, and one from {3,6,9}). Additionally, the
// total sum of the modular lines is equal to 300.

const orangeLines = [
  ['R7C2', 'R6C2', 'R6C3', 'R5C3', 'R5C4', 'R4C4', 'R4C5', 'R3C5', 'R3C6'],
  ['R4C1', 'R3C1', 'R2C2', 'R1C3', 'R1C4'],
  ['R8C3', 'R8C4', 'R7C5', 'R6C5'],
];

const modularLines = [
  ['R5C2', 'R5C1', 'R6C1', 'R7C1'],
  ['R4C2', 'R3C2', 'R3C3'],
  ['R2C3', 'R2C4', 'R2C5'],
  ['R2C6', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R3C8', 'R2C8', 'R2C7'],
  ['R3C7', 'R4C7', 'R4C6'],
  ['R5C6', 'R6C6', 'R6C7'],
  ['R5C7', 'R5C8', 'R4C8', 'R4C9'],
  ['R5C9', 'R6C9', 'R6C8', 'R7C8'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R8C8', 'R8C7', 'R7C7'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R7C6', 'R8C6', 'R8C5'],
  ['R9C5', 'R9C4', 'R9C3'],
  ['R9C2', 'R8C2', 'R8C1'],
];

// Product-line NFA: track the running product, pruning once it exceeds the
// target so state stays bounded.
function productLineNFA(target) {
  return NFA.encodeSpec({
    startState: 1,
    transition: (state, value) => {
      const next = state * value;
      if (next > target) return;
      return next;
    },
    accept: state => state === target,
  }, 9);
}

function productLine(cells, target) {
  return new NFA(productLineNFA(target), `${target} product line`, ...cells);
}

const constraints = [
  new Shape('9x9'),
  ...orangeLines.map(cells => productLine(cells, 300)),
  ...modularLines.map(cells => new Modular(3, ...cells)),
  new Sum(300, ...modularLines.flat()),
];

return constraints;
