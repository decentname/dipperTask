var express = require('express');
var process = require('process');
var redis = require('redis');
var client = redis.createClient(6379,"127.0.0.1");
var app = express();

app.get('/api/serverStatus', function(req, res) {
	var result = {}
	client.keys('*',function(err,resp){
		resp.forEach(function(val,index){
			console.log(val);
			client.ttl(val,function(err,rep){
				console.log(rep);
				result[val] = rep;	
			});	
		})
		res.send(result);
	});
});

app.get('/api/request', function(req, res) {
    var connId = req.query.connId;
    var time = req.query.timeout;

    client.setex(connId,time,"OK");

    var running = setTimeout(function() {
    	// var resp;
    	try{
			client.get(connId,function(err,resp){
				// console.log(err,resp);
				if(resp == "False"){
					client.del(connId,function(err,result){
						// console.log(err,res);
						res.send({"status": "killed"})
					})	
				}
				else{
					res.send({"status": "ok"})
				}
			})
			
		}
		catch(error){
			res.send({"status": "ok"})
		}	
    },time*1000);


});

app.put('/api/kill',function(req,res){
	var connId = req.query.connId;
	client.get(connId,function(err,resp){
		if(resp == "OK"){
			client.set(connId,"False",function(err,result){
				res.send({"status": "ok"});
			});
		}
		else{
			res.send({"status": "invalid connection id: " + connId});
		}
	})
});

app.listen(3000);
console.log('Listening on port 3000...');