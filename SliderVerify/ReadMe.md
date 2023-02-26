# 欢迎使用 SliderVerify

**SliderVerify 是纯JS代码编写的web图片滑块轻量级验证库，不依赖任何第三方包，不论你的项目使用任何框架，引入即可使用**
**通过抠图位置、用户滑动过程上下偏移量、滑动速度进行校验，防止机刷**
**注： 纯JS编写，只能做一些简单验证，对于安全性较高的情景，谨慎使用**

----

### 项目地址

[预览地址](http://localhost/)

[源码地址](http://localhost/)


### 使用样例

```javascript
//容器Dom
<div id="sliderVerifyDom"></div>

//使用
new SliderVerify({
el: "#sliderVerifyDom",
...
})
```

### 配置项

| option        | 类型       |  默认值           | 是否必填     | 解释
| --------      | -----:     | :----:           | :----:   |
| el            | string     |   无             | 是    |  视图容器
| width         | number     |   320            | 否    | 画布宽度
| height        | number     |  160             | 否    | 画布高度
| L             | number     |   42             | 否    | 方形滑块边长
| R             | number     |   9              | 否    | 突出圆形半径
| text          | string     |  向右滑动进行验证 | 否     | 滑动条的文字说明
| imgUrl        | string     |   无             | 否    | 画布背景图片（网络地址或者项目本地地址）
| offset        |  number    |   4              | 否    | 校验精准度，滑块左右偏移量
| success       |  function  |                  | 是    | 校验成功的回调
| fail          | function   |                  | 否    | 校验失败的回调

##### success fail 回调函数参数
```javascript
{
result: "success",   //success  校验通过 fail  校验不通过
type: 0                 //0 成功 1失败   2 怀疑机刷
}
```

### 说明：
**纯JS编写，只能做一些简单验证，对于安全性较高的情景，谨慎使用**
**内置10 张随机背景图，可不设置imgUrl**
**若设置imgUrl，在校验失败的回调中应该调用 实例的setImgUrl(url)更换背景图，不然背景图图片不会变**
例如：
```js
var slider = new SliderVerify({
    el: "#slideCanvas",
    fail: setImg
})
function setImg(result){
    console.log("回调", result)
    slider.setImgUrl("./img/01.jpg")
}
```






