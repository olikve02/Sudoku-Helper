# TODO

## Neste opp

- [X] **Nytt / tømt brett**: knapp som tømmer hele brettet (med bekreftelse). Nå som brettet lagres i `localStorage`, er scanning eneste måte å starte på nytt
- [ ] **Lås gitte tall**: tall fra scanning (og senere generatoren) kan ikke viskes ut eller overskrives. Nytt felt `given: boolean` i `CellState`, vises i egen farge. Trengs før generatoren
- [ ] **Ferdig-skjerm**: når alle 81 celler er fylt og ingen er i konflikt, vis gratulasjon (og tid, hvis timer er laget)
- [ ] **Fyll inn alle kandidater**: knapp som setter alle lovlige kandidater i tomme celler (bruk `isPeer`)

## Mindre forbedringer

- [ ] **Tastatur på PC**: tallene 1–9, piltaster for å flytte, Backspace/Delete for å viske ut
- [ ] **Gjør om (redo)**: motstykket til angre
- [ ] **Timer** som går mens man løser (og pauser når appen er i bakgrunnen)
- [ ] **Tester** med Vitest for de rene funksjonene: `isPeer`, `hasConflict`, `completedNumbers`, `loadBoard` osv.

## Sudoku-logikk

1. [ ] **Løser** (`src/sudoku/solver.ts`): backtracking på `number[]` med 81 tall (0 = tom). Rene funksjoner som `isValid` og `solve`, ingen React
2. [ ] **Hint**: vis riktig tall i den valgte cella
3. [ ] **Sjekk brettet**: marker tall som er feil i forhold til løsningen, ikke bare konflikter
4. [ ] **Valider scanning**: varsle hvis det scannede brettet ikke har nøyaktig én løsning (da er noe sannsynligvis lest feil)
5. [ ] **Generator**: lag et fullt brett (løseren med tilfeldig rekkefølge på tallene), og fjern tall så lenge det fortsatt finnes nøyaktig én løsning (løseren må kunne telle løsninger, og stoppe ved 2)
6. [ ] **Vanskelighetsgrad**: styr med antall tall som står igjen (f.eks. lett ≈ 40, middels ≈ 32, vanskelig ≈ 26)

## Scanning

- [ ] **Kontroller scanningen**: vis bildet ved siden av brettet etter scanning, så feil er lette å rette
