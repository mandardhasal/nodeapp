'use strict';

const routeMap = [
	{
		"patrn" : "^/service/notebook/$", 
		"GET" : { "controller":"nbController", "callable":"getService", "paramGrp": {"service_id":1}  },
		"POST" : "",
		"DELETE": { "controller":"nbController", "callable":"delService" }
	},

	{
		"patrn": "^/user/(.+)$",
		"GET" : "",
		"DELETE": ""
	}
];

const Router = class Router {

	constructor(){
		console.log('router constructor');
		this.http = require('http');
		this.url = require('url');
		this.controllers = require('../controllers');
		this.httpProxy = require('http-proxy');
		this.initialize();
	}

	initialize() {
		const server = this.http.createServer(this.handleRoutes.bind(this));
		this.proxy = this.httpProxy.createProxyServer(/*{ws:true}*/);
		// this.proxy.listen(3001)
		server.listen(config.app.port);
		console.log("server listening on "+ config.app.port);
	}


	async handleRoutes(req, res) {

		const self = this;
		let urlObj = this.url.parse(req.url, true);
		let url = urlObj.pathname;
		let outData = {};


		//match for routes
		for (let i = 0; i < routeMap.length; i++) {

			let match = routeMap[i];
			let matchGrp = url.match(match.patrn)

			if(  matchGrp && match[req.method]  ){
				
				let controller = self.controllers[match[req.method]["controller"]];
				controller.initialize({ server :{req:req}, urlObj:urlObj });
				
				/*let params = {};
				for (let key in match[req.method]["paramGrp"]) {
  					// console.log(key, match[req.method]["paramGrp"][key]);
  					params[key] = matchGrp[match[req.method]["paramGrp"][key]];
				}*/
				//console.log(params)

				outData = await controller[match[req.method]["callable"]]() || outData;

				//////////
				let response = {};
				response['code'] = outData.code || 404;
				response['msg'] = outData.msg || "Not Found";
				response['data'] = outData.data || {};
				res.setHeader('Content-type', 'application/json');
				res.write(JSON.stringify(response));
				res.end();
				///////////
				return;

			}	

		}

		
		let controller  = self.controllers['proxyController'];
		controller.initialize({ server :{req:req, res:res, proxy:self.proxy }, urlObj:urlObj });
		controller.handleDefaultRoute();
		//controller.destruct();
	}

};

module.exports = Router;