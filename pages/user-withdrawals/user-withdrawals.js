// pages/user-withdrawals/user-withdrawals.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
   allmoney:0,
   tixianValue:'' 
  },
  bindtoproblem: function(){
    wx.navigateTo({
      url: "../user-problem/user-problem"
    });
  },
  //金额监听
  bindListenTixian:function(e){
    var regStrs = [
      ['^0(\\d+)$', '$1'], //禁止录入整数部分两位以上，但首位为0
      ['[^\\d\\.]+$', ''], //禁止录入任何非数字和点
      ['\\.(\\d?)\\.+', '.$1'], //禁止录入两个以上的点
      ['^(\\d+\\.\\d{2}).+', '$1'] //禁止录入小数点后两位以上
    ];

    for (var i = 0; i < regStrs.length; i++) {
      var reg = new RegExp(regStrs[i][0]);
      e.detail.value = e.detail.value.replace(reg, regStrs[i][1]);
    }
    


    this.setData({
      tixianValue: e.detail.value,
    })
  },
  //点击全部提现
  bindAlltixian:function(e){
    this.data.tixianValue = this.data.allmoney
    this.setData({
      tixianValue: this.data.allmoney
    })
  },  
  bindToIndex: function () {
    wx.navigateTo({
      url: "../index/index"
    })
  },

  //点击提现
  bindtixian:function(){
    var that = this
    console.log(app.globalData.openid)
    console.log(this.data.tixianValue)
    // https://www.daguaishou.com/index.php?m=content&c=wx_development&a=refund openid  amount

    
    if (!this.data.tixianValue && typeof this.data.tixianValue != "undefined" && this.data.tixianValue != 0) {
      wx.showModal({
        title: '提现金额不得为空',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    } else if (this.data.tixianValue < 1) {
      wx.showModal({
        title: '提现金额至少1元',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    } else if (this.data.tixianValue > this.data.allmoney) {
      wx.showModal({
        title: '提现金额必须少于剩余金额',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
      return
    }
    
    wx.showModal({
      title: '确认是否提现',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定')
          wx.showLoading({
            title: '加载中',
          })
          wx.request({
            url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=refund',
            data: {
              openid: app.globalData.openid,
              amount: that.data.tixianValue
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              console.log(res, '退款成功')
              if(res.data.code == 0){
                wx.hideLoading()
                wx.showToast({
                  title: '提现成功',
                  icon: 'success',
                  duration: 1000
                })
                that.setData({
                  allmoney: res.data.money,
                  tixianValue: ''
                })
              }else{
                wx.showToast({
                  title: '遇到点小状况稍后再试试',
                  duration: 1000
                })
              }
            }
          })

        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })



  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;  

    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=person_center', 
      data: {
        openid: app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {

        that.setData({
          allmoney: res.data.total_money
        })
      }
    })


  },
  //阻止滑屏
  catchTouchMove: function () {

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */


  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  }
})