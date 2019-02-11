'use strict';

const BaseClass =class BaseClass {

	constructor() {
		this.docker = require('../lib/dockerLib');
		this.redis = require('../lib/redisLib');
		this.md5 =  require('md5');
	}

	authenticateApp (appKey){
		console.log(appKey)
		return  (appKey === config.appKey);
	}

	async authenticateToken(key) {
		let valid = await this.redis.checkKeyExist(key);
		return valid;
	}

	async waitFor(waitTime){
		await new Promise(resolve => setTimeout(resolve, waitTime));
	}

	now(){
		let date = new Date();
		return date.getTime();
	}

}


module.exports = BaseClass;