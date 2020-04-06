import wxtool from "../../utils/wxtool";
import { PIC_HOST } from "../../config";
const util = require("../../utils/util.js");

Component({
	properties: {
		content: {
			type: String
		},
		isRead: {
			type: Boolean,
			value: false
		}
	},
	data: {
		logs: "",
		formats: {}
	},
	observers: {
		content: function(content) {
			var c = this;
			c.setData({
				logs:
					c.data.logs +
					"observed: content.length=" +
					(content || "").length +
					"; "
			});
			if (content) {
				if (c.data.intervalId) {
					clearInterval(c.data.intervalId);
				}
				if (c.editorCtx) {
					c.setContents(content);
				} else {
					var intervalId = setInterval(function() {
						if (c.editorCtx) {
							c.setContents(content);
							clearInterval(c.data.intervalId);
						} else {
							console.log("editorContext is not ready, retry 50ms later");
						}
					}, 500);
					c.setData({
						intervalId: intervalId
					});
				}
			}
		}
	},

	lifetimes: {
		created() {
			wx.loadFontFace({
				family: "Pacifico",
				source: "/style/Pacifico.ttf",
				success: console.log
			});
		}
	},

	methods: {
		onEditorReady() {
			const that = this;
			that
				.createSelectorQuery()
				.select("#editor")
				.context(function(res) {
					that.editorCtx = res.context;
				})
				.exec();
		},
		setContents: function(content) {
			this.editorCtx.setContents({
				html: content,
				success: function() {
					console.log("insert html success");
				}
			});
		},
		blur() {
			this.editorCtx.blur();
		},
		format(e) {
			let { name, value } = e.target.dataset;
			if (!name) return;
			console.log("format", name, value);
			this.editorCtx.format(name, value);
		},
		removeFormat() {
			this.editorCtx.removeFormat();
		},
		onStatusChange(e) {
			const formats = e.detail;
			this.setData({ formats });
		},
		handleContentInput(e) {
			const value = e.detail.html;
			//要将图片的头http://*.*.*.去掉/at/g
			// let reg = new RegExp(config.attachmenturl, "g")
			// this.data.content = value.replace(reg, '');
			this.triggerEvent("setContent", { value: value });
		},
		insertImage() {
			const that = this;
			wx.chooseImage({
				count: 1,
				success: function(res) {
					const tempFiles = res.tempFiles;
					for (let v of tempFiles) {
						console.log(v.path + ",size:" + v.size);
						if (v.size > 2048000) {
							wxtool.showToast({
								type: "warm",
								title: "图片超过2M"
							});
							return;
						}
					}
					let fileKey = util.getUpFileKey();
					let flag = true;
					wxtool
						.qiniuUpload({ filePath: res.tempFilePaths[0], key: fileKey })
						.catch(err => {
							let msg = err.msg || "图片上传失败";
							wxtool.showToast({
								type: "warm",
								title: msg
							});
							flag = false;
						});
					if (!flag) {
						return;
					}
					let timg = PIC_HOST + "/" + fileKey;
					that.editorCtx.insertImage({
						src: timg,
						// width: '80%',
						success: function() {
							console.log("insert image success");
						}
					});
				}
			});
		}
	}
});
