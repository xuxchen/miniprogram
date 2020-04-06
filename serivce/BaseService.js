import { navigate } from "../utils/router";
/**
 * 处理接口响应
 */

export default class BaseService {
	constructor() {
		this.app = getApp();
	}

	/**
	 * 处理响应
	 * @param res
	 * @return {Promise.<*>}
	 */
	handleRespond(res) {
		let result = res.data;
		return result.code === 200
			? Promise.resolve(result.data)
			: Promise.reject(result);
	}

	/**
	 * 处理网络请求错误
	 */
	handleError(err) {
		if (err.code == 100) {
			return;
		} else if (err.code == 105) {
			wx.removeStorage({
				key: "sessionKeyInfo"
			});
			navigate({
				path: "page/login/login"
			});
			return;
		} else if (err.code == 20014) {
			wx.showModal({
				title: "",
				content: "信息错误，请重新登录",
				confirmText: "好的",
				showCancel: false,
				success(res) {
					wx.removeStorage({
						key: "sessionKeyInfo"
					});
					wx.removeStorage({
						key: "userInfo"
					});
					navigate({
						path: "page/login/login"
					});
				}
			});
			return;
		}
		if (
			typeof err.errMsg != "undefined" &&
			err.errMsg.indexOf("request:fail") != -1
		) {
			err.errMsg = "服务器繁忙";
		}
		wx.showModal({
			title: "",
			content: err.errMsg || err.msg || "请求失败",
			confirmText: "好的",
			showCancel: false
		});
	}
}
