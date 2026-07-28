// Title: Look and whisper
// Author: Lithium-Ion and Holzanatom
// Video: https://www.youtube.com/watch?v=lhYZ25YivzM
// Source: https://sudokupad.app/lx67bjidk7

// Normal sudoku. Adjacent digits on each drawn green line differ by at least
// 5. Its endpoint digits {a, b}, including equal endpoints, require exactly
// a copies of b and exactly b copies of a on that whole line, endpoints
// included. The paths are transcribed from the five drawn green strokes; the
// R2C6-to-R2C8 path is explicitly identified in the rules text.
const lines = [
  ['R8C1', 'R7C2', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R2C2', 'R1C2', 'R1C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C8', 'R5C8', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R9C2', 'R9C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C8', 'R6C7', 'R5C7', 'R4C6', 'R4C5', 'R4C4', 'R3C4', 'R3C3', 'R2C3'],
  ['R2C6', 'R1C7', 'R1C8', 'R1C9', 'R2C8'],
  ['R5C3', 'R6C4', 'R7C4', 'R7C5', 'R6C6'],
];

// The NFA reads the two endpoints first, then the remaining cells. Its state
// records each endpoint digit and its occurrences; counts saturate one past
// the required opposite endpoint value because a larger count cannot recover.
const lookAndSay = NFA.encodeSpec({
  startState: { d1: null, d2: null, count1: 0, count2: 0 },
  transition: ({ d1, d2, count1, count2 }, value) => {
    if (d1 === null) return { d1: value, d2: null, count1: 1, count2: 0 };
    if (d2 === null) {
      const same = value === d1;
      return {
        d1, d2: value,
        count1: Math.min(count1 + (same ? 1 : 0), value + 1),
        count2: Math.min(1 + (same ? 1 : 0), d1 + 1),
      };
    }
    return {
      d1, d2,
      count1: Math.min(count1 + (value === d1 ? 1 : 0), d2 + 1),
      count2: Math.min(count2 + (value === d2 ? 1 : 0), d1 + 1),
    };
  },
  accept: ({ d1, d2, count1, count2 }) =>
    d2 !== null && count1 === d2 && count2 === d1,
  maxDepth: 15,
}, 9);

const whispers = lines.map(cells => new Whisper(5, ...cells));
const lookAndSays = lines.map((cells, i) => {
  const [first, ...middle] = cells;
  const last = middle.pop();
  return new NFA(lookAndSay, `look-and-say ${i}`, first, last, ...middle);
});

return [
  new Shape('9x9'),
  ...whispers,
  ...lookAndSays,
];
