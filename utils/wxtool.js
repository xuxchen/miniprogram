import { wxPromise } from "./wxhttp";
import CommonService from "../serivce/CommonService";
import config from "../config";

// 模拟弹框
let wxShowModal = param => {
	param = typeof param == "undefined" ? {} : param;
	return new Promise((resolve, reject) => {
		param.success = function(res) {
			if (res.confirm) {
				resolve(res);
			} else if (res.cancel) {
				reject(res);
			}
		};
		param.fail = function(res) {
			reject(res);
		};
		wx.showModal(param);
	});
};

let wxLogin = () => wxPromise(wx.login);
let wxGetStorage = param => wxPromise(wx.getStorage, param);
let wxOpenSetting = param => wxPromise(wx.openSetting, param);
let wxGetSetting = param => wxPromise(wx.getSetting, param);
let wxAuthorize = param => wxPromise(wx.authorize, param);
let wxGetSystemInfo = param => wxPromise(wx.getSystemInfo, param);
let wxGetUserInfo = param => wxPromise(wx.getUserInfo, param);
let wxChooseAddress = param => wxPromise(wx.chooseAddress, param);
let wxGetLocation = param => wxPromise(wx.getLocation, param);
let wxUploadFile = param => wxPromise(wx.uploadFile, param);
let wxChooseImage = param => wxPromise(wx.chooseImage, param);
let wxSaveFile = param => wxPromise(wx.saveFile, param);
let wxGetImageInfo = param => wxPromise(wx.getImageInfo, param);
let wxGetSavedFileList = param => wxPromise(wx.getSavedFileList, param);
let wxCanvasToTempFilePath = param => wxPromise(wx.canvasToTempFilePath, param);
let wxPayment = param => wxPromise(wx.requestPayment, param);

/*
* 获取过去某个时间到当前时间的时间差
*/
let getDeltaT = param => {
	let currentTime = new Date().getTime(),
		time = new Date(Number(param.time)).getTime(),
		type = typeof param.type == "undefined" ? "millisecond" : param.type,
		deltaT = currentTime - time;

	switch (type) {
		case "millisecond":
			return deltaT;
			break;
		case "day":
			return Math.floor(deltaT / 86400000);
			break;
		case "hour":
			return Math.floor(deltaT / 3600000);
			break;
		case "minute":
			return Math.floor(deltaT / 60000);
			break;
		case "second":
			return Math.floor(deltaT / 1000);
			break;
	}
};

/*
* 显示提示弹窗
*/
let showToast = param => {
	let type = typeof param.type == "undefined" ? success : param.type,
		title = param.title,
		imageSrc = "";

	switch (type) {
		case "hint":
			imageSrc = "/image/ico-hint.png";
			break;
		case "success":
			imageSrc = "";
			break;
		case "warm":
			imageSrc = "/image/ico-warm.png";
			break;
	}
	wx.showToast({
		title: title,
		image: imageSrc,
		duration: 1500
	});
};

/**
 * 分享功能无法使用的时候，弹窗提示
 */
let showModalUnusableShare = () => {
	wx.showModal({
		title: "微信版本过低",
		content: "您的微信版本过低，暂无法使用当前按钮分享。请先升级到最新版微信！",
		showCancel: false,
		confirmText: "知道了",
		success: res => {}
	});
};

/*
* 打开设置
*/
let openSetting = param => {
	let type = param.type,
		text = param.text;

	return wxShowModal({
		title: "需要您的授权",
		showCancel: true,
		content: text
	}).then(res => {
		if (res.confirm) {
			return wxOpenSetting({
				scope: `scope.${type}`
			})
				.then(res => {
					if (res.authSetting[`scope.${type}`]) {
						showToast({
							type: "success",
							title: "授权成功"
						});
					} else {
						showToast({
							type: "warm",
							title: "授权失败"
						});
					}
					return res;
				})
				.catch(err => {
					showToast({
						type: "warm",
						title: "授权失败"
					});
					return err;
				});
		} else {
			showToast({
				type: "warm",
				title: "授权失败"
			});
			return res;
		}
	});
};

/*
**  获取设备环境信息
*/

let getSystemInfo = param => {
	let thisData = param.thisData;

	if (!thisData.systemInfo) {
		let fromCache = typeof param.fromCache == "undefined" ? true : false;
		let returnPro = function() {
			return wxGetSystemInfo()
				.then(res => {
					let resJson = {};
					resJson.model = res.model; // 手机型号
					resJson.pixelRatio = res.pixelRatio; // 设备像素比
					resJson.screenWidth = res.screenWidth; // 屏幕宽度
					resJson.screenHeight = res.screenHeight; // 屏幕高度
					resJson.windowHeight = res.windowHeight; // 可用屏幕高度
					resJson.windowWidth = res.windowWidth; // 可用屏幕高度
					resJson.version = res.version; // 微信版本号
					resJson.system = res.system; // 操作系统版本
					resJson.platform = res.platform; // 客户端平台

					// 客户端基础库版本
					let pattern = /(\d+).(\d+).(\d+)/;
					resJson.SDKVersion = [];
					res.SDKVersion.match(pattern);
					resJson.SDKVersion[0] = RegExp.$1;
					resJson.SDKVersion[1] = RegExp.$2;
					resJson.SDKVersion[2] = RegExp.$3;

					// 根据客户的基础库版本赋值
					if (resJson.SDKVersion[0] >= 1) {
						if (resJson.SDKVersion[1] >= 2) {
							// 判断是否启用页内分享
							resJson.shareButtonOpenType = "share";
							// 手机品牌	1.5.0
							resJson.brand = resJson.SDKVersion[1] >= 5 ? res.brand : "未知";
						} else {
							resJson.shareButtonCatchTap = "showModalUnusableShare";
						}
					}

					// 赋值并缓存
					thisData.systemInfo = resJson;
					wx.setStorage({
						key: "systemInfo",
						data: resJson
					});
					return resJson;
				})
				.catch(err => {
					console.log("获取系统信息失败");
					return false;
				});
		};

		// 开始
		if (fromCache) {
			return wxGetStorage({
				key: "systemInfo"
			})
				.then(res => {
					thisData.systemInfo = res.data;
					return res.data;
				})
				.catch(err => {
					return returnPro();
				});
		} else {
			return returnPro();
		}
	} else {
		return new Promise(resolve => {
			resolve(thisData.systemInfo);
		});
	}
};

/*
* 获取授权信息
*/
let getAuthorize = param => {
	let thisData = param.thisData,
		type = param.type;

	return getSystemInfo({
		thisData: thisData
	})
		.then(res => {
			if (
				res.SDKVersion[0] > 1 ||
				(res.SDKVersion[0] >= 1 && res.SDKVersion[1] >= 2)
			) {
				return wxGetSetting().then(res => {
					let authSetting = res.authSetting[`scope.${type}`];

					if (authSetting === true) {
						return res;
					} else if (authSetting === undefined) {
						return wxAuthorize({
							scope: `scope.${type}`
						})
							.then(res => {
								return res;
							})
							.catch(err => {
								return err;
							});
					} else if (authSetting === false) {
						let textType = "";
						switch (param.type) {
							case "userInfo":
								textType = "用户信息";
								break;
							case "userLocation":
								textType = "地理位置";
								break;
							case "address":
								textType = "通讯录";
								break;
							case "record":
								textType = "录音功能";
								break;
							case "writePhotosAlbum":
								textType = "保存到相册";
								break;
						}
						return openSetting({
							type: type,
							text: `为提升您的使用体验和确保程序正常运行，需要获取您的 ${textType} 的授权`
						});
					}
				});
			} else {
				wx.showModal({
					title: "微信版本过低",
					content:
						"当前微信版本过低，不能使用该功能，请手动更新到最新版微信重试。"
				});
				return new Promise(resolve => {
					resolve(res);
				});
			}
		})
		.catch(err => err);
};

/*
* 微信客户端获取用户信息
*/

let getUserInfo = param => {
	let thisData = param.thisData,
		fromCache = typeof param.fromCache == "undefined" ? true : param.fromCache,
		manTrig = typeof param.manTrig == "undefined" ? false : param.manTrig;

	// 客户端获取
	let getUserInfoLine = () => {
		if (manTrig) {
			return getAuthorize({
				thisData: thisData,
				type: "userInfo"
			})
				.then(res => {
					return wxGetUserInfo({ withCredentials: true });
				})
				.then(res => {
					wx.setStorage({
						key: "userInfo",
						data: res
					});
					thisData.userInfo = res;
					return res;
				})
				.catch(err => err);
		} else {
			return wxGetUserInfo({ withCredentials: true })
				.then(res => {
					wx.setStorage({
						key: "userInfo",
						data: res
					});
					thisData.userInfo = res;
					return res;
				})
				.catch(err => err);
		}
	};
	// 开始
	if (fromCache) {
		if (!thisData.userInfo) {
			return wxGetStorage({ key: "userInfo" })
				.then(res => {
					return res.data;
				})
				.catch(err => {
					return getUserInfoLine();
				});
		} else {
			return new Promise(resolve => {
				resolve(thisData.userInfo);
			});
		}
	} else {
		return getUserInfoLine();
	}
};

/*
* 是否显示获取用户信息的按钮
*/
let showUserInfoBtn = () => {
	return wxGetSetting()
		.then(res => {
			let authSetting = res.authSetting["scope.userInfo"];
			if (authSetting === undefined || authSetting === false) {
				return true;
			} else {
				return new Promise((resolve, reject) => {
					reject(false);
				});
			}
		})
		.catch(err => {
			return new Promise((resolve, reject) => {
				reject(false);
			});
		});
};

/*
* 获取jsCode
*/
let getJsCode = param => {
	let thisData = param.thisData,
		fromCache = typeof param.fromCache == "undefined" ? true : param.fromCache;

	// 微信登录
	let startGetJsCode = () => {
		return wxLogin()
			.then(res => {
				console.log(res);
				let jsCode = {};
				jsCode.time = new Date().getTime();
				jsCode.code = res.code;
				thisData.jsCode = jsCode;
				wx.setStorage({
					key: "jsCode",
					data: jsCode
				});
				return jsCode;
			})
			.catch(err => {
				console.log(err);
			});
	};

	// 开始
	if (fromCache) {
		if (!thisData.jsCode) {
			return startGetJsCode();
		} else {
			let jsCodeIndate = new Date().getTime() - thisData.jsCode.time;
			if (jsCodeIndate < 250000) {
				return new Promise(resolve => {
					resolve(thisData.jsCode);
				});
			} else {
				return wxGetStorage({ key: "jsCode" }).then(res => {
					jsCodeIndate = new Date().getTime() - res.data.time;
					if (jsCodeIndate < 250000) {
						return new Promise(resolve => {
							resolve(res.data);
						});
					} else {
						return startGetJsCode();
					}
				});
			}
		}
	} else {
		return startGetJsCode();
	}
};

/*
* 根据经纬度，打开地图
*/

let openMap = param => {
	let thisData = param.thisData,
		latitude = param.latitude,
		longitude = param.longitude,
		name = param.name,
		address = param.address;

	getAuthorize({
		thisData: thisData,
		type: "userLocation"
	})
		.then(res => {
			wx.openLocation({
				latitude: latitude,
				longitude: longitude,
				name: name,
				address: address
			});
		})
		.catch(err => {
			showToast({
				type: "warm",
				title: "打开地图失败"
			});
		});
};

/*
* 获取微信地址
*/
let getLocation = param => {
	let thisData = param.thisData,
		fromCache = typeof param.fromCache == "undefined" ? true : param.fromCache;

	// 微信登录
	let startGetLocation = () => {
		return wxGetLocation({ type: "gcj02" })
			.then(lb => {
				console.log(lb);
				wx.request({
					// ②百度地图API，将微信获得的经纬度传给百度，获得城市等信息
					url:
						"https://api.map.baidu.com/geocoder/v2/?ak=" +
						config.BAIDU_APPAK +
						"&location=" +
						lb.latitude +
						"," +
						lb.longitude +
						"&output=json&coordtype=wgs84ll",
					data: {},
					header: {
						"Content-Type": "application/json"
					},
					success: function(res) {
						console.log(res);
						if (typeof res != "undefined" && res.data.status == 0) {
							let city = res.data.result.addressComponent.city;
							let adcode = res.data.result.addressComponent.adcode;
							city = city.substring(0, city.length - 1);
							adcode = adcode.substring(0, adcode.length - 2);

							let result = {
								latLng: lb.latitude + "," + lb.longitude,
								city: city,
								cityCode: adcode
							};
							thisData.location = result;
							wx.setStorage({
								key: "location",
								data: result
							});
							wx.setStorage({
								key: "current",
								data: {
									city: result.city,
									cityCode: result.cityCode
								}
							});

							return result;
						}
					}
				});
				return true;
			})
			.catch(err => {
				console.log(err);
				if (err.errMsg == "getLocation:fail auth deny") {
					wx.navigateTo({
						url: "/page/city/setting"
					});
				}
			});
	};
	// 开始
	if (fromCache) {
		if (!thisData.location) {
			return wxGetStorage({ key: "location" })
				.then(res => {
					return res.data;
				})
				.catch(err => {
					return startGetLocation();
				});
		} else {
			return new Promise(resolve => {
				resolve(thisData.location);
			});
		}
	} else {
		return startGetLocation();
	}
};

//获取用户地理位置权限
let getUserLocation = obj => {
	wx.chooseLocation({
		success: function(lb) {
			console.log(lb);
			wx.request({
				// ②百度地图API，将微信获得的经纬度传给百度，获得城市等信息
				url:
					"https://api.map.baidu.com/geocoder/v2/?ak=" +
					config.BAIDU_APPAK +
					"&location=" +
					lb.latitude +
					"," +
					lb.longitude +
					"&output=json&coordtype=wgs84ll",
				data: {},
				header: {
					"Content-Type": "application/json"
				},
				success: function(res) {
					console.log(res);
					if (typeof res != "undefined" && res.data.status == 0) {
						const addStr =
							res.data.result.addressComponent.city +
							res.data.result.addressComponent.district +
							"·" +
							lb.name;
						let adcode = res.data.result.addressComponent.adcode;
						adcode = adcode.substring(0, adcode.length - 2);

						let result = {
							province: res.data.result.addressComponent.province,
							city: res.data.result.addressComponent.city,
							cityCode: adcode,
							district: res.data.result.addressComponent.district,
							business: res.data.result.business,
							latitude: lb.latitude,
							longitude: lb.longitude,
							address: lb.address,
							addressName: addStr
						};

						obj.LocationCallBack(result);
					}
				},
				fail: function() {
					this.showToast({
						type: "warm",
						title: "获取位置失败"
					});
				}
			});
		},
		fail: function() {
			wx.getSetting({
				success: function(res) {
					var statu = res.authSetting;
					if (!statu["scope.userLocation"]) {
						wx.showModal({
							title: "是否授权当前位置",
							content:
								"需要获取您的地理位置，请确认授权，否则地图功能将无法使用",
							success: function(tip) {
								if (tip.confirm) {
									wx.openSetting({
										success: function(data) {
											if (data.authSetting["scope.userLocation"] === true) {
												wx.showToast({
													title: "授权成功",
													icon: "success",
													duration: 1000
												});
												//授权成功之后，再调用chooseLocation选择地方
												wx.chooseLocation({
													success: function(lb) {
														wx.request({
															// ②百度地图API，将微信获得的经纬度传给百度，获得城市等信息
															url:
																"https://api.map.baidu.com/geocoder/v2/?ak=" +
																config.BAIDU_APPAK +
																"&location=" +
																lb.latitude +
																"," +
																lb.longitude +
																"&output=json&coordtype=wgs84ll",
															data: {},
															header: {
																"Content-Type": "application/json"
															},
															success: function(res) {
																console.log(res);
																if (
																	typeof res != "undefined" &&
																	res.data.status == 0
																) {
																	const addStr =
																		res.data.result.addressComponent.city +
																		res.data.result.addressComponent.district +
																		"·" +
																		lb.name;
																	let adcode =
																		res.data.result.addressComponent.adcode;
																	adcode = adcode.substring(
																		0,
																		adcode.length - 2
																	);

																	let result = {
																		province:
																			res.data.result.addressComponent.province,
																		city: res.data.result.addressComponent.city,
																		cityCode: adcode,
																		district:
																			res.data.result.addressComponent.district,
																		business: res.data.result.business,
																		latitude: lb.latitude,
																		longitude: lb.longitude,
																		address: lb.address,
																		addressName: addStr
																	};

																	obj.LocationCallBack(result);
																}
															},
															fail: function() {
																this.showToast({
																	type: "warm",
																	title: "获取位置失败"
																});
															}
														});
													}
												});
											} else {
												wx.showToast({
													title: "授权失败",
													icon: "success",
													duration: 1000
												});
											}
										}
									});
								}
							}
						});
					}
				},
				fail: function(res) {
					wx.showToast({
						title: "调用授权窗口失败",
						icon: "success",
						duration: 1000
					});
				}
			});
		}
	});
};

/**
 * 获取短信验证码
 */
let getSmsCode = param => {
	let that = param.that;
	if (!that.data.messageCodeBtnDisabled) {
		let phone = param.phone,
			isTest = typeof param.isTest == "undefined" ? false : param.isTest,
			time = 60,
			msgPhone = wx.getStorageSync(`msgPhone${phone}`);

		// 设置获取验证码按钮文字
		let setMsgText = () => {
			that.setData({
				messageCodeBtnDisabled: true,
				messageCodeBtnColor: "#999",
				messageCodeBtnText: `${time}s`
			});

			let timer = setInterval(() => {
				time = time - 1;
				if (time <= 0) {
					clearInterval(timer);
					wx.removeStorageSync(`msgPhone${phone}`);
					that.setData({
						messageCodeBtnDisabled: false,
						messageCodeBtnColor: "",
						messageCodeBtnText: "获取验证码",
						messageCodeBtnTimer: ""
					});
				} else {
					that.setData({
						messageCodeBtnText: `${time}s`,
						messageCodeBtnTimer: timer
					});
				}
			}, 1000);
		};

		// 请求短信验证码
		let getMsg = () => {
			const commonService = new CommonService();
			return commonService
				.sendCode(phone)
				.then(res => {
					showToast({
						type: "success",
						title: "验证码发送成功"
					});
					let msgCache = {
						phone: phone,
						time: new Date().getTime()
					};
					wx.setStorage({
						key: `msgPhone${phone}`,
						data: msgCache
					});
					return res;
				})
				.catch(err => {
					showToast({
						type: "warm",
						title: "验证码发送失败"
					});
					time = 0;
					return err;
				})
				.finally(() => {});
		};

		// 该号码获取过验证码且未超过60S
		if (msgPhone && msgPhone.time) {
			let msgPhoneTime = Math.floor(getDeltaT({ time: msgPhone.time }) / 1000);
			if (isTest) {
				if (msgPhoneTime < 60) {
					time = time - msgPhoneTime;
					setMsgText();
				} else {
					wx.removeStorageSync(`msgPhone${phone}`);
				}
			} else {
				if (msgPhoneTime < 60) {
					time = time - msgPhoneTime;
					setMsgText();
				} else {
					setMsgText();
					getMsg();
					wx.removeStorageSync(`msgPhone${phone}`);
				}
			}
		} else if (!isTest) {
			setMsgText();
			getMsg();
		}
	}
};

/**
 * 上传图片到七牛
 * @param param
 * @returns {Promise|Promise.<TResult>|*}
 */
let qiniuUpload = param => {
	const commonService = new CommonService();
	return commonService.uploadToken().then(res => {
		let token = res;
		let upParam = {};
		let formData = {
			token: token,
			key: param.key
		};
		upParam.url = "https://up-z2.qiniup.com";
		upParam.filePath = param.filePath;
		upParam.name = "file";
		upParam.header = {
			"Content-Type": "multipart/form-data"
		};
		upParam.formData = formData;
		return wxUploadFile(upParam);
	});
};

module.exports = {
	wxLogin: wxLogin,
	showToast: showToast,
	wxShowModal: wxShowModal,
	wxOpenSetting: wxOpenSetting,
	wxGetSetting: wxGetSetting,
	wxUploadFile: wxUploadFile,
	wxChooseAddress: wxChooseAddress,
	wxGetLocation: wxGetLocation,
	wxChooseImage: wxChooseImage,
	wxSaveFile: wxSaveFile,
	wxGetImageInfo: wxGetImageInfo,
	wxGetSavedFileList: wxGetSavedFileList,
	wxCanvasToTempFilePath: wxCanvasToTempFilePath,
	wxPayment: wxPayment,

	getDeltaT: getDeltaT,
	wxGetStorage: wxGetStorage,
	getSystemInfo: getSystemInfo,
	showModalUnusableShare: showModalUnusableShare,
	getUserLocation: getUserLocation,

	getUserInfo: getUserInfo,
	getLocation: getLocation,
	showUserInfoBtn: showUserInfoBtn,
	openSetting: openSetting,
	getJsCode: getJsCode,
	openMap: openMap,
	getSmsCode: getSmsCode,
	qiniuUpload: qiniuUpload
};
