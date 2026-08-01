// Title: Fraction party
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=TykXTMjfhec
// Source: https://sudokupad.app/oepolnj5ur

// Normal sudoku. Every outlined cage has distinct digits and exactly one
// unmarked divisor digit. Its displayed fraction equals the sum of every other
// cage digit divided by that divisor.

const cages = [
  ['1/2', ['R1C3', 'R1C4', 'R2C3']],
  ['15', ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9']],
  ['1/2', ['R3C1', 'R3C2', 'R4C1']],
  ['10', ['R3C5', 'R3C6', 'R4C6', 'R4C7']],
  ['15', ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9']],
  ['7/2', ['R8C9', 'R9C8', 'R9C9']],
  ['5/2', ['R8C7', 'R9C6', 'R9C7']],
  ['15/2', ['R8C4', 'R9C2', 'R9C3', 'R9C4', 'R9C5']],
  ['14', ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5']],
  ['10', ['R5C6', 'R5C7', 'R6C6', 'R7C6']],
  ['5/2', ['R6C7', 'R7C7', 'R7C8']],
  ['7/2', ['R5C3', 'R6C3', 'R6C4']],
  ['4', ['R4C2', 'R4C3', 'R4C4', 'R5C2', 'R5C4']],
];

// The NFA branches once to designate one scanned cage digit as the divisor,
// then accumulates the other digits. At the end it checks numerator/denominator
// times that sum, avoiding any dependence on an ordering within a cage.
const divisorCageNfa = clue => {
  const [numeratorText, denominatorText = '1'] = clue.split('/');
  const numerator = Number(numeratorText);
  const denominator = Number(denominatorText);
  return NFA.encodeSpec({
    startState: { divisor: null, sum: 0 },
    transition(state, value) {
      if (state.divisor === null) {
        return [
          { divisor: value, sum: state.sum },
          { divisor: null, sum: state.sum + value },
        ];
      }
      return { divisor: state.divisor, sum: state.sum + value };
    },
    accept: state => state.divisor !== null && denominator * state.sum === numerator * state.divisor,
    maxDepth: 5,
  }, 9);
};

const divisorCages = cages.map(([clue, cells]) => [
  new AllDifferent(...cells),
  new NFA(divisorCageNfa(clue), `divisor cage ${clue}`, ...cells),
]);

return [
  new Shape('9x9'),
  ...divisorCages.flat(),
];
