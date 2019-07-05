// pages/match-details/match-details.js
const app = getApp();
var loadimages = require("../game/loading.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    showItem:3,
    isShow:false,
    rankingList: [

    ],
    canvasWidth: 0, 
    canvasHeght: 0,
    layerShow:false,
    layerImagelist:[],
    canvasShow:false,
    endTime:'0',//距现在的结束时间
    Ranking:'第？名',//名次
    bonus:'????',//赏金
    totalmoney:'',//红包总金额
    speedPro:'',//参与进度
    isShowSpeed:1,
    orderno:'',
    flagajax: 0
  },
  // 查看更多
  bindShowMore:function(){
    this.setData({
      showItem: this.data.rankingList.length,
      //isShow: !this.data.isShow
    })
  },
  bindToWithdrawals:function(){
    wx.navigateTo({
      url: "../user-withdrawals/user-withdrawals"
    })
  },
  bindToIndex: function () {
    wx.navigateTo({
      url: "../index/index"
    })
  },

  //阻止滑屏
  catchTouchMove: function () {

  },

  //图片保存
  previewImage: function () {
      
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: this.data.canvasWidth,
      height: this.data.canvasHeight,
      destWidth: this.data.canvasWidth*2,
      destHeight: this.data.canvasHeght*2,
      canvasId: 'Canvas',
      success: function (res) {
        var path = res.tempFilePath
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.openSetting({
                success: (res) => {
                  res.authSetting = {
                    "scope.writePhotosAlbum": true,
                  }
                  wx.saveImageToPhotosAlbum({
                    filePath: path,
                    success(res) {
                      wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        duration: 300
                      })
                    }
                  })
                }
              })
            }else{
              wx.saveImageToPhotosAlbum({
                filePath: path,
                success(res) {
                  wx.showToast({
                    title: '保存成功',
                    icon: 'success',
                    duration: 300
                  })
                }
              })
            }
          }
        })

      }
    })

  },

  //隐藏图片
  bindHiddenImage:function(){
    this.setData({
      layerShow: false,
      canvasShow:false
    })
  },
  //查看图片  晒图
  bindSeeImage:function(){
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    this.setData({
      layerShow:true
    },()=>{
      var query = wx.createSelectorQuery()
      query.select('#cont').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec(res => {
        // 画布 宽高
        var ctxW = res[0].width;
        var ctxH = res[0].height;

        this.setData({
          canvasWidth: ctxW,
          canvasHeght: ctxH
        })

        // 使用 wx.createContext 获取绘图上下文 context
        var ctx = wx.createCanvasContext('Canvas')

        ctx.setFillStyle('#fdf1c8')
        ctx.fillRect(0, 0, ctxW, ctxH)

        ctx.setFillStyle('#666666')
        ctx.setFontSize(15)
        ctx.fillText('我在红包游戏挑战赛中获得', ctxW * 0.236, ctxH * 0.06)


        app.getopenid(function (openid) {
          //  通过 openid  请求 用户头像大怪兽 地址   
          wx.request({
            url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=get_code',
            data: {
              openid: openid
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              var userPhoto = res.data.user_pic;
              var qrCodeUrl = res.data.ewm_pic;
              var wxmlimglist = [
                userPhoto,
                "https://www.daguaishou.com/statics/education/red-envelopes/images/details-scroll.png",
                "https://www.daguaishou.com/statics/education/red-envelopes/images/red-envelopes-bg.png",
                qrCodeUrl,
                "https://www.daguaishou.com/statics/education/red-envelopes/images/layer-saohua.png",
              ]
              loadimages(wxmlimglist, function (pastList) {
                var pastList = pastList;
                that.setData({
                  layerImagelist: pastList,
                })
                wx.hideLoading()
                // 当前用户头像
                var avatarPath = pastList[0]
                var scrollPath = pastList[1]
                var envelopesPath = pastList[2]
                var qrcodePath = pastList[3]
                var saohuaPath = pastList[4]

                ctx.beginPath()
                ctx.setFillStyle('#ff665e')
                ctx.arc(ctxW * 0.5, ctxH * 0.166, ctxW * 0.091, 0, 2 * Math.PI)
                ctx.fill();
                ctx.closePath()

                ctx.beginPath()
                ctx.save(); // 保存当前ctx的状态
                ctx.arc(ctxW * 0.5, ctxH * 0.166, ctxW * 0.092, 0, 2 * Math.PI)
                ctx.clip(); //裁剪上面的圆形
                ctx.drawImage(avatarPath, ctxW * 0.40, ctxH * 0.1, ctxW * 0.2, ctxW * 0.2);  // 在刚刚裁剪的园上画图
                ctx.restore(); // 还原状态
                ctx.closePath()

                ctx.drawImage(scrollPath, ctxW * 0.16, ctxH * 0.215, ctxW * 0.7, ctxH * 0.1);

                //名次
                ctx.setFillStyle('#fed952')
                ctx.setFontSize(25)
                ctx.fillText(that.data.Ranking, ctxW * 0.38, ctxH * 0.272)


                ctx.drawImage(envelopesPath, 0, ctxH * 0.3, ctxW, ctxH);

                ctx.drawImage(qrcodePath, ctxW * 0.382, ctxH * 0.5, ctxW * 0.238, ctxH * 0.159);

                ctx.setFillStyle('#ffffff')
                ctx.setFontSize(12)
                ctx.fillText('长按二维码进入小程序', ctxW * 0.31, ctxH * 0.7)


                ctx.drawImage(saohuaPath, ctxW * 0.1, ctxH * 0.74, ctxW * 0.81, ctxH * 0.17);

                ctx.setFillStyle('#ffd33c')
                ctx.setFontSize(12)
                ctx.fillText('长按图片保存转发', ctxW * 0.345, ctxH * 0.96)

                ctx.draw()

                that.setData({
                  canvasShow: true
                })

              })
            }
          })

        })





 

      })

    })


  },
  //点击刷新
  bindRefresh:function(){

    var that = this;
    if (that.data.flagajax == 1){
      return
    }
    that.data.flagajax = 1
    wx.showLoading({
      title: '加载中',
    })
    // options.orderno   app.globalData.openid
    // 发送 openid 和 订单号     返回  code 0未结算完毕 1已经结算
    wx.request({
      url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=get_paihang',
      data: {
        orderno: that.data.orderno,
        openid: app.globalData.openid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success: function (res) {
        console.log(res, '游戏排行榜') //
        that.data.flagajax = 0;
        wx.hideLoading()
        that.refresh(res, that)
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  refresh: function (res,that) {
    if (res.data.code == 1) {// 已经结算完毕
      that.setData({
        rankingList: res.data.paihang,//排名列表
        Ranking: res.data.current_detail.current_mc,//名次
        bonus: res.data.current_detail.current_sj,//获得赏金
        totalmoney: res.data.current_detail.current_zsj,//红包总金额
        speedPro: res.data.current_detail.current_cyr + '/' + res.data.current_detail.current_zcyr,//参与进度
        isShowSpeed: false
      })
    } else if (res.data.code == 0){
      that.setData({
        endTime: res.data.time,//距现在的结束时间
        totalmoney: res.data.current_detail.current_zsj,//红包总金额
        speedPro: res.data.current_detail.current_cyr + '/' + res.data.current_detail.current_zcyr,//参与进度
        isShowSpeed: true
      })
    }
  },
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    this.setData({
      userInfo: app.globalData.userInfo,
      orderno: options.orderno
    });

    // options.orderno   app.globalData.openid
    // 发送 openid 和 订单号     返回  code 0未结算完毕 1已经结算
    app.getopenid(function (openid) {
      wx.request({
        url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=get_paihang',
        data: {
          orderno: options.orderno,
          openid: app.globalData.openid
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res, options.orderno, app.globalData.openid, '游戏排行榜') //
          that.refresh(res, that)
          wx.hideLoading()
        }
      })
    })

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
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