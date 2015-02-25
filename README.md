# G­Player: Visualization of Spatial­-temporal Play Data

> Visualization and Data Management for Player Activity in Games

## Overview

A data visualization system for viewing and manipulating multiplayer game data. Software will allow researchers to analyze data sets of user activity to understand actions and trends. The system will provide a visual representation of the recorded spatial­-temporal behavior of all players and allow researchers to query data based on metrics such as trajectories of events, frequency of events, and others.

Created in association with Truong-Huy D. Nguyen, Game Development Researcher at Northeastern University. 

## Demo

> Preview the project online

Available at: [g-player.herokuapp.com](g-player.herokuapp.com)

## Getting Started

> How to Run Locally

Download the repository, and open index.html in your browser. The repo should contain all dependencies.

> Initiating Database



Install brew http://brew.sh/

brew install mongo


sudo mkdir /data/db

sudo mongod


> Initiating the Backend

Make sure you have [Node.js](http://nodejs.org/) and the [Heroku Toolbelt](https://toolbelt.heroku.com/) installed.

```sh
$ npm install
$ npm start
```
Your app should now be running on [localhost:5000](http://localhost:5000/).

## Deployment to Server (Heroku)

```
$ heroku create
$ git push heroku master
$ heroku open
```

## Authors

- [Pragathi Sanshi](https://github.com/pragsanshi)
- [Tommy Hu](https://github.com/tomxhu)
- [Alex Gimmi](https://github.com/iBroadband)
- [Alex Johnson](https://github.com/alexjohnson505)
- [Alex Jacks](https://github.com/alexjacks92)

## Special Thanks

> Tutorials, Resources, and Dependencies. 

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