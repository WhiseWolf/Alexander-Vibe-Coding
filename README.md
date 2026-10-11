# Alexanders Feuerwehr – Einsatzleitung

Kostenloses Browser-Spiel für Touch auf iPad und iPhone, ohne externe Pakete. Version 3 ersetzt den festen Waldbrand-Ablauf durch eine durchgehend sichtbare Einsatzkarte von oben.

## Spielen
https://whisewolf.github.io/Alexander-Vibe-Coding/?v=einsaetze-35

1. In der Einsatzzentrale den zufälligen Notruf annehmen. Fünf Szenarien: Auto-, Wald-, Flugzeug-, Lagerhausbrand und Verkehrsunfall.
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

Rettungswagen und Polizei können anfahren und zurückfahren. Polizei hat noch keine Absperrmechanik; Rettungswagen übernimmt nahe Personen automatisch, die Feuerwehr kann Personen mit der Rettungsaktion selbst retten. Nicht eingebaut: Mikrofonbefehle, manuelles Lenken/Fliegen, Tauchen, frei begehbare 3D-Welt, manuelle Schlauchkupplungen, Flughafen-Terminal, komplexe Gefahrstoffkleidung. Die alten Versionen bleiben in der Git-Historie.

## Prüfung

Lokal `python3 -m http.server 8000` starten. JavaScript-Syntax und Browserabläufe in Chromium mit Touch-Viewport prüfen. Ein echter Safari-Test auf iPad/iPhone bleibt nötig, insbesondere für Sprachausgabe und Bediengefühl.

## Version 3.5

Lagerhaus: 100 Sekunden Explosionswarnung. Zuerst den gelb markierten Brand löschen, um die Explosion zu verhindern. Sonst ein kurzer Lichtblitz, Knall und zwei zusätzliche Feuerstellen; keine verletzten Menschen dargestellt. Verkehrsunfall: Motorbrand löschen und die eingeklemmte Person mit der Rettungsschere befreien (zehn Sekunden Arbeit). Beide Szenarien erscheinen als zufällige Notrufe.

Prüfungen: `node check-new-missions.cjs`, `node center-check.cjs`, `node audio-check.cjs`. Simulationen mit DOM/Audio-Stubs; echter Touch- und Hörtest auf eurem Gerät steht aus.
