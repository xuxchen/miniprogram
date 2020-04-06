// app.js
import LoginService from "./serivce/LoginService";
import wxtool from "./utils/wxtool";
import { navigate } from "./utils/router";

App({
	globalData: {
		// 系统设备信息
		systemInfo: null,
		// jsCode
		jsCode: null,

		// 用户信息
		userInfo: null,

		// sessionKey,openid,unionid
		sessionKeyInfo: null,

		// 地理位置信息
		location: null,
		//当前城市
		currentCity: null,
		//搜索keyword
		keyword: "",

		goBackPath: null,
		share: false, // 分享默认为false
		height: 0
	},

	onLaunch: function(options) {
		// 获取设备信息
		wxtool.getSystemInfo({
			thisData: this.globalData
		});
		wxtool.getLocation({
			thisData: this.globalData
		});
		let loginService = new LoginService();
		// 检查openid
		loginService.checkOpenId({
			thisData: this.globalData
		});
	},
	onShow: function(options) {
		console.log(options);
	},
	onHide: function() {},

	isLogined: function() {
		return Boolean(this.getLoginUser().token);
	},
	getLoginUser: function() {
		return wx.getStorageSync("sessionKeyInfo") || {};
	},
	updateLoginUser: function(loginUser) {
		return wx.setStorage({
			key: "sessionKeyInfo",
			data: {
				...this.getLoginUser(),
				...loginUser
			}
		});
	},
	checkLogined: function() {
		const isLogin = this.isLogined();
		if (!isLogin) {
			wxtool.showToast({
				type: "warm",
				title: "请登录"
			});
			setTimeout(function() {
				navigate({
					path: "page/login/login"
				});
			}, 1500);
			return false;
		}
		return true;
	}
});
