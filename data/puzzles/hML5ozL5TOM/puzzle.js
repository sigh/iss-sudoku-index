// Title: Two Out of Three Ain't Bad
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=hML5ozL5TOM
// Source: https://sudokupad.app/1cwnilmrp0

// Each line must satisfy exactly two of modular, entropic, and alternating
// parity. The state retains the last two digits and whether each property has
// survived the prefix scanned so far.
const twoOfThree = NFA.encodeSpec({
  startState: { older: 0, newer: 0, length: 0, modular: 1, entropic: 1, parity: 1 },
  transition: (state, value) => {
    const parity = state.parity
      && (state.length === 0 || (state.newer + value) % 2 === 1);

    let modular = state.modular;
    let entropic = state.entropic;
    if (state.length >= 2) {
      modular = modular && new Set([
        state.older % 3,
        state.newer % 3,
        value % 3,
      ]).size === 3;
      entropic = entropic && new Set([
        Math.floor((state.older - 1) / 3),
        Math.floor((state.newer - 1) / 3),
        Math.floor((value - 1) / 3),
      ]).size === 3;
    }

    return {
      older: state.newer,
      newer: value,
      length: Math.min(state.length + 1, 2),
      modular: Number(modular),
      entropic: Number(entropic),
      parity: Number(parity),
    };
  },
  accept: state => state.modular + state.entropic + state.parity === 2,
}, 9);

const cages = [
  new Cage(9, 'R1C4', 'R1C5'),
  new Cage(12, 'R8C5', 'R9C5'),
  new Cage(12, 'R9C1', 'R9C2'),
  new Cage(9, 'R3C2', 'R3C3'),
  new Cage(11, 'R3C7', 'R4C7'),
];

const lines = [
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
  ['R2C2', 'R2C3', 'R2C4'],
  ['R3C2', 'R4C2', 'R5C2'],
  ['R4C3', 'R5C3', 'R6C3'],
  ['R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5'],
  ['R8C6', 'R8C7', 'R8C8'],
  ['R6C7', 'R5C7', 'R4C7'],
  ['R6C8', 'R5C8', 'R4C8'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
].map(cells => new NFA(twoOfThree, 'exactly two of modular/entropic/parity', ...cells));

return [
  new Shape('9x9'),
  ...cages,
  ...lines,
];
