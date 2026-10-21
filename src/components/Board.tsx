import Grid from "@mui/material/Grid";
import Cell from "./Cell";
import type { CellState } from "../types";
import { hasConflict, isPeerOfSelectedCell } from "../hooks/useSudokuBoard";

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
          hasConflict={hasConflict(cell, cells)}
          onClick={() => onCellClick(cell.row, cell.col)}
          isPeer={isPeerOfSelectedCell(cell, cells)}
        />
      ))}
    </Grid>
  );
}

export default Board;
