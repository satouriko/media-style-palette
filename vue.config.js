module.exports = {
  pages: {
    index: {
      // page 的入口
      entry: 'example/src/main.js',
      // 模板来源
      template: 'example/public/index.html',
      // 在 dist/index.html 的输出
      filename: 'index.html'
    },
  }
}
