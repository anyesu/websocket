(function(window) {
    window.URL = window.URL || window.webkitURL || window.msURL || window.oURL;

    window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

    if (window.AudioContext) {
        window.AudioContext.prototype.playBuffer = function(buffer) {
            var bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = buffer;
            var buffersEndTime = this.buffersEndTime || 0;
            var fragments = this.fragments = this.fragments || [];
            bufferSource.connect(this.destination);
            var currentTime = this.currentTime;
            if (buffersEndTime < currentTime) {
                // console.debug("removing last %d fragments...", fragments.length);
                while (fragments.length > 0) {
                    fragments.shift().stop();
                }
            } else {
                // console.debug("last fragment left %f seconds", buffersEndTime - currentTime);
            }
            var buffersBeginTime = Math.max(buffersEndTime, currentTime);
            bufferSource.start(buffersBeginTime);
            this.buffersEndTime = buffersBeginTime + buffer.duration;
            fragments.push(bufferSource);
        }
    }

    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

    window.createObjectURL = function(obj) {
        return obj && window.URL && window.URL.createObjectURL ? window.URL.createObjectURL(obj) : null;
    };

    window.revokeObjectURL = function(url) {
        url && window.URL && window.URL.revokeObjectURL && window.URL.revokeObjectURL(url);
    };

    window.Media = function(option) {

        var type = 0; // 0.无，1.音频，2.视频，3.音视频
        if (option.video && option.audio) {
            type = 3;
        } else if (option.video) {
            type = 2;
        } else if (option.audio) {
            type = 1;
        }

        var jAlert = function(msg, title, callback) {
            alert(msg);
            callback && callback();
        };

        var errCallBack = function(error) {
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
            return window.createObjectURL(stream) || stream;
        };

        this.start = function(success, error) {
            var _media = this;
            if (this.localMediaStream.readyState) {
                success && success();
                return;
            }

            var userAgent = navigator.userAgent,
                msgTitle = '提示',
                notSupport = '对不起，您的浏览器不支持摄像头/麦克风的API，请使用其他浏览器',
                message = "为了获得更准确的测试结果，请尽量将面部置于红框中，然后进行拍摄、扫描。 点击“OK”后，请在屏幕上方出现的提示框选择“允许”，以开启摄像功能";
            error = error || errCallBack;
            try {
                if (navigator.getUserMedia) {
                    if (userAgent.indexOf('MQQBrowser') > -1) {
                        error({
                            NOT_SUPPORTED_ERROR: 1
                        });
                        return false;
                    }
                    navigator.getUserMedia(option, function(stream) {
                        _media.localMediaStream = stream;
                        success && success();
                    }, function(err) {
                        error(err);
                    });
                } else {
                    /*
                    if (userAgent.indexOf("Safari") > -1 && userAgent.indexOf("Oupeng") == -1 && userAgent.indexOf("360 Aphone") == -1) {

                    } //判断是否Safari浏览器
                    */
                    error({
                        NOT_SUPPORTED_ERROR: 1
                    });
                    return false;
                }
            } catch (err) {
                error({
                    NOT_SUPPORTED_ERROR: 1
                });
                return false;
            }
            return true;
        };

        this.stop = function(url) {
            if (this.localMediaStream.readyState === !0) {
                window.revokeObjectURL(url);
                this.localMediaStream.stop();
                this.localMediaStream = {};
            }
            return true;
        };

        this.localMediaStream = {};
    };

    window.Camera = function() {

        var url;

        this.start = function(success, error) {
            return this.media.start(success, error);
        };

        this.stop = function() {
            return this.media.stop(url);
        };

        this.source = function() {
            return url = url || this.media.source();
        };

        this.media = new Media({
            video: true
        });
    };

    window.MicroPhone = function() {

        var init = function(_microPhone) {
            _microPhone.isInitialized = !1;
            _microPhone.context = new window.AudioContext();
            _microPhone.media = new Media({
                audio: true
            });
        };

        var initInput = function(_microPhone) {
            if (_microPhone.isInitialized !== !0) {
                var localMediaStream = _microPhone.media.localMediaStream;
                _microPhone.audioInput = _microPhone.context.createMediaStreamSource(localMediaStream);
                _microPhone.isInitialized = !0;
            }
        };

        var initRecorderConfig = function(audioContext, _config) {
            return {
                // 输入采样率,取决于平台
                inputSampleRate: audioContext.sampleRate,
                // 输入采样数位 8, 16
                inputSampleBits: 16,
                // 输出采样率
                outputSampleRate: _config.sampleRate || audioContext.sampleRate,
                // 输出采样数位 8, 16
                outputSampleBits: _config.sampleBits || 16,
                // 声道数
                channelCount: _config.channelCount || 2,
                // 音量
                volume: _config.volume || 1,
                // 缓冲大小 2^n (256 ~ 16384)
                bufferSize: _config.bufferSize || 1024
            };
        };

        var initRecorder = function(_microPhone, _config) {
            initInput(_microPhone);

            var audioContext = _microPhone.context;
            var config = _microPhone.recorderConfig = initRecorderConfig(audioContext, _config || {});

            _microPhone.isRecording = false;
            _microPhone.buffer = [];

            var recorder = audioContext.createScriptProcessor(config.bufferSize, config.channelCount, config.channelCount); // 第二个和第三个参数指的是输入和输出的声道数
            recorder.onaudioprocess = function(e) {
                if (!_microPhone.isRecording) return;
                var inputBuffer = e.inputBuffer;
                if (_microPhone.recordMode === "Normal") {
                    var channelCount = inputBuffer.numberOfChannels,
                        length = inputBuffer.length,
                        chunk = new Float32Array(channelCount * length);
                    for (var i = 0; i < length; i++) {
                        for (var j = 0; j < channelCount; j++) {
                            chunk[i * channelCount + j] = inputBuffer.getChannelData(j)[i];
                        }
                    }
                    _microPhone.buffer.push(chunk);
                } else if (_microPhone.recordMode === "AtOnce") {
                    _microPhone.onUpdateSource(inputBuffer);
                }
            };
            _microPhone.recorder = recorder;
        };

        this.start = function(error) {
            this.media.start(function() {
                initInput(this);
                var audioContext = this.context;
                if (this.volume1 == null) {
                    this.volume1 = audioContext.createGain();
                }
                this.audioInput.connect(this.volume1);
                this.volume1.connect(audioContext.destination);
            }.bind(this), error);
        };

        this.startRecord = function(_config, onUpdateSource, error) {
            if (this.isRecording === !0) {
                return;
            }
            this.recordMode = "Normal";
            this.media.start(function() {
                if (onUpdateSource) {
                    this.onUpdateSource = onUpdateSource;
                    this.recordMode = "AtOnce";
                }
                initRecorder(this, _config);
                this.isRecording = true;
                var audioContext = this.context;
                if (this.volume2 == null) {
                    this.volume2 = audioContext.createGain();
                }
                this.audioInput.connect(this.volume2);
                this.volume2.connect(this.recorder);
                this.recorder.connect(audioContext.destination);
            }.bind(this), error);
        };

        this.stop = function() {
            if (this.volume1 != null) {
                this.volume1.disconnect();
                this.volume1 = null;
            }

            if (this.volume2 == null) {
                this.closeMedia();
            }
        };

        this.stopRecord = function() {
            this.isRecording = false;

            if (this.volume2 != null) {
                this.volume2.disconnect();
                this.volume2 = null;
            }

            if (this.recorder != null) {
                this.recorder.disconnect();
                this.recorder = null;
            }

            if (this.volume1 == null) {
                this.closeMedia();
            }
        };

        this.closeMedia = function() {
            this.media.stop();
            this.isInitialized = !1;
        };

        this.updateSource = function(_success, _error) {
            var samples = window.mergebuffer(this.buffer);
            if (samples && samples.byteLength > 0) { //size为44的时候，数据部分为空
                _success && _success(samples);
            } else {
                _error && _error("no available data");
            }
        };

        init(this);
    };

    window.Video = function(obj) {

        this.dom = document.querySelector(obj);

        this.init = function(src) {
            if (src) {
                this.canPlay = false;
                this.dom.src = this.src = src;
            }
            return this;
        };

        this.play = function() {
            this.canPlay && this.dom && this.dom.play();
            return this;
        };

        this.pause = function() {
            this.dom && this.dom.pause();
            return this;
        };

        /**
         * @return {string}
         */
        this.CurrentFrameDataURL = function(width, height) {
            var _canvas = new myCanvas(width, height),
                canvas = _canvas.dom,
                ctx = canvas.getContext("2d");
            ctx.drawImage(this.dom, 0, 0, canvas.width, canvas.height); // 将图像绘制到canvas上
            var dataURL = canvas.toDataURL("image/png");
            _canvas.remove();
            _canvas = null;
            return dataURL;
        };

        this.CurrentFrame = function(width, height) {
            var image = new Image();
            image.src = this.CurrentFrameDataURL(width, height);
            return image;
        };

        this.CurrentFrameData = function(width, height) {
            var _canvas = new myCanvas(width, height),
                canvas = _canvas.dom,
                ctx = canvas.getContext("2d");
            ctx.drawImage(this.dom, 0, 0, canvas.width, canvas.height); // 将图像绘制到canvas上
            var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
            _canvas.remove();
            _canvas = null;
            return data;
        };

        this.CurrentBlob = function(width, height) {
            return dataURLtoBlob(this.CurrentFrameDataURL(width, height));
        };
    };

    window.audio = function(obj) {

        this.dom = document.querySelector(obj);

        this.init = function(src) {
            if (src) {
                this.dom.src = this.src = src;
            }
            return this;
        };

        this.play = function() {
            this.dom && this.dom.play();
            return this;
        };

        this.pause = function() {
            this.dom && this.dom.pause();
            return this;
        };
    };

    window.dataURLtoBlob = function(dataUrl) {
        var arr = dataUrl.split(','),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {
            type: mime
        });
    };

    window.readBlobAsDataURL = function(blob, callback) {
        var a = new FileReader();
        a.onload = function(e) {
            callback && callback(e.target.result);
        };
        a.readAsDataURL(blob);
    };

    /**
     * @return {string}
     */
    window.DataURLtoString = function(dataUrl) {
        return window.atob(dataUrl.substring("data:text/plain;base64,".length))
    };

    window.myCanvas = function(width, height, isDisplay) {

        (function(_this) {
            var _canvas = document.createElement("canvas");
            _canvas.width = width || 640;
            _canvas.height = height || 360;
            if (isDisplay !== !0) {
                _canvas.style.display = "none";
            }
            document.body.appendChild(_canvas);
            _this.dom = _canvas;
        })(this);

        this.remove = function() {
            this.dom && document.body.removeChild(this.dom);
            this.dom = null;
        }
    };

    // 合并
    window.mergebuffer = function(buffers) {
        var bufferLength = 0, i = 0, offset = 0;
        for (; i < buffers.length; i++) {
            bufferLength += buffers[i].length;
        }
        var data = new Float32Array(bufferLength);
        while (buffers.length > 0) {
            var buffer = buffers.shift();
            data.set(buffer, offset);
            offset += buffer.length;
        }
        return data;
    };

    // 压缩
    window.compress = function(samples, _config) {
        // 计算压缩率
        var config = _config || {},
            compression = parseInt(config.inputSampleRate / config.outputSampleRate) || 1;// 压缩倍数

        if (compression > 1) {
            var length = parseInt(samples.length / compression),
                result = new Float32Array(length),
                index = 0;
            while (index < length) {
                result[index] = samples[index++ * compression];
            }
            return result;
        }
        return samples;
    };

    window.encodeWAV = function(samples, _config) {
        if (!_config) {
            return null;
        }

        var config = _config || {},
            sampleRate = config.outputSampleRate,
            sampleBits = config.outputSampleBits,
            channelCount = config.channelCount,
            volume = config.volume;

        var dataLength = samples.length * (sampleBits / 8),
            buffer = new ArrayBuffer(44 + dataLength),
            view = new DataView(buffer),
            offset = 0;

        var writeUTFBytes = function(str) {
                for (var i = 0; i < str.length;) {
                    view.setUint8(offset++, str.charCodeAt(i++));
                }
            },
            writeInt8 = function(val) {
                view.setInt8(offset++, val);
            },
            writeInt16 = function(val) {
                view.setInt16(offset, val, true);
                offset += 2;
            },
            writeUint16 = function(val) {
                view.setUint16(offset, val, true);
                offset += 2;
            },
            writeUint32 = function(val) {
                view.setUint32(offset, val, true);
                offset += 4;
            },
            floatTo16BitPCM = function(sampleBits) {
                for (var i = 0; i < sampleBits.length; i++) {   //因为是int16所以占2个字节,所以偏移量是+2
                    var val = Math.max(-1, Math.min(1, sampleBits[i])) * volume * 0x7FFF;
                    writeInt16(val);
                }
            },
            floatTo8BitPCM = function(sampleBits) {
                for (var i = 0; i < sampleBits.length; i++) {
                    var val = Math.max(-1, Math.min(1, sampleBits[i])) * volume * 0x7FFF;
                    // 有符号转无符号，再按比例缩小
                    val = parseInt((val + 0x7FFF) / 0xFFFF * 0xFF);
                    writeInt8(val);
                }
            };

        // 资源交换文件标识符
        writeUTFBytes('RIFF');
        // 下个地址开始到文件尾总字节数,即文件大小-8
        writeUint32(44 + dataLength);
        // WAV文件标志
        writeUTFBytes('WAVE');
        // 波形格式标志
        writeUTFBytes('fmt ');
        // 过滤字节,一般为 0x10 = 16
        writeUint32(16);
        // 格式类别 (PCM形式采样数据)
        writeUint16(1);
        // 通道数
        writeUint16(channelCount);
        // 采样率,每秒样本数,表示每个通道的播放速度
        writeUint32(sampleRate);
        // 波形数据传输率 (每秒平均字节数) 声道数 × 每样本数据位数 / 8 × 每秒采样次数
        writeUint32(channelCount * (sampleBits / 8) * sampleRate);
        // 块数据调整数 采样一次占用字节数 声道数 × 每样本数据位数 / 8
        writeUint16(channelCount * (sampleBits / 8));
        // 每样本数据位数
        writeUint16(sampleBits);
        // 数据标识符
        writeUTFBytes('data');
        // 采样数据总数,即数据总大小-44
        writeUint32(dataLength);
        // 写入采样数据
        if (sampleBits === 8) {
            floatTo8BitPCM(samples);
        } else {
            floatTo16BitPCM(samples);
        }
        return view.buffer;
    };

})(window);