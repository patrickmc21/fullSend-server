const express = require('express');
const db = express();

db.listen(3000, () => {
  console.log('Listening on localhost:3000');
});