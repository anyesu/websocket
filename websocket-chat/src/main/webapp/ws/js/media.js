(function(window) {
	window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;

	window.Media = function(option) {

		var type = 0; // 0.无，1.音频，2.视频，3.音视频
		if (option.video && option.audio) {
			type = 3;
		} else if (option.video) {
			type = 2;
		} else if (option.audio) {
			type = 1;
		}

		jAlert = function(msg, title, callback) {
			alert(msg);
			callback && callback();
		};
		sucCallBack = function(media, stream) {
			media.localMediaStream = stream;
		};

		errCallBack = function(error) {
			if (error.PERMISSION_DENIED) {
				jAlert('您拒绝了浏览器请求媒体的权限', '提示');
			} else if (error.NOT_SUPPORTED_ERROR) {
				jAlert('对不起，您的浏览器不支持摄像头/麦克风的API，请使用其他浏览器', '提示');
			} else if (error.MANDATORY_UNSATISFIED_ERROR) {
				jAlert('指定的媒体类型未接收到媒体流', '提示');
			} else {
				jAlert('相关硬件正在被其他程序使用中', '提示');
			}
		};

		this.source = function() {
			if (type < 2) {
				return null;
			}
			var stream = this.localMediaStream;
			return (window.URL && window.URL.createObjectURL) ? window.URL.createObjectURL(stream) : stream;
		}

		this.start = function(success, error) {
			var _media = this;
			if (this.localMediaStream.readyState) {
				success && success();
				return;
			}
			navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
			var userAgent = navigator.userAgent,
				msgTitle = '提示',
				notSupport = '对不起，您的浏览器不支持摄像头/麦克风的API，请使用其他浏览器',
				message = "为了获得更准确的测试结果，请尽量将面部置于红框中，然后进行拍摄、扫描。 点击“OK”后，请在屏幕上方出现的提示框选择“允许”，以开启摄像功能";
			try {
				if (navigator.getUserMedia) {
					if (userAgent.indexOf('MQQBrowser') > -1) {
						errCallBack({
							NOT_SUPPORTED_ERROR: 1
						});
						return false;
					}
					navigator.getUserMedia(option, function(stream) {
						sucCallBack(_media, stream);
						success && success();
					}, function(err) {
						errCallBack(err);
						error && error();
					});
				} else {
/*
					if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Oupeng") == -1 && userAgent.indexOf("360 Aphone") == -1) {
						
					} //判断是否Safari浏览器
					*/
					errCallBack({
						NOT_SUPPORTED_ERROR: 1
					});
					return false;
				}
			} catch (err) {
				errCallBack({
					NOT_SUPPORTED_ERROR: 1
				});
				return false;
			}
			return true;
		}

		this.stop = function(url) {
			url && window.URL && window.URL.revokeObjectURL && window.URL.revokeObjectURL(url);
			this.localMediaStream.readyState && this.localMediaStream.stop();
			this.localMediaStream = new Object();
			return true;
		};

		this.localMediaStream = new Object();
	}

	window.Camera = function() {

		this.start = function(success, error) {
			return this.media.start(success, error);
		};

		this.stop = function(url) {
			return this.media.stop(url);
		};

		this.source = function() {
			return this.media.source();
		};

		this.media = new Media({
			video: true
		});
	}

	window.MicroPhone = function() {

		this.start = function(success, error) {
			var _microphone = this;
			_success = function() {
				var stream = _microphone.media.localMediaStream;
				_microphone.audioInput = _microphone.context.createMediaStreamSource(stream);
				_microphone.recorder.onaudioprocess = function(e) {
					if (!_microphone.isReady) return;
					var inputbuffer = e.inputBuffer,
						channelCount = inputbuffer.numberOfChannels,
						length = inputbuffer.length;
					channel = new Float32Array(channelCount * length);
					for (var i = 0; i < length; i++) {
						for (var j = 0; j < channelCount; j++) {
							channel[i * channelCount + j] = inputbuffer.getChannelData(j)[i];
						}
					}
					_microphone.buffer.push(channel);
					_microphone.bufferLength += channel.length;
				};
				_microphone.startRecord();
				_microphone.updateSource(success);
			}
			this.media.start(_success, error);
		}

		this.startRecord = function() {
			this.isReady = true;
			var volume = this.context.createGain();
			this.audioInput.connect(volume);
			volume.connect(this.recorder);
			this.audioInput.connect(this.recorder);
			this.recorder.connect(this.context.destination);
		}

		this.stopRecord = function() {
			this.recorder.disconnect();
		}

		this.stop = function(url) {
			this.isReady = false;
			this.stopRecord();
			this.media.stop(url);
		}

		this.source = function() {
			return this.src;
		}

		this.init = function(_config) {
			_config = _config || {};
			this.isReady = false;
			this.media = new Media({
				audio: true
			});
			audioContext = window.AudioContext || window.webkitAudioContext;
			this.context = new audioContext();
			this.config = {
				inputSampleRate: this.context.sampleRate,
				//输入采样率,取决于平台
				inputSampleBits: 16,
				//输入采样数位 8, 16
				outputSampleRate: _config.sampleRate || (44100 / 6),
				//输出采样率
				oututSampleBits: _config.sampleBits || 8,
				//输出采样数位 8, 16
				channelCount: _config.channelCount || 2,
				//声道数
				cycle: _config.cycle || 500,
				//更新周期,单位ms
				volume: _config.volume || 1 //音量
			};
			var bufferSize = 4096;
			this.recorder = this.context.createScriptProcessor(bufferSize, this.config.channelCount, this.config.channelCount); // 第二个和第三个参数指的是输入和输出的声道数
			this.buffer = [];
			this.bufferLength = 0;

			return this;
		}

		this.compress = function() { //合并压缩
			//合并
			var buffer = this.buffer,
				bufferLength = this.bufferLength;
			this.buffer = []; //处理缓存并将之清空
			this.bufferLength = 0;
			var data = new Float32Array(bufferLength);
			for (var i = 0, offset = 0; i < buffer.length; i++) {
				data.set(buffer[i], offset);
				offset += buffer[i].length;
			}
			//压缩
			var config = this.config,
				compression = parseInt(config.inputSampleRate / config.outputSampleRate),
				//计算压缩率
				length = parseInt(data.length / compression),
				result = new Float32Array(length);
			index = 0;
			while (index < length) {
				result[index] = data[index++ * compression];
			}
			return result;
		}

		this.encodeWAV = function(bytes) {
			var config = this.config,
				sampleRate = Math.min(config.inputSampleRate, config.outputSampleRate),
				sampleBits = Math.min(config.inputSampleBits, config.oututSampleBits),
				dataLength = bytes.length * (sampleBits / 8),
				buffer = new ArrayBuffer(44 + dataLength),
				view = new DataView(buffer),
				channelCount = config.channelCount,
				offset = 0,
				volume = config.volume;

			writeUTFBytes = function(str) {
				for (var i = 0; i < str.length; i++) {
					view.setUint8(offset + i, str.charCodeAt(i));
				}
			};
			// 资源交换文件标识符 
			writeUTFBytes('RIFF');
			offset += 4;
			// 下个地址开始到文件尾总字节数,即文件大小-8 
			view.setUint32(offset, 44 + dataLength, true);
			offset += 4;
			// WAV文件标志
			writeUTFBytes('WAVE');
			offset += 4;
			// 波形格式标志 
			writeUTFBytes('fmt ');
			offset += 4;
			// 过滤字节,一般为 0x10 = 16 
			view.setUint32(offset, 16, true);
			offset += 4;
			// 格式类别 (PCM形式采样数据) 
			view.setUint16(offset, 1, true);
			offset += 2;
			// 通道数 
			view.setUint16(offset, channelCount, true);
			offset += 2;
			// 采样率,每秒样本数,表示每个通道的播放速度 
			view.setUint32(offset, sampleRate, true);
			offset += 4;
			// 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8 
			view.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true);
			offset += 4;
			// 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8 
			view.setUint16(offset, channelCount * (sampleBits / 8), true);
			offset += 2;
			// 每样本数据位数 
			view.setUint16(offset, sampleBits, true);
			offset += 2;
			// 数据标识符 
			writeUTFBytes('data');
			offset += 4;
			// 采样数据总数,即数据总大小-44 
			view.setUint32(offset, dataLength, true);
			offset += 4;
			// 写入采样数据 
			if (sampleBits === 8) {
				for (var i = 0; i < bytes.length; i++, offset++) {
					var val = bytes[i] * (0x7FFF * volume);
					val = parseInt(255 / (65535 / (val + 32768)));
					view.setInt8(offset, val, true);
				}
			} else if (sampleBits === 16) {
				for (var i = 0; i < bytes.length; i++, offset += 2) {
					var val = bytes[i] * (0x7FFF * volume);
					view.setInt16(offset, val, true);
				}
			}
			return new Blob([view], {
				type: 'audio/wav'
			});
		}

		this.updateSource = function(callback) {
			if (!this.isReady) return;
			var _microphone = this,
				blob = this.encodeWAV(this.compress());
			url = this.src;
			url && window.URL && window.URL.revokeObjectURL && window.URL.revokeObjectURL(url);
			if (blob.size > 44) { //size为44的时候，数据部分为空
				this.CurrentData = blob;
				this.src = window.URL.createObjectURL(blob);
			}
			callback && callback();
			setTimeout(function() {
				_microphone.updateSource(callback);
			}, _microphone.config.cycle);
		}

		this.init();
	}

	window.Video = function(obj) {

		this.obj = $(obj);

		this.dom = this.obj.get(0);

		this.init = function(src) {
			this.canPlay = false;
			this.dom.src = this.src = src;
			return this;
		}

		this.play = function() {
			this.dom.play();
			return this;
		};

		this.pause = function() {
			this.dom.pause();
			return this;
		};

		this.CurrentFrame = function(width, height) {
			var _canvas = new myCanvas(),
				canvas = _canvas.dom,
				image = new Image(),
				ctx = canvas.getContext("2d");
			//重置canvans宽高 
			canvas.width = width || this.dom.width;
			canvas.height = height || this.dom.height;
			ctx.drawImage(this.dom, 0, 0, canvas.width, canvas.height); // 将图像绘制到canvas上
			image.src = canvas.toDataURL("image/png");
			_canvas.remove();
			_canvas = null;
			return image;
		};

		this.CurrentFrameData = function(width, height) {
			var _canvas = new myCanvas(),
				canvas = _canvas.dom,
				ctx = canvas.getContext("2d");
			//重置canvans宽高 
			canvas.width = width || this.dom.width;
			canvas.height = height || this.dom.height;
			ctx.drawImage(this.dom, 0, 0, canvas.width, canvas.height); // 将图像绘制到canvas上
			var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
			_canvas.remove();
			_canvas = null;
			return data;
		};

		this.CurrentBlob = function(width, height) {
			var _canvas = new myCanvas(),
				canvas = _canvas.dom,
				ctx = canvas.getContext("2d");
			//重置canvans宽高 
			canvas.width = width || this.dom.width;
			canvas.height = height || this.dom.height;
			ctx.drawImage(this.dom, 0, 0, canvas.width, canvas.height); // 将图像绘制到canvas上
			var data = dataURLtoBlob(canvas.toDataURL("image/png"))
			_canvas.remove();
			_canvas = null;
			return data;
		};
	}

	window.audio = function(obj) {

		this.obj = $(obj);

		this.dom = this.obj.get(0);

		this.init = function(src) {
			this.dom.src = this.src = src;
			return this;
		}

		this.play = function() {
			this.dom.play();
			return this;
		};

		this.pause = function() {
			this.dom.pause();
			this.source && this.source.stop(this.src);
			return this;
		};
	}

	window.dataURLtoBlob = function(dataurl) {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new Blob([u8arr], {
			type: mime
		});;
	}

	window.readBlobAsDataURL = function(blob, callback) {
		var a = new FileReader();
		a.onload = function(e) {
			callback(e.target.result);
		};
		a.readAsDataURL(blob);
	}

	window.DataURLtoString = function(dataurl) {
		return window.atob(dataurl.substring("data:text/plain;base64,".length))
	}

	window.myCanvas = function(width, height, isDisplay) {

		(function(_this) {
			width = width || 640, height = height || 360;
			display = isDisplay ? '' : ' style="display: none;"';
			obj = $('<canvas id="cacheCanvas" width="' + width + '" height="' + height + '"' + display + '></canvas>');
			obj.appendTo("body");
			_this.dom = obj.get(0);
		})(this)

		this.remove = function() {
			$(this.dom).remove();
		}
	}
})(window);