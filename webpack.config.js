const path = require("path")

module.exports = {
    mode: "production",
    entry: `./SliderVerify/index.js`,
    output: {
      path: path.resolve(__dirname, "./build"),
      filename: "SliderVerify.min.js", // 指定生成的库文件名称
      library: {
        type: "umd", // 指定打包出来的库 是哪种模块化规范 通常我们采用umd 就能满足 CommonJS、AMD 以及 script 标签使用
        name: "SliderVerify", // 这就是我们导出的全局对象上的属性的名称 例如 window.mylib  上面有一个test方法
      },
    }
}