const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const citybikedata = new sqlite3.Database('./citybikedata.db');
const cors = require('cors');
app.use(cors());

//initializing everything required, the backend uses express and sqlite3.


// an api call that sends every station from the database. Small enough data set to send everything.
// if stationName parameter is included, will instead send only stations that match the search.
app.get('/api/stations', (req, res) => {
  let query = `SELECT * FROM stations`;
  let param=[];
  // check for additional query parameters
  if (req.query.hasOwnProperty('stationName')) {
    query += ` WHERE Nimi LIKE ? COLLATE NOCASE`;
    param=[`%${req.query.stationName}%`];
  }
  else{}
  query+=` ORDER BY Nimi`;
  citybikedata.all(query, param, (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Internal server error');
    } else {
      res.send(rows);
    }
  });
});



// master api call that can take a few parameters. Parameters are station name, ordering and page number.
// sanitized inputs using '?' instead of just string construction
app.get('/api/journeys', (req, res) => {
  let param=[];
  let query= `SELECT * FROM journeys`;
  // check for additional query parameters
  if (req.query.hasOwnProperty('count')) {
    query=`SELECT COUNT(*) FROM journeys`;
  }
  if (req.query.hasOwnProperty('stationName') && req.query.hasOwnProperty('count')) {
    // if we're counting outbound and inbound journeys from a certain station, we need both cases in separate queries.
    query+= ` WHERE Dname LIKE ? COLLATE NOCASE UNION ALL SELECT COUNT(*) FROM journeys WHERE Rname LIKE ? COLLATE NOCASE`;
    param=[`%${req.query.stationName}%`,`%${req.query.stationName}%`];
  }
  else if (req.query.hasOwnProperty('stationName') && !req.query.hasOwnProperty('count')) {
    // if not counting, proceed normally.
    query += ` WHERE Dname LIKE ? COLLATE NOCASE OR Rname LIKE ? COLLATE NOCASE`;
    param=[`%${req.query.stationName}%`,`%${req.query.stationName}%`]
  }
  else{}

  // using '?' substitution here doesn't work, because sqlite is stupid. handling it differently.
  if (req.query.hasOwnProperty('orderBy') && !req.query.hasOwnProperty('count')) {
    if(['Departure', 'Return', 'Did', 'Dname', 'Rid', 'Rname', 'Distance', 'Duration'].includes(req.query.orderBy)){
      query += ` ORDER BY ${req.query.orderBy}`;
    }
  }
  else{}

  if (req.query.hasOwnProperty('pageNum') && !req.query.hasOwnProperty('count')) {
    // same as below but now we get the pageNum'th page.
    const offset = (parseInt(req.query.pageNum) - 1) * 100;
    query += ` LIMIT 100 OFFSET ?`;
    param.push(offset);
  }
  else if(!req.query.hasOwnProperty('count')){
    // if not counting, we dont want to choke the browser with a million lines, so we get the first 100.
    query += ` LIMIT 100 OFFSET 0`;
  }
  else{}

  citybikedata.all(query, param, (err, rows) => {
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
