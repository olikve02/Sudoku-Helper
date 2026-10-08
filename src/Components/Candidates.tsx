import Grid from "@mui/material/Grid";
import "../App.css";

function Candidates(props) {
  const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <Grid className="sudoku-candidates" container columns={3} size={9}>
      {candidates.map((candidate) => (
        <Grid size={1} key={candidate} className="candidate">
          {props.candidates.includes(candidate) ? candidate : ""}
        </Grid>
      ))}
    </Grid>
  );
}
export default Candidates;
