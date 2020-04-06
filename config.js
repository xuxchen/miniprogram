/**
 * 小程序配置文件
 */
const config = {
	appId: "",
	secretKey: "", //后台分配key

	dev: {
		//开发环境
		domain: "http://127.0.0.1:8000", //后台接口地址
		picDomain: "", //图片地址
		qiniuDomain: "https://up-z2.qiniup.com" //七牛上传地址
	},
	test: {
		//测试环境
		domain: "", //后台接口地址
		picDomain: "", //图片地址
		qiniuDomain: "https://up-z2.qiniup.com" //七牛上传地址
	},
	prod: {
		//生产环境
		domain: "",
		picDomain: "",
		qiniuDomain: ""
	}
};

//开发环境 dev 、 test、prod
//上线时注意切换
let evn = config.dev;

let BASE_URL = evn.domain;
let PIC_HOST = evn.picDomain;
let QINIU_DOMAIN = evn.qiniuDomain;

let APPID = config.appId;
let SECRETKEY = config.secretKey;

module.exports = {
	// 下面的地址配合云端 Server 工作
	BASE_URL,
	APPID,
	SECRETKEY,
	PIC_HOST,
	QINIU_DOMAIN
};
