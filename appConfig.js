module.exports = {
  // 一般情况下，它的值是 /${prodPathPrefix}/${prodPath}
  basename: process.env.NODE_ENV === 'production' ? '/system/<%= prodPath %>' : '',

  // 打包出口目录的前缀，注意：不需要以/开头
  prodPathPrefix: 'system',

  // 打包的出口目录(默认dist目录)
  prodPath: '<%= prodPath %>',

  // syscode 就是打包出口目录的名称
  syscode: '<%= prodPath %>',

  // 本地测试端口
  port: 3880,

  // 本地代理环境地址
  target: 'http://test1-web.autozuche.com/',

  isSystem: true,

  autoLogin: true,

  mfe: true,
}
