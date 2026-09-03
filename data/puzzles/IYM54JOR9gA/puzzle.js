// Title: Hitting the Sweet Spot
// Author: PrissyP
// Video: https://www.youtube.com/watch?v=IYM54JOR9gA
// Source: https://sudokupad.app/tgewrz1n8q

// Normal Sudoku rules apply. The grid has no given digits.
//
// Sweet Spots. On every wheat line there is a Sweet Spot cell that splits the
// line into two hitlines, the run of cells on each side of it (the Sweet Spot
// belongs to neither). A hit is a cell whose digit equals its distance from the
// Sweet Spot, counting outward: the neighbouring cell is at distance 1, the next
// at distance 2, and so on. The Sweet Spot digit equals the NUMBER of hits on
// one hitline and the SUM of the hit digits on the other; either hitline may
// take either role. Digits may not repeat within a hitline.

// The five wheat lines, each as the cells its stroke covers in drawn order.
const lines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R5C8', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R2C8', 'R3C8', 'R3C7', 'R2C7',
    'R2C6', 'R2C5', 'R2C4', 'R3C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6',
    'R6C7'],
  ['R6C3', 'R6C2', 'R7C2', 'R8C2', 'R7C3', 'R8C3'],
  ['R8C1', 'R7C1', 'R6C1', 'R5C2', 'R4C1', 'R3C2', 'R2C3', 'R2C2', 'R3C1',
    'R2C1'],
  ['R5C4', 'R6C5', 'R7C6', 'R8C5', 'R9C6', 'R9C7', 'R8C7', 'R7C8', 'R6C9',
    'R6C8', 'R5C7', 'R4C8', 'R4C7'],
];

// One line's Sweet Spot machine, run over three segments: the Sweet Spot cell
// alone, then one hitline and then the other, each listed outward from the
// Sweet Spot so that a cell's distance is its position within its segment.
//
// State fields:
//   phase 0 = before the Sweet Spot digit, 1 = digit read and awaiting the
//             segment break, 2 = first hitline, 3 = second hitline.
//   S     = the Sweet Spot digit.
//   mode  0 = this hitline supplies the NUMBER of hits, 1 = the SUM of the hit
//             digits. The break after phase 1 branches over both assignments and
//             the break between the hitlines swaps the roles, which is "either
//             hitline may take either role".
//   rem   = what is left of S under this hitline's role, so the hitline is
//           satisfied exactly when rem reaches 0 as its segment ends. Counting
//           down keeps the state bounded by S rather than by the line length.
//   d     = the distance of the cell just read, clamped at 10: no digit 1-9 can
//           equal a distance above 9, so all such distances behave alike.
const sweetSpotSpec = (numCells) => NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    const isBreak = value === SEGMENT_BREAK;
    if (state.phase === 0) {
      return isBreak ? undefined : { phase: 1, S: value };
    }
    if (state.phase === 1) {
      return isBreak ? [
        { phase: 2, S: state.S, mode: 0, d: 0, rem: state.S },
        { phase: 2, S: state.S, mode: 1, d: 0, rem: state.S },
      ] : undefined;
    }
    if (isBreak) {
      if (state.phase !== 2 || state.rem !== 0) return undefined;
      return { phase: 3, S: state.S, mode: 1 - state.mode, d: 0, rem: state.S };
    }
    const d = Math.min(state.d + 1, 10);
    const rem = state.rem - (value === d ? (state.mode === 0 ? 1 : d) : 0);
    if (rem < 0) return undefined;
    return { phase: state.phase, S: state.S, mode: state.mode, d, rem };
  },
  accept: (state) => state.phase === 3 && state.rem === 0,
  // Every cell of the line plus the two segment breaks.
  maxDepth: numCells + 2,
}, 9, { multiSegment: true });

// "Find a Sweet Spot cell on every line": a disjunction over where on the line
// it sits, each branch carrying that split's hitline all-differents alongside
// its machine so the no-repeats rule applies to the same split the machine
// scores. An end cell is not a candidate: its empty hitline has no hits, so both
// its hit count and its hit total are 0, which no digit 1-9 can equal.
const sweetSpotLine = (cells, lineIndex) => {
  const spec = sweetSpotSpec(cells.length);
  const branches = [];
  for (let i = 1; i < cells.length - 1; i++) {
    const before = cells.slice(0, i).reverse();
    const after = cells.slice(i + 1);
    branches.push(new And([
      new AllDifferent(...before),
      new AllDifferent(...after),
      new NFA(spec, `sweet_L${lineIndex + 1}_at${i + 1}`,
        [cells[i]], before, after),
    ]));
  }
  return new Or(branches);
};

return [
  new Shape('9x9'),
  ...lines.map(sweetSpotLine),
];
