# Alexanders Feuerwehr – Einsatzleitung

Kostenloses Browser-Spiel für Touch auf iPad und iPhone, ohne externe Pakete. Version 3 ersetzt den festen Waldbrand-Ablauf durch eine durchgehend sichtbare Einsatzkarte von oben.

## Spielen
https://whisewolf.github.io/Alexander-Vibe-Coding/?v=rekorde-52

1. In der Einsatzzentrale den zufälligen Notruf annehmen. Sechs Szenarien: Auto-, Wald-, Flugzeug-, Lagerhausbrand, Verkehrsunfall und Flussunfall.
2. Fahrzeugtyp und eine ganze Anzahl von 1 bis 4 wählen, dann anfordern. Insgesamt passen vier Fahrzeuge auf die Karte; ein Platz bleibt für einen Krankenwagen frei.
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

## Version 4.2 – Hausbrand und wechselnde Schwierigkeit

Achter Notruf: Von außen unsichtbarer Hausbrand. Mit Notabschaltung den gelben Stromkasten bedienen, dann mit Menschen retten die markierte Tür öffnen. Erst danach werden Innenbrände und Personen sichtbar. Dunkler Innenraum, gezeichneter Rauch und langsameres Gehen im Haus. Leicht/normal: eine Person; schwer: zwei. Krankenwagen müssen alle Patienten ins Krankenhaus bringen. Nach Erfolg zurück zur Zentrale. Zweites Haus und weitere versteckte Gegenstände bleiben spätere Erweiterungen.

Alle Einsätze erhalten zufällig leicht, normal oder schwer. Leicht: schwächere Feuer, keine zusätzliche Ausbreitung, längere Explosionsfrist. Schwer: stärkere Feuer und frühere Ausbreitungswarnung. Hausbrand-Schwierigkeit wird beim Türöffnen im Funk gemeldet. Spielregeln, keine reale Einsatzanleitung. Prüfung mit `node house-check.cjs` für alle drei Varianten; echter Safari-Touch-Test bleibt offen.


## Version 5.0 – Einsatzleiter Alexander

Neuer Startbildschirm mit gezeichnetem Feuerwehrauto, dezentem Blaulicht (respektiert reduzierte Bewegung), direktem Einstieg und freiwilligem Funk/Ton. Erst nach dem Antippen wird ein Notruf ausgelöst. Das Intro lässt sich überspringen.

Im Aufstiegsmodus beginnen Einsätze leicht. Nach zwei erfolgreichen Einsätzen folgen normale Einsätze, nach vier schwere. Stufe und nächster Aufstieg stehen vor Annahme des Notrufs in der Zentrale. Der jederzeit in der Zentrale wählbare Übungsmodus bleibt leicht und erhöht den Aufstiegszähler nicht. Abbrechen erhöht ihn ebenfalls nicht. Die bestehenden vier Stellplätze, der reservierte Krankenwagenplatz und die Panther-Regel bleiben erhalten. Das Löschflugzeug hat bei Waldbrand drei Abwürfe auf leicht, zwei auf normal, einen auf schwer; die 75 Sekunden Wartezeit bleibt. Zielwahl abbrechen verbraucht keinen Abwurf. Weitere Löschwagen und Auftanken bleiben verfügbar, damit verbrauchte Spezialhilfe keinen Einsatz blockiert.

Nach einem Erfolg erscheinen Zeit, insgesamt angeforderte Fahrzeuge, Abwürfe und bis zu drei Sterne. Ein Stern gilt dem vollständigen Abschluss einschließlich Klinikübergaben. Ein weiterer belohnt höchstens drei angeforderte Fahrzeuge (vier bei Wald/Flughafen); abgezogene und neu angeforderte Wagen zählen mit, Auftanken und Rückkehr desselben Krankenwagens nicht. Der dritte Stern belohnt einen Abschluss ohne Explosion, tatsächlich neu entstandene Ausbreitungsbrände oder jemals ausgelaufenes Öl. Konkrete Abzeichen nennen beispielsweise verhinderte Explosionen, gestoppte Ausbreitung und rechtzeitig gesicherte Ölfässer. Klickanzahl und Geschwindigkeit verdienen keine Bonuspunkte. Die Abschlusszeit wird beim Erfolg eingefroren und enthält weder Pausen noch den Rückkehr-Countdown. Die letzte Auswertung bleibt nach der automatischen Rückkehr in der Zentrale lesbar.

Stand Version 5.0: Fortschritt bestand nur im Arbeitsspeicher. Seit Version 5.2 bleiben Aufstieg, erledigte Tutorials und persönliche Rekorde lokal erhalten; siehe unten.

Prüfung: alle `*-check.cjs`, `check-new-missions.cjs`, `test-game.cjs`, `test-new-missions.cjs`, `tests/room-and-fleet.cjs` und `tests/progression.cjs`. Die alten DOM-Testattrappen wurden um die vorhandene Panther-Auswahl ergänzt und die Szenarien an die bereits existierende Vier-Fahrzeug-Regel angepasst. Der Haus-Test erkundet die Räume vor Befehlen an versteckte Personen. `tests/browser-flow.cjs` prüft mit Playwright den Intro-/Zentralen-/Erfolgsablauf in drei Touch-Viewports; Der Test startet seinen HTTP-Server selbst und benötigt installiertes Playwright/Chromium. Ein echter Safari-Test auf iPad/iPhone bleibt nötig.


## Version 5.1 – Schläuche und Feuerwehrschule

Alle Einsätze besitzen drei blaue Hydranten an der Zufahrt. Feuerwehrmann wählen, „Hydrant anschließen“ und den Hydranten antippen. Die Mannschaft verlegt vereinfacht eine maximal 80 m lange Zuleitung und verbindet sie nach fünf Sekunden Arbeit. Ein Hydrant versorgt einen Wagen. Er füllt den Tank laufend auf und kann zwei Schlauchtrupps versorgen. Panther nutzen weiterhin ihren Tank und die Rückfahrt zum Auftanken.

Wasser, Schaum und Wasser mit Mittel benötigen einen Schlauch. Pro Feuerwehrmann stehen zunächst 80 Spielmeter bereit; „Schlauch kuppeln · +40 m“ verlängert zweimal bis 160 m. Reichweite wird beim Zielbefehl und beim Löschen geprüft. Ein Kreis zeigt die Reichweite; in Häusern läuft die Längenberechnung durch Türen und Flur. Sichtbare Kupplungen markieren die Leitung. Pulver und Rettungsausrüstung brauchen keine Wasserleitung. Die Maßstabswerte sind erfundene Spielregeln.

„Y-Verteiler setzen“ wählen und freien Boden innerhalb der 80-m-Zuleitung antippen. Nach fünf Sekunden Aufbau können die zwei Feuerwehrleute desselben Fahrzeugs jeweils einen Ausgang nutzen: Schlauch wählen, Y antippen, dann Brand antippen. Der Truppschlauch beginnt nun am Y, damit die Reichweite steigt. „Direkt am Fahrzeug anschließen“ löst diesen Anschluss. Abziehen oder Auftanken trennt Hydrant und Verteiler und gibt die Anschlüsse frei. Zurückkehrende Mannschaften erhalten ihre Grundausstattung. Erfolgreich genutzte Versorgung und Y-Abgänge können Abzeichen geben.

Die Feuerwehrschule ist im Intro oder unter Spielweise erreichbar. Neun frei wählbare Lektionen: Grundbefehle mit allen vier Löschmitteln, Pause, Polizei, Auftanken und Platzfreigabe; Wasserversorgung; Rettungsschere; Flussrettung; Haus-Erkundung; Tunnel; Explosionsverhinderung; Löschflugzeug/Vorhut; Panther. Aufgaben werden anhand echter Bewegungen und Aktionen abgehakt. Im Tutorial bleibt es leicht, die Lagerhaus-Warnung dauert zehn Minuten, der Aufstieg zählt nicht weiter. Übungsfeuer werden für noch fehlende Löschübungen ausdrücklich erneut entzündet. Erst nach den Lektionsaufgaben und den normalen Einsatzaufgaben wird die Übung abgeschlossen. Jede Lektion lässt sich jederzeit neu starten; nach einer Explosion weist die Hilfe ausdrücklich darauf hin. Die Polizei hat weiterhin keine Absperrfunktion, was die Lektion erklärt. Seit Version 5.2 bleiben erledigte Lektionen lokal gespeichert.

Zusätzliche Prüfung: `node tests/hoses.cjs`, `node tests/tutorial.cjs`, `node tests/tutorial-playthrough.cjs`. Der letzte Test spielt alle neun Lektionen über tatsächliche Befehle vollständig durch, ohne Abschlussflags oder Aktionsstatistiken zu setzen. Die älteren Szenariotests kuppeln ihre Löschschläuche jetzt über die normale Aktion. Der Browser-Test prüft außerdem Tutorial-Auswahl, Kupplung, Hydrantenanschluss, beide Y-Abgänge trotz darauf stehender Mannschaft und Neustart in drei Touch-Viewports. Echter iPad-/iPhone-Safari-Test bleibt offen.

## Version 5.2 – Persönliche Rekorde auf dem Gerät

Rekorde, Aufstiegs-Erfolge und erledigte Tutorials werden nach erfolgreichem Abschluss automatisch in `localStorage` unter `alexanders-feuerwehr-progress-v1` gespeichert. Sie bleiben nach Neuladen und Schließen des Browsers erhalten, solange der Browser die Website-Daten behält. Es gibt keine Anmeldung, Übertragung der Spielstände an einen Server oder Synchronisierung zwischen Geräten/Browsern. Der laufende Einsatz und die letzte Auswertung werden nicht wiederhergestellt.

In der Zentrale öffnet „Persönliche Rekorde“ die jeweils beste Zeit, geringste insgesamt angeforderte Fahrzeugzahl und höchste Sterne-Wertung. Diese drei Werte sind unabhängige Bestleistungen und werden nach Einsatzart, Schwierigkeit und Aufstieg/Übung getrennt geführt. Tutorials zählen nur als erledigte Lektionen, abgebrochene Einsätze setzen keine Rekorde. Verbesserungen erscheinen in der Erfolgs-Auswertung. Zufällige Brandlagen variieren weiterhin; Zeitrekorde sind deshalb eine persönliche Orientierung.

Nicht lesbare Daten werden geprüft und das Spiel bleibt bedienbar; beim nächsten Erfolg kann ein neuer gültiger Spielstand gespeichert werden. Gesperrter oder voller Speicher wird in der Auswertung und im Rekordbuch angezeigt; der aktuelle Fortschritt bleibt dann nur im Arbeitsspeicher. Vor einem Abschluss werden neuere Bestleistungen aus einem bereits geöffneten anderen Tab eingelesen. Es werden nur Daten dieses Spiels gespeichert, keine anderen Website-Daten gelöscht.

Prüfung: `node tests/storage.cjs` prüft Wiederherstellung in einer neuen Seiteninstanz, alle drei Rekordarten, Trennung der Wertungen, Tutorial-Fortschritt, Abbruch, blockierten Speicher, beschädigte Daten und ältere Tabs. `tests/browser-flow.cjs` prüft zusätzlich tatsächliches Neuladen, einen neuen Tab und die mobile Rekordtabelle. Ein echter Safari-Gerätetest bleibt offen.
