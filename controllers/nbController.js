'use strict';

const BaseClass = require('../classes/BaseClass.js');


const nbController  = class NbController extends BaseClass {

	constructor(obj){
		super();
		this.router = obj;

	}

	async getService() {

		let self = this;
		let appid = this.router.server.req.headers.appid;
		if( !appid  || !this.authenticateApp(appid) ){
			return  {'code':400,'data':{}, 'msg':'not auntenticated'}
		}


		let qs = this.router.urlObj.query;

		if(!qs.service_id || qs.service_id == "" ){
			return {'code':400,'data':{}, 'msg':'no service_id'};
		}

		
		if(!qs.service_id.match("^[aA0-zZ9]{3,}$") ){
			return {'code':400,'data':{}, 'msg':'invalid service_id. must be /^[aA0-zZ9]{3,}$/ '};
		}
		

		let serviceId = config.PlatformId+"-"+qs.service_id;
		

		let serviceStatus = await this.docker.checkServiceExist(serviceId);
		console.log("serviceStatus", JSON.stringify(serviceStatus))




		if( serviceStatus && serviceStatus.length > 0){
			console.log("service exist");

			let tasks = await this.docker.getTasks({ "filters": "{ \"service\" : [\"" + serviceId + "\"], \"desired-state\" : [\"running\"]}" } );
			console.log("cheking task..",JSON.stringify(tasks, null, 4));

			let map = { 
					'userServiceId' :qs.service_id,
					'serviceId': serviceStatus[0]["ID"],
					'serviceName': serviceStatus[0]["Spec"]["Name"],

					 };

			return {'code':200, 'data':map, 'msg':'ok'};



		} else {

			//create service
			//check running //if not running ? loop
			//map redis
			//return data

			console.log("service not exist");

			let serviceOpts = {
				"Name": serviceId,
				"TaskTemplate": {
					"ContainerSpec": {
						"Image": "nginx:latest",
						"Mounts": [
						{
							"ReadOnly": false,
							"Source": "vol-" + serviceId, 
							"Target": "/usr/share/nginx/html",
							"Type": "volume",
							"VolumeOptions": {}
						}
						]


					},
					"Placement": {},
					"Resources": {
						"Limits": {
							"MemoryBytes": 504857600
						},
						"Reservations": {}
					},
					"RestartPolicy": {
						"Condition": "on-failure",
						/*"Delay": 5,*/
						"MaxAttempts": 3
					}
				},
				"Mode": {
					"Replicated": {
						"Replicas": 1
					}
				},
				"EndpointSpec": {
					// "Ports": [
					// {
					// 	"Protocol": "tcp",
					// 	// "PublishedPort": 80 
					// 	// "TargetPort": 80
					// }
					//]
				},
				"Labels": {}
			}

			console.log("creating service");
			let serviceCreate =  await this.docker.createService(serviceOpts);
			console.log("created service", JSON.stringify(serviceCreate, null, 4));

			if(!serviceCreate){
				return {'code':500,'data':'', 'msg':'could not create service'}; 
			}

			
			let tasks = [];
		
			for(let i = 1; i<=3; i++){
				console.log("checking for running task.. attempt = "+i)		
				tasks = await this.docker.getTasks({ "filters": "{ \"service\" : [\"" + serviceId + "\"], \"desired-state\" : [\"running\"]}" } );				
				if(tasks.length > 0){
					break;
				}
				await this.waitFor(3000);
			}

			console.log("tasklist after check..", JSON.stringify(tasks))


			if(tasks.length==0){
				return {'code':500,'data':'', 'msg':'could not create service task'}; 
			}

			let service = await this.docker.checkServiceExist(serviceId);
			console.log("service........", JSON.stringify(service))

			if( !service || service.length == 0){
				return {'code':500,'data':'', 'msg':'could not get service status'}; 
			}



			let map = { 

					'serviceId': service[0]["ID"],
					'serviceName': service[0]["Spec"]["Name"],

					 };
			

			return map;	
		}

	}

};

module.exports = nbController;
