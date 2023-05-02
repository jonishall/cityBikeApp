A Helsinki City Bike app.

You can test it out here: http://170.187.189.225:3000/index.html

Or you can build it yourself:

Install node.js from https://nodejs.org/en/download

Pull the repository and navigate to cityBikeBackend.

Run "npm install" in this folder to install required modules.

Since this app uses a ~ 260MB database that shouldn't be put on github,
you can either download it here: https://www.dropbox.com/s/gb07noyxiuhcxzr/citybikedata.db?dl=0
and paste it into the cityBikeBackend folder.
or build it yourself using sqlite3:

Download these 4 files
https://dev.hsl.fi/citybikes/od-trips-2021/2021-05.csv
https://dev.hsl.fi/citybikes/od-trips-2021/2021-06.csv
https://dev.hsl.fi/citybikes/od-trips-2021/2021-07.csv
https://opendata.arcgis.com/datasets/726277c507ef4914b0aec3cbcfcbfafc_0.csv

Then create a database called citybikedata.db in the cityBikeBackend folder.
Import Helsingin_ja_Espoon_kaupunkipy%C3%B6r%C3%A4asemat_avoin.csv to a table called "stations", as is.
Then create a table called "journeys" with the following schema:
CREATE TABLE journeys(
  Departure,
  Return,
  Did INT,
  Dname,
  Rid INT,
  Rname,
  Distance INT CHECK(Distance>=10),
  Duration INT CHECK(Duration>=10)
);

And then import all 3 od-trips-2021/2021-0*.csv files to this table, skipping the first line.
After this, remove all duplicates and lines where Distance is of the form "%.%.%".
Then you can vacuum to slim the file down.

To run: run the command "node server.js" in the cityBikeBackend folder
and go to localhost:3000/index.html OR run index.html from the cityBikeFrontend folder while server.js is running.