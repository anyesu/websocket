package indi.anyesu.action;

import javax.websocket.EndpointConfig;
import javax.websocket.Session;
import java.io.IOException;
import java.util.List;
import java.util.Map;

/**
 * 公共逻辑
 *
 * @author anyesu
 */
public abstract class BaseMediaController extends BaseController {

	@Override
	public void onOpen(Session session, EndpointConfig config) {
		// 设置用户信息
		Map<String, List<String>> map = session.getRequestParameterMap();
		setSession(session);
		List<String> uids = map.get("uid");
		if (uids == null) {
			try {
				this.getSession().close();
			} catch (IOException ignored) {
			}
		} else {
			setUserName(uids.get(0));
			super.onOpen(session, config);
		}
	}

}
