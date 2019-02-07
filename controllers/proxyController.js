'use strict';

const BaseClass = require('../classes/BaseClass.js');


const proxyController  = class proxyController extends BaseClass {
	
	constructor(){
		super();
	}

	initialize(obj){
		this.router = obj;
	}

	async handleDefaultRoute(){
		let urlParts = this.router.urlObj.pathname.split('/');
		let serviceId = urlParts[1];
		let token  = urlParts[2];
		if(!serviceId || !token){
			this.end({'code':404, 'data':'', 'msg':'Not Found'});
			return;
		}
		
		let val =  await this.redis.getKey(serviceId);
		if(!val){
			this.end({'code':404, 'data':'', 'msg':'Not Found'});
			return;	
		}

		val = JSON.parse(val)
		if(!val["token"] || val['token']!=token ){
			this.end({'code':404, 'data':'', 'msg':'Not Found'});
			return;	
		}

		this.router.server.proxy.web(this.router.server.req, this.router.server.res, {
    		target: 'http://'+serviceId+':80',
    		ignorePath: true
  		});
		
	}

	end(response){

		this.router.server.res.setHeader('Content-type', 'application/json');
		this.router.server.res.write(JSON.stringify(response));
		this.router.server.res.end();
	}

}

module.exports = new proxyController();