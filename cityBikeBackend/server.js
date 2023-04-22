const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const stationsdata = new sqlite3.Database('./stations.db');
const journeys1 = new sqlite3.Database('./journeys1.db');
const journeys2 = new sqlite3.Database('./journeys2.db');
const journeys3 = new sqlite3.Database('./journeys3.db');
const cors = require('cors');
app.use(cors());

//initializing everything required, the backend uses express and sqlite3.


// an api that returns every station from the database with some error handling
app.get('/api/stations', (req, res) => {
  stationsdata.all('SELECT * FROM stations', (err, rows) => {
    
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      res.send(rows);
    }
  });
});

app.listen(3000, () => {
  console.log('Server listening on port 3000');
});

// an api that returns the output of "SELECT * FROM journeys WHERE Did=<:Did>;" from all 3 databases.
// this is a placeholder method, it will change.

app.get('/api/id/:Did', (req, res) => {
  const did=req.params.Did;
  result=[];
  journeys1.all(`SELECT * FROM journeys where Did=?`,did, (err, rows) => {
    
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      result.push(rows);
   journeys2.all(`SELECT * FROM journeys where Did=?`,did, (err, rows) => {
    
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      result.push(rows);
   journeys3.all(`SELECT * FROM journeys where Did=?`,did, (err, rows) => {
    
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      result.push(rows);
      res.send(result);
      

    }
  });

    }
  });

    }
  });
});