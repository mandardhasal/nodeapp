'use strict';

global.config = require('./config/config');

class App  {
	
	constructor() {
		console.log('app constructor');
		this.router = require('./routers/router');		
	}

	start() {
		new this.router();
	}

};


const app = new App();
app.start();