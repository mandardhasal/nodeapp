'use strict';

const redisLib = class redisLib {

	constructor() {

		this.redis = require('async-redis');
		this.initialize();

	}

	initialize() {

		try {
			this.redis = this.redis.createClient(config.redis);
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
		try {
			let val = await this.redis.get(key);
			return !(val=='');
		} catch(err) {
			console.log(err.message);
			return false;
		} 
	}

	async getKey(key){
		try {
			let val = await this.redis.get(key);
			return val;
		} catch(err) {
			console.log(err.message);
			return false;
		} 
	}

	async setKey(key,val){
		try {
			let res = await this.redis.set(key, val);
			return res;
		} catch(err) {
			console.log(err.message);
			return false;
		}
	}

	async delKey(key){
		try {
			let res = await this.redis.del(key);
			return res;
		} catch(err) {
			console.log(err.message);
			return false;
		}
	}
	

}

module.exports = new redisLib();