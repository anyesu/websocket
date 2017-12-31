package indi.anyesu.model;

import com.alibaba.fastjson.JSONObject;

/**
 * @author anyesu
 */
public class Message {

	/**
	 * 消息类型
	 */
	private int type;

	/**
	 * 消息主题
	 */
	private String msg;

	/**
	 * 发送者
	 */
	private String host;

	/**
	 * 接受者
	 */
	private String[] dests;

	/**
	 * 聊天室信息
	 */
	private RoomInfo roomInfo;

	public class MsgConstant {

		/**
		 * 新连接
		 */
		public final static int OPEN = 1;

		/**
		 * 连接断开
		 */
		public final static int CLOSE = 2;

		/**
		 * 发送给所有人
		 */
		public final static int MSG_TO_ALL = 3;

		/**
		 * 发送给所有人
		 */
		public final static int MSG_TO_POINTS = 4;

		/**
		 * 需要登录
		 */
		public final static int REQUIRE_LOGIN = 5;

		/**
		 * 设置用户名
		 */
		public final static int SET_NAME = 6;
	}

	public static class RoomInfo {

		/**
		 * 聊天室名称
		 */
		private String name;

		/**
		 * 创建人
		 */
		private String creator;

		/**
		 * 创建时间
		 */
		private String createTime;

		public RoomInfo(String creator, String createTime) {
			this.creator = creator;
			this.createTime = createTime;
		}

		public RoomInfo(String name) {
			this.name = name;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}

		public String getCreator() {
			return creator;
		}

		public void setCreator(String creator) {
			this.creator = creator;
		}

		public String getCreateTime() {
			return createTime;
		}

		public void setCreateTime(String createTime) {
			this.createTime = createTime;
		}
	}

	public Message() {
		setType(MsgConstant.MSG_TO_ALL);
	}

	public Message(String host, int type) {
		setHost(host);
		setType(type);
	}

	public Message(String host, int type, String msg) {
		this(host, type);
		setMsg(msg);
	}

	public Message(String host, int type, String[] dests) {
		this(host, type);
		setDests(dests);
	}

	@Override
	public String toString() {
		/*
		  序列化成json串
		 */
		return JSONObject.toJSONString(this);
	}

	public int getType() {
		return type;
	}

	public void setType(int type) {
		this.type = type;
	}

	public String getMsg() {
		return msg;
	}

	public void setMsg(String msg) {
		this.msg = msg;
	}

	public String getHost() {
		return host;
	}

	public void setHost(String host) {
		this.host = host;
	}

	public String[] getDests() {
		return dests;
	}

	public void setDests(String[] dests) {
		this.dests = dests;
	}

	public RoomInfo getRoomInfo() {
		return roomInfo;
	}

	public void setRoomInfo(RoomInfo roomInfo) {
		this.roomInfo = roomInfo;
	}

}
