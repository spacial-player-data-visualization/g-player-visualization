# G­-Player: Visualization of Spatial-Temporal Play Data

> Visualization and Data Management for Player Activity in Games

### Overview

G-Player is a data visualization web-app for uploading and viewing **spatial-temporal player activity data** in video games. The project was developed in the context of visualizing a player's data as they played a custom mod within the game Fallout: New Vegas. This software attempts to provide the visual tools to enable game researchers to analyze player activity within video games. Our goal was to provide a user interface for exploring player data in order to understand actions, correlations, and trends. G-Player was created as a team project in *CS4500 Software Development* - in association with Truong-Huy D. Nguyen, Game Development Researcher and Alessandro Canossa, Associate Professor of the College of Arts, Media & Design at Northeastern University. 

### Available Online:

Available at: [g-player.herokuapp.com](g-player.herokuapp.com)

> Note: We're currently using the hosting provider Heroku.com as our staging server. All visitors to the site share access to the same database - thus uploaded data, key mappings, and maps are shared amongst users. We strongly recommend a scheduled backup of the database. In addition, due to limitations of their development plan, the database is limited to 100mb. This storage amount is quickly exceeded, so we recommend either upgrading the hosting platform, or running the app on a local server.


# Visualizer

The goal of this section is to describe the features and functionality of the G-Player Data Visualizer. Available at /index.html, the Visualizer tool allows users to plot player data on a map, and adjust what data is being represented. The Visualizer tool contains the following panels:

#### Menu

The menu opens up an additional set of menu options. Included in this panel are links to the various admin tools for uploading data, adding key mappings, and managing maps. You may also **Export .CSV from Current Data Set**, which takes the data that you currently have shown on the map, and downloads the corresponding .csv data file.

#### Select Map

Select Map offers the ability to change the 'context' of the map. Selecting the 'game', and selecting the 'map' change which set of users is available to the player, and which map the tool should load.

The "Select Fidelity" field offers a setting for improving the performance of the tool. Often, when loading multiple sets of player data, or large data sets, the tool will slow down due to the size of the data. The "Select Fidelity" pulldown allows the user to reduce the amount of points per second that the API returns. This drastically reduces the amount of data and compution required.

#### Select Data

The "Select Data" panel allows users to select which players they wish to visualize on the map. Upon selecting a player, the user is prompted to choose a color. After selecting a color and selecting ```Add Player```, that player's data will load, and they will be visible as part of the active data set. The user may also choose to select ```Preview Data```, which loads the raw JSON format from the database. This is useful for providing the granular data for debugging.

Users may also select *actions* for ```Filter Users Who:```. This reduces the list on the left to only show players that have performed the selected actions during their lifetime. 

> Note: The "Select Data" player list will only show players whose data has been uploaded to the database. For more on uploading data, see the section below.

The ```Load All``` button on the bottom provides an option to take the current viewed list of players, and add them all to the map.

> Note: The ```Load All``` button may instigate significant load times if enough players are active. I'd highly suggest lowering the "Data Fidelity" before using the ```Load All``` button.

#### Position Map

The "Position Map" panel in the top right of the visualizer tool offers a graphical way of moving and scaling the background map. Since the provided background maps are only raster images, it's required for users to manually fit and save the map position in relation to the player positions.

#### Players

The "Players" panel shows the users that are currently 'active' and set to display on the map. The user may choose to remove players from the map using this panel.

#### Add Layer

The "Add Layer" panel adds support for creating, and removing heatmaps. Heatmaps are generated using the currently active set of players (See: Players Panel), as well as the currently selected Data Filters (See: Filter Data below). 

> For Example: It is a frequent use case that users may want to create a heatmap for different filters then actions that are plotted on the map. FOR EXAMPLE: Let's say we wanted to compare a **heatmap of locations where users sneaked vs. the line graph of how players moved around the map**. To do this, we would execute the following steps: First, we would select players from the left-menu. These players would appear on the map. Now we would adjust the filters to limit the map to only show position lines (See: Filter Data below). Choose the ```None``` button in the Filters panel, followed by selecting the "position" checkbox in the Filters panel. Upon selecting ```Update``` the visualizer would now show *ONLY* the position paths of players. Now to add a heatmap of sneaking actions. *Unselect* "position" in the Filters Panel, and *SELECT* "sneaking" (**DO NOT SELECT UPDATE, AS WE DON'T WANT TO APPLY THESE FILTERS TO THE MAP YET**). Instead, select ```Add Heatmap from Currently Selected Filters``` from the "Add Layer" panel, and it adds a new Heatmap showing ONLY the sneaking actions. 

#### Filter Data

The "Filter Data" panel allows the user to adjust what data they wish to see. The "Filter Data" panel currently only supports games for which we have multiple key-mappings (See: Key Mappings below). The "Filter Data" panel uses the **type** key on the Key Mapping, otherwise known as the category of action. If you wish to filter by a *specific* action, we recommend creating a unique category/key-mapping for that action. 

Upon selecting ```Update``` the filters on actions will be applied to the currently active set of players, and update which actions of theirs are represented on the visualizer's map.



# Admin Tools

As part of the hand-off process, we wanted to provide a description of how we designed the app - in the hopes that users or future developers of this platform can quickly understand the underlying workings. One of the core requirements requested by our clients was "arbitrary game support". The goal was to develop a piece of game data visualization software that *in theory* could be used to visualize any future data. This proved to be more challenging that initially believed. 

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
// in the key mappings. 
Name : Position_Introhouse

// A URL where the background image can be loaded
imageURL : 'http://i.imgur.com/8zDo1iB.jpg'

// The top of the map
top: 2174.

// The bottom of the map
bottom: -671

// The left of the map
left: -616

// The right of the map
right : 3072
```

> Note: All coordinates are in terms of PLAYER location. We plot the map by placing the bottom-left corner, and top-left corner then stretching the map to fit. When editing this data, it may be helpful to think "if the player was standing on the top, right corner of this image, what would their coordinates be?"


> Tip: We've provided buttons on the visualizer for visually moving and scaling the map image to align with the data. When adding a new map, we recommend setting the bottom/left values to 0, and the top/right values to the corresponding height/width of the map image (in pixels), then using the GUI tools to fit the map. This ensures that the proportions of the original image remain correct.


# Development

### Running Locally

Download from our [GitHub](https://github.com/spacial-player-data-visualization/g-player-visualization)

> Setting Up the Database & API

After downloading the repository, create a directory for the database
Use [Brew](http://brew.sh/) to install Mongo Database on your Mac OSX. 

```sh
# Create a directoy for the database
$ sudo mkdir /data/db  

# Install MongoDB's database software
$ brew install mongo   

# After installing Node.js (nodejs.org), use
# node package manager to download backend dependencies
$ npm install
```

### Starting Local Server

> Note: Each command runs a process, and may require independent terminal windows.

```sh
# Start the MongoDB 
$ sudo mongod

# Start the Node.js server
$ node index.js

```

Your app should now be running on [localhost:5000](http://localhost:5000/) with the API at [localhost:5000/api](http://localhost:5000/api).

> Pro Tip: While developing, use ``` $ nodemon index.js ``` to automatically restart the API on file change.

### Deploying to Heroku

To deploy to the staing server, log into [heroku.com](http://heroku.com) with the service account and use ther Graphic User Interface to deploy the most recent code from the GitHub repository.

### Testing

We've included a few basic unit tests for the API using Mocha. Tests can be run with the following command. Make sure this is only run locally, as the tests clear out the database beforehand.

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

### Front-End Resources, and Tutorials. 

- [Leaflet.js - Open Source Library for Interactive Maps](leafletjs.com)
- [Patrick Wied's Heatmap Library](http://www.patrick-wied.at/static/heatmapjs/)
- [Node.js](http://nodejs.org/)
- [PapaParse.js for Parsing .CSV files](http://papaparse.com)
- [FontAwesome's Icon Library](http://fortawesome.github.io/Font-Awesome/)
- [Bootstrap](http://getbootstrap.com/)
- [Underscore.js](http://underscorejs.org/)

### Backend Resources

For more information about using Node.js on Heroku, see these Dev Center articles:

- [Getting Started with Node.js on Heroku](https://devcenter.heroku.com/articles/getting-started-with-nodejs)
- [Heroku Node.js Support](https://devcenter.heroku.com/articles/nodejs-support)
- [Node.js on Heroku](https://devcenter.heroku.com/categories/nodejs)
- [Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)
- [Using WebSockets on Heroku with Node.js](https://devcenter.heroku.com/articles/node-websockets)
