// Title: Fibonacci Thermo
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=-pJ3m4G82ag
// Source: https://app.crackingthecryptic.com/sudoku/t43n9QnBLp
//
// Normal sudoku rules apply.
//
// Thermo (bulb R5C5): grouped into consecutive non-overlapping pairs starting
// at the bulb, each pair's two digits (in path order) form a 2-digit number;
// the 17 numbers strictly increase along the path, and any of them beginning
// with 2 or 8 must have an odd second digit. Encoded as one NFA scanning the
// path in path order: phase 'tens' reads a pair's first digit, phase 'ones'
// reads its second digit, checks the 2/8-leading parity rule and the strict
// increase against the previous pair's number, then returns to 'tens'.
// Accept only on a 'tens' boundary (i.e. after a whole number of pairs) with
// at least one pair read.
//
// Black dot (edge R8C9/R9C9): "the black dot joins digits with a 1:2 ratio"
// is BlackDot's standard Kropki semantics (one value double the other).

const thermo = [
  'R5C5', 'R6C5', 'R6C4', 'R5C3', 'R4C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7',
  'R5C7', 'R6C7', 'R7C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C2', 'R6C1',
  'R5C1', 'R4C1', 'R3C1', 'R2C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7',
  'R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C8', 'R9C7',
];

const pairThermoSpec = NFA.encodeSpec({
  startState: { phase: 'tens', tens: null, prev: null },
  transition: ({ phase, tens, prev }, value) => {
    if (phase === 'tens') return { phase: 'ones', tens: value, prev };
    // phase === 'ones': close out the pair.
    if ((tens === 2 || tens === 8) && value % 2 === 0) return undefined;
    const num = tens * 10 + value;
    if (prev !== null && num <= prev) return undefined;
    return { phase: 'tens', tens: null, prev: num };
  },
  accept: ({ phase, prev }) => phase === 'tens' && prev !== null,
}, 9);

return [
  new Shape('9x9'),
  new NFA(pairThermoSpec, 'thermo pair numbers increase', thermo),
  new BlackDot('R8C9', 'R9C9'),
];
