import type { LucideIcon } from "lucide-react";

type ToolButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  // Av/på-knapper (f.eks. notater) lyser lilla når de er på
  active?: boolean;
};

// Verktøyknapp under brettet: ikon med kort tekst under
function ToolButton({ icon: Icon, label, onClick, active = false }: ToolButtonProps) {
  return (
    <button
      className={`tool-button ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <Icon size={22} />
      <span>{label}</span>
    </button>
  );
}

export default ToolButton;
