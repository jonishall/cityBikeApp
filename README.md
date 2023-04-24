First version of a Helsinki city bike app.
Requires node.js and sqlite3.
Currently the database is split into 3 files, but my backend uses only one database.
To rebuild my database:
  create a database called citybikedata.db using sqlite3
  import stations.db to a table called stations and journeys*.db to a table called journeys
To use, start server.js with node and then run index.html
