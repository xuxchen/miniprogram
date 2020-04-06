/**
 * 这里重新封装了导航方法，navigate、redirect、switchTab、reLaunch分别对应着微信的导航方法，
 * 与微信提供的API不通过的是，这里参数data里面的path是静态配置，即app.json文件的页面路径；
 * params为链接查询参数；
 * @example
 * navigate({
 *      path:'pages/index/index',
 *      params:{
 *          id:123
 *      }
 * });//跳转到index页面，index页面的options可以读取到id。
 *
 */

/**
 * 保留当前页面，跳转到应用内的某个页面
 * @param data
 */
export function navigate(data = {}) {
	return route(data, "navigateTo");
}

/**
 * 关闭当前页面，跳转到应用内的某个页面
 * @param data
 */
export function redirect(data = {}) {
	return route(data, "redirectTo");
}

/**
 * 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
 * @param data
 */
export function switchTab(data = {}) {
	return route(data, "switchTab");
}

/**
 * 后退
 * @param param
 */
export function goBack(param = 2) {
	wx.navigateBack({
		delta: param
	});
}

/**
 * 关闭所有页面，打开到应用内的某个页面
 * @param data
 */
export function reLaunch(data = {}) {
	return route(data, "reLaunch");
}

function joinPath(index, url) {
	let str = "";
	for (let i = 0; i < index - 1; i++) {
		str += "../";
	}
	return str + url;
}

function route(data, method) {
	try {
		const { length } = getCurrentPages();
		const currentRoute = getCurrentPages()[length - 1]
			? getCurrentPages()[length - 1].route
			: "";
		if (data.path === currentRoute) {
			return;
		}
		const pathIndex = currentRoute.split("/").length;
		const path = joinPath(pathIndex, data.path);
		const url = joinParams(data.params, path);
		const obj = { ...data, url };
		console.log(obj);
		wx[method].call(null, obj);
	} catch (e) {
		console.log(e);
	}
}

export function joinParams(params, url) {
	if (!params) {
		return url;
	}
	const keys = Object.keys(params);
	let finalUrl = "";
	if (keys.length === 0) {
		return url;
	}
	if (url.indexOf("?") === -1) {
		finalUrl = keys.reduce(
			(url, key) => `${url + key}=${params[key]}&`,
			`${url}?`
		);
	} else if (url.endsWith("?")) {
		finalUrl = keys.reduce((url, key) => `${url + key}=${params[key]}&`, url);
	} else if (url.endsWith("&")) {
		finalUrl = keys.reduce((url, key) => `${url + key}=${params[key]}&`, url);
	} else {
		finalUrl = keys.reduce(
			(url, key) => `${url + key}=${params[key]}&`,
			`${url}&`
		);
	}

	return finalUrl.endsWith("&")
		? finalUrl.slice(0, finalUrl.length - 1)
		: finalUrl;
}
