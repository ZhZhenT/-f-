//app.js

App({
  onLaunch: function () {

   

    var that = this

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //console.log(res)  www.daguaishou.com/index.php?m=content&c=wx_development&a=getOpenid
        var code = res.code
        wx.request({
          url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=getOpenid', 
          data: {
            code:code,
          },
          header: { 
            'content-type': 'application/json' // 默认值
          },
          success:(res)=>{
            that.globalData.openid = res.data.openid
            // 获取用户信息
            wx.getSetting({
              success: res => {

                wx.getUserInfo({
                  success: res => {
                    // 可以将 res 发送给后台解码出 unionId
                    that.globalData.userInfo = res.userInfo
                    //console.log(res.userInfo, code)
                    // 向后台发送用户信息  
                    wx.request({
                      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=getUserInfo', //仅为示例，并非真实的接口地址
                      data: {
                        userInfo: that.globalData.userInfo,
                        openid: that.globalData.openid
                      },
                      header: {
                        'content-type': 'application/json' // 默认值
                      },
                      success: function (res) {
                        //console.log(res)
                      }
                    })

                    // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                    // 所以此处加入 callback 以防止这种情况
                    console.log(that.userInfoReadyCallback)
                    if (that.userInfoReadyCallback) {
                      that.userInfoReadyCallback(res)
                    }
                  }
                })
              }
            })
          }
        })
      } 
    })
    
  },
  getopenid:function(cb){
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        //console.log(res)  www.daguaishou.com/index.php?m=content&c=wx_development&a=getOpenid
        var code = res.code
        wx.request({
          url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=getOpenid',
          data: {
            code: code,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: (res) => {
            this.globalData.openid = res.data.openid;
            cb ? cb(res.data.openid) : function () { }
          }
        })
      }
    })
  },
  getuserinfo:function(cb){
    wx.getUserInfo({
      success: function (res) {
        console.log(res)
        cb ? cb(res) : function(){}
      }
    })
  },
  onShow: function (options) {
   // console.log(options)
  },

  globalData: {
    userInfo: null,
    openid:null,
    a:1,
  }
})