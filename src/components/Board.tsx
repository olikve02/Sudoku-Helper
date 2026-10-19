import Grid from "@mui/material/Grid";
import "../App.css";
import Cell from "./Cell";

type BoardPropsType = {
  cells: {
    row: number;
    cell: number;
    value: number | null;
    candidates: number[];
    selected: boolean;
  }[];
  handleCellClicked: (row: number, cell: number) => void;
};

function Board(props: BoardPropsType) {
  return (
    <Grid container columns={9} className="board">
      {props.cells.map((cell) => (
        <Cell
          key={`${cell.row} - ${cell.cell}`}
          row={cell.row}
          cell={cell.cell}
          value={cell.value}
          candidates={cell.candidates}
          selected={cell.selected}
          handleCellClicked={props.handleCellClicked}
        ></Cell>
      ))}
    </Grid>
  );
}
export default Board;
