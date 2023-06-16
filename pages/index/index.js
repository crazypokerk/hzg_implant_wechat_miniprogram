// index.js
// 获取应用实例
const app = getApp()
var amapFile = require('../../libs/amap-wx.130');
var markersData = [];

Page({
  data: {
    baseURL: "https://testforguncy.app.hzgcloud.cn/mini_program_test",
    serverUrl: "https://testforguncy.app.hzgcloud.cn",
    clientID: "f07a5a25-c9c6-409d-bb24-437185dc",
    makers: [],
    latitude: '',
    longitude: '',
    textData: {},
    motto: 'test for wechat, label text',
    userInfo: {},
    hasUserInfo: false,
    weatherData: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    canIUseGetUserProfile: true,
  },
  onLoad: function () {
    let that = this;
    console.log(that);
    wx.showLoading({
      title: "正在加载中",
      mask: true
    });

    // 初始化登录
    wx.login({
      success(result) {
        if (result.code) {
          console.log(result.code);
          console.log(that.data.baseURL);
          wx.request({
            url: `${that.data.baseURL}/ServerCommand/GetRequestToken`,
            method: "POST",
            data: JSON.stringify({
              "client_id": that.data.clientID,
              "serverURL": that.data.serverUrl
            }),
            fail: err => {
              console.log(`/ServerCommand/GetRequestToken${err}`);
              wx.hideLoading();
            },
            success: response => {
              console.log("response.data:::");
              console.log(response.data);
              wx.request({
                url: `${that.data.baseURL}/ServerCommand/Code2SessionID`,
                method: "POST",
                header: { "Authorization": response.data.Authorization },
                data: { "code": result.code },
                fail: err => {
                  console.log(`/ServerCommand/Code2SessionID${err}`);
                  wx.hideLoading();
                },
                success: code2SessionResult => {
                  console.log("code2SessionResult:::");
                  console.log(code2SessionResult.data);
                  if (code2SessionResult.data.openid) {
                    wx.request({
                      url: `${that.data.baseURL}/ServerCommand/GetOpenidCount`,
                      method: "POST",
                      header: { "Authorization": response.data.Authorization },
                      data: { "openid": code2SessionResult.data.openid },
                      fail: err => {
                        console.log(`/ServerCommand/GetOpenidCount${err}`);
                        wx.hideLoading();
                      },
                      success: countResult => {
                        console.log("countResult:::");
                        console.log(countResult);
                        if (countResult.data.Message > 0) {
                          wx.showLoading({
                            title: "自动登录中",
                            mask: true
                          })
                          that.verifyLoginUser(result.code, null, code2SessionResult.data.openid);
                        } else {
                          wx.hideLoading();
                          console.log("end --> wx.login")
                        }
                      }
                    })
                  } else {
                    wx.showModal({
                      content: code2SessionResult.data.Message,
                      confirmText: "确定"
                    });
                  }
                }
              })
            }
          })
        }

      }
    })
  },
  verifyLoginUser: function (code, userResponse, openid) {
    let that = this;
    console.log("userResponse");
    console.log(userResponse);
    wx.request({
      url: `${that.data.baseURL}/ServerCommand/GetRequestToken`,
      method: "POST",
      data: JSON.stringify({
        "client_id": that.data.clientID,
        "serverURL": that.data.serverUrl
      }),
      success(response) {
        console.log(response);
        let url = null, body = null;
        if (userResponse == null) {
          url = `${that.data.baseURL}/ServerCommand/GetSSOToken`;
          body = {
            "userName": openid,
            "baseURL": that.data.baseURL
          }
        }
        if (openid == null) {
          url = `${that.data.baseURL}/ServerCommand/AddUserAndLogin`;
          body = {
            "code": code,
            "fullname": userResponse.userInfo.nickName,
            "avatarurl": userResponse.userInfo.avatarUrl,
            "gender": userResponse.userInfo.gender,
            "country": userResponse.userInfo.country,
            "province": userResponse.userInfo.province,
            "city": userResponse.userInfo.city,
            "language": userResponse.userInfo.language,
            "baseURL": that.data.baseURL
          }
        }
        wx.request({
          url: url,
          method: "POST",
          header: { "Authorization": response.data.Authorization },
          data: body,
          success(response) {
            console.log(response);
            wx.setStorage({
              key: "openid",
              data: response.data.openid,
              success: () => {
                if (response.data.ErrCode === 0) {
                  console.log(response.data.redirectURL);
                  wx.navigateTo({
                    url: `/pages/webview/forguncy_webview?url=${encodeURIComponent(response.data.redirectURL)}`
                  })
                }
              }
            })
          }
        })
      }
    })
  },
  markertap: function (e) {
    var id = e.markerId;
    this.showMarkerInfo(markersData, id);
    this.changeMarkerColor(markersData, id);
  },
  // 事件处理函数
  bindViewTap() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  // 高德地图
  /**
  var myAmapFun = new amapFile.AMapWX({ key: 'd1b25af5b02259b95861102e7f1ab452' });
  myAmapFun.getPoiAround({
    iconPathSelected: '../../resources/img/marker_checked', //如：..­/..­/img/marker_checked.png
    iconPath: '../../resources/img/marker.png.png', //如：..­/..­/img/marker.png
    success: function (data) {
      markersData = data.markers;
      this.setData({
        markers: markersData
      });
      this.setData({
        latitude: markersData[0].latitude
      });
      this.setData({
        longitude: markersData[0].longitude
      });
      this.showMarkerInfo(markersData, 0);
    },
    fail: function (info) {
      wx.showModal({ title: info.errMsg })
    }
  });
  // 获取实时天气数据
  myAmapFun.getWeather({
    success: function (data) {
      console.log(data);
      // var this = this;
      // this.setData({

      // });
      // this.weatherData = data;
    },
    fail: function (error) {
      console.log(error);
    }
  });
  */
  showMarkerInfo: function (data, i) {
    this.setData({
      textData: {
        name: data[i].name,
        desc: data[i].address
      }
    });
  },
  changeMarkerColor: function (data, i) {
    var markers = [];
    for (var j = 0; j < data.length; j++) {
      if (j == i) {
        data[j].iconPath = "../../resources/img/marker_checked"; //如：..­/..­/img/marker_checked.png
      } else {
        data[j].iconPath = "../../resources/img/marker.png.png"; //如：..­/..­/img/marker.png
      }
      markers.push(data[j]);
    }
    this.setData({
      markers: markers
    });
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    let that = this;
    wx.getUserProfile({
      desc: '需要获取用户信息用于登录', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (userResponse) => {
        console.log(userResponse)
        wx.showLoading({
          title: "正在登录",
          mask: true
        });
        wx.login({
          success: res => {
            if (res.code) {
              that.verifyLoginUser(res.code, userResponse, null);
            }
          },
          fail: error => {
            wx.hideLoading();
            wx.showModal({
              title: "错误",
              content: error,
              confirmText: "确定"
            });
          }
        });
      }
    })
  },
  getUserInfo(e) {
    // 不推荐使用getUserInfo获取用户信息，预计自2021年4月13日起，getUserInfo将不再弹出弹窗，并直接返回匿名的用户个人信息
    console.log(e)
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  postmsg(data) {
    console.log(data)
  }
})
