## Notes
Create a new Index for the token collection to autodelete expired tokens (180 sec = 3 min): 
```js
db.dailyOffers.createIndex( { “creationDate”: 1 }, { expireAfterSeconds: 180 } )
```