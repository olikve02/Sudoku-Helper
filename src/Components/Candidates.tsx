type CandidatesProps = {
  candidates: number[];
};

function Candidates(props: CandidatesProps) {
  const candidates = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="sudoku-candidates">
      {candidates.map((candidate) => (
        <div className="candidate" key={candidate}>
          {props.candidates.includes(candidate) ? candidate : ""}
        </div>
      ))}
    </div>
  );
}

export default Candidates;
