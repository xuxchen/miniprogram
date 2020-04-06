/**
 * 登录接口
 */
import BaseService from "./BaseService";
import { post, get } from "../utils/wxhttp";
import { wxGetStorage, getJsCode } from "../utils/wxtool";

export default class LoginService extends BaseService {
	/**
	 * 检查openid
	 * @param param
	 * @returns {*}
	 */
	checkOpenId(param) {
		let thisData = param.thisData;
		return wxGetStorage({ key: "openid" })
			.then(res => {
				thisData.openid = res.data.openId;
				return res.data.openId;
			})
			.catch(err => {
				console.log(err);
				return this.getSessionKey({
					thisData: thisData,
					fromCache: false
				})
					.then(res => {
						console.log(res);
						if (typeof res.openId != undefined) {
							thisData.openid = res.openId;
							wx.setStorage({
								key: "openid",
								data: res.openId
							});
							return res.openId;
						}
					})
					.catch(this.handleError);
			});
	}

	getSessionKey(param) {
		let thisData = param.thisData,
			fromCache =
				typeof param.fromCache == "undefined" ? false : param.fromCache;

		// 全新获取
		let startGet = () => {
			return getJsCode({
				thisData: thisData,
				fromCache: false
			})
				.then(res => {
					let code = res.code;
					return get("/api/v1/wx/openid", { code }, { noNeedLogin: true }).then(
						this.handleRespond
					);
				})
				.then(res => {
					thisData.sessionKeyInfo = res;
					wx.setStorageSync("sessionKeyInfo", res);
					return res;
				});
		};

		// 流程
		if (fromCache) {
			if (thisData.sessionKeyInfo) {
				return new Promise((resolve, reject) => {
					resolve(thisData.sessionKeyInfo);
				});
			} else {
				return wxGetStorage({ key: "sessionKeyInfo" })
					.then(res => {
						thisData.sessionKeyInfo = res.data;
						return res.data;
					})
					.catch(err => {
						return startGet();
					});
			}
		} else {
			return startGet();
		}
	}

	/**
	 * 登陆
	 * @param openid
	 * @param mobile
	 * @param code
	 * @param nickName
	 * @param avatar
	 * @returns {Promise.<TResult>|Promise|*}
	 */
	login(openid, mobile, code, nickName, avatar) {
		return post(
			"/api/v1/wx/login",
			{
				openid,
				mobile,
				code,
				nickName,
				avatar
			},
			{ noNeedLogin: true }
		).then(this.handleRespond);
	}

	loginByWX(encryptedData, iv, nickName, avatar) {
		const openId = wx.getStorageSync("openid");
		return post(
			"/api/v1/wx/phone-login",
			{
				encryptedData,
				iv,
				openId,
				nickName,
				avatar
			},
			{ noNeedLogin: true }
		).then(this.handleRespond);
	}
}
