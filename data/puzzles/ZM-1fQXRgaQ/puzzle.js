// Title: Pointers and Pulsars
// Author: David Sadler
// Video: https://www.youtube.com/watch?v=ZM-1fQXRgaQ
// Source: https://sudokupad.app/2a25cs6i6d

// Normal Sudoku rules: standard rows/columns/boxes (default Shape regions).
//
// Pulsar cells (marker on the drawn diagonal axis): the marked cell's value
// equals (value of the cell 2 steps down that diagonal) ^ (value of the cell
// 2 steps up that diagonal). "Down"/"up" mean increasing/decreasing row
// index, so on the NW-SE axis "down" is the SE neighbour two steps away and
// "up" is the NW neighbour; on the NE-SW axis "down" is the SW neighbour and
// "up" is the NE neighbour.
//
// Pointer cells (one or more chevrons drawn in-cell, one per adjacent
// target): the pointer cell's value equals the arithmetic mean of the
// values in every cell it points to.

// Ternary power relation for one pulsar cell: reads (down, up, marked) in
// that order and accepts iff down^up === marked. State after the first
// symbol records `down`; after the second it records `up` too; the third
// symbol is checked against pow(down, up) and the machine moves to a single
// ACCEPT sink (or dies) rather than carrying the (possibly huge) power
// forward as state.
const pulsarNFA = NFA.encodeSpec({
  startState: { down: null, up: null },
  transition: (state, value) => {
    if (state.down === null) return { down: value, up: null };
    if (state.up === null) return { down: state.down, up: value };
    return Math.pow(state.down, state.up) === value ? 'ACCEPT' : undefined;
  },
  accept: (state) => state === 'ACCEPT',
}, 9);

function Pulsar(marked, down, up) {
  return new NFA(pulsarNFA, `pulsar ${marked}`, down, up, marked);
}

// Mean relation for one pointer cell: sum(targets) - targets.length * pointer
// == 0, using Sum's per-cell coefficient form (bare cells default to +1).
// A single-target pointer is a plain equality instead (SameValues of two
// size-1 sets), since a 1-coefficient Sum is just that.
function Pointer(pointer, ...targets) {
  if (targets.length === 1) return new SameValues(2, pointer, targets[0]);
  return new Sum(0, [pointer, -targets.length], ...targets);
}

return [
  new Shape('9x9'),

  new Given('R9C5', 4),
  new Given('R9C6', 1),

  // Pointer cells -- targets from the drawn chevron directions.
  Pointer('R2C2', 'R2C1', 'R1C1', 'R1C2', 'R2C3', 'R3C2', 'R3C1'),
  Pointer('R2C5', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R3C5', 'R3C4'),
  Pointer('R2C6', 'R1C7', 'R2C7', 'R3C7'),
  Pointer('R2C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8'),
  Pointer('R3C4', 'R4C3'),
  Pointer('R4C8', 'R4C7', 'R5C7'),
  Pointer('R5C2', 'R4C3', 'R6C3'),
  Pointer('R5C5', 'R5C4', 'R4C5', 'R5C6', 'R6C6', 'R6C5', 'R6C4'),
  Pointer('R6C6', 'R6C7', 'R7C7', 'R7C5'),
  Pointer('R7C8', 'R7C7', 'R7C9'),
  Pointer('R8C7', 'R7C7', 'R9C7'),
  Pointer('R8C9', 'R7C9', 'R9C9'),
  Pointer('R9C8', 'R9C7', 'R9C9'),

  // Pulsar cells -- axis from the drawn corner-to-corner diagonal stroke.
  Pulsar('R3C5', 'R5C7', 'R1C3'),
  Pulsar('R5C3', 'R7C5', 'R3C1'),
  Pulsar('R5C7', 'R7C9', 'R3C5'),
  Pulsar('R7C5', 'R9C3', 'R5C7'),
];
