// Title: Counting Killers
// Author: Yawnus
// Video: https://www.youtube.com/watch?v=xzXnxCeFSt4
// Source: https://sudokupad.app/aaardvutyh

// Each cage has no repeated digits. For every possible cage total N, the
// number of cages summing to N is either 0 or exactly N.

const cages = [
  ["R7C1", "R7C2", "R7C3"],
  ["R8C1", "R9C1"],
  ["R8C2", "R9C2"],
  ["R8C3", "R9C3"],
  ["R7C7", "R8C7", "R9C7"],
  ["R7C8", "R7C9"],
  ["R8C8", "R8C9"],
  ["R9C8", "R9C9"],
  ["R7C4", "R8C4", "R9C4"],
  ["R8C6", "R9C5", "R9C6"],
  ["R1C4", "R2C4"],
  ["R1C5", "R2C5"],
  ["R1C6", "R1C7"],
  ["R1C8", "R2C8"],
  ["R2C9", "R3C9", "R4C9"],
  ["R6C6", "R7C5", "R7C6"],
  ["R5C5", "R5C6"],
  ["R4C6", "R4C7"],
  ["R5C3", "R6C3", "R6C4"],
  ["R3C3", "R3C4"],
  ["R2C2", "R3C2"],
  ["R4C1", "R5C1"],
];

function cageCountNFA(target) {
  return NFA.encodeSpec({
    startState: { sum: 0, count: 0 },
    transition: ({ sum, count }, value) => {
      if (value === SEGMENT_BREAK) {
        const nextCount = count + (sum === target ? 1 : 0);
        if (nextCount > target) return [];
        return { sum: 0, count: nextCount };
      }
      return { sum: Math.min(target + 1, sum + value), count };
    },
    accept: ({ sum, count }) => {
      const finalCount = count + (sum === target ? 1 : 0);
      return finalCount === 0 || finalCount === target;
    },
  }, 9, { multiSegment: true });
}

const constraints = [
  new Shape("9x9"),
  ...cages.map(cells => new AllDifferent(...cells)),
];

for (let total = 3; total <= 24; total++) {
  constraints.push(new NFA(cageCountNFA(total), `count cages summing to ${total}`, ...cages));
}

return constraints;
