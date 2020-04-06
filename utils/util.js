import md5 from "../lib/md5";

export function formatTime(timestamp, format) {
	if (timestamp <= 0) {
		return "";
	}
	const formateArr = ["Y", "M", "D", "h", "m", "s"];
	let returnArr = [];
	let date = new Date(timestamp * 1000); //13位的时间戳,    如果不是13位的,  就要乘1000,就像这样 let date = new Date(timestamp*1000)
	let year = date.getFullYear();
	let month = date.getMonth() + 1;
	let day = date.getDate();
	let hour = date.getHours();
	let minute = date.getMinutes();
	let second = date.getSeconds();
	returnArr.push(year, month, day, hour, minute, second);
	returnArr = returnArr.map(formatNumber);
	for (var i in returnArr) {
		format = format.replace(formateArr[i], returnArr[i]);
	}
	return format;
}

const formatNumber = n => {
	n = n.toString();
	return n[1] ? n : "0" + n;
};

export function priceFormat(money) {
	if (money == undefined || isNaN(money))
		return "";

	var precision=2;
	var symbol = 1;
	if (money < 0) {
		// 符号为负
		symbol = -1;
		money *= -1
	}
	var num2 = (Math.round(money * Math.pow(10, precision))
		/ Math.pow(10, precision) + Math.pow(10, -(precision + 1)))
		.toString().slice(0, -1);

	return parseFloat(num2 * symbol).toFixed(precision)
}

/**
 * 毫秒转换友好的显示格式
 * 输出格式：21小时前
 * @param  {[type]} time [description]
 * @return {[type]}      [description]
 */
export function matDate(dateTime) {
	//获取js 时间戳
	var time = new Date().getTime();
	//去掉 js 时间戳后三位，与php 时间戳保持一致
	time = parseInt((time - dateTime * 1000) / 1000);

	//存储转换值
	var s;
	if (time < 60 * 5) {
		//5分钟内
		return "刚刚";
	} else if (time < 60 * 60 && time >= 60 * 5) {
		//超过十分钟少于1小时
		s = Math.floor(time / 60);
		return s + "分钟前";
	} else if (time < 60 * 60 * 24 && time >= 60 * 60) {
		//超过1小时少于24小时
		s = Math.floor(time / 60 / 60);
		return s + "小时前";
	} else if (time < 60 * 60 * 24 * 3 && time >= 60 * 60 * 24) {
		//超过1天少于3天内
		s = Math.floor(time / 60 / 60 / 24);
		return s + "天前";
	} else {
		//超过3天
		var date = new Date(parseInt(dateTime) * 1000);
		return (
			date.getFullYear() + "/" + (date.getMonth() + 1) + "/" + date.getDate()
		);
	}
}

export function sleep(time = 100) {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve(null);
		}, time);
	});
}

export function isIos() {
	const { system } = wx.getSystemInfoSync();
	return /IOS*/.test(system.toLocaleUpperCase());
}

export function clearSpace(data) {
	return data.replace(/\s|\n|\r/g, "");
}

export function formatMeter(distance) {
	if (distance >= 1000) {
		distance = Math.round(distance / 1000) + "km";
	} else if (distance <= 0) {
		distance = "--";
	} else {
		distance = distance + "m";
	}
	return distance;
}

export function getUpFileKey(extension) {
	let date = new Date();
	if (extension == undefined || extension == "") {
		extension = "jpg";
	}
	return (
		"sale/" +
		date.getFullYear() +
		"/" +
		(date.getMonth() + 1) +
		"/" +
		date.getDate() +
		"/" +
		md5.hexMD5("sale-tool" + date.getTime() + "file").substr(0, 10) +
		"." +
		extension
	);
}

export function strToTime(date) {
	date = new Date(Date.parse(date.replace(/-/g, "/")));
	date = date.getTime() / 1000;
	return parseInt(date);
}

export function strToInt(date) {
	if(isNaN(date)){
		return 0;
	}
	return parseInt(date);
}

export function strToFloat(date) {
	if(isNaN(date)){
		return 0;
	}
	return parseFloat(date);
}

export function isPriceNumber(_keyword) {
	if (
		_keyword == "0" ||
		_keyword == "0." ||
		_keyword == "0.0" ||
		_keyword == "0.00"
	) {
		_keyword = "0";
		return true;
	} else {
		var index = _keyword.indexOf("0");
		var length = _keyword.length;
		if (index == 0 && length > 1) {
			/*0开头的数字串*/
			var reg = /^[0]{1}[.]{1}[0-9]{1,2}$/;
			if (!reg.test(_keyword)) {
				return false;
			} else {
				return true;
			}
		} else {
			/*非0开头的数字*/
			var reg = /^[1-9]{1}[0-9]{0,10}[.]{0,1}[0-9]{0,2}$/;
			if (!reg.test(_keyword)) {
				return false;
			} else {
				return true;
			}
		}
		return false;
	}
}

export function checkSocialCreditCode(Code) {
	var patrn = /^[0-9A-Z]+$/;
	//18位校验及大写校验
	if (Code.length != 18 || patrn.test(Code) == false) {
		console.info("不是有效的统一社会信用编码！");
		return false;
	} else {
		var Ancode; //统一社会信用代码的每一个值
		var Ancodevalue; //统一社会信用代码每一个值的权重
		var total = 0;
		var weightedfactors = [
			1,
			3,
			9,
			27,
			19,
			26,
			16,
			17,
			20,
			29,
			25,
			13,
			8,
			24,
			10,
			30,
			28
		]; //加权因子
		var str = "0123456789ABCDEFGHJKLMNPQRTUWXY";
		//不用I、O、S、V、Z
		for (var i = 0; i < Code.length - 1; i++) {
			Ancode = Code.substring(i, i + 1);
			Ancodevalue = str.indexOf(Ancode);
			total = total + Ancodevalue * weightedfactors[i];
			//权重与加权因子相乘之和
		}
		var logiccheckcode = 31 - (total % 31);
		if (logiccheckcode == 31) {
			logiccheckcode = 0;
		}
		var Str = "0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,J,K,L,M,N,P,Q,R,T,U,W,X,Y";
		var Array_Str = Str.split(",");
		logiccheckcode = Array_Str[logiccheckcode];

		var checkcode = Code.substring(17, 18);
		if (logiccheckcode != checkcode) {
			console.info("不是有效的统一社会信用编码！");
			return false;
		} else {
			console.info("yes");
		}
		return true;
	}
}

// 函数参数必须是字符串，因为二代身份证号码是十八位，而在javascript中，十八位的数值会超出计算范围，造成不精确的结果，导致最后两位和计算的值不一致，从而该函数出现错误。
// 详情查看javascript的数值范围
export function checkIDCard(idcode) {
	// 加权因子
	var weight_factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
	// 校验码
	var check_code = ["1", "0", "X", "9", "8", "7", "6", "5", "4", "3", "2"];

	var code = idcode + "";
	var last = idcode[17]; //最后一个

	var seventeen = code.substring(0, 17);

	// ISO 7064:1983.MOD 11-2
	// 判断最后一位校验码是否正确
	var arr = seventeen.split("");
	var len = arr.length;
	var num = 0;
	for (var i = 0; i < len; i++) {
		num = num + arr[i] * weight_factor[i];
	}

	// 获取余数
	var resisue = num % 11;
	var last_no = check_code[resisue];

	// 格式的正则
	// 正则思路
	/*
    第一位不可能是0
    第二位到第六位可以是0-9
    第七位到第十位是年份，所以七八位为19或者20
    十一位和十二位是月份，这两位是01-12之间的数值
    十三位和十四位是日期，是从01-31之间的数值
    十五，十六，十七都是数字0-9
    十八位可能是数字0-9，也可能是X
    */
	var idcard_patter = /^[1-9][0-9]{5}([1][9][0-9]{2}|[2][0][0|1][0-9])([0][1-9]|[1][0|1|2])([0][1-9]|[1|2][0-9]|[3][0|1])[0-9]{3}([0-9]|[X])$/;

	// 判断格式是否正确
	var format = idcard_patter.test(idcode);

	// 返回验证结果，校验码和格式同时正确才算是合法的身份证号码
	return last === last_no && format;
}

//判断是否为空
export const isNull = str => {
	if (str == null || str == undefined || str == "") {
		return true;
	} else {
		return false;
	}
};
// 分享函数
export const shareEvent = (option, obj) => {
	let shareObj = {
		title: isNull(obj.shareTitle)
			? "店助手正在举行优惠活动，快来参加呀！"
			: obj.shareTitle,
		path: isNull(obj.path) ? getCurrentPageUrlWithArgs() : obj.path,
		imageUrl: obj.imgUrl,
		success(res) {
			// 转发成功之后的回调
			if (res.errMsg == "shareAppMessage:ok") {
			}
		},

		fail(res) {
			// 转发失败之后的回调
			if (res.errMsg == "shareAppMessage:fail cancel") {
				// 用户取消转发
			} else if (res.errMsg == "shareAppMessage:fail") {
				// 转发失败，其中 detail message 为详细失败信息
			}
		},

		complete() {
			// 转发结束之后的回调（转发成不成功都会执行）
		}
	};
	// console.log(shareObj.imgUrl)
	if (option.from === "button") {
		// 来自页面内转发按钮
		console.log(option.target);
	}
	return shareObj;
};

/*获取当前页url*/
export const getCurrentPageUrl = () => {
	var pages = getCurrentPages(); //获取加载的页面
	var currentPage = pages[pages.length - 1]; //获取当前页面的对象
	var url = currentPage.route; //当前页面url
	return url;
};

/*获取当前页带参数的url*/
export const getCurrentPageUrlWithArgs = () => {
	var pages = getCurrentPages(); //获取加载的页面
	var currentPage = pages[pages.length - 1]; //获取当前页面的对象
	var url = currentPage.route; //当前页面url
	var options = currentPage.options; //如果要获取url中所带的参数可以查看options

	//拼接url的参数
	var urlWithArgs = url + "?";
	for (var key in options) {
		var value = options[key];
		urlWithArgs += key + "=" + value + "&";
	}
	urlWithArgs = urlWithArgs.substring(0, urlWithArgs.length - 1);

	return urlWithArgs;
};

export function sectionToChinese(section) {
	var chnStr = "";
	var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

	if (section < 10) {
		chnStr = chnNumChar[section];
	}
	return chnStr;
}

export function getRandom(max, min) {
	min = arguments[1] || 0;
	return Math.floor(Math.random() * (max - min + 1) + min);
}