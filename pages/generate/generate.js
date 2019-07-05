// pages/generate/generate.js
const app = getApp()
var loadimages = require("../game/loading.js")
Page({
  
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    orderno:'',
    canvasWidth: 0,
    canvasHeght: 0,
    canvasShow: false,
    layerShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  // s生成分享到朋友圈的图片

  bindSeeImage: function () {
    var that = this;

    //请求获取分享的  二维码图片 
    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=get_code',  // path  /pages/index/index
      data: {
        orderno: that.data.orderno,
        openid: app.globalData.openid,
        launchInfo: app.globalData.userInfo,
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res)
        var userPhoto = res.data.user_pic;
        var qrCodeUrl = res.data.ewm_pic;
        that.setData({
          layerShow: true
        }, () => {
          var query = wx.createSelectorQuery()
          query.select('#cont').boundingClientRect()
          query.selectViewport().scrollOffset()
          query.exec(res => {
            // 画布 宽高
            var ctxW = res[0].width;
            var ctxH = res[0].height;

            that.setData({
              canvasWidth: ctxW,
              canvasHeght: ctxH
            })

            // 使用 wx.createContext 获取绘图上下文 context
            var ctx = wx.createCanvasContext('Canvas')

            //ctx.setFillStyle('#fdf1c8')
            //ctx.fillRect(0, 0, ctxW, ctxH)

            //  通过 openid  请求用户头像大怪兽地址 

            console.log(res)
            var wxmlimglist = [
              userPhoto,
              "https://www.daguaishou.com/statics/education/red-envelopes/images/share-bg.jpg",
              qrCodeUrl
            ]
            loadimages(wxmlimglist, function (pastList) {
              var pastList = pastList;

              that.setData({
                layerImagelist: pastList,
              })

              // 当前用户头像
              var avatarPath = pastList[0]
              var shareBgPath = pastList[1]
              var qrCodeUrl = pastList[2]

              ctx.drawImage(shareBgPath, 0, 0, ctxW, ctxH);  // 在刚刚裁剪的园上画图

              ctx.beginPath()
              ctx.setFillStyle('#ff665e')
              ctx.arc(ctxW * 0.5, ctxH * 0.106, ctxW * 0.091, 0, 2 * Math.PI)
              ctx.fill();
              ctx.closePath()

              ctx.beginPath()
              ctx.save(); // 保存当前ctx的状态
              ctx.arc(ctxW * 0.5, ctxH * 0.106, ctxW * 0.092, 0, 2 * Math.PI)
              ctx.clip(); //裁剪上面的圆形
              ctx.drawImage(avatarPath, ctxW * 0.40, ctxH * 0.04, ctxW * 0.2, ctxW * 0.2);  // 在刚刚裁剪的园上画图
              ctx.restore(); // 还原状态
              ctx.closePath()

              ctx.drawImage(qrCodeUrl, ctxW * 0.3, ctxH * 0.6, ctxW * 0.4, ctxW * 0.4);  // 在刚刚裁剪的园上画图

              ctx.draw()

              that.setData({
                canvasShow: true
              })
              
              setTimeout(function(){
                wx.canvasToTempFilePath({
                  x: 0,
                  y: 0,
                  width: ctxW,
                  height: ctxH,
                  destWidth: ctxW,
                  destHeight: ctxH,
                  canvasId: 'Canvas',
                  success: function (res) {
                    var showImg = res.tempFilePath
                    console.log(showImg)
                    
                    wx.previewImage({
                      current: '',
                      urls: [showImg]
                    })

                    that.setData({
                      layerShow: false
                    })

                  }
                })

              },300)

            })



          })

        })
      }
    })




  },

  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    console.log(options.orderno, app.globalData.openid,'进入分享页面')

    this.setData({
      userInfo: app.globalData.userInfo,
      orderno: options.orderno
    });
    
    wx.showShareMenu({
      withShareTicket: true
    })
    wx.hideLoading();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //阻止滑屏
  catchTouchMove: function () {

  },



  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function (res) {
    var orderno = this.data.orderno
    if (res.from === 'button') {
      // 来自页面内转发按钮
      //console.log(res.target)
    };
    console.log(orderno, JSON.stringify(app.globalData.userInfo),'生成分享后的链接')
    return {
      title: '我发起了一个游戏红包',
      path: '/pages/game/game?orderno=' + orderno + '&launchInfo=' + JSON.stringify(app.globalData.userInfo),
      success: function (res) {
        // 分享成功时  后端生成时间戳
        var shareTime = {
          orderno:orderno,     
        }
        console.log(shareTime + "share请求")
        wx.request({
          url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=share', 
          data: {
            shareTime: shareTime,
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
           
          }
        })
        
      },
      fail: function (res) {
        // 转发失败
      }
    };
  }
})