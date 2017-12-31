package indi.anyesu.util;

import java.text.DecimalFormat;

public class StringUtil {
	public static String obj2String(Object obj, String defVal) {
		if (obj instanceof String)
			return (String) obj;
		return defVal;
	}

	/**
	 * @param s1
	 * @param s2
	 * @param specialStr
	 * @return 1.如果s2为null，返回false 2、如果s2等于specialStr,直接返回true
	 *         3、如果s1等于null,返回false 4、如果s1包含s2，返回true 5、返回false
	 * 
	 */
	public static boolean contain(String s1, String s2, String specialStr) {
		if (null == s2)
			return false;
		if (s2.equals(specialStr))
			return true;
		if (null == s1)
			return false;
		return s1.contains(s2);
	}

	public static String getString(Object str) {
		if (str == null) {
			str = "";
		}
		return str.toString();
	}

	public static String substring(String str, int len, String subfix) {
		if (null == str)
			str = "";
		if (str.length() > len) {
			if (null == subfix)
				subfix = "";
			return str.substring(0, len) + subfix;
		}
		return str;
	}

	public static String changeToHTML(String str) {
		if (null != str) {
			String retStr = str.replace("\r\n", "<br />");
			// str.replace("\r", "<br />");
			// str.replace("\n", "<br />");
			return retStr;
		}
		return "";
	}

	/**
	 * @param d
	 *            要格式化的数字
	 * @param parttern
	 *            要求格式结果，例如：0.00
	 * @return
	 */
	public static String formatNum(double d, String parttern) {
		DecimalFormat df = (DecimalFormat) DecimalFormat.getInstance();
		df.applyPattern(parttern);
		return df.format(d);
	}

	// 判断某字符串是否不为空且长度不为0且不由空白符(whitespace)构成
	public static boolean isNotBlank(String str) {
		int length;
		if (str == null)
			return false;

		if ((length = str.length()) == 0)
			return false;
		for (int i = 0; i < length; ++i) {
			if (Character.isWhitespace(str.charAt(i)))
				return false;
		}
		return true;
	}

	// 判断某字符串是否为空或长度为0或由空白符(whitespace) 构成
	public static boolean isBlank(String str) {
		int length;
		if (str == null)
			return true;

		if ((length = str.length()) == 0)
			return true;
		for (int i = 0; i < length; ++i) {
			if (Character.isWhitespace(str.charAt(i)))
				return true;
		}
		return false;
	}

	public static boolean isEmpty(String str) {
		if (null == str || str.length() == 0)
			return true;
		return false;
	}

	public static boolean isNotEmpty(String str) {
		if (null == str || str.length() == 0)
			return false;
		return true;
	}

	/**
	 * html转文本
	 * 
	 * @param htm
	 * @return
	 */
	public static String htm2txt(String htm) {
		if (StringUtil.isBlank(htm)) {
			return htm;
		}
		return htm.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", "\"").replaceAll("&nbsp;", " ").replaceAll("<br/>", "\n").replaceAll("&#39;", "\'");
	}

	/**
	 * html代码转义
	 * 
	 * @param txt
	 * @return
	 */
	public static String txt2htm(String txt) {
		if (StringUtil.isBlank(txt)) {
			return txt;
		}
		return txt.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll(" ", "&nbsp;").replaceAll("\n", "<br/>").replaceAll("\'", "&#39;");
	}

	public static boolean Contains(String[] strs, String str) {
		if (isEmpty(str) || strs.length == 0)
			return false;
		for (String s : strs)
			if (s.equals(str))
				return true;
		return false;
	}
}
