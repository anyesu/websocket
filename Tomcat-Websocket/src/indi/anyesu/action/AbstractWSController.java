package indi.anyesu.action;

import indi.anyesu.model.Message;
import indi.anyesu.model.Message.MsgConstant;
import indi.anyesu.util.StringUtil;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.List;

import javax.websocket.EndpointConfig;
import javax.websocket.RemoteEndpoint.Async;
import javax.websocket.RemoteEndpoint.Basic;
import javax.websocket.Session;

import com.alibaba.fastjson.JSONObject;

/**
 * Websocket 通讯 抽象类
 * 
 * @author anyesu
 */
public abstract class AbstractWSController {
	private Session session;
	private String userName;

	abstract List<AbstractWSController> getConnections();

	abstract String getConnectType();

	/**
	 * websock连接建立后触发
	 * 
	 * @param session
	 * @param config
	 */
	protected void OnOpen(Session session, EndpointConfig config) {
		getConnections().add(this);
		broadcast2All(new Message(getUserName(), MsgConstant.Open, getUsers()).toString());
		System.out.println(getConnectType() + ": " + getUserName() + "加入了，当前总人数：" + getConnections().size());
	}

	/**
	 * websock连接断开后触发
	 */
	protected void OnClose() {
		getConnections().remove(this);
		broadcast2Others(new Message(getUserName(), MsgConstant.Close, getUsers()).toString());
		System.out.println(getConnectType() + ": " + getUserName() + "退出了，当前总人数：" + getConnections().size());
	}

	/**
	 * 接受客户端发送的字符串
	 * 
	 * @param message
	 */
	protected void OnMessage(String message) {
		Message msg = JSONObject.parseObject(message, Message.class);
		msg.setHost(getUserName());
		if (getConnectType().equals("text")) {
			msg.setMsg(StringUtil.txt2htm(msg.getMsg()));
			if (msg.getDests() == null) {
				broadcast2All(msg.toString());
			} else {
				broadcast2Special(msg.toString(), msg.getDests());
			}
		} else {
			broadcast2Others(msg.toString());
		}
	}

	/**
	 * 接收客户端发送的字节流
	 * 
	 * @param message
	 */
	protected void OnMessage(ByteBuffer message) {
		broadcast2Others(message);
	}

	/**
	 * 发生错误
	 */
	protected void OnError(Throwable t) throws Throwable {
	}

	/**
	 * 广播给所有用户
	 * 
	 * @param msg
	 */
	protected <T> void broadcast2All(T msg) {
		for (AbstractWSController client : getConnections())
			client.call(msg);
	}

	/**
	 * 发送给指定的用户
	 * 
	 * @param msg
	 */
	protected <T> void broadcast2Special(T msg, String[] dests) {
		for (AbstractWSController client : getConnections())
			if (StringUtil.Contains(dests, client.getUserName()))
				client.call(msg);
	}

	/**
	 * 广播给除了自己外的用户
	 * 
	 * @param msg
	 */
	protected <T> void broadcast2Others(T msg) {
		for (AbstractWSController client : getConnections())
			if (!client.getUserName().equals(this.getUserName()))
				client.call(msg);
	}

	/**
	 * 异步方式向客户端发送字符串
	 * 
	 * @param msg
	 *            参数类型为String或ByteBuffer
	 */
	protected <T> void callAsync(T msg) {
		Async remote = this.getSession().getAsyncRemote();
		if (msg instanceof String) {
			remote.sendText((String) msg);
		} else if (msg instanceof ByteBuffer) {
			remote.sendBinary((ByteBuffer) msg);
		}
	}

	/**
	 * 同步方式向客户端发送字符串
	 * 
	 * @param msg
	 *            参数类型为String或ByteBuffer
	 */
	protected <T> void call(T msg) {
		try {
			synchronized (this) {
				Basic remote = this.getSession().getBasicRemote();
				if (msg instanceof String) {
					remote.sendText((String) msg);
				} else if (msg instanceof ByteBuffer) {
					remote.sendBinary((ByteBuffer) msg);
				}

			}
		} catch (IOException e) {
			try {
				this.getSession().close();
			} catch (IOException e1) {
				// Ignore
			}
			OnClose();
		}
	}

	protected void setSession(Session session) {
		this.session = session;
	}

	protected Session getSession() {
		return this.session;
	}

	protected String getUserName() {
		return userName;
	}

	protected void setUserName(String userName) {
		this.userName = userName;
	}

	protected String[] getUsers() {
		int i = 0;
		String[] destArrary = new String[getConnections().size()];
		for (AbstractWSController client : getConnections())
			destArrary[i++] = client.getUserName();
		return destArrary;
	}
}
