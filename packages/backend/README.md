## Notes
Create a new Index for the token collection to autodelete expired tokens (300 sec = 5 min): 
```js
db.authtokens.createIndex( { “creationDate”: 1 }, { expireAfterSeconds: 300 } )
```