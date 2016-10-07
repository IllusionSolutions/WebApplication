## Bühler PowerCloud Project

Measures electrical data, calculates relevant power measurements, and stores it on a cloud service, which can be accessed later.

### Status:
[![Build Status](https://travis-ci.org/IllusionSolutions/WebApplication.svg?branch=master)](https://travis-ci.org/IllusionSolutions/WebApplication)

### Installation

Once the repository has been cloned, ensure that the following are installed:
<br/>
[NodeJS](https://nodejs.org/en/)
<br/>
[Bower](https://bower.io/)
<br/>
[Gulp](http://gulpjs.com/)

Run the following commands: <br/>
` $ bower install ` <br/>
` $ npm install `


### Running the Project

`
$ gulp serve
`

The development server will then listen for connections on:
http://localhost:9000

### Build Static Files

To build static files which can then be placed in a web server:

`
$ gulp build
`

### Running Unit Tests

`
$ gulp test
`
