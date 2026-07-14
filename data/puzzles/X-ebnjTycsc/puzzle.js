// Title: Heavy Is the Crown
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=X-ebnjTycsc
// Source: https://sudokupad.app/c3qu3xglut

// A Tentropic line's last three group labels must all differ from the next.
// Thus every four-cell window contains the four groups 19, 28, 37, and 46;
// digit 5 has no group and is rejected.
const tentropicNfa = NFA.encodeSpec({
  startState: { recent: [] },
  transition: ({ recent }, digit) => {
    const group = digit === 5 ? -1 : Math.min(digit, 10 - digit);
    if (group < 1 || recent.includes(group)) return undefined;
    return { recent: [...recent, group].slice(-3) };
  },
  accept: () => true,
}, 9);

const tentropicLines = [
  new NFA(tentropicNfa, 'Tentropic',
    'R9C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3', 'R6C2', 'R5C2', 'R4C2', 'R3C1'),
  new NFA(tentropicNfa, 'Tentropic',
    'R2C3', 'R3C3', 'R3C4', 'R4C5', 'R4C6', 'R5C6', 'R6C7', 'R7C7', 'R7C8'),
];

const regionSumLines = [
  new RegionSumLine(
    'R1C3', 'R2C4', 'R2C5', 'R3C6', 'R3C7', 'R4C7', 'R5C8', 'R6C8', 'R7C9'),
  new RegionSumLine('R5C3', 'R5C4', 'R6C4', 'R7C5'),
];

const cages = [
  new Cage(20, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(20, 'R7C2', 'R8C2', 'R8C3'),
  new Cage(20, 'R8C7', 'R8C8', 'R8C9'),
];

return [
  new Shape('9x9'),
  ...tentropicLines,
  ...regionSumLines,
  ...cages,
];
