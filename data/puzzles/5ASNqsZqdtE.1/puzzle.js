// Title: July 21, 2022: Odd/Even Count
// Author: clover!
// Video: https://www.youtube.com/watch?v=5ASNqsZqdtE
// Source: https://tinyurl.com/2p36nvxd

// Normal sudoku rules apply. An odd digit in a gray cell tells you how many
// of the surrounding cells (including diagonals) contain odd digits; an even
// digit in a gray cell tells you how many surrounding cells contain even
// digits. The gray cell's own digit is not included in its own count.

const graph = cellGraph('9x9');

// The 8 gray-shaded cells the count rule applies to.
const grayCells = [
  'R1C1', 'R1C3', 'R3C3', 'R4C5', 'R6C5', 'R7C7', 'R9C7', 'R9C9',
];

// One NFA per gray cell, scanning [cell, ...kingNeighbours(cell)]. The first
// symbol sets `target` to the gray cell's own digit; every later symbol adds
// to `count` when its parity matches target's parity, clamped at target + 1
// (a sink meaning "already too many"). Accept iff count === target. Because
// matching the target's own parity is exactly "odd digit counts odd
// neighbours, even digit counts even neighbours", one relation covers both
// halves of the rule.
function oddEvenCountNfa(cell) {
  const neighbours = graph.kingNeighbours(cell);
  const spec = NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      const hit = (value % 2 === target % 2) ? 1 : 0;
      return { target, count: Math.min(count + hit, target + 1) };
    },
    accept: ({ target, count }) => target !== null && count === target,
  }, 9);
  return new NFA(spec, `oddEvenCount-${cell}`, cell, ...neighbours);
}

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 3),
  new Given('R1C3', 2),
  new Given('R1C7', 5),
  new Given('R1C9', 7),
  new Given('R2C4', 4),
  new Given('R2C8', 8),
  new Given('R3C3', 1),
  new Given('R3C9', 6),
  new Given('R4C7', 7),
  new Given('R5C4', 9),
  new Given('R5C6', 3),
  new Given('R6C3', 7),
  new Given('R7C1', 7),
  new Given('R7C7', 4),
  new Given('R8C2', 6),
  new Given('R8C6', 5),
  new Given('R9C1', 8),
  new Given('R9C3', 9),
  new Given('R9C7', 3),
  new Given('R9C9', 2),

  ...grayCells.map(oddEvenCountNfa),
];
