package indi.anyesu.action;

import indi.anyesu.model.IdGenerator;
import indi.anyesu.model.Message;
import indi.anyesu.model.Message.MsgConstant;
import indi.anyesu.model.Message.RoomInfo;

import java.nio.ByteBuffer;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

/**
 * Websocket 文字通讯
 * 
 * @author anyesu
 */
@ServerEndpoint(value = "/websocket/chat", configurator = wsConfigurator.class)
public class TextController extends AbstractWSController {
	private static final List<AbstractWSController> connections = new CopyOnWriteArrayList<AbstractWSController>();

	private RoomInfo roomInfo;

	@OnOpen
	public void OnOpen(Session session, EndpointConfig config) {
		// 设置用户信息
		setUserName(IdGenerator.getNextId());
		setSession(session);
		// 设置聊天室信息
		if (connections.size() == 0) {
			setRoomInfo(new RoomInfo(getUserName(), (new SimpleDateFormat("yyyy-MM-dd HH:mm:ss")).format(new Date())));
		} else {
			Iterator<AbstractWSController> it = connections.iterator();
			TextController client = (TextController) it.next();
			setRoomInfo(client.getRoomInfo());
		}
		Message msg = new Message(getUserName(), MsgConstant.setName);
		msg.setRoomInfo(getRoomInfo());
		call(msg.toString());
		super.OnOpen(session, config);
	}

	@OnClose
	public void OnClose() {
		super.OnClose();
	}

	@OnMessage(maxMessageSize = 10000000)
	public void OnMessage(String message) {
		super.OnMessage(message);
	}

	@OnMessage(maxMessageSize = 10000000)
	public void OnMessage(ByteBuffer message) {
		super.OnMessage(message);
	}

	@OnError
	public void OnError(Throwable t) throws Throwable {
	}

	@Override
	List<AbstractWSController> getConnections() {
		return connections;
	}

	/**
	 * 设置聊天室信息
	 */
	private void setRoomInfo(RoomInfo roomInfo) {
		this.roomInfo = roomInfo;
	}

	private RoomInfo getRoomInfo() {
		return roomInfo;
	}

	@Override
	String getConnectType() {
		return "text";
	}

}
