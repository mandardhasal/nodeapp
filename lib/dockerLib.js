'use strict';

const DockerLib = class DockerLib {

	constructor() {

		this.docker = require('dockerode');
		this.initialize();

	}

	initialize() {

		try {

			 this.docker = new this.docker({socketPath: '/var/run/docker.sock'});
		
		} catch(err) {
			console.log(err.message);
			throw new Error('ERROR-204: cannot initialize docker - '+ err.message);
		} 
	}

	async getRunningContainer(){

		let retrn;
		await this.docker.listContainers()
		.then(function(containers){

			retrn =  containers;

		}).catch(function(err) {
  			console.log(err);
		});

		return retrn;

	}


	async createService(){

		let retrn;
		await this.docker.listContainers()
		.then(function(containers){

			retrn =  containers;

		}).catch(function(err) {
  			console.log(err);
		});

		return retrn;

	}


	async getService(id){
		let retrn;
		retrn = await this.docker.getService(id);
		return retrn;
	}

	async inspectServiceId(id){

		let retrn;

		try {
			let service = await this.docker.listServices(  { filters:{ name : "mandar"} }   ).then(function(res){
			console.log(res)
			});
		}catch (err) {
			console.log(err);
		}
		//retrn = await service.inpect();
		return retrn;
	}

}

module.exports = new DockerLib();