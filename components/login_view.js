// components/get_user_info.js
import LoginService from "../serivce/LoginService";

const app = getApp();
const callbacks = [];

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {
		payload: {
			type: null,
			value: null
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {
		isLogin: true
	},

	ready() {
		const isLogined = app.isLogined();
		if (!isLogined) {
			callbacks.push(() => {
				this.setData({
					isLogin: true
				});
			});
		}
		// 已经登陆了不再受用getUserinfo接口，这个微信有点慢
		this.setData({
			isLogin: app.isLogined()
		});
	},
	/**
	 * 组件的方法列表
	 */
	methods: {
		getPhoneNumber(e) {
			const wxService = new WxService();
			const loginService = new LoginService();
			const userInfo = loginService.getUserInfo();
			if (userInfo && userInfo.openid) {
				this.triggerEvent("onLoginSuccess", {
					userInfo,
					payload: this.data.payload
				});
				return;
			}
			if (e.detail.errMsg !== "getPhoneNumber:ok") {
				wx.showModal({
					title: "授权失败",
					content: "请重新操作",
					showCancel: false,
					onConfirm: () => {
						this.triggerEvent("onLoginFail", {});
					}
				});
			} else {
				const { encryptedData, iv } = e.detail;
				wx.showLoading({
					title: "登陆中"
				});
				/*wxService
          .getCode()
          .then(code => loginService.getOpenId(code))
          .then(({ openId }) =>
            loginService.loginWithWeChat(openId, encryptedData, iv)
          )
          .then(userInfo => {
            console.log(userInfo);
            callbacks.forEach(cb => cb());
            wx.hideLoading();
            app.updateLoginUser(userInfo);
            this.triggerEvent("onLoginSuccess", {
              userInfo,
              payload: this.data.payload
            });
          })
          .catch(err => {
            console.log(err);
            wx.hideLoading();
            this.triggerEvent("onLoginFail", { err });
          });*/
			}
		},
		handleTap() {
			const loginService = new LoginService();
			const userInfo = loginService.getUserInfo();
			console.log(userInfo);
			this.triggerEvent("onLoginSuccess", {
				userInfo,
				payload: this.data.payload
			});
		}
	}
});
