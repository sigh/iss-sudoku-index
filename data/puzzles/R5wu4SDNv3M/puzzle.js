// Title: Nine Rooms
// Author: zetamath
// Video: https://www.youtube.com/watch?v=R5wu4SDNv3M
// Source: https://sudokupad.app/38fLLNhq84

// Normal Sudoku rules apply. Grey squares are even and grey circles are odd.
// Each box's circle or pill is the decimal total of the digits orthogonally
// adjacent within that box to its own box-number digit. Pill order is reading order.
const rooms = [
  { number: 1, total: ['R3C1'], cells: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'] },
  { number: 2, total: ['R1C5', 'R1C6'], cells: ['R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'] },
  { number: 3, total: ['R3C8'], cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'] },
  { number: 4, total: ['R5C3', 'R6C3'], cells: ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3'] },
  { number: 5, total: ['R4C5'], cells: ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'] },
  { number: 6, total: ['R5C7', 'R6C7'], cells: ['R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9'] },
  { number: 7, total: ['R9C2'], cells: ['R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3'] },
  { number: 8, total: ['R8C4', 'R8C5'], cells: ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6'] },
  { number: 9, total: ['R7C9'], cells: ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'] },
]; // Room cells and mark locations transcribed from the 3x3 boxes and drawn marks.

const neighbours = index => {
  const row = Math.floor(index / 3);
  const col = index % 3;
  return [index - 3, index + 3, index - 1, index + 1]
    .filter(other => other >= 0 && other < 9 && (Math.floor(other / 3) === row || other % 3 === col));
};

// One NFA per possible location of the room number. Its state holds the displayed
// total and the running adjacent-digit sum; the fixed location selects the right neighbours.
const roomTotal = ({ number, total, cells }) => cells.map((_, numberIndex) => {
  const adjacent = neighbours(numberIndex).map(index => cells[index]);
  const spec = NFA.encodeSpec({
    startState: { position: 0, total: 0, sum: 0 },
    transition: ({ position, total: displayed, sum }, value) => {
      if (position < total.length) {
        const nextTotal = displayed * 10 + value;
        return position + 1 === total.length && nextTotal > 36
          ? undefined
          : { position: position + 1, total: nextTotal, sum };
      }
      if (position === total.length) {
        return value === number ? { position: position + 1, total: displayed, sum } : undefined;
      }
      const nextSum = sum + value;
      return nextSum > displayed ? undefined : { position: position + 1, total: displayed, sum: nextSum };
    },
    accept: ({ position, total: displayed, sum }) => position === total.length + 1 + adjacent.length && sum === displayed,
    maxDepth: total.length + 1 + adjacent.length,
  }, 9);
  return new NFA(spec, `room ${number} total`, ...total, cells[numberIndex], ...adjacent);
});

const roomTotals = rooms.map(room => new Or(roomTotal(room)));
const parity = [
  new Given('R3C3', 2, 4, 6, 8),
  new Given('R5C5', 2, 4, 6, 8),
  new Given('R8C6', 2, 4, 6, 8),
  new Given('R2C5', 1, 3, 5, 7, 9),
  new Given('R2C8', 1, 3, 5, 7, 9),
]; // Grey square and circle cells in the drawn grid.

return [new Shape('9x9'), ...parity, ...roomTotals];
