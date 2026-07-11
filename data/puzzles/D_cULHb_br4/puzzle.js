// Title: Border Dispute
// Author: Staxis
// Video: https://www.youtube.com/watch?v=D_cULHb_br4
// Source: https://sudokupad.app/k3928bukk6

// Normal sudoku with standard 3x3 boxes and no given digits. Each domino
// crossing a box border must contain a unique unordered pair of digits (no
// digit pair may repeat across border-crossing dominoes). White dots mark
// consecutive digits (not all dots are given). Arrows sum their arm digits
// into the attached circle.
//
// Border-crossing uniqueness: a 9x9 box grid has exactly 36 border-crossing
// dominoes (a border domino's two cells always share a row or column, so the
// row/column all-different rule already forces its digits to differ). One
// shared NFA reads the four cells of every pair of border dominoes and
// rejects whenever both dominoes carry the same unordered digit pair, giving
// pairwise distinctness across all C(36, 2) domino pairs.

const graph = cellGraph('9x9');
const gridCells = graph.cells();

// Box index (0-8, row-major) of a cell, used only to detect box borders; the
// API has no box-index helper.
function box(cellId) {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
}

const borderDominoes = [];
for (const cell of gridCells) {
  const right = graph.step(cell, 0, 1);
  if (right && box(cell) !== box(right)) borderDominoes.push([cell, right]);
  const down = graph.step(cell, 1, 0);
  if (down && box(cell) !== box(down)) borderDominoes.push([cell, down]);
}

const constraints = [new Shape('9x9')];
const add = (...cs) => constraints.push(...cs);

// Reads (a1, b1, a2, b2): the two cells of one border domino, then the two
// cells of another. Rejects if both dominoes carry the same unordered pair.
const pairwiseDistinctMachine = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0:
        return { step: 1, a1: value };
      case 1:
        return {
          step: 2,
          lo1: Math.min(state.a1, value),
          hi1: Math.max(state.a1, value),
        };
      case 2:
        return { step: 3, lo1: state.lo1, hi1: state.hi1, a2: value };
      case 3: {
        const lo2 = Math.min(state.a2, value);
        const hi2 = Math.max(state.a2, value);
        if (lo2 === state.lo1 && hi2 === state.hi1) return undefined;
        return { step: 4 };
      }
    }
  },
  accept: (state) => state.step === 4,
}, 9);

for (let i = 0; i < borderDominoes.length; i++) {
  const [a1, b1] = borderDominoes[i];
  for (let j = i + 1; j < borderDominoes.length; j++) {
    const [a2, b2] = borderDominoes[j];
    add(new NFA(pairwiseDistinctMachine, 'border-pair-distinct', a1, b1, a2, b2));
  }
}

// --- Arrows: bulb cell first, then arm cells the arm digits sum to. ---
add(new Arrow('R8C3', 'R7C3', 'R6C3', 'R6C4', 'R6C5', 'R7C6'));
add(new Arrow('R3C7', 'R2C6', 'R3C6', 'R4C6', 'R4C7'));
add(new Arrow('R2C7', 'R1C6'));
add(new Arrow('R9C3', 'R8C4'));
add(new Arrow('R4C3', 'R5C4'));
add(new Arrow('R2C4', 'R1C3'));

// --- White dots: consecutive digits; not all dots are given. ---
add(new WhiteDot('R1C7', 'R2C7'));
add(new WhiteDot('R7C7', 'R8C7'));
add(new WhiteDot('R2C2', 'R2C3'));
add(new WhiteDot('R7C9', 'R8C9'));

return constraints;
