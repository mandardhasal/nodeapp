'use strict';

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
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


	async listContainers(){

		let retrn;
		await this.docker.listContainers()
		.then(function(containers){

			retrn =  containers;

		}).catch(function(err) {
			console.log(err);
			retrn = false;
		});

		return retrn;

	}


	async getService(id){
		let retrn;
		retrn = await this.docker.getService(id);
		return retrn;
	}

	async checkServiceExist(id){

		let retrn;

		try {
			
			await this.docker.listServices(  { "filters": "{ \"name\" : [\"" + id + "\"]}" }   ).then(function(res){
				retrn = res;

			}).catch(function(err) {

				console.log(err);
				retrn = false;

			});

		}catch (err) {
			console.log(err);
			retrn = false;
		}

		return retrn;
	}


	async createService(opts){
		let retrn;
		try {

			await this.docker.createService(opts).then( function(res){
				retrn = res;
			}).catch(function(err) {

				console.log(err);
				retrn = false;

			});

		} catch (err) {
			console.log(err);
			retrn = false;
		}

		return retrn;

	}

	async getTasks(filter){
		let retrn;

		try {
			
			await this.docker.listTasks(  filter  ).then(function(res){
				retrn = res;

			}).catch(function(err) {
				
				console.log(err);
				retrn = false;

			});

		}catch (err) {
			console.log(err);
			retrn = false;
		}

		return retrn;
	}


	async getService(id){
		let retrn;
		try{
			
			retrn = await this.docker.getService(  id  );

		} catch (err) {
			console.log(err);
			retrn = false;
		}

		return retrn;
	}


	async inspectService(service){
		let retrn;
		try{
			
			retrn = await service.inpect();

		} catch (err) {
			console.log(err);
			retrn = false;
		}

		return retrn;
	}

}

module.exports = new DockerLib();