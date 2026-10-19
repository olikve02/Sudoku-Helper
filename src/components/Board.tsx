import Grid from "@mui/material/Grid";
import Cell from "./Cell";
import type { CellState } from "../types";

type BoardProps = {
  cells: CellState[];
  onCellClick: (row: number, col: number) => void;
};

function Board({ cells, onCellClick }: BoardProps) {
  return (
    <Grid container columns={9} className="board">
      {cells.map((cell) => (
        <Cell
          key={`${cell.row}-${cell.col}`}
          cell={cell}
          onClick={() => onCellClick(cell.row, cell.col)}
        />
      ))}
    </Grid>
  );
}

export default Board;
