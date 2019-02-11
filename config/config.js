'use strict';

const config = {

	"app" : {
		
		"port" : 8000,
		"interface": '0.0.0.0'
	},

	"nbProxyPrefix" : "/route/notebook/",

	"swarmNetwork" : "jupyter-stack_jupyterhub-net",

	"redis" : {
		'host' : 'jupyter-stack_redis'
	},

	"appKey":"APP1234",
	"PlatformId" : "100"

};


module.exports = config;