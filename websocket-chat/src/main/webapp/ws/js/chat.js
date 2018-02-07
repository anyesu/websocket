var MODE_TEXT = 0,
	MODE_VIDEO = 1,
	MODE_AUDIO = 2,
	NO_SOURCE = new Image(),
	textClient = new WSClient({
		host: "ws://" + window.location.host + "/websocket/chat",
		type: MODE_TEXT,
		onopen: function() {
			$(".mainedit").ctrlEnter(".submit", function(event) {
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
			$(".mainedit").ctrlEnter(".submit", function(event) {
				Console.log('WebSocket已断开.请刷新页面以重新连接', true)
			});
			Console.log('Info: WebSocket已断开.', true)
		},
		wsonopen: function(msg) {
			textClient.initUserList(msg.dests);
			if (textClient.isMe(msg.host)) {
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
		wsrequirelogin: function(msg) {
			document.location.href = "http://" + window.location.host + "/login.htm?to_url=" + document.location.href
		},
		wssetname: function(msg) {
			textClient.setRoomInfo(msg.roomInfo);
			$("#user").text(textClient.option.userName);
			videoClient.option.userName = textClient.option.userName;
			audioClient.option.userName = textClient.option.userName
		}
	});
textClient.addsrcMsg = function(msg) {
	var console = Console.Win + " .console",
		obj = '<div class="row"><span class="headpic src" title="' + msg.host + '"></span><i class="src"></i><div class="src"><p></p><br><p class="time">' + new Date().toLocaleString() + '</p></div>';
	obj = $(obj);
	obj.find("p").eq(0).html(msg.msg);
	obj.fadeIn('slow').appendTo(console);
	scrollToBottom($(console))
};
textClient.adddestMsg = function(msg) {
	var console = Console.Win + " .console",
		obj = '<div class="row"><span class="headpic" title="' + msg.host + '"></span><i></i><div class="dest"><p></p><br><p class="time">' + new Date().toLocaleString() + '</p></div>';
	obj = $(obj);
	obj.find("p").eq(0).html(msg.msg);
	obj.fadeIn('slow').appendTo(console);
	scrollToBottom($(console))
};
textClient.setRoomInfo = function(roomInfo) {
    if (!roomInfo) {
        return;
    }
    var _str = new StringBuffer();
    var creator = roomInfo.creator || "神秘用户";
    var createTime = roomInfo.createTime || new Date().toLocaleString();
    _str.append('<span class="host">' + creator + '</span>');
    _str.append('创建于' + createTime);
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
var videoClient = new WSClient({
	host: "ws://" + window.location.host + "/websocket/chat/video",
	type: MODE_VIDEO,
	onopen: function() {
		videoClient.onlineNum = 1;
		Console.myVideo.obj.bind("play", function() {
			requestAnimationFrame(function() {
				videoClient.sendFrame()
			})
		});
		Console.myVideo.canPlay && Console.myVideo.play();
		Console.log('视频聊天已连接.')
	},
	onclose: function() {
		videoClient.online = false;
		videoClient.onlineNum = 0;
		Console.myVideo.obj.unbind();
		Console.log('视频聊天已断开.', true);
		if (!videoClient.isUserClose) {
			videoClient.initialize("uid=" + videoClient.option.userName)
		}
	},
	wsonopen: function(msg) {
		videoClient.onlineNum = msg.dests.length;
		if (videoClient.isMe(msg.host)) {
			videoClient.addVideo();
			msg = "您已加入视频聊天"
		} else {
			videoClient.addVideo(msg.host);
			msg = msg.host + "加入了视频聊天"
		}
		Console.log(msg)
	},
	wsonclose: function(msg) {
		if (videoClient.isMe(msg.host)) {
			videoClient.online = false;
			videoClient.removeVideo();
			videoClient.onlineNum = 0;
			msg = "您已退出视频聊天"
		} else {
			videoClient.removeVideo(msg.host);
			videoClient.onlineNum = msg.dests.length;
			msg = msg.host + "退出了视频聊天"
		}
		Console.log(msg, true)
	},
	wsonmessage: function(msg) {
		videoClient.renderFrame2(msg.host, msg.msg)
	},
	wsonblob: function(msg) {
		var offset = 14;
		videoClient.renderFrame(new Blob([msg.data.slice(0, offset)], {
			type: "text/plain"
		}), new Blob([msg.data.slice(offset)], {
			type: "image/png"
		}))
	},
	wsrequirelogin: function(msg) {
		document.location.href = "http://" + window.location.host + "/login.htm?to_url=" + document.location.href
	},
	wssetname: function(msg) {}
});
videoClient.addVideo = function(host) {
	if (host) {
		var console = Console.Win + " #videocontent",
			obj = $('<canvas width="120" height="90" id="canvas" title="' + host + '" destname="' + host + '">'),
			canvas = obj[0],
			context = canvas.getContext("2d");
		context.drawImage(NO_SOURCE, 0, 0, canvas.width, canvas.height);
		obj.fadeIn('slow').appendTo(console)
	} else {
		Console.myVideo.canPlay && Console.myVideo.play()
	}
};
videoClient.removeVideo = function(host) {
	if (host) {
		var dest = $('canvas[destname="' + host + '"]');
		dest && dest.remove()
	} else {
		videoClient.close()
	}
};
videoClient.renderFrame2 = function(host, data) {
	if (Console.ChatMode != MODE_VIDEO) {
		return
	}
	var canvas = $('canvas[destname="' + host + '"]'),
		img = new Image();
	while (canvas.length == 0) {
		videoClient.addVideo(host);
		canvas = $('canvas[destname="' + host + '"]')
	}
	img.onload = function() {
		releaseUrl(img.src);
		var _canvas = canvas[0],
			context = _canvas.getContext("2d");
		context.drawImage(img, 0, 0, _canvas.width, _canvas.height);
		img = null
	};
	img.src = "data:image/png;base64," + window.btoa(data)
};
videoClient.renderFrame = function(_host, blob) {
	if (Console.ChatMode != MODE_VIDEO) {
		return
	}
	readBlobAsDataURL(_host, function(host) {
		_host = null;
		host = DataURLtoString(host);
		var canvas = $('canvas[destname="' + host + '"]'),
			url = URL.createObjectURL(blob),
			img = new Image();
		while (canvas.length == 0) {
			videoClient.addVideo(host);
			canvas = $('canvas[destname="' + host + '"]')
		}
		img.onload = function() {
			releaseUrl(url);
			var _canvas = canvas[0],
				context = _canvas.getContext("2d");
			context.drawImage(img, 0, 0, _canvas.width, _canvas.height);
			img = null;
			blob = null
		};
		img.src = url
	})
};
videoClient.sendCanvas = function() {
	if (videoClient.online) {
		videoClient.onlineNum > 1 && videoClient.sendBlob(Console.myVideo.CurrentBlob(100, 100));
		setTimeout(videoClient.sendCanvas, 300)
	}
};
videoClient.sendType = 2;
videoClient.canvas = new myCanvas(160, 90);
videoClient.sendFrame = function() {
	if (this.online) {
		var video = Console.myVideo.dom;
		if (!video.paused && !video.ended) {
			if (this.onlineNum > 1) {
				var canvas = videoClient.canvas.dom,
					ctx = canvas.getContext("2d");
				ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
				if (this.sendType == 1) {
					this.sendBlob(dataURLtoBlob(canvas.toDataURL("image/png")))
				} else {
					msg = {
						type: 3,
						msg: canvas.toDataURL("image/png").substring("data:image/png;base64,".length),
						host: videoClient.option.userName
					};
					msg.msg = window.atob(msg.msg);
					this.sendString(JSON.stringify(msg))
				}
			}
		}
		setTimeout(function() {
			requestAnimationFrame(function() {
				videoClient.sendFrame()
			})
		}, 100)
	}
};
var audioClient = new WSClient({
    host: "ws://" + window.location.host + "/websocket/chat/audio",
    type: MODE_AUDIO,
    binaryType: "arraybuffer",
    onopen: function() {
        audioClient.onlineNum = 1;
        audioClient.voiceList = [];

        var microPhone = Console.microPhone;
        audioClient.audioContext = microPhone.context;
        microPhone.startRecord({
            channelCount: 1,
            sampleBits: 8,
            bufferSize: 16384
        }, function(inputBuffer) {
            if (audioClient.onlineNum <= 1) {
                return;
            }
            var channelCount = inputBuffer.numberOfChannels,
                length = inputBuffer.length,
                samples = new Float32Array(channelCount * length);
            for (var i = 0; i < length; i++) {
                for (var j = 0; j < channelCount; j++) {
                    samples[i * channelCount + j] = inputBuffer.getChannelData(j)[i];
                }
            }
            // 先编码成wav
            var wav = new Uint8Array(encodeWAV(samples, microPhone.recorderConfig));

            var userName = audioClient.option.userName;
            var offset = 0;
            var message = new Uint8Array(wav.length + 8 + userName.length);
            for (i = 0; i < userName.length;) {
                message[i] = userName.charCodeAt(i++);
            }
            offset += userName.length;

            var timestamp = Date.now();
            var first = parseInt(timestamp / 4294967296);
            var second = timestamp % 4294967296;
            message[offset++] = (first >>> 24) & 0xFF;
            message[offset++] = (first >>> 16) & 0xFF;
            message[offset++] = (first >>> 8) & 0xFF;
            message[offset++] = (first) & 0xFF;
            message[offset++] = (second >>> 24) & 0xFF;
            message[offset++] = (second >>> 16) & 0xFF;
            message[offset++] = (second >>> 8) & 0xFF;
            message[offset++] = (second) & 0xFF;

            message.set(wav, offset);

            audioClient.send(message);
        });
        Console.log('语音聊天已连接.')
    },
    onclose: function() {
        audioClient.removeVoice();
        if (!audioClient.isUserClose) {
            Console.log('语音聊天已断开.', true);
            audioClient.initialize("uid=" + audioClient.option.userName);
        } else {
            Console.log("您已退出语音聊天");
        }
    },
    wsonopen: function(msg) {
        audioClient.onlineNum = msg.dests.length;
        if (audioClient.isMe(msg.host)) {
            msg = "您已加入语音聊天"
        } else {
            msg = msg.host + "加入了语音聊天"
        }
        Console.log(msg)
    },
    wsonclose: function(msg) {
        if (!audioClient.isMe(msg.host)) {
            audioClient.removeVoice(msg.host);
            audioClient.onlineNum = msg.dests.length;
            Console.log(msg.host + "退出了语音聊天");
        }
    },
    onWsBuffer: function(arraybuffer) {
        var dataView = new DataView(arraybuffer);
        var host = "";
        var hostLen = 16;
        for (var i = 0; i < hostLen;) {
            host += String.fromCharCode(dataView.getUint8(i++));
        }
        audioClient.playVoice({
            host: host,
            timestamp: dataView.getUint32(hostLen) * 4294967296 + dataView.getUint32(hostLen + 4),
            buffer: arraybuffer.slice(hostLen + 8)
        });
    },
    wsrequirelogin: function(msg) {
        document.location.href = "http://" + window.location.host + "/login.htm?to_url=" + document.location.href
    },
    wssetname: function(msg) {
    }
});

audioClient.removeVoice = function(host) {
    if (host) {
        this.voiceList[host] = null;
    } else {
        this.onlineNum = 0;
        var microPhone = Console.microPhone;
        if (microPhone.isRecording) {
            microPhone.stopRecord();
        }
        this.audioContext = null;
        this.voiceList = null;
    }
};

audioClient.playVoice = function(message) {
    var host = message.host;
    var timestamp = message.timestamp;
    var audioContext = audioClient.audioContext;
    if (audioContext && audioContext.state === "running") {
        // 解码
        audioContext.decodeAudioData(message.buffer, function(buffer) {
            var bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = buffer;
            bufferSource.connect(audioContext.destination);

            var currentTime = audioContext.currentTime;
            var voice = audioClient.voiceList[host] = audioClient.voiceList[host] || {
                lastBeginTime: currentTime,
                lastEndTime: currentTime,
                lastTimestamp: timestamp,
                fragments: []
            };

            var lastBeginTime = voice.lastBeginTime;
            var lastEndTime = voice.lastEndTime;
            var lastTimestamp = voice.lastTimestamp;
            var fragments = voice.fragments;

            var newBeginTime = (timestamp - lastTimestamp) / 1000 + lastBeginTime;

            /*
            if (newBeginTime < lastEndTime) {
                while (fragments.length > 0) {
                    fragments.shift().stop();
                }
            }
            fragments.push(bufferSource);
            */
            bufferSource.start(newBeginTime);
            voice.lastBeginTime = newBeginTime;
            voice.lastEndTime = newBeginTime + buffer.duration;
            voice.lastTimestamp = timestamp;
        });
    }
};
var Console = {
	Win: ".mwd .mode-text",
	ChatMode: MODE_TEXT,
	fullScreen: false,
	isMin: false,
    microPhone: new MicroPhone(),
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
				Console.camera = new Camera(), Console.myVideo = new Video("#myVideo");
				var callback = function() {
						videoClient.initialize("uid=" + videoClient.option.userName)
					};
				Console.camera.start(function() {
					Console.myVideo.init(Console.camera.source());
					Console.myVideo.canPlay = true;
					callback()
				}, callback)
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
		audioClient.online && audioClient.close();
		CloseWindow()
	}
};

function releaseUrl(url) {
	url && window.URL && window.URL.revokeObjectURL && window.URL.revokeObjectURL(url)
}