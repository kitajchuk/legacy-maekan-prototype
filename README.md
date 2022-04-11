maekan-middleman
================

> Maekan prototype.



## Dependencies
The required dependencies and known working versions for this project.

- [node](http://nodejs.org/) @0.12.3
- [npm](https://www.npmjs.com/) @2.10.0 ( packaged with node install )
- [grunt](http://gruntjs.com/) @~0.4.5
- [middleman](http://middlemanapp.com/) @~>3.3.12
- [sass](http://sass-lang.com/install) @3.4.13
- [compass](http://compass-style.org/) @1.0.3
- [properjs](https://github.com/ProperJS/) @~0.1



## Installation
Install all global project dependencies. This list denotes starting from a blank slate. First install [node](http://nodejs.org/download/) for your machine. Node will install with npm.
```shell
npm install -g grunt-cli

npm install -g properjs-cli

gem install middleman

gem install compass

gem install sass
```



## Getting Started
Install all local project dependencies via the `package.json` file.
```shell
npm install
```

Follow the steps relevant to you [here](https://github.com/jquery/jquery#how-to-build-your-own-jquery) regarding custom [jQuery](https://github.com/jquery/jquery) builds. Then perform the following to build the jQuery dist this project uses.
```shell
cd jquery

grunt custom:-deprecated,-effects,-css,-dimensions,-offset,-wrap,-exports/amd,-event/alias,-core/ready
```



## Development


### Hammer Tips
All events are normalized using [Hammer.js](http://hammerjs.github.io) unless they are events that cannot be wrapped in a touch interface, such as mousing or form binding. A handy [ProperJS](https://github.com/ProperJS) wrapper called [Hammered](https://github.com/ProperJS/Hammered) is used for event delegation when adding Hammer listeners.


### jQuery Tips
Checkout [this page](https://learn.jquery.com/performance/) to familiarize yourself with some best practices when working with jQuery and the DOM. Aside from that, these are some other good ones.
- Cache your elements
- Cache elements when a module deems it necessary only
- Use high-level caching for document, html and body
- Use native value over .val()
- Use native innerHTML over .html()
- Never use .each(), rather use native loops
- Query with context, either $( selector, context ) OR $element.find( selector )


### Static Assets
Watch and compile static assets for the project. Middleman will compile Compass. Grunt will compile Javascript.
```shell
grunt watch

grunt build
```


### Run the Server
Run the local server using middleman.
```shell
middleman server
```

Build the static deployable package using grunt uglification and middleman. See [@kitajchuk](https://github.com/kitajchuk) for setup.
```shell
./local/build
```


### Deployment
Rsync is recommended for deployment of the static build to a server. See [@kitajchuk](https://github.com/kitajchuk) for setup.
```shell
./local/deploy
```