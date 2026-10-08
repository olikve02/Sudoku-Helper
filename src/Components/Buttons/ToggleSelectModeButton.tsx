import { Button } from "@mui/material";

function ToggleSelectModeButton(props) {
  return <Button onClick={() => props.handleSelectModeClicked()}></Button>;
}
export default ToggleSelectModeButton;
