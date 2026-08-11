// Title: Cross About Dominoes
// Author: FullDeck and Missing A Few Cards
// Video: https://www.youtube.com/watch?v=SMDnnAmIM4E
// Source: https://app.crackingthecryptic.com/sudoku/jBPdbMpP9d

// Normal sudoku rules apply; regions are the standard 3x3 boxes (the payload's
// `regions` array lists exactly the nine default boxes).
//
// Cages: Cage(total, ...cells) -- digits sum to the total shown in the cage's
// top-left cell.
//
// "Every diagonal of length 7,8 or 9 is either modular or unimodular": the
// payload has no `lines` array, so "diagonal" is not drawn geometry -- it is
// the grid's own mathematical diagonals (constant row-col, or constant
// row+col). Of the 17 diagonals per direction (lengths 1..9..1), the length
// filter keeps exactly 5 per direction: the length-9 main diagonal, the two
// length-8 diagonals next to it, and the two length-7 diagonals beyond those.
// Each of the resulting 10 diagonals is independently either modular or
// unimodular; the rules never say which, so each is Or(Modular, unimodular).
// Modular is ISS's native Modular(3, ...cells). Unimodular has no native
// class: the unimodularSpec NFA reads the first digit's residue mod 3 as the
// shared class (state field `cls`, null until set) and rejects any later
// digit whose residue differs.

const graph = cellGraph('9x9');

// 17 diagonals per direction, generated from every border start cell nearest
// the top, then filtered to the lengths (7, 8 or 9) the rule names.
const diagonalStarts = [
  ...graph.row(1).map(cell => [cell, 1, 1]),
  ...graph.column(1).slice(1).map(cell => [cell, 1, 1]),
  ...graph.row(1).map(cell => [cell, 1, -1]),
  ...graph.column(9).slice(1).map(cell => [cell, 1, -1]),
];
const diagonals = diagonalStarts
  .map(([start, dR, dC]) => graph.ray(start, dR, dC))
  .filter(cells => cells.length >= 7);

const unimodularSpec = NFA.encodeSpec({
  startState: { cls: null },
  transition: (state, value) => {
    if (state.cls === null) return { cls: value % 3 };
    if (value % 3 !== state.cls) return undefined;
    return state;
  },
  accept: () => true,
}, 9);

const diagonalConstraints = diagonals.map((cells, idx) => new Or([
  new Modular(3, ...cells),
  new NFA(unimodularSpec, 'unimodular' + idx, ...cells),
]));

// Cages, provenance: the source's drawn cage clues (its metadata stubs for
// title/author/rules are not cages and are excluded).
const cages = [
  new Cage(13, 'R2C1', 'R2C2'),
  new Cage(15, 'R4C5', 'R5C5', 'R5C4', 'R6C5', 'R5C6'),
  new Cage(11, 'R1C8', 'R2C8'),
  new Cage(13, 'R6C9', 'R7C9'),
  new Cage(8, 'R9C3', 'R9C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...diagonalConstraints,
];
