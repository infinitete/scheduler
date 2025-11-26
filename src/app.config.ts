export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/schedule-list/index',
    'pages/schedule-form/index',
    'pages/schedule-detail/index',
    'pages/filter/index',
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '日程管理',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    custom: true,  // 启用自定义 tabBar
    color: "#7A7E83",
    selectedColor: "#667eea",
    backgroundColor: "#ffffff",
    borderStyle: "black",
    list: [
      {
        pagePath: "pages/home/index",
        text: "首页"
      },
      {
        pagePath: "pages/schedule-list/index",
        text: "日程"
      }
    ]
  },
  requiredPrivateInfos: ['chooseLocation']
})