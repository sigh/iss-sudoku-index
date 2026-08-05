// Title: Nov. 7, 2022: Minimax
// Author: clover!
// Video: https://www.youtube.com/watch?v=FLATfYbBeug
// Source: https://tinyurl.com/4jb85f9f

// Normal Sudoku rules apply. Each listed outside clue gives the sum of the
// smallest and largest digits in its adjacent three-cell row or column run.
const outsideClues = [
  // Clue totals and runs transcribed from the twelve outside text clues.
  [4, ['R1C1', 'R2C1', 'R3C1']],
  [5, ['R1C4', 'R2C4', 'R3C4']],
  [4, ['R1C7', 'R2C7', 'R3C7']],
  [8, ['R1C9', 'R1C8', 'R1C7']],
  [10, ['R3C9', 'R3C8', 'R3C7']],
  [10, ['R5C9', 'R5C8', 'R5C7']],
  [15, ['R9C3', 'R8C3', 'R7C3']],
  [16, ['R9C6', 'R8C6', 'R7C6']],
  [14, ['R9C9', 'R8C9', 'R7C9']],
  [8, ['R7C1', 'R7C2', 'R7C3']],
  [11, ['R9C1', 'R9C2', 'R9C3']],
  [9, ['R5C1', 'R5C2', 'R5C3']],
];

function minimaxSpec(total) {
  // State records how many cells have been read and their running extrema.
  return NFA.encodeSpec({
    startState: { count: 0, min: 10, max: 0 },
    transition: ({ count, min, max }, value) =>
      count === 3 ? [] : { count: count + 1, min: Math.min(min, value), max: Math.max(max, value) },
    accept: ({ count, min, max }) => count === 3 && min + max === total,
  }, 9);
}

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R2C4', 2), new Given('R3C7', 3),
  new Given('R4C2', 4), new Given('R5C5', 5), new Given('R6C8', 6),
  new Given('R7C3', 7), new Given('R8C6', 8), new Given('R9C9', 9),
  ...outsideClues.map(([total, cells]) => new NFA(minimaxSpec(total), 'minimax', cells)),
];
