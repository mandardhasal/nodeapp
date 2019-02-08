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
		//console.log(this.router.urlObj);
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

		try{

			/*let newpath = this.router.urlObj.path;
			console.log("oldpath,,,", newpath);

			newpath = newpath.replace('/'+serviceId, "").replace('/'+token, "");
			console.log("newpath...", newpath);
			*/
			/*this.router.server.proxy.on('proxyRes', function(proxyRes, req, res, option){
				console.log('ressssssssssssssssss',proxyRes.headers);
				if( proxyRes.headers['location'] ){
					//return proxyRes.headers['location'] = self.router.urlObj.path + proxyRes.headers['location'];
				}
			})*/

			/*this.router.server.proxy.on('upgrade', function (req, socket, head) {
  				this.router.server.proxy.ws(req, socket, head);
			});*/

			this.router.server.proxy.on('error', function(err) {
    				return console.log(err);
			});
		 	let proxy = this.router.server.proxy.web(this.router.server.req, this.router.server.res, {

    			target: 'http://'+serviceId+':8888',
    			//changeOrigin : true,
    			ws:true //+ newpath,
    			 // ignorePath: true,
    			// followRedirects: true
    			//prependPath:false
  			});
  			//this.router.server.res.end();

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