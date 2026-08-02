// Title: Poison Pill Killer
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=DRvCTOPGnkU
// Source: https://app.crackingthecryptic.com/sudoku/fR6qnrR7Rb

// Normal Sudoku applies. Each drawn cage has distinct digits. A globally chosen
// poison digit makes every cage containing it miss its displayed total; all other
// cages have their displayed total.
const poison = new Var('P', 'poison digit', 1);

// This machine reads the poison digit first, then one cage. It retains the cage
// total and whether the poison appeared; totals above the target share a sink.
function poisonCage(total, ...cells) {
  const machine = NFA.encodeSpec({
    startState: null,
    transition: (state, value) => {
      if (state === null) return { poison: value, sum: 0, hasPoison: false };
      return {
        poison: state.poison,
        sum: Math.min(state.sum + value, total + 1),
        hasPoison: state.hasPoison || value === state.poison,
      };
    },
    accept: state => state !== null && (state.hasPoison
      ? state.sum !== total
      : state.sum === total),
  }, 9);
  return [new AllDifferent(...cells), new NFA(machine, `poison cage ${total}`, 'VP', ...cells)];
}

// Each table is transcribed from one displayed cage: [total, cells].
const cages = [
  [33, ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C4', 'R2C5', 'R2C6']],
  [7, ['R1C6', 'R1C7']], [15, ['R1C8', 'R1C9']],
  [6, ['R3C1', 'R3C2']], [10, ['R2C3', 'R3C3']], [12, ['R3C7', 'R3C8']],
  [31, ['R4C3', 'R5C3', 'R6C3', 'R7C2', 'R7C3', 'R8C2', 'R9C2']],
  [12, ['R7C1', 'R8C1']], [12, ['R4C1', 'R5C1']],
  [28, ['R4C7', 'R5C7', 'R6C7', 'R7C7', 'R7C8', 'R8C8', 'R9C8']],
  [9, ['R6C8', 'R6C9']], [12, ['R3C9', 'R4C9']],
  [12, ['R3C4', 'R3C5', 'R3C6', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R7C6']],
  [13, ['R8C6', 'R8C7', 'R9C6']], [12, ['R8C4', 'R9C4']],
  [9, ['R4C2', 'R5C2', 'R6C2']], [9, ['R5C6', 'R6C6']],
];

return [new Shape('9x9'), poison, ...cages.flatMap(([total, cells]) => poisonCage(total, ...cells))];
