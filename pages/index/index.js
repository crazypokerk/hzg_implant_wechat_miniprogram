// index.js
// 获取应用实例
const app = getApp()
var amapFile = require('../../libs/amap-wx.130');
var markersData = [];

Page({
  data: {
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

    wx.navigateTo({
      url: "/pages/confirm_login/user_login"
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
