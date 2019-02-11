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
		let self = this;
		let urlParts = this.router.urlObj.pathname.split('/');
		let serviceId = urlParts[2];
		//let token  = urlParts[2];
		if(!serviceId){
			this.end({'code':404, 'data':'', 'msg':'Not Found'});
			return;
		}
		
		/*let val =  await this.redis.getKey(serviceId);
		if(!val){
			this.end({'code':404, 'data':'', 'msg':'Not Found'});
			return;	
		}

		val = JSON.parse(val)
		if(!val["token"] || val['token']!=token ){
			this.end({'code':404, 'data':'', 'msg':'Not Found'});
			return;	
		}*/

		try{
	
			let headers = this.router.server.req.headers;
			
			//// temp ////
			console.log(headers)
			this.router.server.proxyServer.on('proxyRes', function (proxyRes, req, res) {
				proxyRes.headers["content-security-policy"] = "";
				  // console.log('RAW Response from the target', JSON.stringify(proxyRes.headers, true, 2));
			});
			////////////

			if(headers['connection'] && headers['connection'].includes('Upgrade') && headers['upgrade'] && headers['upgrade']=='websocket'){
				this.router.server.proxyServer.ws(this.router.server.req, this.router.server.res, {
					target:{
						protocol: 'http:', 
						host: serviceId, 
						port: 8888
					}
				},function(err){
					console.log('ws error.... ', err);
					this.end({'code':404, 'data':'', 'msg':'something went wrong'});
				});
			}else{

				this.router.server.proxyServer.web(this.router.server.req, this.router.server.res, {

					target:{
						protocol: 'http:', 
						host: serviceId, 
						port: 8888
					},
				},function(err){
					console.log('webbb error.... ', err);
					if(err.code == 'ENOTFOUND'){
						self.end({'code':404, 'data':'', 'msg':'Not Found'});
					}else{
						self.end({'code':404, 'data':'', 'msg':'something went wrong'});
					}
				});
			}

		}catch(err){
			console.log(err)
			this.end({'code':404, 'data':'', 'msg':'something went wrong'});
		}

	}

	end(response){

		this.router.server.res.setHeader('Content-type', 'application/json');
		this.router.server.res.write(JSON.stringify(response));
		this.router.server.res.end();
	}

}

module.exports = new proxyController();