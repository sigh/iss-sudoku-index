// Title: SVS (300) - Killer Skyscrapers Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=u6ElvJF89_c
// Source: https://app.crackingthecryptic.com/sudoku/g3DPMFpPLR

// Normal sudoku (rows, columns, boxes). Digits in the 9x9 grid are
// skyscraper heights. Every cage listed below is one of the dotted
// outlined areas from the rules: cages sum to the printed total and hold
// no repeated digit.
//
// Four of the twelve cages also reach one cell outside the grid, on one of
// the four sides. The rules define what a digit outside the grid means
// ("how many buildings can be seen from that direction"), not that every
// such position is printed -- only the ones the source actually draws, each
// as a cage cell here, are in play. There is no printed clue number: like
// every other cage cell, its value is left for the solver and is pinned by
// the visible-count relation below plus its cage's sum/distinctness.
//
// Var groups hold those outside cells, one group per side, indexed by
// ascending row/column: VT{n} = above column n, VB{n} = below column n,
// VL{n} = left of row n, VR{n} = right of row n (n is the group's own
// 1..count index, not the grid row/column number -- see the NFA cell lists
// below for which line each Var actually reads).
const outsideCells = [
  new Var('T', 'skyscraper clues above the grid', 5),
  new Var('B', 'skyscraper clues below the grid', 5),
  new Var('L', 'skyscraper clues left of the grid', 6),
  new Var('R', 'skyscraper clues right of the grid', 6),
];

// One NFA per outside clue: the first cell fed in is the clue itself
// (target); the rest is the full row/column scanned away from the clue.
// The clue accepts once every cell has been read and the running count of
// buildings taller than every prior building (the visible count) equals the
// target value read first.
const skySpec = NFA.encodeSpec({
  startState: { target: null, tallest: 0, visible: 0 },
  transition: ({ target, tallest, visible }, value) => {
    if (target === null) return { target: value, tallest: 0, visible: 0 };
    return {
      target,
      tallest: Math.max(tallest, value),
      visible: visible + (value > tallest ? 1 : 0),
    };
  },
  accept: ({ target, visible }) => target !== null && visible === target,
  maxDepth: 10,
}, 9);

const skyscraperClues = [
  new NFA(skySpec, 'sky', 'VT1', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new NFA(skySpec, 'sky', 'VT2', 'R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new NFA(skySpec, 'sky', 'VT3', 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new NFA(skySpec, 'sky', 'VT4', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new NFA(skySpec, 'sky', 'VT5', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new NFA(skySpec, 'sky', 'VB1', 'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new NFA(skySpec, 'sky', 'VB2', 'R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new NFA(skySpec, 'sky', 'VB3', 'R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7'),
  new NFA(skySpec, 'sky', 'VB4', 'R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8'),
  new NFA(skySpec, 'sky', 'VB5', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'),
  new NFA(skySpec, 'sky', 'VL1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new NFA(skySpec, 'sky', 'VL2', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new NFA(skySpec, 'sky', 'VL3', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'),
  new NFA(skySpec, 'sky', 'VL4', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'),
  new NFA(skySpec, 'sky', 'VL5', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'),
  new NFA(skySpec, 'sky', 'VL6', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new NFA(skySpec, 'sky', 'VR1', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'),
  new NFA(skySpec, 'sky', 'VR2', 'R3C9', 'R3C8', 'R3C7', 'R3C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'),
  new NFA(skySpec, 'sky', 'VR3', 'R4C9', 'R4C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1'),
  new NFA(skySpec, 'sky', 'VR4', 'R7C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R7C1'),
  new NFA(skySpec, 'sky', 'VR5', 'R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1'),
  new NFA(skySpec, 'sky', 'VR6', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'),
];

// Dotted cages, provenance: source `cages` array. Each cage lists its cells
// in the drawn order; the printed total sits at the first cell listed.
const cages = [
  new Cage(17, 'VT2', 'VT1', 'R1C1', 'VL1'),
  new Cage(19, 'VT3', 'R1C3', 'R1C2', 'R2C3', 'R1C4'),
  new Cage(25, 'VT4', 'R1C5', 'R2C5', 'R3C5'),
  new Cage(9, 'VT5', 'R1C9', 'VR1'),
  new Cage(16, 'VR2', 'R3C9', 'R4C9', 'VR3'),
  new Cage(20, 'R7C8', 'R7C9', 'VR4', 'VR5'),
  new Cage(34, 'R8C7', 'R9C7', 'R9C6', 'VB3', 'R9C8'),
  new Cage(15, 'VB4', 'VB5', 'R9C9', 'VR6'),
  new Cage(20, 'VB2', 'R9C5', 'R8C5', 'R7C5'),
  new Cage(15, 'VL4', 'VL5', 'R7C1', 'R6C1'),
  new Cage(15, 'VL2', 'VL3', 'R3C1', 'R3C2'),
  new Cage(6, 'VL6', 'R9C1', 'VB1'),
];

return [
  new Shape('9x9'),
  ...outsideCells,
  ...skyscraperClues,
  ...cages,
];
