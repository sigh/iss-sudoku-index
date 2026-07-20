// Title: Unlucky 13
// Author: Possible Spam Risk
// Video: https://www.youtube.com/watch?v=KCdKUL5EjPM
// Source: https://sudokupad.app/4b16rwzym1

// Normal sudoku. A VS overlay records the cell shading: 1 is unshaded and
// 2..6 are gray, brown, blue, brick, and yellow. One NFA per row and column
// reads alternating shade/digit cells and enforces its complete ordered list
// of coloured Japanese Sum runs. '?' means a total of 1..9; '??' means a
// total of 10..99. Repeated runs of one colour require an unshaded separator.

const UNSHADED = 1;
const GRAY = 2;
const BROWN = 3;
const BLUE = 4;
const BRICK = 5;
const YELLOW = 6;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const geometry = graph.gridGeometry();

const clue = (color, total) => ({ color, total });

// A target is either an exact number or the literal '?' / '??'.
const rowClues = [
  [clue(GRAY, '??'), clue(GRAY, 1)],
  [clue(GRAY, 19), clue(GRAY, 13)],
  [clue(BLUE, '?'), clue(BLUE, '?'), clue(GRAY, 19)],
  [clue(BLUE, '?'), clue(BLUE, 8), clue(BLUE, '?'), clue(YELLOW, 12), clue(BLUE, '?')],
  [clue(BLUE, 1), clue(BLUE, '?'), clue(YELLOW, 9), clue(BLUE, '?')],
  [clue(BLUE, '?'), clue(BLUE, '?'), clue(YELLOW, '??'), clue(BLUE, '?'), clue(BLUE, '?')],
  [clue(BLUE, '?'), clue(BRICK, '?'), clue(BLUE, '?'), clue(BLUE, '?')],
  [clue(BLUE, 1), clue(BROWN, '??'), clue(BLUE, '?')],
  [clue(BROWN, '??')],
];

const columnClues = [
  [clue(GRAY, '??'), clue(BLUE, '?'), clue(BLUE, '?'), clue(BLUE, '?')],
  [clue(GRAY, 10), clue(BLUE, '?'), clue(BLUE, '?'), clue(BLUE, '?'), clue(BROWN, 14)],
  [clue(GRAY, 1), clue(BLUE, '?'), clue(BLUE, 6), clue(BROWN, '?')],
  [clue(GRAY, '?'), clue(BLUE, 3), clue(BLUE, '?'), clue(BRICK, '?'), clue(BROWN, 10)],
  [clue(YELLOW, 1), clue(BROWN, 17)],
  [clue(GRAY, 1), clue(BLUE, 4), clue(YELLOW, '??'), clue(BLUE, '?'), clue(BROWN, 9)],
  [clue(GRAY, 11), clue(YELLOW, 9), clue(BLUE, '?'), clue(BROWN, 6)],
  [clue(GRAY, '?'), clue(YELLOW, 9), clue(BLUE, 5), clue(BLUE, '?'), clue(BROWN, 11)],
  [clue(GRAY, 15), clue(BLUE, '?'), clue(BLUE, '?'), clue(BLUE, 3)],
];

function matchesTotal(target, sum) {
  if (target === '?' || target === '??') return String(sum).length === target.length;
  return sum === target;
}

function japaneseSumMachine(clues) {
  const closeRun = state => {
    const current = clues[state.clueIndex];
    if (!current || current.color !== state.color ||
        !matchesTotal(current.total, state.sum)) return undefined;
    return {
      phase: 'shade',
      clueIndex: state.clueIndex + 1,
      color: UNSHADED,
      sum: 0,
    };
  };

  return NFA.encodeSpec({
    startState: {
      phase: 'shade',
      clueIndex: 0,
      color: UNSHADED,
      sum: 0,
    },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return {
          ...state,
          phase: 'shade',
          sum: state.color === UNSHADED ? 0 : state.sum + value,
        };
      }

      let current = state;
      if (current.color !== UNSHADED && value !== current.color) {
        current = closeRun(current);
        if (!current) return undefined;
      }

      if (value === UNSHADED) {
        return {
          ...current,
          phase: 'digit',
          color: UNSHADED,
          sum: 0,
        };
      }

      if (current.color === UNSHADED) {
        const next = clues[current.clueIndex];
        if (!next || next.color !== value) {
          return undefined;
        }
        return {
          ...current,
          phase: 'digit',
          color: value,
          sum: 0,
        };
      }

      return { ...current, phase: 'digit' };
    },
    accept: state => {
      if (state.phase !== 'shade') return false;
      const finished = state.color === UNSHADED ? state : closeRun(state);
      return Boolean(finished && finished.clueIndex === clues.length);
    },
    // Nine shade/digit pairs are the complete input for one row or column.
    maxDepth: 18,
  }, geometry.numValues);
}

const rowConstraints = rowClues.map((clues, index) => new NFA(
  japaneseSumMachine(clues),
  `japanese-R${index + 1}`,
  ...graph.row(index + 1).flatMap(cell => [shade.at(cell), cell]),
));

const columnConstraints = columnClues.map((clues, index) => new NFA(
  japaneseSumMachine(clues),
  `japanese-C${index + 1}`,
  ...graph.column(index + 1).flatMap(cell => [shade.at(cell), cell]),
));

return [
  new Shape('9x9'),
  shade.toVar('Japanese Sums shading'),
  shade.makeReplicate(new Given(shade.cells()[0],
    UNSHADED, GRAY, BROWN, BLUE, BRICK, YELLOW)),
  ...rowConstraints,
  ...columnConstraints,
];
