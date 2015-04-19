# G­-Player: Visualization of Spatial-Temporal Play Data

> Visualization and Data Management for Player Activity in Games

# Overview

A data visualization system for viewing and manipulating multiplayer game data. Software will allow researchers to analyze data sets of user activity to understand actions and trends. The system will provide a visual representation of the recorded spatial-temporal behavior of all players and allow researchers to query data based on metrics such as trajectories of events, frequency of events, and others.

Created in association with Truong-Huy D. Nguyen, Game Development Researcher and Alessandro Canossa, Associate Professor of the collge Arts, Media & Design at Northeastern University. 

### Demo

> Preview the project online

Available at: [g-player.herokuapp.com](g-player.herokuapp.com)

# Development

### Running Locally

Download from our [GitHub](https://github.com/spacial-player-data-visualization/g-player-visualization)

> Installing Database

After downloading the repository, create a directory for the database
Use [Brew](http://brew.sh/) to install Mongo Database. 

```sh
$ sudo mkdir /data/db // Create a directoy for the database
$ brew install mongo  // Install MongoDB's database software
```

> Installing the Node Server

Make sure you have [Node.js](http://nodejs.org/) installed.

```sh
$ npm install
```

### Starting Local Server

> Start Database & Server

```sh
$ sudo mongod
$ node index.js

```

Note: Each command runs a process, and may require independent terminals.

Pro Tip: Use nodemon on index.js to automatically restart the API on file change.

Your app should now be running on [localhost:5000](http://localhost:5000/) with the API at [localhost:5000/api](http://localhost:5000/api).

### Testing

> Run Mocha to test

```sh
$ mocha

```

Note: Make sure this is only run locally, as the tests clear out the database beforehand.

## Deployment to Server (Heroku)
> Log into [heroku.com](http://heroku.com) and deploy from the GitHub repo.

# Contributors

- [Alex Johnson](https://github.com/alexjohnson505)
- [Tommy Hu](https://github.com/tomxhu)
- [Pragathi Sanshi](https://github.com/pragsanshi)
- [Alex Jacks](https://github.com/alexjacks92)
- [Alex Gimmi](https://github.com/iBroadband)

### Special Thanks

A special thanks to the guidance and feedback from Truong-Huy D. Nguyen and Alessandro Canossa of Northeastern University.

### Resources

> Front-End Resources, and Tutorials. 

- [Leaflet.js - Open Source Library for Interactive Maps](leafletjs.com)
- [Patrick Wied's Heatmap Library](http://www.patrick-wied.at/static/heatmapjs/)
- [Node.js](http://nodejs.org/)
- [PapaParse.js for Parsing .CSV files](http://papaparse.com)
- [FontAwesome's Icon Library](http://fortawesome.github.io/Font-Awesome/)
- [Bootstrap](http://getbootstrap.com/)
- [Underscore.js](http://underscorejs.org/)

> Backend Resources

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
