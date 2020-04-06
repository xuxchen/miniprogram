/**
 * 公用接口
 */
import BaseService from "./BaseService";
import { del, get, post } from "../utils/wxhttp";

export default class CommonService extends BaseService {
	/**
	 * 发送手机验证码
	 * @param mobile
	 * @returns {Promise.<T>}
	 */
	sendCode(mobile) {
		return post("/api/v1/sms/send", { mobile }, { noNeedLogin: true }).then(
			this.handleRespond
		);
	}

	uploadToken() {
		return get("/api/v1/upload/token", {}, { noNeedLogin: true }).then(
			this.handleRespond
		);
	}

	payUnifiedOrder() {
		const openId = wx.getStorageSync("openid");
		return post(
			"/shop/v1/wx/unified-order",
			{ openId },
			{ noNeedLogin: true }
		).then(this.handleRespond);
	}

	/**
	 * 行业分类
	 * @returns {Promise<T | never>}
	 */
	getIndustryCates() {
		return get("/api/v1/industry/cates", {}, { noNeedLogin: true })
			.then(this.handleRespond)
			.catch(this.handleError);
	}

	getInputTypes() {
		return get("/shop/v1/input/types", {}, {})
			.then(this.handleRespond)
			.catch(this.handleError);
	}

	getFieldTypes(actId) {
		return get("/shop/v1/field/types", { actId }, {})
			.then(this.handleRespond)
			.catch(this.handleError);
	}
	addFieldType(param) {
		return post(
			"/shop/v1/field/types",
			{ ...param },
			{ loadingMsg: "提交中" }
		).then(this.handleRespond);
	}

	getShopFieldTypes() {
		return get("/shop/v1/shop-field/types", {}, {})
			.then(this.handleRespond)
			.catch(this.handleError);
	}

	delShopFieldType(id) {
		return del("/shop/v1/shop-field/" + id, {}, { loadingMsg: "提交中" }).then(
			this.handleRespond
		);
	}
}
