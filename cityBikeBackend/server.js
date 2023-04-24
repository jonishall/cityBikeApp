const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const citybikedata = new sqlite3.Database('./citybikedata.db');
const cors = require('cors');
app.use(cors());

//initializing everything required, the backend uses express and sqlite3.


// an api call that sends every station from the database. Small enough data set to send everything.
app.get('/api/stations', (req, res) => {
  citybikedata.all('SELECT * FROM stations', (err, rows) => {

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

// an api call that sends page <:Page> of journeys, sorted by departure station name and return station name.

app.get('/api/journeys/:Page', (req, res) => {
  const start=(req.params.Page-1)*100;
  citybikedata.all(`SELECT * FROM journeys ORDER BY Dname, Rname LIMIT 100 OFFSET ?`,start, (err, rows) => {

    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      res.send(rows);
   }
  });
});

//api call to search for a particular station as departure or return station, case insensitive search.
app.get('/api/search/:Search', (req, res) => {
  const search='%'+req.params.Search+'%'
  citybikedata.all(`SELECT * FROM journeys WHERE Dname like ? COLLATE NOCASE OR Rname like ? COLLATE NOCASE ORDER BY Dname, Rname`, search, search, (err, rows) => {

    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      res.send(rows);
   }
  });
});

//api call to count journeys from and to a particular station
app.get('/api/count/:Station', (req, res) => {
  result=[];
  const station=req.params.Station
  citybikedata.all(`SELECT COUNT(*) FROM journeys WHERE Dname=? COLLATE NOCASE`, station, (err, amount) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
      result=[];
    } else {
      result.push(amount);
      citybikedata.all(`SELECT COUNT(*) FROM journeys WHERE Rname=? COLLATE NOCASE`, station, (err, amount) => {
        if (err) {
          console.error(err.message);
          res.status(500).send('Internal server error');
          result=[];
        } else {
          result.push(amount);
          res.send(result);
          result=[];
        }
      });
    }
  });
});

//these api's were created to test things out. I'm probably going to create one "master" api that can do all of these and more.
