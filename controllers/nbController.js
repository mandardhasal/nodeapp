'use strict';

const BaseClass = require('../classes/BaseClass.js');


const nbController  = class NbController extends BaseClass {

	constructor(){
		super();

	}

	initialize(obj){
		this.router = obj;

	}

	async getService() {

		//initial checks
		let appkey = this.router.server.req.headers.appkey;
		if( !appkey  || !this.authenticateApp(appkey) ){
			return  {'code':400,'data':{}, 'msg':'not auntenticated'}
		}

		let qs = this.router.urlObj.query;
		if(!qs.service_id || qs.service_id == "" ){
			return {'code':400,'data':{}, 'msg':'no service_id'};
		}

		if(!qs.service_id.match("^[aA0-zZ9]{3,}$") ){
			return {'code':400,'data':{}, 'msg':'invalid service_id. must be /^[aA0-zZ9]{3,}$/ '};
		}
		

		//appending with platform id for making it unique platform-wise
		let serviceId = config.PlatformId+"-"+qs.service_id;
		

		//check if service already running
		let serviceStatus = await this.docker.checkServiceExist(serviceId);
		console.log("serviceStatus", JSON.stringify(serviceStatus))


		if( serviceStatus && serviceStatus.length > 0){ //if running //check task running
			console.log("service exist...");

			let tasks = await this.docker.getTasks({ "filters": "{ \"service\" : [\"" + serviceId + "\"], \"desired-state\" : [\"running\"]}" } );
			console.log("cheking task..",JSON.stringify(tasks, null, 4));
			
			if(!tasks || tasks.length == 0 || tasks[0]["Status"]["State"]!='running'){
				this.docker.delService(serviceId);
				return {'code':400, 'data':'', 'msg':'service exist.. but task are not running.. please delete service and try again'};
			}


			let contNode =  await this.docker.listNodes(  { "filters": "{ \"id\" : [\"" +  tasks[0]["NodeID"] + "\"] }" } );
			console.log('node.......', JSON.stringify(contNode, null, 4))
			


			let token;
			let redisExist = await this.redis.getKey(serviceId);
			if(redisExist){

					redisExist = JSON.parse(redisExist);
					token = redisExist["token"];

			}else{
			
				token = serviceId + this.now();
				token = this.md5(token);
			}
			
			let url = "/route/"+serviceId;

			await this.redis.setKey(serviceId, JSON.stringify({"url":url, "token":token}));

			let map = { 
					'userServiceId' :qs.service_id,
					'serviceId': serviceStatus[0]["ID"],
					'serviceName': serviceStatus[0]["Spec"]["Name"],
					'NodeInfo' : {
								'id': contNode[0]["ID"],
								'host': contNode[0]["Description"]["Hostname"],
								'address': contNode[0]["Status"]['Addr']
							},
					'ContainerInfo': { 
								"Mounts" : tasks[0]["Spec"]["ContainerSpec"]["Mounts"],
								"Status" : tasks[0]["Status"]["ContainerStatus"] 
							},
					'ResourceLocator': {
								"token": token,
								"url": url
							}
					 };

			
			return {'code':200, 'data':map, 'msg':'ok'};

		} else { 

			//create service //check running //if not running ? loop //map redis //return data
			console.log("service not exist");
			let token = this.md5( serviceId + this.now() );

			let serviceOpts = {
				"Name": serviceId,
				"TaskTemplate": {
					"ContainerSpec": {
						"Image": "jupyter-notebook:light-v1",
						"ENV": ["BASEURL=/route/"+serviceId, "TOKEN="+token],
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
				"Networks":  [ {"Target": config.swarmNetwork}  ],
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

			console.log("creating new service");
			let serviceCreate =  await this.docker.createService(serviceOpts);
			if(!serviceCreate){
				return {'code':500,'data':'', 'msg':'could not create service'}; 
			}
			console.log("created service", JSON.stringify(serviceCreate, null, 4));

			let tasks = [];
			for(let i = 1; i<=4; i++){
				console.log("checking for running task.. attempt = "+i)		
				await this.waitFor(5000);
				let taskState = await this.docker.getTasks({ "filters": "{ \"service\" : [\"" + serviceId + "\"], \"desired-state\" : [\"running\"]}" } );				
				
				//desired state running.. doesnt assure the task is running.. have to check Status again
				if(taskState && taskState.length > 0 && taskState[0]["Status"]["State"]=='running'){
					tasks = taskState;
					break;
				}
			}
			console.log("tasklist after check..", JSON.stringify(tasks))


			if(tasks.length==0){
				//safe delete incomplete service
				this.docker.delService(serviceId); 
				return {'code':500,'data':'', 'msg':'could not create service task afer max attempts'}; 
			}

			let contNode =  await this.docker.listNodes(  { "filters": "{ \"id\" : [\"" +  tasks[0]["NodeID"] + "\"] }" } );
			console.log('node.......', JSON.stringify(contNode, null, 4));


			
			let url = "/route/"+serviceId;
	
			let map = { 
					'userServiceId' :qs.service_id,
					'serviceId': serviceCreate["id"],
					'serviceName': serviceId,
					'NodeInfo' : {
								'id': contNode[0]["ID"],
								'host': contNode[0]["Description"]["Hostname"],
								'address': contNode[0]["Status"]['Addr']
							},
					'ContainerInfo': { 
								"Mounts" : tasks[0]["Spec"]["ContainerSpec"]["Mounts"],
								"Status" : tasks[0]["Status"]["ContainerStatus"] 
							},
					'ResourceLocator': {
								"token": token,
								"url": url
							}
					 };
			

			await this.redis.setKey(serviceId, JSON.stringify( map.ResourceLocator ));

			return {'code':200, 'data':map, 'msg':'ok'};
		}

	}


	//delete service
	async delService(){
		let appkey = this.router.server.req.headers.appkey;
		if( !appkey  || !this.authenticateApp(appkey) ){
			return  {'code':400,'data':{}, 'msg':'not auntenticated'}
		}

		let qs = this.router.urlObj.query;
		if(!qs.service_id || qs.service_id == "" ){
			return {'code':400,'data':{}, 'msg':'no service_id'};
		}

		if(!qs.service_id.match("^[aA0-zZ9]{3,}$") ){
			return {'code':400,'data':{}, 'msg':'invalid service_id. must be /^[aA0-zZ9]{3,}$/ '};
		}
		

		//appending with platform id for making it unique platform-wise
		let serviceId = config.PlatformId+"-"+qs.service_id;

		this.redis.delKey(serviceId);

		this.docker.delService(serviceId);

		return { code:200, data:'', msg:'ok'}		
	}	



};

module.exports = new nbController();