# G­-Player: Visualization of Spatial-Temporal Play Data

> Visualization and Data Management for Player Activity in Games

### Overview

G-Player is a data visualization web-app for uploading and viewing **spatial-temporal player activity data** in video games. The project was developed in the context of visualizing a player's data as they played a custom mode within the game Fallout: New Vegas. This software attempts to provide the visual tools to enable game researchers to analyze player activity within video games. Our goal was to provide a user interface for exploring player data in order to understand actions, correlations, and trends. G-Player was created as a team project in *CS4500 Software Development* - in association with Truong-Huy D. Nguyen, Game Development Researcher and Alessandro Canossa, Associate Professor of the collge Arts, Media & Design at Northeastern University. 

### Available Online:

Available at: [g-player.herokuapp.com](g-player.herokuapp.com)

> Note: We're currently using the hosting provider Heroku.com as our staging server. All visitors to the site share access to the same database - thus uploaded data, key mappings, and maps are shared amongst users. We strongly recommend a scheduled backup of the database. In addition, due to limitations of their development plan, the database is limited to 100mb. This storage about is quickly exceeded, so we recommend either upgrading the hosting platform, or running the app on a local server.

# Application Features

### Visualizer

### Admin Tools

# Application Design

As part of the hand-off process, we wanted to provide a description of how we designed the app - in the hopes that users or future developers of this platform can quickly understand the underlying workings. One of the core requirements requested by our clients was "arbitrary game support". The goal was to develop a peice of game data visualization software that *in theory* could be used to visualize any future data. This proved to be more challenging that initially believed. 

> This section hopes to explain the types of data that we support, as well as the information users are required to provide in order to support their intended game data.

### Data

> Add data at /admin/uploader.html

G-Player supports uploading .csv files of player data. There are a number of **requirements for the data**:

1. Each entry must be on it's own line
2. If there are multiple types of 'actions', the first column must be the action name.
3. Each action must have a key-mapping (explained below)
4. If a game contains only a single key-mapping, we assume that every line in the .csv file is only a position of the player.
5. Each entry must contain an 'posX' position, 'posY' position, 'timestamp', and 'area' name.
6. If no 'playerID' is provided, the software will prompt the user.

### Key Mappings

> Add data at /admin/key.html

Key Mappings tell the software what each column of the data represents. When a user provides data, we'll use the names defined in the key mapping. For example, here is a row from the Fallout: New Vegas data set:

```
Position_SheriffOffice	112	787.6	2066.61	1361.03	9057.04	34.12	0	2.44	0.98
```

Here's an example key mapping for this data entry: 

```javascript
// Name of the game
game : Fallout New Vegas,

// The category of action. Multiple actions might share the 
// same key-mapping, so we make sure to allow them to be 'grouped'
type : position

// List of actions that use this key mapping. These actions represent the data
// in the FIRST column of each entry. Notice how all these position actions share
// the same key mapping
actions : ["Position_AbandonedHouse","Position_Bar","Position_Hotel","Position_Introhouse","Position_Outside","Position_SheriffOffice","Position_Mine","Position_Cave"],

// Here we define the keys for each column. These tell the software how 
// to interpret each entry. poxY/posY are REQUIRED.
// The first column should be either "area" OR "action" depending on if
// this data is a position data, or an action the player took.
columns : ["area","playerID","timestamp","posX","posY","cameraX","cameraY","unknown3","unknown2","unknown1"]
```

### Maps

> Add data at /admin/map.html

Map data helps the software position a background image to the position of player data. Once created, we've included buttons on the top right of the visualizer for positioning the map. A sample set of map data looks like the following:

```javascript
// Name of the map. MUST match the 'area' column
// in the key mappings. For games that only have a
// single map, please use the value 'default'
Name : Position_Introhouse

// A URL where the background image can be loaded
imageURL : http://i.imgur.com/8zDo1iB.jpg

// The top of the map
top: 2174.

// The bottom of the map
bottom: -671

// The left of the map
left: -616

// The right of the map
right : 3072
```

> Note: All coordinates are in terms of PLAYER location. 

> Tip: size

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
