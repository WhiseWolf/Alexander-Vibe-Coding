# Alexanders Feuerwehr – Einsatzleitung

Kostenloses Browser-Spiel für Touch auf iPad und iPhone, ohne externe Pakete. Version 3 ersetzt den festen Waldbrand-Ablauf durch eine durchgehend sichtbare Einsatzkarte von oben.

## Spielen
https://whisewolf.github.io/Alexander-Vibe-Coding/?v=fluss-37

1. In der Einsatzzentrale den zufälligen Notruf annehmen. Sechs Szenarien: Auto-, Wald-, Flugzeug-, Lagerhausbrand, Verkehrsunfall und Flussunfall.
2. Fahrzeugtyp und eine ganze Anzahl von 1 bis 10 wählen, dann anfordern. Insgesamt passen zehn Fahrzeuge auf die Karte.
3. Die Fahrzeuge fahren sichtbar an. Aus Löschwagen und Vorhut steigen jeweils zwei Feuerwehrleute aus.
4. Feuerwehrmann auf der Karte antippen. Unten Ausrüstung wählen: Schlauch, Schaum, Pulver, Wasser mit Mittel oder Rettung. Der Feuerwehrmann geht zum Gerätefach.
5. Auf freien Boden tippen: dorthin gehen. Auf Flamme tippen: hingehen und automatisch löschen. Auf hilfsbedürftige Person tippen: mit Rettungsausrüstung hingehen und retten.
6. Panther auswählen, Löschmittel wählen und Flamme antippen: sichtbarer Dachwerfer löscht automatisch.
7. Tankstände stehen in der Fahrzeugliste und unter den Fahrzeugen. Bei weniger als 20 Prozent kommt eine Warnung. Verstärkung anfordern und das gewählte Fahrzeug über „Zurück / auftanken“ zur Wache schicken. Die Mannschaft sammelt sich, steigt ein; nach Rückfahrt und 12 Sekunden Auftanken kehrt das Fahrzeug zurück.
8. Am Ende müssen alle Brände gelöscht und alle Personen gerettet sein. Dann räumt die Mannschaft vereinfacht auf und rückt ab.

Optional: Funkstimme mit Browser-Sprachausgabe. Pause hält die Simulation an, im Hintergrund läuft sie nicht weiter. Version 3.2 startet mit Waldbrand. Tippe auf „Löschflugzeug“, dann auf eine brennende Stelle: Das Flugzeug fliegt sichtbar an und wirft dort Wasser ab. Der Abwurf schwächt nur die Brände in seinem Abwurfstreifen. Nach 75 Sekunden kann es erneut angefordert werden. Ein weiterer Tipp auf den Flugzeugknopf bricht die Zielwahl ab. Die Feuerwehr am Boden übernimmt die übrigen Brände und die Rettung.

## Grenzen und Spielregeln

Detaillierter gezeichnetes 2D-Canvas mit Animationen, kein fotorealistisches 3D. Schlauchleitungen sind sichtbar und werden automatisch ausgelegt. Aufräumen und Rettung sind vereinfacht. Feuerlöscherarten nutzen bewusst erfundene Wirkungswerte, keine Anleitung für reale Einsätze. Einsatzdauer hängt von Anzahl, Löschmittel und Befehlen ab: eine einzelne Mannschaft benötigt mehrere Tankfüllungen; viele Fahrzeuge verkürzen die Zeit deutlich. Zehn Minuten sind eine Zielgröße, keine feste Wartezeit.

Polizei kann anfahren und zurückfahren, hat noch keine Absperrmechanik. Die Feuerwehr befreit Menschen, Krankenwagen versorgen und transportieren sie anschließend (Version 4.1). Nicht eingebaut: Mikrofonbefehle, manuelles Lenken/Fliegen, Tauchen, frei begehbare 3D-Welt, manuelle Schlauchkupplungen, Flughafen-Terminal, komplexe Gefahrstoffkleidung. Die alten Versionen bleiben in der Git-Historie.

## Prüfung

Lokal `python3 -m http.server 8000` starten. JavaScript-Syntax und Browserabläufe in Chromium mit Touch-Viewport prüfen. Ein echter Safari-Test auf iPad/iPhone bleibt nötig, insbesondere für Sprachausgabe und Bediengefühl.

## Version 3.5

Lagerhaus: 100 Sekunden Explosionswarnung. Zuerst den gelb markierten Brand löschen, um die Explosion zu verhindern. Sonst ein kurzer Lichtblitz, Knall und zwei zusätzliche Feuerstellen; keine verletzten Menschen dargestellt. Verkehrsunfall: Motorbrand löschen und die eingeklemmte Person mit der Rettungsschere befreien (zehn Sekunden Arbeit). Beide Szenarien erscheinen als zufällige Notrufe.

Prüfungen: `node check-new-missions.cjs`, `node center-check.cjs`, `node audio-check.cjs`. Simulationen mit DOM/Audio-Stubs; echter Touch- und Hörtest auf eurem Gerät steht aus.

## Version 3.7 – Flussunfall

Neuer zufälliger Notruf an der Flussbrücke. Transporterbrand löschen, eine Person mit Tauchausrüstung retten und drei tatsächlich treibende Ölfässer sichern. Für jedes Fass: Feuerwehrmann auswählen, Ölsperre holen, Fass antippen. Die Mannschaft sichert es vereinfacht vom Ufer aus. Ein ungesichertes Fass kann am rechten Kartenrand Öl verlieren; Sichern beseitigt den dargestellten Ölfilm. Erst nach allen drei Aufgaben ist der Einsatz beendet. Tauchausrüstung ist eine vereinfachte Rettungsaktion, keine Unterwassersimulation.

Prüfung: `node river-check.cjs` sowie vorhandene Spiel-, Notruf- und Tonprüfungen. Echter Safari-Gerätetest bleibt offen.

## Version 3.8 – Automatisch zurück zur Einsatzzentrale

Nach erfolgreichem Abschluss erscheint sechs Sekunden lang die Erfolgsmeldung mit Countdown. Danach öffnet sich automatisch die Einsatzzentrale, setzt den alten Einsatz zurück und empfängt den nächsten zufälligen Notruf. Pause und Hintergrund halten den Countdown ebenfalls an. „Nächster Notruf“ bleibt als sofortige Rückkehr verfügbar. Prüfung: `node completion-center-check.cjs`.

## Version 3.9 – Variable Brände und begrenzte Ausbreitung

Brandstellen und Anfangsstärken variieren beim Laden. Auf dem Parkplatz kann eines von drei verschiedenen Autos den Ausgangsbrand bilden. Waldbrände variieren stärker als Fahrzeugbrände, damit das Feuer zum Objekt passt. Nach 35–50 Sekunden kann ein kräftiger Brand eine nahe Stelle bedrohen: gelbe Warnmarkierung, zwölf Sekunden bis zum Übergreifen. Den Ausgangsbrand auf unter 40 Prozent schwächen verhindert dies. Pro Einsatz höchstens vier zusätzliche Ausbreitungsstellen im Wald, zwei bei Auto/Flugzeug/Lagerhaus und eine bei Unfall/Fluss (Lagerhaus-Explosion weiterhin separat). Jede Ausbreitungsstelle entzündet sich höchstens einmal; gelöschte Brände zünden nicht erneut. Vereinfachte Windrichtung beeinflusst im Wald die bevorzugte Ausbreitungsseite. Pause und Hintergrund halten den Ablauf an.

Ausbreitung und Lösbarkeit geprüft mit `node spread-check.cjs`; vorhandene Tests isolieren ihre jeweiligen Mechaniken gezielt von zufälliger Ausbreitung.

## Version 4.0 – Nachtexpress im Bergtunnel

Siebter Notruf mit eigener Nachtkarte, stehendem Zug, Warnleuchten und Funken. Feuerwehrmann auswählen, neue Aktion Notabschaltung wählen und den markierten Schaltkasten links antippen. Nach fünf Sekunden Arbeit sind Funken aus und Lösch-/Türaktionen freigeschaltet. Zwei Fahrgäste mit Rettungsschere befreien und variable Brände löschen. Brandausbreitung bleibt begrenzt. Erfolg führt automatisch zur Einsatzzentrale zurück. Vereinfachte Spielregeln, kein reales Bahneinsatz-Verfahren.

## Version 4.1 – Krankenwagen und Patiententransport

Feuerwehr-Rettung befreit eine Person und bringt sie sichtbar zum Sammelplatz. Sie wartet dort auf einen Krankenwagen. Jeder Krankenwagen übernimmt automatisch genau einen freien Patienten, fährt zum Sammelplatz, versorgt ihn acht Sekunden, nimmt ihn auf und fährt zum Krankenhaus (linker Kartenrand). Erst die Übergabe zählt als abgeschlossener Transport. Nach zwölf Sekunden kehrt der Wagen für weitere Patienten zurück. Mehrere Wagen übernehmen unterschiedliche Patienten. Einsatzabschluss verlangt die Übergabe aller Patienten zusätzlich zu den bisherigen Aufgaben. Ein Stellplatz bleibt für einen Krankenwagen reserviert, solange keiner angefordert wurde. Pause/Hintergrund halten auch Versorgung und Transport an. Vereinfachte Spielmechanik ohne medizinische Simulation.

Prüfung: `node ambulance-check.cjs` und aktualisierte Szenario-/Abschlusstests. Echter iPad-/iPhone-Test bleibt offen.
