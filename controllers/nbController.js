'use strict';

const BaseClass = require('../classes/BaseClass.js');

const nbController  = class NbController extends BaseClass {

	constructor(obj){
		super();
		this.router = obj;

	}

	async getService() {


		let appid = this.router.server.req.headers.appid;
		if( !appid  || !this.authenticateApp(appid) ){
			return  {'code':400,'data':{}, 'msg':'not auntenticated'}
		}

	
		let qs = this.router.urlObj.query;

		if(!qs.service_id || qs.service_id == "" ){
			return {'code':400,'data':{}, 'msg':'no service_id'};
		}

		let serviceId = qs.service_id;
		
		if(!serviceId.match("^[aA0-zZ9]{3,}$") ){
			return {'code':400,'data':{}, 'msg':'invalid service_id. must be /^[aA0-zZ9]{3,}$/ '};
		}
		
		
		let serviceInspect =  await this.docker.inspectServiceId(serviceId);
		console.log("inpecttttttttttt",serviceInspect);

		return



		let retrn;
		retrn = await this.docker.getRunningContainer();	
		return {'code':200,'data':retrn, 'msg':'ok'}; 
	
	}

};

module.exports = nbController;
