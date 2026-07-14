// Title: The Good, the Bad and the Ugly
// Author: UnnamedSorcerer
// Video: https://www.youtube.com/watch?v=NRFfM16q7MY
// Source: https://sudokupad.app/4ljh14tybv

// Each question mark is an unknown value shared by an X-Sum, a sandwich,
// a skyscraper, and a little-killer diagonal at the same location. The
// question values are modeled by VQ1, VQ2, and VQ3.

const graph = cellGraph('9x9');

function xSumEquals(clueCell, cells, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, x: null, left: null, sum: 0 };
      if (state.x === null) {
        if (value > state.target) return undefined;
        return { target: state.target, x: value, left: value - 1, sum: value };
      }
      if (state.left === 0) return state;
      const sum = state.sum + value;
      if (sum > state.target) return undefined;
      return { target: state.target, x: state.x, left: state.left - 1, sum };
    },
    accept: state => state !== null && state.left === 0 && state.sum === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, clueCell, ...cells);
}

function sandwichEquals(clueCell, cells, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, phase: 'before', sum: 0 };
      if (state.phase === 'before') {
        return (value === 1 || value === 9)
          ? { target: state.target, phase: 'between', sum: 0 }
          : state;
      }
      if (state.phase === 'between') {
        if (value === 1 || value === 9) {
          return { target: state.target, phase: 'after', sum: state.sum };
        }
        const sum = state.sum + value;
        if (sum > state.target) return undefined;
        return { target: state.target, phase: 'between', sum };
      }
      return state;
    },
    accept: state => state !== null && state.phase === 'after' && state.sum === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, clueCell, ...cells);
}

function skyscraperEquals(clueCell, cells, name) {
  const spec = {
    startState: null,
    transition: (state, value) => {
      if (state === null) return { target: value, maxSeen: 0, count: 0 };
      if (value <= state.maxSeen) return state;
      const count = state.count + 1;
      if (count > state.target) return undefined;
      return { target: state.target, maxSeen: value, count };
    },
    accept: state => state !== null && state.count === state.target,
  };
  return new NFA(NFA.encodeSpec(spec, 9), name, clueCell, ...cells);
}

function combinedClue(clueCell, cells, diagonal, name) {
  return [
    xSumEquals(clueCell, cells, `${name} X-Sum`),
    sandwichEquals(clueCell, cells, `${name} sandwich`),
    skyscraperEquals(clueCell, cells, `${name} skyscraper`),
    new EqualSum(diagonal, [clueCell]),
  ];
}

return [
  new Shape('9x9'),
  new Var('Q', 'combined outside clue values', 3),

  ...combinedClue('VQ1', graph.row(2), ['R1C1'], 'left of R2'),
  ...combinedClue('VQ2', graph.row(5).reverse(), ['R6C9', 'R7C8', 'R8C7', 'R9C6'], 'right of R5'),
  ...combinedClue('VQ3', graph.column(4).reverse(), ['R9C3', 'R8C2', 'R7C1'], 'below C4'),

  new WhiteDot('R2C9', 'R3C9'),
  new BlackDot('R8C5', 'R9C5'),
];
