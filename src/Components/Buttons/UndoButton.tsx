import Button from "@mui/material/Button";

function UndoButton(props) {
  return <Button onClick={() => props.handleUndoClick()}>Undo</Button>;
}
export default UndoButton;
