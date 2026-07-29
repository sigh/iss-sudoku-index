// Title: Rainbow Trout
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=to8n89nnrRw
// Source: https://sudokupad.app/qy2dyyfrcg

// Normal Sudoku applies.  On each grey fishing line, adjacent digits differ by
// exactly the digit in the fish whose letter and colour match that line's hook.
// The line/fish coordinates are transcribed from the drawn grey paths and labels.
function fishingLine(fish, cells, label) {
  // The NFA reads the fish digit first, then remembers the previous line digit
  // so every later digit can be checked at exactly that difference.
  const spec = NFA.encodeSpec({
    startState: { fish: null, previous: null },
    transition: (state, value) => {
      if (state.fish === null) return { fish: value, previous: null };
      if (state.previous === null) return { fish: state.fish, previous: value };
      return Math.abs(state.previous - value) === state.fish
        ? { fish: state.fish, previous: value }
        : undefined;
    },
    accept: state => state.fish !== null && state.previous !== null,
  }, 9);
  return new NFA(spec, `${label} fishing line`, fish, ...cells);
}

const fishingLines = [
  fishingLine('R9C6', ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4'], 'E'),
  fishingLine('R6C6', ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6'], 'G'),
  fishingLine('R7C9', ['R1C5', 'R2C5'], 'F'),
  fishingLine('R6C9', ['R1C7', 'R2C7', 'R3C7'], 'H'),
  fishingLine('R1C2', ['R1C8', 'R2C8', 'R3C8'], 'I'),
  fishingLine('R9C7', ['R1C9', 'R2C9', 'R3C9'], 'J'),
  fishingLine('R4C7', ['R7C1', 'R8C1', 'R9C1'], 'A'),
  fishingLine('R6C1', ['R7C2', 'R8C2', 'R9C2'], 'B'),
  fishingLine('R2C1', ['R7C3', 'R8C3', 'R9C3'], 'C'),
  fishingLine('R4C1', ['R6C4', 'R7C4', 'R8C4'], 'D'),
];

return [
  new Shape('9x9'),
  ...fishingLines,
];
