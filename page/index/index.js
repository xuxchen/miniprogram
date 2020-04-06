Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		windowWidth: 0,
		windowHeight: 0,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function(options) {
		var that = this;
		// 把设备的尺寸赋值给画布，以做到全屏效果
		wx.getSystemInfo({
			success: function(res) {
				that.setData({
					windowWidth: res.windowWidth,
					windowHeight: res.windowHeight
				});
			}
		});
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function() {},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide: function() {},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload: function() {},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh: function() {},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom: function() {},
});
