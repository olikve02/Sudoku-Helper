import { Box } from "@mui/material";

type NumberButtonRowProps = {
  onNumberClick: (number: number) => void;
};

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function NumberButtonRow({ onNumberClick }: NumberButtonRowProps) {
  return (
    <Box className="button-row">
      {NUMBERS.map((number) => (
        <button
          key={number}
          onClick={() => onNumberClick(number)}
          className="number-button"
        >
          {number}
        </button>
      ))}
    </Box>
  );
}

export default NumberButtonRow;
