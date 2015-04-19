# G­-Player: Visualization of Spatial-Temporal Play Data

> Visualization and Data Management for Player Activity in Games

# Overview

G-Player is a data visualization web-app for uploading and viewing **spatial-temporal data of player activity** in video games. The project was developed in the context of visualizing a player's data as they played a custom mode within the game Fallout: New Vegas. This software attempts to provide the visual tools to enable game researchers to analyze player activity within video games. Our goal was to provide a user interface for exploring player data in order to understand actions, correlations, and trends. G-Player was created as a team project in *CS4500 Software Development* - in association with Truong-Huy D. Nguyen, Game Development Researcher and Alessandro Canossa, Associate Professor of the collge Arts, Media & Design at Northeastern University. 

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
# Create a directoy for the database
$ sudo mkdir /data/db  

# Install MongoDB's database software
$ brew install mongo   
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

### Deployment to Server (Heroku)
> Log into [heroku.com](http://heroku.com) and deploy from the GitHub repo.

### Testing

We've included a few basic unit tests for the API using Mocha. Tests can be run with the following command:

> Note: Make sure this is only run locally, as the tests clear out the database beforehand.

```sh
$ mocha

```

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
