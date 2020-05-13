## Notes:
 - export macht ein Objekt für andere Datein verfügbar.
 - Programmiert wird hauptsächlich in den src-Ordnern
 - tslint und eslint: Prüfen des 'Code-Schreibstils' und Anwenden einen einheitlichen Codes
 
#### package.json
 -> dependencies: Werden auch mit in das finale Produkt verpackt
 -> devDep: Werden nur für die Entwicklung benötigt


## BACKEND
/src/configuration
 - logger.ts: Uninterissant; Nur für's Loggen importieren
 - express.ts: Alles wichtige Einstellen, was mit expres zu tuen hat
    - Registrierung der /api/ Route, APILimiter
 - environment.ts: Richtet die env-vars ein und überprüft sie
    - Muss nur angepasst werden, wenn neue ENV-Variablen hinzugefügt wurden
    - Kein `process.env` im Code verwenden!
 - dicord.ts: Bot wird initialisiert

/src/routes
 - index.routes: Sammelstelle um alle Routen /api/* zu registrieren
 - Die einzelnen Handler und spezifizierten Routen werden in einzelnen Dateien verpackt

/src/docs
 - Beinhaltet die REST-API Dokumentation.
 - Weitere Doumentationen können hier ebenfalls abgelegt werden

/src/controllers
 - Beinhaltet in der Regel einzelne Ordner für jede Ressource, welche über die API verwaltet wird
 - /*
    - *.schema.ts: [mongoose Schema][mongoose-schema] des Datenbank Objekts
    - *.handler.ts: 'Middleware/Handler' welche für das Bearbeiten der entsprechende HTTP-API-Anfrage verantwortlich ist.


## FRONTEND
tests/units
 - Jede Componente hat eine eigene *.spec.js Datei mit ihren Tests

public/
 - Statische Dateien wie das favicon und die index.html
 - index.html: Hier können CDNs eingefügt werden (auch wenn es unschön ist)

/src/assets/
 - Hier werden in der Regel nur Images gespeichert
 - Eine main.css gibt es in Vue nicht wirklich. Nach den Best Practise werden globale css Regeln in der `App.vue` gespeichert.

/src/
 - main.js und App.vue sind, wie die index.ts im backend, die erste Anlaufstelle im Frontend.
 - main.js: Hier werden einzelne Module wie der Router oder der Store registriert.
 - App.vue: Bleibt in der Regel wie sie ist. Hier können in `<style></style>`

/src/views
 - Views werden Componenten genannt, welche als Parent-Component im `<router-view>` für alle weiteren Child-Components dienen. 
 - Für unser Beispiel wäre eine "Login.vue" und "Dashboard.vue" sinnvoll.

/src/router
 - Die Idee der Index.js hier ist ähnlich zu dem Vorgehen im Backend under /src/routes. Nur alles in einer Datei

/src/componenten
 - Hier werden alle Componenten gesammelt. Dateien sowie Componenten werden in PascalCase benannt
 - Wichtig hier: Das `<style>` braucht das `scoped` attibut. Also `<style scoped>`

/src/store
 - Darauf sind wir nicht wiklich eingegangen, ist aber für die Einbindung einer API wichtig. Unten ist ein Video verlinkt

## Erweiterungen
Hier mal eine Liste von Erweiterungen, welche das Entwickeln in VSCode einfacher machen:

#### Wichtig
- octref.vetur

#### Nice2Have
- aaron-bond.better-comments
- coenraads.bracket-pair-colorizer-2
- joelday.docthis
- benjaminadk.emojis4git
- xabikos.javascriptsnippets
- eamodio.gitlens
- vscode-icons-team.vscode-icons
- pkief.material-icon-theme

## Videos
- [Vue.js Explained in 100 Seconds](https://www.youtube.com/watch?v=nhBVL41-_Cw)
- [TypeScript - The Basics](https://www.youtube.com/watch?v=ahCwqrYpIuM)
- [Vue JS Crash Course](https://www.youtube.com/watch?v=Wy9q22isx3U)
- [Vuex Crash Course | State Management](https://www.youtube.com/watch?v=5lVQgZzLMHc)

<!--LINKS-->
[mongoose-schema]: https://medium.com/@tomanagle/strongly-typed-models-with-mongoose-and-typescript-7bc2f7197722