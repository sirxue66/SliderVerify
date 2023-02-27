import assets from "./assets.js"
class SliderVerify{
    c_blue = "#1e90ff"
    c_green = "#52ccba"
    c_red = "#f57a7a"
    // 校验需要的私有变量
    #startX = 0 //鼠标按下的起始X坐标
    #startFlag = false  //是否滑动的标志
    #eventFlag = true
    #distance = 0 //抠图偏移量
    #moveX = [] //移动过程的X坐标记录
    #moveY = []  //移动过程的Y坐标记录
    #offset = 4
    // 校验结果
    #verifyResult = {
        result: "success",
        type: 0  //0 成功  1 失败  2 机器操作
    }
    constructor(option){
        const {width=320, height=160,L=42,R=9,offset=4,blockH=35,visible=true,text="向右滑动进行验证"} = option
        this.containerDom = option.el || null
        this.W = width //canvas宽
        this.H = height  //canvas高
        this.L = L // 抠图边长
        this.R = R   //抠图半径
        this.blockH = blockH //滑块高度
        this.visible = visible //显隐
        this.text = text //滑动文本
        this.imgUrl = option.imgUrl || null //图片背景图
        this.#offset = offset //精确度 滑块左右偏移量
        this.successFun = option.success || this.onSuccess
        this.failFun = option.fail || this.onFail
        this.refishFun = option.refish || this.onRefish
        this.setImgUrl = this.setImgUrl
        // Dom 变量
        this.Container = null
        this.canvasDom = null
        this.canvasDom_ctx = null
        this.blockDom = null
        this.blockDom_ctx = null
        this.sliderDom = null
        this.sliderBlock = null
        this.iconDom = null
        this.textDom = null
        this.activeDom = null
        // 抠图位置坐标
        this.margin = 2  //抠图间隙
        this.X = this.getRandomNumber((L+R*2)*2, width-(L+R*2)-this.margin) //随机X坐标
        this.Y = this.getRandomNumber(L*2+this.margin, height-(L+R*2)-this.margin) //随机Y坐标
        // 静态资源
        this.assets = assets

        this.init()
    }

    init(){
        this.initDom()
        this.initDrawImg()
        this.addEvent()
    }

    /**
     * 初始化Dom
     */
    initDom(){
        this.Container = typeof this.containerDom === "string" ? document.querySelector(this.containerDom) : this.containerDom
        if(!this.Container instanceof HTMLElement){
            throw new Error("未找到初始化容器，请初始化一个Dom容器！")
        }
        this.Container.innerHTML = ""
        if(!this.visible) return //是否显示
        this.Container.style.position = "relative"
        this.Container.style.borderRadius = "3px"
        this.Container.style.background = "#ffffff"
        this.Container.style.padding = "8px"
        this.Container.style.overflow = "hidden"
        // Canvas部分
        const canvasContainer = document.createElement("div")
        canvasContainer.style.position = "relative"

        this.canvasDom = document.createElement("canvas")
        this.canvasDom_ctx = this.canvasDom.getContext("2d")
        this.canvasDom.height = this.H
        this.canvasDom.width = this.W

        this.blockDom = document.createElement("canvas")
        this.blockDom_ctx = this.blockDom.getContext("2d", {willReadFrequently: true}) //willReadFrequently使得多次读取image更快
        this.blockDom.height = this.H
        this.blockDom.width = this.W
        this.blockDom.style.position = "absolute"
        this.blockDom.style.left = 0

        // 拖动部分
        this.sliderDom = document.createElement("div")
        this.sliderDom.style.cssText = `height:${this.blockH}px;position:relative;border-radius:3px;background:#f7f9fa;text-align:center;border:1px solid #e4e7eb;`
        this.textDom = document.createElement("span")
        this.textDom.innerText = this.text
        this.textDom.style.cssText = `position:relative;margin-right:20px;line-height:${this.blockH}px;letter-spacing:2px;color:#999797;font-size:14px;margin-left: 20px;`
        this.sliderBlock = document.createElement("div")
        this.sliderBlock.style.cssText = 
        `height:${this.blockH}px;width:${this.L+this.R*2}px;position:absolute;left:0;top:-1px;background:${this.c_blue};border-radius:3px;cursor:pointer;text-align:center;border:1px solid ${this.c_blue};`
        this.activeDom = document.createElement("div")
        this.activeDom.style.cssText = `height:${this.blockH}px;width:0px;position:absolute;left:0;top:-1px;background:#d1e9fe;border-radius:3px;border:1px solid ${this.c_blue};`

        canvasContainer.appendChild(this.canvasDom)
        canvasContainer.appendChild(this.blockDom)
        this.Container.appendChild(canvasContainer)
        this.sliderBlock.appendChild(this.makeSliderIcon())
        this.sliderDom.appendChild(this.textDom)
        this.sliderDom.appendChild(this.activeDom)
        this.sliderDom.appendChild(this.sliderBlock)
        this.Container.appendChild(this.sliderDom)

    }

    makeSliderIcon(){
        this.iconDom = document.createElement("img")
        // this.iconDom.title = "SliderIcon"
        this.iconDom.alt = "SliderIcon"
        this.iconDom.src = this.assets.defaultIcon
        this.iconDom.style.height = `${this.blockH}px`
        this.iconDom.addEventListener("mousedown",(e) => e.preventDefault())
        return this.iconDom
    }
    getImageUrl(){
        if(this.imgUrl){
            return this.imgUrl
        } 
        else {
            const random = this.getRandomNumber(1, this.assets.defaultImage.length)
            return this.assets.defaultImage[random]
        }
    }
    /**
     * 初始化图形
     */
    async initDrawImg(){
        const img = await this.getBGImg(this.getImageUrl())
        // 背景抠图填充灰色
        this.drawPath(this.canvasDom_ctx, this.X, this.Y, 'fill')
        this.canvasDom_ctx.drawImage(img,0,0,this.W,this.H)

        //裁剪抠图滑块
        this.drawPath(this.blockDom_ctx, this.X, this.Y, 'clip')
        this.blockDom_ctx.drawImage(img,0,0,this.W,this.H)

        const x1 = this.X - this.margin
        const y1 = this.Y - this.R * 2 - this.margin
        const HW = this.L + this.R * 2 + this.margin
        const ImageData = this.blockDom_ctx.getImageData(x1, y1, HW, HW)
        // 调整滑块画布宽度,为了将原抠图去掉
        this.blockDom.width = HW
        this.blockDom_ctx.putImageData(ImageData, 0, y1)
    }

    /**
     * 添加鼠标事件
     */
    addEvent(){
        if(this.isMobile()){
            this.sliderBlock.addEventListener("touchstart", this.mouseStart.bind(this), false)
            this.Container.addEventListener("touchmove", this.mouseMove.bind(this), false)
            this.Container.addEventListener("touchend", this.mouseEnd.bind(this), false)
        } else {
            this.sliderBlock.addEventListener("mousedown", this.mouseStart.bind(this), false)
            this.Container.addEventListener("mousemove", this.mouseMove.bind(this), false)
            this.Container.addEventListener("mouseup", this.mouseEnd.bind(this), false)
        }
    }
    mouseStart(e){
        if(!this.#eventFlag) return
        this.#startX = e.clientX
        this.#startFlag = true
        this.Container.addEventListener("mouseleave", this.mouseEnd.bind(this), {once: true})
    }
    mouseMove(e){
        if(!this.#eventFlag) return
        if(!this.#startFlag) return
        if(e.clientX <= this.#startX) return //左滑边界
        this.#distance = e.clientX - this.#startX
        if(this.#distance > this.W - (this.L+this.R*2)) return //右滑边界
        this.activeDom.style.width = this.#distance + "px"
        this.sliderBlock.style.transform = `translateX(${this.#distance}px)`
        this.blockDom.style.transform = `translateX(${this.#distance}px)`
        // 记录移动轨迹
        this.#moveX.push(e.clientX)
        this.#moveY.push(e.clientY)
    }
    mouseEnd(e){
        if(!this.#eventFlag) return
        if(!this.#startFlag) return //防止鼠标离开事件二次触发刷新
        this.#startFlag = false
        this.verify()
        console.log(this.#verifyResult)
        if(this.#verifyResult.result === "success"){
            this.#eventFlag = false
            this.successView()
            this.successFun(this.#verifyResult)
        } 
        else {
            this.failView()
            this.failFun(this.#verifyResult)
            setTimeout(() => {
                this.onRefish()
            }, 800)
        }
    }
    setImgUrl(url){
        this.imgUrl = url;
    }

    successView(){
        this.iconDom.src = this.assets.successIcon
        this.sliderDom.style.textAlign = "left"
        this.sliderBlock.style.background = this.c_green
        this.sliderBlock.style.border = `1px solid ${this.c_green}`
        this.activeDom.style.background = "#d2f4ef"
        this.activeDom.style.border = `1px solid ${this.c_green}`
        this.textDom.innerText = "验证通过"
        this.textDom.style.color = this.c_green
        this.textDom.style.zIndex = 10
    }
    failView(){
        this.iconDom.src = this.assets.failIcon
        this.sliderDom.style.textAlign = "left"
        this.sliderBlock.style.background = this.c_red
        this.sliderBlock.style.border = `1px solid ${this.c_red}`
        this.activeDom.style.background = "#fce1e1"
        this.activeDom.style.border = `1px solid ${this.c_red}`
        this.textDom.innerText = "验证失败"
        this.textDom.style.color = this.c_red
        this.textDom.style.zIndex = 10
    }

    /**
     * 验证
     */
    verify(){
        // 校验抠图位置
        const standardXY = this.X - this.margin
        if(!(standardXY-this.#offset <= this.#distance && this.#distance <= standardXY+this.#offset)){
            this.#verifyResult = {
                result: "fail",
                type: 1
            }
            return
        }
        //校验Y坐标偏移
        const Y = Array.from(new Set(this.#moveY))
        if(Y.length <= 1){
            this.#verifyResult = {
                result: "fail",
                type: 2
            }
            return
        }
        //校验X坐标滑动是否匀速
        const X = this.#moveX.map((item, index) => this.#moveX[index+1] - item)
        const X1 = Array.from(new Set(X))
        if(X1.length <= 1){
            this.#verifyResult = {
                result: "fail",
                type: 2
            }
            return
        }
    }

    /**
     * 画移动抠图
     * @param {*} ctx canvas上下文
     * @param {*} x  
     * @param {*} y 
     * @param {*} operation 填充还是裁剪 
     */
    drawPath(ctx, x, y, operation = 'fill' || 'clip'){
        const L = this.L
        const R = this.R
        const PI = Math.PI
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.arc(x + L / 2, y - R + 2, R, 0.72 * PI, 2.26 * PI)
        ctx.lineTo(x + L, y)
        ctx.arc(x + L + R - 2, y + L / 2, R, 1.21 * PI, 2.78 * PI)
        ctx.lineTo(x + L, y + L)
        ctx.lineTo(x, y + L)
        ctx.arc(x + R - 2, y + L / 2, R + 0.4, 2.76 * PI, 1.24 * PI, true)
        ctx.lineTo(x, y)
        ctx.lineWidth = this.margin
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
        ctx.stroke()
        ctx.globalCompositeOperation = 'destination-over'
        // 判断是填充还是裁切, 裁切主要用于生成图案滑块
        operation === 'fill'? ctx.fill() : ctx.clip()
    }
    getBGImg(url){
        return new Promise(resolve => {
            const img = new Image()
            img.crossOrigin = 'Anonymous';
            img.src = url
            img.onload = () => resolve(img)
        })
    }

    /**
     * 获取区间整数
     * @param {*} min 
     * @param {*} max 
     * @returns 
     */
    getRandomNumber(min,max){
        return Math.round(Math.random()*(max-min)+min)
    }
    isMobile() {
        let flag = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
        return flag;
    }
    onSuccess(){
        console.log("验证成功！")
    }
    onFail(){
        console.log("验证失败！")
    }
    /**
     * 刷新视图
     */
    onRefish(){
        //重置偏移量
        this.blockDom.style.transform = "translateX(0px)"
        this.sliderBlock.style.transform = "translateX(0px)"
        this.sliderDom.style.textAlign = "center"
        this.sliderBlock.style.background = this.c_blue
        this.sliderBlock.style.border = `1px solid ${this.c_blue}`
        this.activeDom.style.width = 0
        this.activeDom.style.background = "#d1e9fe"
        this.activeDom.style.border = `1px solid ${this.c_blue}`
        this.textDom.innerText = this.text
        this.textDom.style.color = "#999797"
        this.textDom.style.zIndex = 0
        this.iconDom.src = this.assets.defaultIcon
        //将滑块宽度还原
        this.blockDom.width = this.W
        //重新随机抠图位置
        this.X = this.getRandomNumber((this.L+this.R*2)*2, this.W-(this.L+this.R*2)-this.margin)
        this.Y = this.getRandomNumber(this.L*2+this.margin, this.H-(this.L+this.R*2)-this.margin)
        //清除画布
        this.canvasDom_ctx.clearRect(0,0,this.W, this.H)
        this.blockDom_ctx.clearRect(0,0,this.W, this.H)
        //重新画图
        this.initDrawImg()
        this.resetData()
        console.log("刷新成功！")
    }
    /**
     * 重置校验数据
     */
    resetData(){
        this.#startX = 0
        this.#startFlag = false
        this.#distance = 0
        this.#moveX = []
        this.#moveY = []
        this.#verifyResult = {
            result: "success",
            type: 0
        }
    }
}

export default SliderVerify