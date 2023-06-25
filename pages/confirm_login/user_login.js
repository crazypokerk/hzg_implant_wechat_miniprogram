// pages/confirm_login/user_login.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    baseURL: "https://testforguncy.app.hzgcloud.cn/mini_program_test",
    serverUrl: "https://testforguncy.app.hzgcloud.cn",
    clientID: "f07a5a25-c9c6-409d-bb24-437185dc",
    ssoPassword: "yzgd6bHAoEm$",
    avatarUrl: '/resources/img/default_avatar.svg',
    nickname: ''
  },

  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    this.setData({
      avatarUrl,
    })
  },

  onGetUserProfile: function () {
    let that = this;
    wx.login({
      timeout: 3000,
      success: userResponse => {
        if (userResponse.code) {
          wx.showLoading({
            title: "正在登录",
            mask: true
          });
          console.log(userResponse);
          that.verifyLoginUser(userResponse.code, {
            "nickname": that.data.nickname,
            "avatarurl": that.data.avatarUrl,
            "baseURL": that.data.baseURL
          }, null);
        } else {
          wx.showModal({
            title: "错误",
            confirmText: "确定",
            content: "发生错误"
          });
        }
      }
    });
  },
  verifyLoginUser: function (code, userObj, openid) {
    let that = this;
    console.log("userObj");
    console.log(userObj);
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
        if (userObj == null) {
          url = `${that.data.baseURL}/ServerCommand/GetSSOToken`;
          body = {
            "userName": openid,
            "baseURL": that.data.baseURL,
            "ssoPassword": that.data.ssoPassword
          }
        }
        if (openid == null) {
          url = `${that.data.baseURL}/ServerCommand/AddUserAndLogin`;
          body = {
            "code": code,
            "fullname": userObj.nickname,
            "avatarurl": userObj.avatarurl,
            "baseURL": userObj.baseURL,
            "ssoPassword": that.data.ssoPassword
          }
        }
        wx.request({
          url: url,
          method: "POST",
          header: { "Authorization": response.data.Authorization },
          data: JSON.stringify(body),
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

  onInputChange: function (e) {
    this.setData({
      nickname: e.detail.value
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this;
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
            success: response => {
              console.log("response.data:::");
              console.log(response.data);
              wx.request({
                url: `${that.data.baseURL}/ServerCommand/Code2SessionID`,
                method: "POST",
                header: { "Authorization": response.data.Authorization },
                data: { "code": result.code },
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
                          console.log("end --> wx.login")
                        }
                        wx.hideLoading();
                      }
                    })
                  } else {
                    wx.showModal({
                      content: "错误:code2SessionResult返回有误",
                      confirmText: "确定"
                    });
                  }
                }
              })
            },
            fail: err => {
              console.log(`/ServerCommand/GetRequestToken${err}`);
              wx.hideLoading();
            }
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})