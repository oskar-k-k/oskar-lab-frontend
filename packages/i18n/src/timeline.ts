export const timelineEn = {
  "core.timelineDescription":
    "An ordered, responsive sequence with date labels, connected markers and custom content. Callers control sorting and grouping.",
  "core.timelineLabel": "Example milestones",
  "core.timelineFirst": "Request received",
  "core.timelineSecond": "In progress",
  "core.timelineLast": "Completed",
  "core.timelineContent":
    "Each milestone can contain headings, notes and actions.",
  "core.timelineTokens":
    "Theme with --timeline-text, --timeline-muted, --timeline-line, --timeline-current and --timeline-label-width. Defaults use global design tokens.",
} as const;
export const timelineDe: Record<keyof typeof timelineEn, string> = {
  "core.timelineDescription":
    "Eine geordnete, responsive Folge mit Datumsangaben, verbundenen Markierungen und eigenen Inhalten. Sortierung und Gruppierung bestimmt die nutzende App.",
  "core.timelineLabel": "Beispiel-Meilensteine",
  "core.timelineFirst": "Anfrage erhalten",
  "core.timelineSecond": "In Bearbeitung",
  "core.timelineLast": "Abgeschlossen",
  "core.timelineContent":
    "Jeder Meilenstein kann Überschriften, Notizen und Aktionen enthalten.",
  "core.timelineTokens":
    "Anpassbar mit --timeline-text, --timeline-muted, --timeline-line, --timeline-current und --timeline-label-width. Standardwerte nutzen globale Design-Tokens.",
};
