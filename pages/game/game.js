// pages/game/game.js
const app = getApp()
var Tween = require("tween.js")
var loadimages = require("loading.js")

Page({
  /** 
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    canvasWidth: 0,
    canvasWidth1: 0,
    canvasHeght: 0,
    hid: false,
    isRange: false,
    isMove:false,
    isBegin:false,// 是否点击开始
    isCountDown:false,
    startPoint:{x:0,y:0},
    endPoint: {x: 0, y: 0 },
    startTime:0,
    timedis:0,
    speed:0,
    countDown:3,
    righttime:20,//倒计时
    begintimer:null,
    righttimetimer:null,
    gamebeginbtnhid:true,
    rightTime:null,
    moveTotop:false,
    ruleArr:[
      "需要内完成需要在限定时间内完成需要在限定时间内完成需要在限定时间内完成", "需要在限定时间内完成", "需要在限定时间内完成", "需要在限定时间内完成", "需要在限定时间内完成"
    ],
    ruleLayerShow:false,
    rankinglayerShow:false,
    gameImagelist:[],
    launchInfo:{},//发起者信息
    launchOpenid:'',//发起者openid
    paiming:"",
    money:0,//总金额
    speedPro:'',
    firstmoney:0,// 第一名奖金
    paodaoTop:0,
    animationBg:{},
    animationBall: {},
    ballTop:0,
    windowWidth:0,
    windowHegih: 0,
    openid:''
  },
  // 捕捉用户手指滑动信息
  bindCanvasTouchstart:function(e){
    this.data.isRange = false;
    this.data.isMove = false;

    var price = 0.5

    if (this.data.isBegin){
      var ctxW = this.data.canvasWidth1;
      var ctxH = this.data.canvasHeght;
      var userTouch = { x: e.touches[0].x, y: e.touches[0].y }
      var rangeRect = { wl: ctxW * 0.34, wr: ctxW * 0.68, ht: ctxH * 0.68, hb: ctxH * 0.83 };//w 0.35 0.65  h 0.68 083
      this.data.startPoint = userTouch;
      this.data.endPoint = { x: 0, y: 0 };
      this.data.startTime = new Date().getTime();
      if (rangeRect.wl < userTouch.x && userTouch.x < rangeRect.wr && rangeRect.ht < userTouch.y && userTouch.y < rangeRect.hb) {
        this.data.isRange = true;
      }
    }
  },
  bindCanvasTouchmove:function(e){
    if (this.data.isRange){
      var movePoint = { x: 0, y: 0 };
      movePoint.x = e.touches[0].x;
      movePoint.y = e.touches[0].y;
      var dis = { x: 0, y: 0 };
      dis.x = movePoint.x - this.data.startPoint.x;
      dis.y = movePoint.y - this.data.startPoint.y;
      var nowTime = new Date().getTime();
      this.data.timedis = nowTime - this.data.startTime
      this.data.endPoint = dis;
      this.data.isMove = true;
    }
  },
  bindCanvasTouchend: function (e) {
    var that = this;
    if (this.data.isRange && this.data.isMove){

      // 向后台 发送请求  判断游戏是否在有效时间内 

      var speed = Math.abs(this.data.endPoint.y / this.data.timedis);//根据季节气候潮汐计算出的速度mmp
      var ctxW = this.data.canvasWidth;
      var ctxH = this.data.canvasHeght; 
      this.setData({
        speed: speed
      })

      speed += 1;

      if (speed>5.25){
        speed = 5.25
      }
      var durationTime = (speed + 3) * 1000
      
      //计算米数
      var rice = Math.round(speed*187) / 10

      clearInterval(this.data.righttimetimer)
      

      this.data.isBegin = false;

    
      var bgmoveto = this.data.windowHeight * (-2.442 * rice/100 + 2.442)
      var ballmoveto = this.data.windowHeight * (-0.551 * rice/100 + 0.709)

      var animation1 = wx.createAnimation({
        duration: durationTime,
        timingFunction: 'ease-out',
      });
      animation1.translate('-50%', -bgmoveto).step()
      this.setData({
        animationBg: animation1.export()
      })

      var animation2 = wx.createAnimation({
        duration: durationTime,
        timingFunction: 'ease-out',
      });

      animation2.translate('-49.5%', ballmoveto).step()
      this.setData({
        animationBall: animation2.export()
      })
      /*
        发送 参与者信息  
        orderno 订单号
        openid  参与者 openid
        meter   成绩 

        获取
        coed -4  红包超时 游戏结束
        coed 0   获取当前名次信息  res.data.paiming
       
      */ 
      console.log(that.data.orderno, that.data.openid, rice,'gameover请求 游戏结束')
      wx.request({
        url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=gameover', 
        data: {
          orderno: that.data.orderno,
          openid: that.data.openid,
          meter: rice
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res, '游戏结束over')
          clearInterval(that.data.righttimetimer)
          if (res.data.code == -4) {
            setTimeout(function(){
              wx.showModal({
                title: '对不起,您来得太慢了~~',
                content: '已经被抢光了,去发一个试试',
                confirmText: '确定',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                      url: "../index/index"
                    })
                  } else if (res.cancel) {
                    wx.navigateTo({
                      url: "../index/index"
                    })
                  }
                }
              })
            }, durationTime)
          } else if (res.data.code == 0) {
            setTimeout(function(){
              that.setData({
                rankinglayerShow: true,
                ruleLayerShow: false,
                rice: rice,
                paiming: res.data.paiming
              });
            }, durationTime)
          }
        }
      })


      /*setTimeout(function () {
        wx.request({
          url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=gameover', //仅为示例，并非真实的接口地址
          data: {
            orderno: that.data.orderno,
            openid: app.globalData.openid,
            meter: rice
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success: function (res) {
            console.log(res, '游戏结束')
            if (res.data.code == -4) {
              wx.showModal({
                title: '对不起,您来得太慢了~~',
                content: '已经被抢光了,去发一个试试',
                confirmText: '确定',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                      url: "../index/index"
                    })
                  } else if (res.cancel) {
                    wx.navigateTo({
                      url: "../index/index"
                    })
                  }
                }
              })
            } else if (res.data.code == 0) {
              that.setData({
                rankinglayerShow: true,
                ruleLayerShow: false,
                rice: rice,
                paiming: res.data.paiming
              });
            }
          }
        })

      }, durationTime)*/

      //参数1  滑动距离  参数2执行次数 
      //this.move(speed * ctxH * 0.68, 60 + Math.ceil(speed * 20), rice);

      // 0    2.442   0.709
      //100   0       0.158  
      // 50   1.221   0.4335

    }
  },
  //用户点击  开始游戏按钮
  binGamesBegin:function(){
    var that = this
    var index = 3

    /*
     https://www.daguaishou.com/index.php?m=content&c=wx_development&a=game_start
      发送
      openid   参与者  openid
      orderno  订单号

      获取
      res.data.money            当前红包总金额
      res.data.current_person   当前参与人数
      res.data.current_zperson  允许的总人数 
      res.data.first_money      第一名的奖金 
    */ 

    app.getopenid(function (openid){
      var openid = openid
      console.log(openid, that.data.orderno,'用户点击开始游戏按钮 game_start')
      wx.request({
        url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=game_start',
        data: {
          openid: openid,
          orderno: that.data.orderno,
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          console.log(res, ' game_start 返回')
          clearInterval(that.data.begintimer)
          clearInterval(that.data.righttimetimer)

          that.setData({
            countDown: 3,
            isCountDown: true,
            gamebeginbtnhid: false,
            moveTotop: true,
            money: res.data.money,//总金额
            speedPro: res.data.current_person + '/' + res.data.current_zperson,//进度
            firstmoney: res.data.first_money// 第一名奖金
          })

          that.data.begintimer = setInterval(function () {
            that.data.countDown = --index;
            that.setData({
              countDown: that.data.countDown
            })
            if (that.data.countDown == 0) {
              clearInterval(that.data.begintimer)
              index = 3
              that.data.isBegin = true;
              that.data.countDown = "Go";
              that.setData({
                countDown: that.data.countDown,
                isCountDown: false
              });
              that.data.rightTime();
            }
          }, 1000)
        }

      })
    })




  },
  //显示
  bindShowLayer:function(){
    this.setData({
      ruleLayerShow:true
    })
  },
  //规则弹层关闭
  bindCloseRuleLayer: function () {
    this.setData({
      ruleLayerShow: false
    })
  },
  //阻止滑屏
  catchTouchMove: function () {

  },
  //游戏结束弹窗  跳转 游戏结果详情页面
  bindGoToUserCenter:function(){
    wx.navigateTo({
      url: "../match-details/match-details?orderno=" + this.data.orderno
    })
  },

  //图片保存
  previewImage: function () {



  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showLoading({
      title: '加载中',
    })
    var that = this;
    //页面适配 
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          windowHeight: res.windowHeight
        })
        wx.createSelectorQuery().select('#the-id').boundingClientRect(function (rect) {
          that.setData({
            paodaoTop: "translate(-49.5%," + -(rect.height - res.windowHeight) + "px)"
          });
        }).exec()
        wx.createSelectorQuery().select('#the-ball').boundingClientRect(function (rect) {
          that.setData({
            ballTop: "translate(-50%," + (0.71 * res.windowHeight) + "px)"
          });
        }).exec()
      }
    })
    // canvas中图片
    var wxmlimglist = [
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-begin-btn.png",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-seerule.png",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-seerule-bg.png",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-close.png",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-ranking-bg.png",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/details-scroll.png"
    ];
    //  canvas中图片
    var imgList = [
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-bg-left.jpg",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-bg-right.jpg",
      "https://www.daguaishou.com/statics/education/red-envelopes/images/games-begin.png",
      'https://www.daguaishou.com/statics/education/red-envelopes/images/games-ball.png'
    ];

    //右边倒计时
    that.data.rightTime = function () {
      clearInterval(that.data.righttimetimer)
      that.data.righttimetimer = setInterval(function () {
        that.data.righttime = --that.data.righttime
        that.setData({
          righttime: that.data.righttime
        })
        if (that.data.righttime == 0) {
          //时间到了
          /*that.setData({
            rankinglayerShow: true
          })*/
          wx.showModal({
            title: '对不起,您来得太慢了~~',
            content: '已经被抢光了,去发一个试试',
            confirmText: '确定',
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.navigateTo({
                  url: "../index/index"
                })
              } else if (res.cancel) {
                wx.navigateTo({
                  url: "../index/index"
                })
              }
            }
          })
          clearInterval(that.data.righttimetimer)
        }
      }, 1000);
    }

    if (!options.launchInfo) {
      return
    }
    // 分享者页面中参数传递信息 
    this.setData({
      launchInfo: JSON.parse(options.launchInfo),
      orderno: options.orderno
    })


    /* 请求获取红包信息  
    {"id":"9","orderno":"2018012954515597","userid":"2","money":"0.01","fwf":"0.00","total_money":"0.01","count":"5",                       "time":"20","create_time":"1517226358","type":"1","pay_status":"1","share_time":"1517226370"}
    */
    /*
     join接口 判断用户是否已经参与
     orderno 订单号
     openid  参与者openid

     返回值
     res.data.is_join
     0 未参与
     1 已经参与 
    */
    app.getopenid(function (openid) {
   
      that.setData({
        openid: openid,
      })

      console.log(options.orderno, openid, 'game界面 发送join请求验证是否参加')
      wx.request({
        url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=join',
        data: {
          orderno: options.orderno,
          openid: openid
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success: function (res) {
          //验证是否参与过 console.log(res.data.is_join)  0未参与 1已经参与过 res.data.is_join == 0
          console.log(options.orderno,openid,res.data, 'join验证是否已经参与')
          var envelopes = res.data.order_detail
          if (res.data.code == -4){
            // 已经超时
            wx.hideLoading()
            wx.showModal({
              title: '活动已经结束',
              content: '',
              cancelText: '取消',
              confirmText: '确定',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.navigateTo({
                    url: "../index/index"
                  })

                } else if (res.cancel) {
                  wx.navigateTo({
                    url: "../index/index"
                  })
                }
              }
            })
          } else if (res.data.code == -3){
            // 已经超员
            wx.hideLoading()
            wx.showModal({
              title: '红包已经被抢光啦',
              content: '',
              cancelText: '取消',
              confirmText: '确定',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.navigateTo({
                    url: "../index/index"
                  })

                } else if (res.cancel) {
                  wx.navigateTo({
                    url: "../index/index"
                  })
                }
              }
            })
          } else if (res.data.code == 0){
            if (res.data.is_join == 0){
              // 未参与
              wx.hideLoading()
              var nowTime = Date.parse(new Date()).toString();
              nowTime = nowTime.substr(0, 10);
              that.setData({
                userInfo: app.globalData.userInfo,
                righttime: (Number(envelopes.time) - (Number(nowTime) - Number(envelopes.share_time))) ? (Number(envelopes.time) - (Number(nowTime) - Number(envelopes.share_time))) : 500,
              })
              loadimages(wxmlimglist, function (pastList) {
                var pastList = pastList;
                that.setData({
                  gameImagelist: pastList,
                })
              })

              that.data.rightTime();// 开始倒计时
              //缓存canvas 中图片
              loadimages(imgList, function (pastList) {
                var pastList = pastList;
                var leftPath = pastList[0];
                var rightPath = pastList[1];
                var beginPath = pastList[2];
                var ballPath = pastList[3];
                //获取手机屏幕信息  适配页面
                wx.getSystemInfo({
                  success: function (res) {
                    var ctxW = res.windowWidth * 0.82;
                    var ctxH = res.windowHeight;

                    var ctxW1 = res.windowWidth;

                    that.setData({
                      canvasWidth: ctxW,
                      canvasHeght: ctxH,
                      hid: true,
                      canvasWidth1: ctxW1
                    })
               
                  }
                })
              });
            } else if (res.data.is_join == 1){
              // 已经参与
              wx.hideLoading()
              clearInterval(that.data.righttimetimer)
              wx.showModal({
                title: '您已经参与过了~~请等待排名结果',
                content: '',
                cancelText: '取消',
                confirmText: '确定',
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                    wx.navigateTo({
                      url: "../match-details/match-details?orderno=" + options.orderno
                    })

                  } else if (res.cancel) {
                    wx.navigateTo({
                      url: "../match-details/match-details?orderno=" + options.orderno
                    })
                  }
                }
              })
            }
          }


          //---------------------------------------------------------------------------------
          if (0) {
            //  判断是否在有效时间内 Number(nowTime) < Number(envelopes.time) + Number(envelopes.share_time)
            //  倒计时 Number(envelopes.time) - (Number(nowTime) - Number(envelopes.share_time))
            console.log(options.orderno,  'game界面 发送order_detail 验证是否超时')
            wx.request({
              url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=order_detail',
              data: {
                orderno: options.orderno,
              },
              header: {
                'content-type': 'application/json' // 默认值
              },
              success: function (res) {
                var envelopes = res.data
                var nowTime = Date.parse(new Date()).toString();
                nowTime = nowTime.substr(0, 10);
                // 验证红包是否过期 Number(nowTime) < Number(envelopes.time) + Number(envelopes.share_time)
                console.log(res, 'order_detail返回信息')
                if (Number(nowTime) < Number(envelopes.time) + Number(envelopes.share_time)) {
                  wx.hideLoading()
                  that.setData({
                    userInfo: app.globalData.userInfo,
                    righttime: (Number(envelopes.time) - (Number(nowTime) - Number(envelopes.share_time))) ? (Number(envelopes.time) - (Number(nowTime) - Number(envelopes.share_time))) : 500,
                  })

                  // 缓存 cove-view 中图片
                  loadimages(wxmlimglist, function (pastList) {
                    var pastList = pastList;
                    that.setData({
                      gameImagelist: pastList,
                    })
                  })

                  that.data.rightTime();// 开始倒计时

                  //缓存canvas 中图片
                  loadimages(imgList, function (pastList) {
                    var pastList = pastList;
                    var leftPath = pastList[0];
                    var rightPath = pastList[1];
                    var beginPath = pastList[2];
                    var ballPath = pastList[3];
                    //获取手机屏幕信息  适配页面
                    wx.getSystemInfo({
                      success: function (res) {
                        var ctxW = res.windowWidth * 0.82;
                        var ctxH = res.windowHeight;

                        var ctxW1 = res.windowWidth;

                        that.setData({
                          canvasWidth: ctxW,
                          canvasHeght: ctxH,
                          hid: true,
                          canvasWidth1: ctxW1
                        })
                        //  赛道绘制
                        var ctxGameGg = wx.createCanvasContext('gamebg')

                        //console.log(ctxW, ctxH)

                        /*ctxGameGg.setFillStyle('#ffebac')
                        ctxGameGg.fillRect(ctxW * 0.12, 0, ctxW * 0.75, ctxH)
  
                        ctxGameGg.setStrokeStyle('#e8d594')
                        ctxGameGg.moveTo(ctxW * 0.5, 0)
                        ctxGameGg.lineTo(ctxW * 0.5, ctxH)
  
                        var bgW = ctxW * 0.038;
                        var bgH = ctxH * 0.058;
                        var bgNum = Math.ceil(ctxH / bgH) + 80;
  
                        ctxGameGg.setFillStyle('#999999')
                        ctxGameGg.setFontSize(14)
                        for (var i = 0; i < 11; i++) {
                          ctxGameGg.fillText(10 * i + "m", 0, ctxH * (0.75 - 0.4 * i))
                          ctxGameGg.fillText(10 * i + "m", ctxW * 0.905, ctxH * (0.75 - 0.4 * i))
                          ctxGameGg.setStrokeStyle('#e8d594')
                          ctxGameGg.moveTo(ctxW * 0.12, ctxH * (0.752 - 0.4 * i))
                          ctxGameGg.lineTo(ctxW * 0.88, ctxH * (0.752 - 0.4 * i))
                          ctxGameGg.stroke()
                        }
  
                        for (var i = 0; i < bgNum; i++) {
                          ctxGameGg.drawImage(leftPath, ctxW * 0.1, ctxH * 0 + bgH * (i - 79), bgW, bgH);
                          ctxGameGg.drawImage(rightPath, ctxW * 0.862, ctxH * 0 + bgH * (i - 79), bgW, bgH);
                        }*/

                        /*ctxGameGg.drawImage(beginPath, ctxW * 0.25, ctxH * 0.56, ctxW * 0.5, ctxH * 0.30);
  
                        ctxGameGg.drawImage(ballPath, ctxW * 0.42, ctxH * 0.71, ctxW * 0.15, ctxH * 0.08)*/
                        ctxGameGg.draw()

                        var t = 0;// 记录当前次数
                        var b = 0;//开始的位置
                        //var c = that.data.c;//移动距离
                        //var d = that.data.d; //总次数
                        var s = 0;//回弹距离

                        /*that.move = function (c, d, rice) {
  
                          that.timer = setInterval(function () {
                            t++
                            if (t > d) {// 用户游戏结束
                              clearInterval(that.timer)
                              clearInterval(that.data.righttimetimer)
  
                              console.log(options.orderno, app.globalData.openid, rice, '游戏结束')
                              //游戏结束 向后台 发送成绩 等信息  
                              wx.request({
                                url: 'https://www.daguaishou.com/index.php?m=content&c=wx_development&a=gameover', //仅为示例，并非真实的接口地址
                                data: {
                                  orderno: options.orderno,
                                  openid: app.globalData.openid,
                                  meter: rice
                                },
                                header: {
                                  'content-type': 'application/json' // 默认值
                                },
                                success: function (res) {
                                  console.log(res, '游戏结束')
                                  if (res.data.code == -4) {
                                    wx.showModal({
                                      title: '对不起,您来得太慢了~~',
                                      content: '已经被抢光了,去发一个试试',
                                      confirmText: '确定',
                                      success: function (res) {
                                        if (res.confirm) {
                                          console.log('用户点击确定')
                                          wx.navigateTo({
                                            url: "../index/index"
                                          })
                                        } else if (res.cancel) {
                                          wx.navigateTo({
                                            url: "../index/index"
                                          })
                                        }
                                      }
                                    })
                                  } else {
                                    that.setData({
                                      rankinglayerShow: true,
                                      ruleLayerShow: false,
                                      rice: rice,
                                      paiming: res.data.paiming
                                    });
                                  }
                                }
                              })
  
                            }
                            var point = Tween["Quint"](t, b, c, d, s);
  
                            ctxGameGg.clearRect(0, 0, ctxW, ctxH)
  
                            ctxGameGg.setFillStyle('#ffebac')
                            ctxGameGg.fillRect(ctxW * 0.12, 0, ctxW * 0.75, ctxH)
  
                            ctxGameGg.setStrokeStyle('#e8d594')
                            ctxGameGg.moveTo(ctxW * 0.5, 0)
                            ctxGameGg.lineTo(ctxW * 0.5, ctxH)
  
                            ctxGameGg.setFillStyle('#999999')
                            ctxGameGg.setFontSize(14)
                            for (var i = 0; i < 11; i++) {
                              ctxGameGg.fillText(10 * i + "m", 0, ctxH * (0.75 - 0.4 * i) + point)
                              ctxGameGg.fillText(10 * i + "m", ctxW * 0.905, ctxH * (0.75 - 0.4 * i) + point)
                              ctxGameGg.setStrokeStyle('#e8d594')
                              ctxGameGg.moveTo(ctxW * 0.12, ctxH * (0.752 - 0.4 * i) + point)
                              ctxGameGg.lineTo(ctxW * 0.88, ctxH * (0.752 - 0.4 * i) + point)
                              ctxGameGg.stroke()
                            }
  
                            var bgNumWL = ctxW * 0.1;
                            var bgNumWR = ctxW * 0.862;
                            var bgNumH = 0
                            for (var i = 0; i < bgNum; i++) {
                              bgNumH = bgH * (i - 79) + point
                              ctxGameGg.drawImage(leftPath, bgNumWL, bgNumH, bgW, bgH);
                              ctxGameGg.drawImage(rightPath, bgNumWR, bgNumH, bgW, bgH);
                            }
  
                            ctxGameGg.drawImage(beginPath, ctxW * 0.25, ctxH * 0.56 + point, ctxW * 0.5, ctxH * 0.30);
  
                            var Hto = point / 8
  
                            ctxGameGg.drawImage(ballPath, ctxW * 0.42, ctxH * 0.71 - Hto, ctxW * 0.15, ctxH * 0.08)
  
                            ctxGameGg.draw()
  
                          }, 30)
                        }*/
                        //that.move();
                      }
                    })
                  });

                } else {
                  wx.hideLoading()
                  wx.showModal({
                    title: '红包已过期,去发一个试试吧',
                    content: '',
                    success: function (res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: "../index/index"
                        })
                      } else if (res.cancel) {
                        wx.navigateTo({
                          url: "../index/index"
                        })
                      }
                    }
                  })
                }

              }
            })

          } else if(0){
            wx.hideLoading()
            wx.showModal({
              title: '您已经参与过了~~请等待排名结果',
              content: '',
              cancelText: '取消',
              confirmText: '确定',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  wx.navigateTo({
                    url: "../match-details/match-details?orderno=" + options.orderno
                  })

                } else if (res.cancel) {
                  wx.navigateTo({
                    url: "../match-details/match-details?orderno=" + options.orderno
                  })
                }
              }
            })
          }


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