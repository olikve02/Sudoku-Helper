import { Box } from "@mui/material";
import { Check } from "lucide-react";

type NumberButtonRowProps = {
  onNumberClick: (number: number) => void;
  completedNumbers: number[];
};

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function NumberButtonRow({
  onNumberClick,
  completedNumbers,
}: NumberButtonRowProps) {
  return (
    <Box className="button-row">
      {NUMBERS.map((number) => (
        <button
          key={number}
          onClick={() => onNumberClick(number)}
          className="number-button"
          disabled={completedNumbers.includes(number) ? true : false}
        >
          {completedNumbers.includes(number) ? <Check></Check> : number}
        </button>
      ))}
    </Box>
  );
}

export default NumberButtonRow;
