export const locales = ["en", "de"] as const;
export type Locale = typeof locales[number];

const en = {
    "common.projects": "Projects", "common.search": "Search", "common.clearSearch": "Clear search", "common.results": "results",
    "language.label": "Change language", "language.english": "English", "language.german": "German",
    "projects.searchLabel": "Search projects", "projects.searchPlaceholder": "Search projects …", "projects.backendUnavailable": "The backend is currently unavailable. Local projects remain accessible.",
    "projects.projectFound": "project found", "projects.projectsFound": "projects found", "projects.emptyTitle": "No project found", "projects.emptyDescription": "Try another search term or clear the search.",
    "projects.coreDescription": "The living style guide for UI components, design tokens, and core utilities.", "projects.chessDescription": "A complete chess game with all important rules.",
    "chess.white": "White", "chess.black": "Black", "chess.playerOne": "Player 1 · White", "chess.playerTwo": "Player 2 · Black", "chess.turn": "To move", "chess.inCheck": "{player} is in check",
    "chess.checkmate": "Checkmate – {player} has lost", "chess.stalemate": "Stalemate – Draw", "chess.currentTurn": "To move: {player}", "chess.newGame": "New game",
    "chess.capturedPieces": "{player}: captured pieces", "chess.noCaptures": "No pieces captured yet",
    "chess.square": "Square {square}", "chess.pawn": "pawn", "chess.rook": "rook", "chess.knight": "knight", "chess.bishop": "bishop", "chess.queen": "queen", "chess.king": "king",
    "core.searchLabel": "Search Core and Design", "core.searchPlaceholder": "Search UI, components, and classes …", "core.heroKicker": "Oskar Lab · Living Documentation", "core.heroTitle": "Core & Design System",
    "core.heroDescription": "An automatically maintained reference for design, global components, and shared code.", "core.tabsLabel": "Documentation sections", "core.tabDesign": "UI Design", "core.tabDesignDetail": "Tokens & HTML",
    "core.tabComponents": "Components", "core.tabComponentsDetail": "React & Next.js", "core.tabCore": "Core Classes", "core.tabCoreDetail": "Automatic docs",
    "core.colors": "Colors & Tokens", "core.colorsDescription": "Rendered directly from src/styles/variables.css. Changes appear here immediately.", "core.typography": "Typography",
    "core.typographyDescription": "A normal paragraph for longer content. Good readability, clear hierarchy, and calm contrast form the standard.", "core.quote": "A design system makes decisions visible and repeatable.",
    "core.forms": "Forms", "core.textField": "Text field", "core.projectName": "Project name", "core.selection": "Selection", "core.description": "Description …", "core.enableFeature": "Enable feature", "core.defaultOption": "Default option", "core.progress": "Progress", "core.range": "Range",
    "core.listsTablesStatus": "Lists, Tables & Status", "core.standardList": "Standard list", "core.projectNeutral": "Project-neutral", "core.reusable": "Reusable", "core.documented": "Documented", "core.status": "Status", "core.info": "Info", "core.success": "Success", "core.warning": "Warning", "core.error": "Error",
    "core.element": "Element", "core.area": "Area", "core.stable": "Stable", "core.tested": "Tested", "core.designDefault": "Design default",
    "core.liveComponents": "Live Components", "core.liveComponentsDescription": "The real global components rendered with meaningful example props.", "core.automaticComponentApi": "Automatic Component API", "core.automaticComponentApiDescription": "Files, functions, and props are read directly from src/components.",
    "core.automaticCoreApi": "Automatic Core API", "core.automaticCoreApiDescription": "This view scans src/core. JSDoc on classes and methods appears automatically as its description.",
    "core.searchResults": "Search results", "core.matchesFor": "{count} matches for “{query}”", "core.noMatches": "No UI element, component, class, or method matches your search.", "core.uiDesign": "UI Design", "core.components": "Components", "core.coreClasses": "Core Classes",
    "core.ruleLabel": "Rule:", "core.rule": "Reusable and project-neutral → Core or Components. Domain-specific → the respective project.",
    "core.globalColor": "Global color value {token}.", "core.primaryActions": "Primary, secondary, and disabled actions.", "core.contentCards": "Cards for content and linked previews.", "core.responsiveGrid": "Responsive grid for cards and other content.", "core.squareCell": "Square, freely colorable grid cell.", "core.controlledSearch": "Controlled search field with a clear action.", "core.globalHeader": "Global header with optional content areas.", "core.standardLayout": "Centered, responsive page content.",
    "core.formsDescription": "Inputs, selections, text areas, choices, and progress controls.", "core.structuredContentDescription": "Lists, tables, badges, and status feedback.", "core.languageSwitchDescription": "Global language menu for English and German.", "core.previewCardDescription": "Global preview card with a title and description.", "core.previewSearch": "Search example", "core.centeredContent": "Centered content",
} as const;

const de: Record<keyof typeof en, string> = {
    "common.projects": "Projekte", "common.search": "Suchen", "common.clearSearch": "Suche löschen", "common.results": "Treffer",
    "language.label": "Sprache wechseln", "language.english": "Englisch", "language.german": "Deutsch",
    "projects.searchLabel": "Projekte durchsuchen", "projects.searchPlaceholder": "Projekte durchsuchen …", "projects.backendUnavailable": "Das Backend ist gerade nicht erreichbar. Lokale Projekte bleiben weiterhin verfügbar.",
    "projects.projectFound": "Projekt gefunden", "projects.projectsFound": "Projekte gefunden", "projects.emptyTitle": "Kein Projekt gefunden", "projects.emptyDescription": "Versuche einen anderen Suchbegriff oder lösche die Suche.",
    "projects.coreDescription": "Der lebende Styleguide für UI-Komponenten, Design-Tokens und Core-Helfer.", "projects.chessDescription": "Ein vollständiges Schachspiel mit allen wichtigen Regeln.",
    "chess.white": "Weiß", "chess.black": "Schwarz", "chess.playerOne": "Spieler 1 · Weiß", "chess.playerTwo": "Spieler 2 · Schwarz", "chess.turn": "Am Zug", "chess.inCheck": "{player} ist im Schach",
    "chess.checkmate": "Schachmatt – {player} hat verloren", "chess.stalemate": "Patt – Unentschieden", "chess.currentTurn": "Am Zug: {player}", "chess.newGame": "Neue Partie",
    "chess.capturedPieces": "{player}: geschlagene Figuren", "chess.noCaptures": "Noch keine Figuren geschlagen",
    "chess.square": "Feld {square}", "chess.pawn": "Bauer", "chess.rook": "Turm", "chess.knight": "Springer", "chess.bishop": "Läufer", "chess.queen": "Dame", "chess.king": "König",
    "core.searchLabel": "Core und Design durchsuchen", "core.searchPlaceholder": "UI, Komponenten und Klassen suchen …", "core.heroKicker": "Oskar Lab · Lebende Dokumentation", "core.heroTitle": "Core- & Design-System",
    "core.heroDescription": "Eine automatisch gepflegte Referenz für Design, globale Komponenten und projektübergreifenden Code.", "core.tabsLabel": "Dokumentationsbereiche", "core.tabDesign": "UI Design", "core.tabDesignDetail": "Tokens & HTML",
    "core.tabComponents": "Komponenten", "core.tabComponentsDetail": "React & Next.js", "core.tabCore": "Core-Klassen", "core.tabCoreDetail": "Auto-Dokumentation",
    "core.colors": "Farben & Tokens", "core.colorsDescription": "Direkt aus src/styles/variables.css gerendert. Änderungen erscheinen hier sofort.", "core.typography": "Typografie",
    "core.typographyDescription": "Ein normaler Absatz für längere Inhalte. Gute Lesbarkeit, klare Hierarchie und ruhige Kontraste bilden den Standard.", "core.quote": "Ein Designsystem macht Entscheidungen sichtbar und wiederholbar.",
    "core.forms": "Formulare", "core.textField": "Textfeld", "core.projectName": "Projektname", "core.selection": "Auswahl", "core.description": "Beschreibung …", "core.enableFeature": "Feature aktivieren", "core.defaultOption": "Standardoption", "core.progress": "Fortschritt", "core.range": "Bereich",
    "core.listsTablesStatus": "Listen, Tabellen & Status", "core.standardList": "Standardliste", "core.projectNeutral": "Projektneutral", "core.reusable": "Wiederverwendbar", "core.documented": "Dokumentiert", "core.status": "Status", "core.info": "Info", "core.success": "Erfolg", "core.warning": "Warnung", "core.error": "Fehler",
    "core.element": "Element", "core.area": "Bereich", "core.stable": "Stabil", "core.tested": "Getestet", "core.designDefault": "Design-Standard",
    "core.liveComponents": "Live-Komponenten", "core.liveComponentsDescription": "Die echten globalen Komponenten, mit sinnvollen Beispiel-Props gerendert.", "core.automaticComponentApi": "Automatische Komponenten-API", "core.automaticComponentApiDescription": "Dateien, Funktionen und Props werden direkt aus src/components gelesen.",
    "core.automaticCoreApi": "Automatische Core-API", "core.automaticCoreApiDescription": "Diese Ansicht scannt src/core. JSDoc-Kommentare über Klassen und Methoden erscheinen automatisch als Beschreibung.",
    "core.searchResults": "Suchergebnisse", "core.matchesFor": "{count} Treffer für „{query}“", "core.noMatches": "Keine UI, Komponente, Klasse oder Methode passt zu deiner Suche.", "core.uiDesign": "UI Design", "core.components": "Komponenten", "core.coreClasses": "Core-Klassen",
    "core.ruleLabel": "Regel:", "core.rule": "Wiederverwendbar und projektneutral → Core oder Components. Fachlich speziell → jeweiliges Projekt.",
    "core.globalColor": "Globaler Farbwert {token}.", "core.primaryActions": "Primäre, sekundäre und deaktivierte Aktionen.", "core.contentCards": "Karten für Inhalte und verlinkte Vorschauen.", "core.responsiveGrid": "Responsives Raster für Karten und andere Inhalte.", "core.squareCell": "Quadratische, frei einfärbbare Rasterzelle.", "core.controlledSearch": "Kontrolliertes Suchfeld mit Löschaktion.", "core.globalHeader": "Globale Kopfzeile mit optionalen Inhaltsbereichen.", "core.standardLayout": "Zentrierter, responsiver Seiteninhalt.",
    "core.formsDescription": "Eingaben, Auswahlen, Textbereiche, Optionen und Fortschrittsanzeigen.", "core.structuredContentDescription": "Listen, Tabellen, Badges und Statusrückmeldungen.", "core.languageSwitchDescription": "Globales Sprachmenü für Englisch und Deutsch.", "core.previewCardDescription": "Globale Vorschaukarte mit Titel und Beschreibung.", "core.previewSearch": "Beispiel durchsuchen", "core.centeredContent": "Zentrierter Inhalt",
};

export const messages = {en, de} as const;
export type TranslationKey = keyof typeof en;

/** Returns a supported locale and falls back to English for untrusted values. */
export function parseLocale(value: string | undefined): Locale {
    return value === "de" ? "de" : "en";
}
