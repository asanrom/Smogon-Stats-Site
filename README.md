Smogon-Stats-Site
====================

Smogon-Stats-Site, a mobile-responsive website that shows [Pokemon Showdown!](https://pokemonshowdown.com/) usage stats, provided by [Smogon University](https://www.smogon.com/stats/).

**WARNING:** This application is currently on beta. There may be some bugs. If you are using this application and find any bugs, please report then to [Issues](https://github.com/asanrom/Smogon-Stats-Site/issues).

Features
------------

 - **Usage stats**: You can visualize Smogon usage stats, including formats lists, ranking pages and trending pages for Pokemon, moves, items, abilities and leads. You can also visualize metagame stats and Pokemon usage data details.
 - **Automatic crawling**: Automatically crawls and downloads usage stats from Smogon website. It has a control panel you can use to select which months you want to download.
 - **Multi-Process**: You can use multiple workers to to take advantage of multiple processors.
 - **Mobile responsive**: Interface based on <a href="https://material.io/design/" target="_blank">Material Design</a>. 
 - **API**: It includes an API to get the stats in XML or JSON.

<a href="https://imgur.com/a/yVqasyY" target="_blank">See some screenshots.</a>

Installation (By cloning the repository)
------------

This application requires [node.js](http://nodejs.org/) to run. Install version **8.11.0** or newer (recommended to install the lastest stable version to avoid bugs).

Clone this repository. It requires you have [Git](https://git-scm.com/) installed. Open a terminal or console, type the following and press ENTER:
```
git clone https://github.com/asanrom/Smogon-Stats-Site.git
```

If you have an old version and want to update it, ppen a terminal or console, use `cd` to reach the directory of the application, type the following command and press ENTER:
```
git pull https://github.com/asanrom/Smogon-Stats-Site.git
```

Use `cd` to reach the directory of the application and run the following command to install dependencies:
```
npm install
```

To build the application, run the following command:
```
npm run build
```

Configuration
------------

After installation, run the following command to create the configuration file and set the control panel credentials:
```
npm run quickstart
```

To configure the application, edit the configuration file ``config.json``. The meaning of the parameters are explained in the following table.

Parameter | Description
--- | ---
`debug` | Set to `true` for debug mode. Set to `false` to production mode. Debug mode prints all log messages to the console.
`portHTTP` | Listening port for the HTTP server.
`portHTTPS` | Listening port for the HTTPS server.
`bindAddress` | Bind address for both servers.
`certificate` | Path to the SSL certificate file. Required for HTTPS.
`privateKey` | Path to the SSL private key file. Required for HTTPS.
`redirectSecure` | Set to `true` to force clients to use HTTPS.
`numWorkers` | Number of processes. Set to the number of processors of your machine for max performance.
`logsPath` | Path to store the log files.
`smogonStatsURL` |  URL to Smogon Usage Stats.
`storageMode` | Storage mode. You can store the stats in your local filesystem or use a database. Available modes: `json` (JSON files, local filesystem), `zip` (ZIP compressed files, local filesystem), `mongo` (MongoDB Database).
`storagePath` | Storage path. For `json` and `zip` modes.
`mongoURL` | MongoDB database URL.
`mongoOptions` | MongoDB connection additional options.

In order to select the months you want to download, access the control panel, at ``[yoursite.example]/admin``.

Lanching the application
------------

In order to launch the application, run the following command:
```
npm start
```

You can stop the application using the web control panel, at ``[yoursite.example]/admin``.

Lisense
------------

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat)](http://opensource.org/licenses/MIT)

The MIT License (MIT)

Copyright (c) 2018 Agustin San Roman

For some parts of the code taken from Pokemon Showdown:
Copyright (c) 2018 Guangcong Luo and other Pokemon Showdown contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
