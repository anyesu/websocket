package indi.anyesu.model;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

/**
 * 获取随机id (时间戳 + 一位数字序号)
 * 
 * @author anyesu
 * 
 */
public class IdGenerator {
	private static final long LIMIT = 10;
	private static final Lock LOCK = new ReentrantLock();
	private static long LastTime = System.currentTimeMillis();
	private static int COUNT = 0;

	public static synchronized String getNextId() {
		LOCK.lock();
		try {
			while (true) {
				long now = System.currentTimeMillis();
				if (now == LastTime) {
					if (++COUNT == LIMIT) {
						try {
							Thread.currentThread();
							Thread.sleep(1);
						} catch (java.lang.InterruptedException e) {
						}
						continue;
					}
				} else {
					LastTime = now;
					COUNT = 0;
				}
				break;
			}
		} finally {
			LOCK.unlock();
		}
		return LastTime + "" + COUNT;
	}
}
