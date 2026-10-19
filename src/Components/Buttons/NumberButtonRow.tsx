import { Box } from "@mui/material";

type ButtonRowProps = {
  handleNumberButtonClicked: (number: number) => void;
};

function ButtonRow(props: ButtonRowProps) {
  const buttons = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <Box className="button-row">
      {buttons.map((button) => (
        <button
          key={button}
          onClick={() => props.handleNumberButtonClicked(button + 1)}
          className="number-button"
        >
          {button + 1}
        </button>
      ))}
    </Box>
  );
}
export default ButtonRow;
