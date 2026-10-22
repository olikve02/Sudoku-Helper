import { useState } from "react";
import { Divider, ListItemIcon, ListItemText, Menu, MenuItem } from "@mui/material";
import { Camera, ChevronDown, Plus, Sparkles } from "lucide-react";

type NewGameMenuProps = {
  onNewGame: (givens: number) => void;
  onScan: () => void;
};

// Antall gitte tall for hver vanskelighetsgrad
const DIFFICULTIES = [
  { label: "Lett", givens: 40 },
  { label: "Middels", givens: 32 },
  { label: "Vanskelig", givens: 26 },
];

// Mørke farger som matcher resten av appen (MUI er lys som standard)
const paperStyle = {
  backgroundColor: "#25262c",
  color: "#f3f4f6",
  border: "1px solid #4b5563",
  borderRadius: "9px",
  minWidth: 220,
};

/**
 * Knapp som åpner en meny for å starte et nytt brett: generert med valgt
 * vanskelighetsgrad, eller scannet med kameraet.
 */
function NewGameMenu({ onNewGame, onScan }: NewGameMenuProps) {
  // Elementet menyen skal henge under. null = menyen er lukket
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  function choose(action: () => void) {
    setAnchor(null);
    action();
  }

  return (
    <>
      <button
        className="new-game-button"
        onClick={(event) => setAnchor(event.currentTarget)}
      >
        <Plus size={18} />
        Nytt brett
        <ChevronDown size={16} />
      </button>

      <Menu
        anchorEl={anchor}
        open={anchor !== null}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{ paper: { sx: paperStyle } }}
      >
        {DIFFICULTIES.map(({ label, givens }) => (
          <MenuItem key={label} onClick={() => choose(() => onNewGame(givens))}>
            <ListItemIcon sx={{ color: "#a78bfa" }}>
              <Sparkles size={18} />
            </ListItemIcon>
            <ListItemText
              primary={label}
              secondary={`${givens} tall`}
              slotProps={{ secondary: { sx: { color: "#9ca3af" } } }}
            />
          </MenuItem>
        ))}

        <Divider sx={{ borderColor: "#4b5563" }} />

        <MenuItem onClick={() => choose(onScan)}>
          <ListItemIcon sx={{ color: "#9ca3af" }}>
            <Camera size={18} />
          </ListItemIcon>
          <ListItemText primary="Scan brett" />
        </MenuItem>
      </Menu>
    </>
  );
}

export default NewGameMenu;
