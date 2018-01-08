(function(){
	// http服务设置
	var express = require('express'),
		app = express(),
		http = require('http').createServer(app);

	app.use(express.static(__dirname));

	http.listen(3000, function(){
		console.log('httpServer: listening on "http://localhost:3000"');
	});

	// websocket服务设置
	var WebSocketServer = require('ws').Server,
		wss = new WebSocketServer({
			port: 3002,
			// host: "localhost",
			path: "/websocket/chat"
		}, function() {
			console.log('websocketServer: listening on "ws://localhost:3002/chat"');
		}),
		connectionList = new ArrayList(),
		roomInfo = {};

	//连接建立
	wss.on('connection', function(ws) {
		var wsid = ws._ultron.id,
			name = "游客" + new Date().getTime().toString();

		console.log("%s 加入了聊天室.",name);

		roomInfo = connectionList.length > 0 ? roomInfo : {
			creater: name,
			createTime: new Date().toLocaleString()
		};

		connectionList.add({
			wsid: wsid,
			name: name,
			connect: ws
		});

		var	dests = getDests(),
			setNameMsg = {
				host: name,
				type: 6, //setName
				roomInfo: roomInfo,
				dests: dests
			},
			joinMsg = {
				host: name,
				type: 1, //setName
				roomInfo: roomInfo,
				dests: dests
			},
			msg = JSON.stringify(setNameMsg);

		//设置名称
		ws.send(msg);

		msg = JSON.stringify(joinMsg);

		//通知所有人有新连接
	    connectionList.foreach(function(obj) {
	    	obj.connect.send(msg);
	    });

		//收到消息
	    ws.on('message', function(message) {
	        console.log('收到%s的消息：%s', name, message);
	        
	        //反序列化
	        var msg = JSON.parse(message);

	        msg.host = name;
	        
	        //序列化
	        message = JSON.stringify(msg);
	        
	        connectionList.foreach(function(obj) {
	        	obj.connect.send(message);
	        });
	    });

	    //连接断开
	    ws.on('close', function(message) {
	        console.log("%s 离开了聊天室.", name  );
	        
	        //移除当前连接
			var index = connectionList.find(function(obj) {
	        	return obj.wsid == wsid;
	        });

	        index > -1 && connectionList.removeAt(index);

			var closeMsg = {
				host: name,
				type: 2, //close
				dests: getDests()
			};

	        message = JSON.stringify(closeMsg);

	        connectionList.foreach(function(obj) {
	        	obj.connect.send(message);
	        });
	    });
	});

	function getDests() {
		var dests = [];

	    connectionList.foreach(function(obj) {
	    	dests[dests.length] = obj.name;
	    });

	    return dests;
	}

	function ArrayList(array) {
		this.array = typeof array !== 'undefined' && array instanceof Array ? array : new Array();
		this.length = this.array.length;
		var that = this,
			setLength = function() {
			that.length = that.array.length;
		};

		this.get = function(index){
			return this.array[index];
		}
		this.add = function(obj) {
			this.array.push(obj);
			setLength();
		};

		this.indexOf = function(obj) {
			return this.array.indexOf(obj);
		}

		this.find = function(callback) {
			for(var i = 0; i < this.length; i++){
				if(callback(this.get(i))) {
					return i;
				}
		    }
		    return -1;
		}

		this.removeAt = function(index){ 
			this.array.splice(index, 1);
			setLength();
		};

		this.remove = function(obj){ 
			var index = this.indexOf(obj); 
			if (index >= 0){ 
				this.removeAt(index); 
			}
		};

		this.clear = function(){ 
			this.array.length = 0;
			setLength();
		};

		this.insertAt = function(index, obj){ 
			this.array.splice(index, 0, obj);
			setLength();
		};

		this.foreach = function(callback) {
			for(var i = 0; i < this.length; i++){
				callback(this.get(i));
		    }
		};
	}
})();
