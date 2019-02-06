'use strict';

const BaseClass =class BaseClass {

	constructor(obj) {

		//this.server = obj.server;

		this.docker = require('../lib/dockerLib');
		
		this.redis = require('../lib/redisLib');

	}

	authenticateApp (appId){
		return  (appId === config.appId);
	}

	async authenticateToken(key) {

		let valid = await this.redis.checkKeyExist(key);

		return valid;

	}

	// onst sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

	async waitFor(waitTime){
		await new Promise(resolve => setTimeout(resolve, waitTime));
	}
	
}


module.exports = BaseClass;