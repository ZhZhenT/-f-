// pages/user-record/user-record.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    currentTab:0,
    tabs:[{
      statetext:"发起的大赛"
    },{
      statetext: "参与的大赛"
    }],
    launchInfo:[//发起的
      { time:"", cyd: "暂无发起信息,快去尝试发一个吧", money: ""},
    ],
    participateInfo: [//参与过的
      { pic: "", nc: "", time: "2018-01-03", mc: "", sj: ""},
    ],
    total:{
      preTotal:0,
      num:0
    }//总数
  },
  bindToIndex: function () {
    wx.navigateTo({
      url: "../index/index"
    })
  },
  // 跳转去分享页
  binToGenerate: function (e) {
    var that = this
    if (this.data.launchInfo.time){
      return
    }
    // 通过 id  请求  用户发起的信息     
    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=send_list', //仅为示例，并非真实的接口地址
      data: {
        openid: app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.fq_arr) {
          that.setData({
            launchInfo: res.data.fq_arr,
            total: {
              preTotal: res.data.fq_money,
              num: res.data.fq_count
            },
          })
          if (e.currentTarget.dataset.end) {
            wx.showModal({
              title: '您的红包已过期',
              content: '去发一个试试',
              cancelText: '取消',
              confirmText: '确定',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.navigateTo({
                    url: "../index/index"
                  })

                } else if (res.cancel) {

                }
              }
            })
          } else {
            wx.navigateTo({
              url: "../generate/generate?orderno=" + e.currentTarget.dataset.url
            })
          }
        }
      }
    })

  }, 
  // 去成绩页面
  binTomatch: function(e){
    wx.navigateTo({
      url: "../match-details/match-details?orderno=" + e.currentTarget.dataset.url
    })
  },
  bindTopMenu: function(e){
    var arr = []
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    // 通过 id  请求  用户发起的信息     
    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=send_list', //仅为示例，并非真实的接口地址
      data: {
        openid: app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res,'用户历史记录')
        if (e.currentTarget.dataset.current == 0) {
          wx.hideLoading()
          if (res.data.fq_arr){// 有发起信息
            that.setData({
              currentTab: e.currentTarget.dataset.current,
              launchInfo: res.data.fq_arr,
              total: {
                preTotal: res.data.fq_money,
                num: res.data.fq_count
              },
            })
          }else{
            that.setData({
              currentTab: e.currentTarget.dataset.current,
              total: {
                preTotal: 0,
                num: 0
              },
            })
          }

        } else {
          wx.hideLoading()
          if (res.data.cy_arr) {// 有参与信息
            that.setData({
              currentTab: e.currentTarget.dataset.current,
              participateInfo: res.data.cy_arr,
              total: {
                preTotal: res.data.cy_money,
                num: res.data.cy_count
              },
            })
          }else{
            that.setData({
              currentTab: e.currentTarget.dataset.current,
              participateInfo: res.data.cy_arr,
              total: {
                preTotal: 0,
                num: 0
              },
            })
          }


        }


      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this

    that.setData({
      userInfo: app.globalData.userInfo
    })

    // 通过 id  请求  用户发起的信息     
    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=send_list', //仅为示例，并非真实的接口地址
      data: {
        openid: app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        if (res.data.fq_arr){
          that.setData({
            launchInfo: res.data.fq_arr,
            total: {
              preTotal: res.data.fq_money,
              num: res.data.fq_count
            },
          })
        }else{
          //没有值时
          console.log('首次进入没有发起信息')
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    //wx.onAccelerometerChange(function (res) {
      //console.log(res.x.toFixed(2), res.y.toFixed(2), res.z.toFixed(2))
    //})
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

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