// Én celle på sudokubrettet. row og col går fra 1 til 9.
export type CellState = {
  row: number;
  col: number;
  value: number | null;
  candidates: number[];
  selected: boolean;
};
