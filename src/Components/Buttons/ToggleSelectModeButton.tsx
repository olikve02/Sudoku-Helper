import { Button } from "@mui/material";

function ToggleSelectModeButton(props) {
  return (
    <Button onClick={() => props.handleSelectModeClicked()}>
      Select Multiple Cells
    </Button>
  );
}
export default ToggleSelectModeButton;
