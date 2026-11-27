export const timelineEn = {
  "core.timelineDescription":
    "A responsive timeline with cards or alternating image bubbles. Activate a bubble to reveal details; only one is open at a time. Optional paired stations share one side and a labeled downward arrow. An optional centered opening bubble introduces the timeline. Station labels are centered on the vertical rail beside each bubble. Use visualStyle=\"illustration\" for transparent, uncropped artwork instead of a circle. Optional ranges connect same-side items across intervening milestones without regrouping them. An optional label action opens app-owned editing without toggling station details. Callers own ordering and content.",
  "core.timelineEditLabel": "Edit milestone date",
  "core.timelineEditNotice": "Label action activated. The app can open its inline editor here without expanding the station.",
  "core.timelineRange": "2 days",
  "core.timelineBubbles": "Bubble view",
  "core.timelineCards": "Card view",
  "core.timelineLabel": "Example milestones",
  "core.timelineConnection": "2 hr 30 min",
  "core.timelineFirst": "Request received",
  "core.timelineSecond": "In progress",
  "core.timelineLast": "Completed",
  "core.timelineContent":
    "Each milestone can contain headings, notes and actions.",
  "core.timelineTokens":
    "Theme with --timeline-text, --timeline-muted, --timeline-line, --timeline-current, --timeline-label-width, --timeline-background, --timeline-bubble, --timeline-start-background, --timeline-start-width, --timeline-start-padding, --timeline-rail-background, --timeline-branch-background, --timeline-bubble-shadow, --timeline-active-shadow and --timeline-start-shadow. Defaults use global design tokens.",
} as const;
export const timelineDe: Record<keyof typeof timelineEn, string> = {
  "core.timelineDescription":
    "Eine responsive Timeline mit Karten oder abwechselnden Bildkreisen. Ein Kreis öffnet die Details; jeweils einer bleibt offen. Optionale Stationspaare teilen eine Seite und einen beschrifteten Abwärtspfeil. Eine optionale mittige Start-Bubble leitet die Timeline ein. Stationsbeschriftungen stehen mittig auf der senkrechten Hauptlinie neben dem jeweiligen Kreis. visualStyle=\"illustration\" zeigt transparente Motive ohne Kreisrahmen. Optionale Bereiche verbinden gleichseitige Einträge über dazwischenliegende Meilensteine hinweg. Eine optionale Beschriftungsaktion öffnet die Bearbeitung der App, ohne die Stationsdetails aufzuklappen. Reihenfolge und Inhalte bestimmt die nutzende App.",
  "core.timelineEditLabel": "Datum des Meilensteins bearbeiten",
  "core.timelineEditNotice": "Beschriftungsaktion ausgelöst. Die App kann hier ihren Editor öffnen, ohne die Station aufzuklappen.",
  "core.timelineRange": "2 Tage",
  "core.timelineBubbles": "Kreisansicht",
  "core.timelineCards": "Kartenansicht",
  "core.timelineLabel": "Beispiel-Meilensteine",
  "core.timelineConnection": "2 Std. 30 Min.",
  "core.timelineFirst": "Anfrage erhalten",
  "core.timelineSecond": "In Bearbeitung",
  "core.timelineLast": "Abgeschlossen",
  "core.timelineContent":
    "Jeder Meilenstein kann Überschriften, Notizen und Aktionen enthalten.",
  "core.timelineTokens":
    "Anpassbar mit --timeline-text, --timeline-muted, --timeline-line, --timeline-current, --timeline-label-width, --timeline-background, --timeline-bubble, --timeline-start-background, --timeline-start-width, --timeline-start-padding, --timeline-rail-background, --timeline-branch-background, --timeline-bubble-shadow, --timeline-active-shadow und --timeline-start-shadow. Standardwerte nutzen globale Design-Tokens.",
};
