import { Box } from "@mui/material";

function ButtonRow(props) {
  const buttons = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <Box direction={"row"} className="button-row">
      {buttons.map((button) => (
        <button
          key={button}
          onClick={() => props.handleCandidateButtonClicked(button + 1)}
          className="button"
        >
          {button + 1}
        </button>
      ))}
    </Box>
  );
}
export default ButtonRow;
