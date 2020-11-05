/**
 * Created on 22/11/18.
 */

const express = require('express');
const app = express();
const path = __dirname + '/dist/edualert-frontend';
const port = process.env.PORT || 8080;

app.use(express.static(path));

app.get('*', function (req, res) {
  res.sendFile(path + '/index.html');
});

app.listen(port);
console.log(`Server starter. Listening on port ${port}`);
