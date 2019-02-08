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
			retrn = await this.docker.getService( id );
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


	async listNodes(filter){
		let retrn;
		try{
			await this.docker.listNodes(filter).then(function(res){
				retrn=res
			}).catch(function(err){
				retrn = false;
			})	
		} catch (err) {
			console.log(err);
			retrn = false;
		}
		return retrn;
	}

	async delService(id){
		try {
			let service = await this.getService(id);
			if(service) {
				await service.remove().catch(function(err){
					console.log(err)
				});
			}
		}catch (err){
			console.log(err)
		}
	}

}

module.exports = new DockerLib();