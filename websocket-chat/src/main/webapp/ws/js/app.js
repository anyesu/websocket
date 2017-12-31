$(document.body).ready(function(e) {
	$(videoClient.canvas.dom).appendTo("body");
	NO_SOURCE.src = "/ws/pic/websocket/canvaspost.png";
	textClient.initialize();
	Console.setMode(Console.ChatMode);
	$(".pageTop .func a").on("click", function() {
		if ($(this).index() < 2) {
			if ($(this).attr("class").indexOf("click") > -1) return;
			$(".pageTop .func a.click").removeClass("click");
			$(this).addClass("click");
			Console.setMode($(this).index())
		}
	});
	$(".pageTop .func a.voice").on("click", function() {
		if ($(this).attr("class").indexOf("check") > -1) {
			$(this).removeClass("check");
			audioClient.close()
		} else {
			if (!audioClient.online) {
				Console.microphone = new MicroPhone(), Console.mySound = new audio("#mySound");
				audioClient.initialize("uid=" + audioClient.option.userName)
			}
			$(this).addClass("check")
		}
	});
	$(".mwd>:not(.pageLeft)").each(function() {
		this.onselectstart = function() {
			return false
		}
	});
	var ScrollConfig = {
		cursorcolor: "#ffdb51",
		cursoropacitymax: 0.5,
		cursorwidth: "5PX",
		cursorborder: "0px solid #000",
		grabcursorenabled: false,
		preservenativescrolling: false,
		nativeparentscrolling: true,
		enablescrollonselection: true
	};
	$("[MyScroll]").each(function() {
		$(this).niceScroll(ScrollConfig)
	});
	$(window).resize(function() {
		if (Console.fullScreen) Console.resize()
	});
	$(".pageTop .toolbar .min").bind("click", Console.toggleMin);
	$(".pageTop .toolbar .max").bind("click", Console.toggleFullScreen);
	$(".pageTop .toolbar .close").bind("click", Console.close);
	$("#min-max .back").bind("click", Console.toggleMin);
	$("#min-max .max").bind("click", Console.minToMax);
	$("#min-max .close").bind("click", Console.close);
	$(".mwd .pageLeft .edit .buttons .close").bind("click", Console.close)
});

function CloseWindow() {
	if (typeof(WeixinJSBridge) != "undefined") {
		WeixinJSBridge.call('closeWindow')
	} else {
		var opened = window.open('about:blank', '_self');
		opened.opener = null;
		opened.close()
	}
}
function StringBuffer(str) {
	this.strArray = new Array();
	this.strArray.push(str);
	this.append = function(appendStr) {
		this.strArray.push(appendStr)
	};
	this.toString = function() {
		return this.strArray.join("")
	}
}
$.fn.ctrlEnter = function(btns, fn) {
	var thiz = $(this);
	btns = $(btns);

	function performAction(e) {
		fn.call(thiz, e)
	};
	thiz.unbind();
	thiz.bind("keydown", function(e) {
		if (e.keyCode === 13 && e.ctrlKey) {
			thiz.val(thiz.val() + "\n");
			scrollToBottom(thiz);
			e.preventDefault()
		} else if (e.keyCode === 13) {
			performAction(e);
			e.preventDefault()
		}
	});
	btns.bind("click", performAction)
}
function htmlEncode(value) {
	return $('<div/>').text(value).html()
}
function htmlDecode(value) {
	return $('<div/>').html(value).text()
}
function scrollToBottom(obj) {
	obj[0].scrollTop = obj[0].scrollHeight
}