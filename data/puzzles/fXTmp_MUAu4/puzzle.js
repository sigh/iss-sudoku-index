// Title: Anti-knight Singularis Alchemis
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=fXTmp_MUAu4
// Source: https://sudokupad.app/vnxrlvh04f

// The wording says the thermometer digits "must not decrease", so equal
// consecutive digits are allowed: this is a slow thermometer, not a Thermo.
const slowThermoCells = [
  'R8C4', 'R7C3', 'R6C2', 'R5C2', 'R4C2', 'R3C3', 'R2C4', 'R3C5',
  'R2C6', 'R3C7', 'R4C8', 'R5C8', 'R6C8', 'R7C7', 'R8C6',
];
const slowThermoKey = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Pair(slowThermoKey, 'Slow Thermometer', ...slowThermoCells),
  new Renban('R6C4', 'R5C4', 'R4C4'),
  new Whisper(5, 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5'),
  new Cage(5, 'R1C4', 'R2C4'),
  new Arrow('R3C5', 'R2C5', 'R1C5'),
  new X('R6C3', 'R6C4'),
  new V('R7C4', 'R8C4'),
];
