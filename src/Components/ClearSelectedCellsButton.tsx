import { Button } from "@mui/material";

function ClearSelectedCellsButton(props) {
  return (
    <Button onClick={() => props.handleClearSelectedCellsClicked}>
      Clear Selected Cells
    </Button>
  );
}
export default ClearSelectedCellsButton;
