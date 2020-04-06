import md5 from "../lib/md5";
import config from "../config";

let wxPromise = (fn, param = {}, options = {}) => {
	sideEffect.beforeRequest(options);

	return new Promise((resolve, reject) => {
		param.success = function(res) {
			resolve(res);
		};
		param.fail = function(res) {
			reject(res);
			// reject({err: "网络请求失败"});
		};
		param.complete = function(res) {
			sideEffect.afterRequest(options);
		};
		fn(param);
	});
};

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function(callback) {
	let P = this.constructor;
	return this.then(
		value => P.resolve(callback()).then(() => value),
		reason =>
			P.resolve(callback()).then(() => {
				throw reason;
			})
	);
};

let createHeader = () => {
	const login = wx.getStorageSync("sessionKeyInfo");
	const current = wx.getStorageSync("current");

	const nowtime = Date.now();
	const userId = login.userId || "";
	const shopId = login.shopId || "";
	const openId = login.openId || "";
	const fixStr = "sale";
	const sign = md5.hexMD5(
		fixStr + config.APPID + nowtime.toString() + config.SECRETKEY
	);
	let head = {
		Accept: "application/json",
		"Content-Type": "application/json",
		appid: config.APPID,
		openId: openId,
		sign,
		city: current.cityCode,
		time: nowtime.toString()
	};
	if (userId) {
		head = {
			...head,
			userId,
			shopId,
			token: login.token
		};
	}
	return head;
};
let sideEffect = {
	beforeRequest(options) {
		if (options.hasOwnProperty("loadingMsg")) {
			wx.showLoading({
				title: `${options.loadingMsg}`
			});
		}
	},
	afterRequest(options) {
		if (options.hasOwnProperty("loadingMsg")) {
			wx.hideLoading();
		}
	}
};

let canRequest = options => {
	if (options.hasOwnProperty("noNeedLogin")) {
		return true;
	}

	return Boolean(wx.getStorageSync("sessionKeyInfo").token);
};

let request = (method, api, params = {}, options = {}) => {
	if (!canRequest(options)) {
		return Promise.reject({
			code: 100,
			msg: "请登录账户"
		});
	}

	return wxPromise(
		wx.request,
		{
			url: config.BASE_URL + api,
			method: method,
			data: params,
			header: createHeader()
		},
		options
	);
};

/**
 * 微信请求get方法
 */
let get = (api, params = {}, options = {}) => {
	return request("GET", api, params, options);
};

/**
 * 微信请求post方法封装
 */
let post = (api, params = {}, options = {}) => {
	return request("POST", api, params, options);
};

/**
 * 微信请求put方法封装
 */
let put = (api, params = {}, options = {}) => {
	return request("PUT", api, params, options);
};
let del = (api, params = {}, options = {}) => {
	return request("DELETE", api, params, options);
};

module.exports = {
	wxPromise: wxPromise,
	get: get,
	post: post,
	put: put,
	del: del
};
