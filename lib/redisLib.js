'use strict';

const redisLib = class redisLib {

	constructor() {

		this.redis = require('async-redis');
		this.initialize();

	}

	initialize() {

		try {

			this.redis = this.redis.createClient(/*[options]*/);

			this.redis.on("error", function (err) {
				console.log("Redis Error " + err);
				throw new Error('ERROR-206: cannot perform redis operation - '+ err);
			});

		} catch(err) {
			console.log(err.message);
			throw new Error('ERROR-205: cannot initialize redis - '+ err.message);
		} 
	}


	async checkKeyExist(key){
		let val = await this.redis.get(key);
		return !(val=='');
	}

	async getKey(key){

		let val = await this.redis.get(key);
		return val;

	}

	setKey(){

	}

	

}

module.exports = new redisLib();