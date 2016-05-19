var MODE_TEXT = 0,
	MODE_VIDEO = 1,
	MODE_AUDIO = 2,
	NO_SOURCE = new Image(),
	textClient = new WSClient({
		host: "ws://" + window.location.hostname + ":8082/websocket/chat",
		type: MODE_TEXT,
		onopen: function() {
			$(".mainedit").ctrlEnter("#submit", function(event) {
				var message = {
					type: 3,
					msg: $(Console.Win).find(".mainedit").val()
				};
				if (message.msg.trim() != '') {
					textClient.sendString(JSON.stringify(message));
					$(Console.Win).find(".mainedit").val('')
				} else Console.log("不能发送空消息", false, 3000)
			});
			Console.log('WebSocket已连接.')
		},
		onclose: function() {
			$(".mainedit").ctrlEnter("#submit", function(event) {
				Console.log('WebSocket已断开.请刷新页面以重新连接', true)
			});
			Console.log('Info: WebSocket已断开.', true)
		},
		wsonopen: function(msg) {
			textClient.initUserList(msg.dests);
			if (textClient.isMe(msg.host)) {
				textClient.online = true;
				msg = "您已加入聊天室"
			} else {
				msg = msg.host + "加入了聊天室"
			}
			Console.log(msg)
		},
		wsonclose: function(msg) {
			if (textClient.isMe(msg.host)) {
				textClient.online = false;
				textClient.initUserList(null);
				msg = "您已退出聊天室"
			} else {
				textClient.initUserList(msg.dests);
				msg = msg.host + "退出了聊天室"
			}
			Console.log(msg, true)
		},
		wsonmessage: function(msg) {
			msg.msg = msg.msg.replace(/\n/g, "<br/>");
			if (textClient.isMe(msg.host)) textClient.addsrcMsg(msg);
			else textClient.adddestMsg(msg)
		},
		wssetname: function(msg) {
			textClient.setRoomInfo(msg.roomInfo);
			$("#user").text(textClient.option.userName);
		}
	});
textClient.addsrcMsg = function(msg) {
	var console = Console.Win + " #console",
		obj = '<div class="row"><span class="headpic src" title="' + msg.host + '"></span><i class="src"></i><div class="src"><p></p><br><p class="time">' + new Date().toLocaleString() + '</p></div>';
	obj = $(obj);
	obj.find("p").eq(0).html(msg.msg);
	obj.fadeIn('slow').appendTo(console);
	scrollToBottom($(console))
};
textClient.adddestMsg = function(msg) {
	var console = Console.Win + " #console",
		obj = '<div class="row"><span class="headpic" title="' + msg.host + '"></span><i></i><div class="dest"><p></p><br><p class="time">' + new Date().toLocaleString() + '</p></div>';
	obj = $(obj);
	obj.find("p").eq(0).html(msg.msg);
	obj.fadeIn('slow').appendTo(console);
	scrollToBottom($(console))
};
textClient.setRoomInfo = function(roomInfo) {
	if (roomInfo == null || typeof(roomInfo) == "undefined") return;
	var _str = new StringBuffer();
	if (typeof(roomInfo.creater) == "undefined") roomInfo.creater = "神秘用户";
	if (typeof(roomInfo.createTime) == "undefined") roomInfo.createTime = new Date().toLocaleString();
	_str.append('<span class="host">' + roomInfo.creater + '</span>');
	_str.append('创建于' + roomInfo.createTime);
	$(".mwd .pageTop .title").html(_str.toString())
};
textClient.initUserList = function(list) {
	var userlist = ".mwd .mode-text .pageRight";
	if (list == null || typeof(list) == "undefined" || list.length == 0) {
		$(userlist).html('');
		return
	}
	var _str = new StringBuffer();
	for (var i = 0; i < list.length; i++) {
		_str.append('<div class="row">');
		_str.append('<img class="headpic" height="40" width="40" title="' + list[i] + '" src="pic/websocket/headpic.png"></img>');
		_str.append('<a class="user" id=n_' + list[i] + ' title="' + list[i] + '">' + list[i] + '</a>');
		_str.append('</div>')
	}
	$(userlist).html(_str.toString())
};
var videoClient = {
	online: false,
	initialize: function() {
		if(videoClient.online && videoClient.webrtc) return;
		webrtc = new SimpleWebRTC({
		    // the id/element dom element that will hold "our" video
		    localVideoEl: 'myVideo',
		    // the id/element dom element that will hold remote videos
		    remoteVideosEl: '',
		    // immediately ask for camera access
		    autoRequestMedia: true,
		    debug: false,
		    detectSpeakingEvents: true,
		    media: {
		        video: true,
		        audio: true
		    },
		    autoAdjustMic: false
		});
		webrtc.on('videoAdded', function (video, peer) {
			console.log('video added', peer);
			$(video).fadeIn('slow').appendTo(Console.Win + " #videocontent");
			$(video).attr("id","dest-" + peer.id);
		});
		webrtc.on('videoRemoved', function (video, peer) {
		    console.log('video removed ', peer);
	        var dest = $('video[id="dest-' + peer.id + '"]');
			dest && dest.remove()
		});
		webrtc.joinRoom('video');
		videoClient.online = true;
		videoClient.webrtc = webrtc;
	},
	close: function() {
		if(videoClient.webrtc) {
			videoClient.webrtc.leaveRoom();
		}
	}
}
var Console = {
	Win: ".mwd .mode-text",
	ChatMode: MODE_TEXT,
	fullScreen: false,
	isMin: false,
	setMode: function(mode) {
		if (Console.ChatMode == mode) {
			return
		}
		Console.ChatMode = mode;
		switch (mode) {
		case MODE_TEXT:
			Console.Win = ".mwd .mode-text";
			break;
		case MODE_VIDEO:
			Console.Win = ".mwd .mode-video";
			if (!videoClient.online) {
				Console.myVideo = new Video("#myVideo");
				videoClient.initialize();
			}
			break
		}
		$(Console.Win).siblings("[class^='mode-']").hide();
		$(Console.Win).show()
	},
	log: function(message, error, delay) {
		if (message == "") return;
		console.log(message);
		delay = delay || 10000;
		var v = $(Console.Win).find(".edit .buttons .info");
		v.html(message);
		v.attr("title", message);
		if (error) v.addClass("error");
		setTimeout(function() {
			v.removeClass("error").html("")
		}, 5000)
	},
	resize: function() {
		var padding = parseInt($(Console.Win).find(".pageRight").css("padding-left"));
		$(Console.Win).find(".pageLeft").width(parseInt($(".mwd").width() - $(Console.Win).find(".pageRight").width() - padding * 2));
		$(".content").height(parseInt($(".mwd").height() - $(".pageTop").height() - $(".edit").height() - 19))
	},
	toggleFullScreen: function() {
		Console.fullScreen = !Console.fullScreen;
		if (Console.fullScreen) {
			$(".mwd").addClass("mwd_full");
			$("h2").hide()
		} else {
			$(".mwd").removeClass("mwd_full");
			$("h2").show()
		}
		Console.resize()
	},
	toggleMin: function() {
		Console.isMin = !Console.isMin;
		if (Console.isMin) {
			$(".mwd").fadeOut('quick');
			$("#min-max").fadeIn('quick')
		} else {
			$("#min-max").fadeOut('quick');
			$(".mwd").fadeIn('quick')
		}
	},
	minToMax: function() {
		Console.toggleMin();
		Console.isMin = false;
		if (!Console.fullScreen) Console.toggleFullScreen()
	},
	close: function() {
		textClient.online && textClient.close();
		videoClient.online && videoClient.close();
		CloseWindow()
	}
};