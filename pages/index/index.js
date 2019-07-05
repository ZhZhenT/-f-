//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    areaIndex: 0,//下拉框默认显示
    area: [60, 90, 120, 150],// 下拉框
    serviceMoney:"0.00",//计算服务费
    submitText:"生成游戏红包",//提交按钮
    bottomMenuInfo: [{ // 底部 导航信息
      imgUrl:"https://www.daguaishou.com/statics/education/red-envelopes/images/bot-menu1.png",
      text:"我的记录",
      url:"../user-record/user-record"
    }, {
        imgUrl: "https://www.daguaishou.com/statics/education/red-envelopes/images/bot-menu2.png",
      text: "赏金提现",
      url: "../user-withdrawals/user-withdrawals"
      }, {
        imgUrl: "https://www.daguaishou.com/statics/education/red-envelopes/images/bot-menu3.png",
        text: "常见问题",
        url: "../user-problem/user-problem"
      }],
    showTishi:false,
    priceval:null,
    numval:null,
    tishiText:""
  },

  bindPickerChange: function (e) {
    this.setData({
      areaIndex: e.detail.value
    })
  },
  //首页赏金改变监听
  bindMoneyInput:function(e){

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
      showTishi: false,
      priceval: e.detail.value
    })
    this.setData({
      serviceMoney: Number((Number(e.detail.value) / 100).toString().match(/^\d+(?:\.\d{0,2})?/)),
      submitText: "还需支付￥" + Number((Number(e.detail.value) * 1 + Number(e.detail.value) / 100).toString().match(/^\d+(?:\.\d{0,2})?/))    + "元",
    })

    if (this.data.numval){ // 已设置红包个数
      if ((Number(e.detail.value) / Number(this.data.numval))<2){
        this.setData({
          showTishi: true
        })
      }
    }

    if (e.detail.value<1){
      this.setData({
        showTishi: true,
        tishiText:'赏金不得低于1元'
      })
    }

  },
   //首页赏金输入框 失去焦点 
  bindMoneyBlur:function(){

  },
  //红包个数
  bindNumInput: function (e) {
    //console.log(e.detail.value)
    this.setData({
      numval: e.detail.value
    })
  },

  //底部跳转
  bindBottomMenu:function(e){
    var that = this
    wx.navigateTo({
      url: e.currentTarget.dataset.gourl 
    })
  },
  //提交按钮  支付  
  bindSubmitBtn:function(e){
    
    //console.log(app.globalData.openid,this.data.showTishi)

    /*var orderno = 1;
    wx.navigateTo({
      url: "../generate/generate?orderno=" + orderno,
    });*/

    this.setData({
      showTishi: false,
      tishiText: ""
    })
    //验证 红包金额
    /*if (!this.data.priceval && typeof this.data.priceval != "undefined" && this.data.priceval != 0){
      console.log("请输入赏金金额")
      this.setData({
        showTishi: true,
        tishiText: "请输入赏金金额"
      })
      return
    }else if (this.data.priceval<1){
      console.log("赏金不得低于1元")
      this.setData({
        showTishi: true,
        tishiText: '赏金不得低于1元'
      })
      return
    }
    //验证 红包个数
    if (!this.data.numval && typeof this.data.numval != "undefined" && this.data.numval != 0) {
      console.log("请输入红包个数")
      this.setData({
        showTishi: true,
        tishiText: "请输入红包个数"
      })
      return
    } else if (this.data.numval < 1) {
      console.log("红包个数不得低于1个")
      this.setData({
        showTishi: true,
        tishiText: "红包个数不得低于1个"
      })
      return
    }else if (this.data.numval > Math.floor(this.data.priceval)*2){
      this.setData({
        showTishi: true,
        tishiText: "红包个数不得超过金额的两倍"
      })
      return
    } */

    // 红包金额 个数 时间限定 服务费 openid 总金额
    var envelopesInfo = {
      priceval: this.data.priceval,
      numval: this.data.numval,
      effectivetime: this.data.area[this.data.areaIndex],
      serviceMoney: this.data.serviceMoney,
      openid: app.globalData.openid,
      totalMoney: Number(this.data.priceval) + Number(this.data.serviceMoney)
    }

    console.log(envelopesInfo,'发送order请求 生成唯一订单')
    // 发送红包信息 生成 订单号  
    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=order',
       data: {
        envelopesInfo: envelopesInfo
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res,'order请求成功回调')
         if (res.data.code == 0){// 订单成功生成  发起支付请求
           var orderno = res.data.orderno;
           //console.log(orderno, envelopesInfo.totalMoney, app.globalData.openid,'发送pay请求')
            wx.request({
              url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=pay',
              data: { 
                openid: app.globalData.openid,
                fee: envelopesInfo.totalMoney,
                orderno: orderno
              },
              header: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              method: 'POST',
              success: function (res) {
                console.log(res.data.timeStamp, res.data.nonceStr, res.data.package, res.data.paySign)
                wx.requestPayment({
                  'timeStamp': res.data.timeStamp,
                  'nonceStr': res.data.nonceStr,
                  'package': res.data.package,
                  'signType': 'MD5',
                  'paySign': res.data.paySign,
                  'success': function (res) {
                    // 支付成功后的 跳转
                    console.log(orderno + '支付成功 跳转去分享页面')
                    wx.navigateTo({
                      url: "../generate/generate?orderno=" + orderno,
                    });
                    wx.showToast({
                      title: '支付成功',
                      icon: 'success',
                      duration: 1000,
                    });
                  },
                  'fail': function (res) {
                    console.log('fail');
                  },
                  'complete': function (res) {
                    console.log('complete');
                  }
                });
              },
              fail: function (res) {
                console.log(res.data)
              }
            });
         }else{
           wx.showModal({
             title: '提示',
             content: res.data.message,
             success: function (res) {
               if (res.confirm) {
                 console.log('用户点击确定')
               } else if (res.cancel) {
                 console.log('用户点击取消')
               }
             }
           })
         }
         
      }
    })



  },
  bindToDetails:function(){
    var that = this;
    wx.chooseImage({
      success: function (res) {
        var tempFilePaths = res.tempFilePaths
        var uploadTask = wx.uploadFile({
          url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=get_code', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'user': 'test'
          },
          success: function (res) {
            console.log(tempFilePaths[0])
            that.setData({
              userInfo: {
                avatarUrl: tempFilePaths[0]
              },
            })
          }
        })
      }
    })
  },  
   /*bindToGame:function(){
    var orderno = 1;
    wx.navigateTo({
      url: '/pages/game/game?orderno=' + orderno + '&launchInfo=' + JSON.stringify(app.globalData.userInfo),
    })
  },*/
  onLoad: function (options) {

    wx.showLoading({
      title: '加载中',
    })
    if (app.globalData.userInfo) {
      wx.hideLoading();
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回   所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        app.globalData.userInfo = res.userInfo,
        wx.hideLoading();
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
      //console.log(2)
    } else {
      wx.getUserInfo({ 
        success: res => {
          wx.hideLoading();
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
    //console.log(3)
  },

})
