import { Box } from "@mui/material";
import Board from "./Components/Board";
import ButtonRow from "./Components/CandidateButtonRow";
import { useState } from "react";
import CandidateButtonRow from "./Components/CandidateButtonRow";
import NumberButtonRow from "./Components/NumberButtonRow";

function App() {
  const [cells, setCells] = useState<
    {
      row: number;
      cell: number;
      value: number | null;
      candidates: number[];
      selected: boolean;
    }[]
  >(addCells);

  return (
    <Box className="screen-container">
      <Board cells={cells} handleCellClicked={handleCellClicked}></Board>

      <CandidateButtonRow
        handleCandidateButtonClicked={handleCandidateButtonClicked}
      ></CandidateButtonRow>

      <NumberButtonRow
        handleNumberButtonClicked={handleNumberButtonClicked}
      ></NumberButtonRow>
    </Box>
  );

  function handleCellClicked(row: number, cell: number) {
    const newCells = cells.map((cellState) => {
      if (cellState.row == row && cellState.cell == cell) {
        return { ...cellState, selected: !cellState.selected };
      } else {
        return cellState;
      }
    });

    setCells(newCells);
  }

  function handleCandidateButtonClicked(buttonNr: number) {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        if (cell.candidates.includes(buttonNr)) {
          return {
            ...cell,
            candidates: cell.candidates.filter(
              (candidate) => candidate != buttonNr,
            ),
          };
        } else {
          return { ...cell, candidates: [...cell.candidates, buttonNr] };
        }
      } else {
        return cell;
      }
    });
    console.log(newCells);
    setCells(newCells);
  }

  function handleNumberButtonClicked(buttonNr: number) {
    const newCells = cells.map((cell) => {
      if (cell.selected) {
        return { ...cell, value: buttonNr };
      } else {
        return cell;
      }
    });
    setCells(newCells);
  }
}

function addCells() {
  const cells = [];
  for (let row = 1; row <= 9; row++) {
    for (let cell = 1; cell <= 9; cell++) {
      cells.push({
        row: row,
        cell: cell,
        value: null,
        candidates: [],
        selected: false,
      });
    }
  }
  return cells;
}
export default App;
