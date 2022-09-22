var app = new Vue({
    el: '#app',
    data: {
        nowTime: '',
        loading: false,
        server: 'http://139.9.83.91:7777/api',
        amount: {
            totalAmount: 0,
            dailyParseAmount: 0,
            dailyRegisterAmount: 0,
            totalEquAmount: 0,
            onlineEquAmount: 0
        },
        oldAmount: {},
        detail: [],
        fontSize: 16,
        seamlessScrollOption: {
            step: 0.2, // 数值越大速度滚动越快
            limitMoveNum: 2, // 开始无缝滚动的数据量 this.dataList.length
            hoverStop: true, // 是否开启鼠标悬停stop
            direction: 1, // 0向下 1向上 2向左 3向右
            openWatch: true, // 开启数据实时监控刷新dom
            singleHeight: 0, // 单步运动停止的高度(默认值0是无缝不停止的滚动) direction => 0/1
            singleWidth: 0, // 单步运动停止的宽度(默认值0是无缝不停止的滚动) direction => 2/3
            waitTime: 1000, // 单步运动停止的时间(默认值1000ms)
        },
    },
    mounted() {
        this.init();
    },
    watch: {
        amount: {
            handler(newValue, oldValue) {
                this.oldAmount = oldValue
            },
            deep: true
        }
    },
    methods: {
        init() {
            this.getNowTime();
            this.setFont();
            window.onresize = () => {
                this.setFont();
            }
            this.getData()
            this.getDetail()
            this.darwMap()
            this.getRecent()
            this.setIntervalFun()
        },
        getNowTime() {
            setInterval(() => {
                var now = new Date();
                var year = now.getFullYear(); //年
                var month = now.getMonth() + 1; //月
                var day = now.getDate(); //日
                var h = now.getHours();
                var m = now.getMinutes();
                var s = now.getSeconds();
                if (h < 10) {
                    h = "0" + h;
                }
                if (m < 10) {
                    m = "0" + m;
                }
                if (s < 10) {
                    s = "0" + s;
                }
                this.nowTime = year + '-' + month + '-' + day + ' ' + h + ":" + m + ':' + s;
            }, 1);
        },
        setFont() {
            var html = document.documentElement;// 获取html
            // 获取宽度
            var width = html.clientWidth;

            // 判断
            if (width < 1024) width = 1024

            // 设置html的基准值
            var fontSize = width / 80 + 'px';
            // 设置给html
            html.style.fontSize = fontSize;
            this.fontSize = width / 80
        },
        darwMap() {
            axios({
                method: 'get',
                url: `${this.server}/borche-snms-service/board/map`,
            }).then(res => {
                const data = JSON.parse(JSON.stringify(res.data.data).replace(/province/g, 'name').replace(/count/g, 'value'))

                var yData = [];

                data.sort(function (o1, o2) {
                    if (isNaN(o1.value) || o1.value == null) return -1;
                    if (isNaN(o2.value) || o2.value == null) return 1;
                    return o1.value - o2.value;
                });

                for (var i = 0; i < data.length; i++) {
                    yData.push(data[i].name);
                }

                var option = {
                    tooltip: {
                        show: true,
                        formatter: function (params) {
                            return params.name + '：' + params.data['value']
                        },
                    },
                    visualMap: {
                        type: 'piecewise',
                        pieces: [{
                            min: 10000,
                            label: '大于9999次',
                            color: '#e94747'
                        },
                        {
                            min: 1000,
                            max: 9999,
                            label: '1000-9999次',
                            color: '#ea9d12'
                        },
                        {
                            min: 100,
                            max: 999,
                            label: '100-999次',
                            color: '#744cdf'
                        },
                        {
                            max: 100,
                            label: '小于100次',
                            color: '#36a9ec'
                        },
                        ],
                        textStyle: {
                            color: '#fff',
                        },
                        visibility: 'off',
                        seriesIndex: [0]
                    },
                    grid: {
                        right: 20,
                        top: 80,
                        bottom: 30,
                        width: '20%'
                    },
                    xAxis: {
                        type: 'value',
                        scale: true,
                        position: 'top',
                        splitNumber: 1,
                        boundaryGap: false,
                        splitLine: {
                            show: false
                        },
                        axisLine: {
                            show: false
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            margin: 2,
                            textStyle: {
                                color: '#fff',
                            }
                        },
                    },
                    yAxis: {
                        type: 'category',
                        nameGap: 16,
                        axisLine: {
                            show: false,
                            lineStyle: {
                                color: '#ddd'
                            }
                        },
                        axisTick: {
                            show: false,
                            lineStyle: {
                                color: '#ddd'
                            }
                        },
                        axisLabel: {
                            interval: 0,
                            textStyle: {
                                color: '#fff',
                                fontSize: 0.5 * this.fontSize,
                            }
                        },
                        data: yData,
                    },
                    geo: {
                        roam: true,
                        map: 'china',
                        left: 'left',
                        right: '300',
                        layoutSize: '80%',
                        zoom: 0.8,
                        roam: false,
                        label: {
                            emphasis: {
                                show: false
                            }
                        },
                        itemStyle: {
                            emphasis: {
                                areaColor: '#fff464'
                            }
                        },
                    },
                    series: [{
                        name: 'mapSer',
                        type: 'map',
                        roam: false,
                        geoIndex: 0,
                        label: {
                            show: false,
                        },
                        data: data
                    }, {
                        name: 'barSer',
                        type: 'bar',
                        roam: false,
                        visualMap: false,
                        zlevel: 2,
                        barMaxWidth: 20,
                        itemStyle: {
                            normal: {
                                color: function (params) {
                                    let color = params.value > 9999 ? '#e94747' : (params.value >= 1000 && params.value <= 9999) ? '#ea9d12' : (params.value >= 100 && params.value <= 999) ? '#744cdf' : '#36a9ec'
                                    return color
                                }
                            },
                            emphasis: {
                                color: "#3596c0"
                            }
                        },
                        label: {
                            normal: {
                                show: true,
                                position: 'right',
                                offset: [0, 2],
                                color: '#fff'
                            }
                        },
                        data: data
                    }]
                };
                var myechart = echarts.init(document.querySelector('.map'));
                myechart.setOption(option);
                window.addEventListener('resize', function () {
                    myechart.resize();
                })
            })
        },
        drawline(data) {
            let option = {
                tooltip: {
                    trigger: "axis",
                    axisPointer: {
                        lineStyle: {
                            color: {
                                type: "linear",
                                x: 0,
                                y: 0,
                                x2: 0,
                                y2: 1,
                                colorStops: [
                                    {
                                        offset: 0,
                                        color: "rgba(0, 255, 233,0)",
                                    },
                                    {
                                        offset: 0.5,
                                        color: "rgba(255, 255, 255,1)",
                                    },
                                    {
                                        offset: 1,
                                        color: "rgba(0, 255, 233,0)",
                                    },
                                ],
                                global: false,
                            },
                            iconStyle: {
                                borderColor: "#5ABE64",
                            },
                        },
                    },
                },
                grid: {
                    left: "0%",
                    right: "5%",
                    bottom: "4%",
                    top: "15%",
                    containLabel: true,
                },
                legend: {
                    show: true,
                    icon: "circle",
                    orient: "horizontal",
                    top: "90.5%",
                    right: "center",
                    itemWidth: 16.5,
                    itemHeight: 6,
                    textStyle: {
                        color: "#C9C8CD",
                        fontSize: 14,
                    },
                },
                xAxis: [
                    {
                        boundaryGap: false,
                        type: "category",
                        data: data.xData.reverse(),
                        axisLine: {
                            show: true,
                            lineStyle: {
                                color: "#3b538f",
                            },
                        },
                        axisTick: {
                            show: false, //不显示刻度
                        },
                        axisLabel: {
                            margin: 10,
                            color: "#23769e",
                            textStyle: {
                                fontSize: 0.6 * this.fontSize,
                            },
                        }
                    },
                ],
                yAxis: [
                    {
                        name: '次数',
                        nameTextStyle: {
                            fontSize: 0.6 * this.fontSize,
                            color: '#23769e',
                            padding: [0, 0, 0, -1.6 * this.fontSize],
                        },
                        type: "value",
                        axisTick: {
                            show: false,
                        },
                        axisTick: {
                            show: false,
                        },
                        axisLine: {
                            show: false,
                        },
                        axisLabel: {
                            color: "#23769e",
                            fontSize: 0.6 * this.fontSize,
                            formatter: function (params) {
                                return data.className == '.register' ? params / 10000 + '万' : params
                            },
                        },
                        splitLine: {
                            lineStyle: {
                                color: "#253c73",
                            },
                        },
                    },
                ],
                series: [
                    {
                        type: "line",
                        smooth: true, //是否平滑曲线显示
                        symbolSize: 0,
                        lineStyle: {
                            normal: {
                                color: data.lineColor1, // 线条颜色
                            },
                        },
                        areaStyle: {
                            //区域填充样式
                            normal: {
                                color: new echarts.graphic.LinearGradient(
                                    0,
                                    0,
                                    0,
                                    1,
                                    [
                                        { offset: 0, color: data.lineColor2 },
                                        { offset: 0.7, color: "rgba(61,234,255, 0)" },
                                    ],
                                    false
                                ),
                                shadowColor: data.shadowColor, //阴影颜色
                                shadowBlur: 20, //shadowBlur设图形阴影的模糊大小。配合shadowColor,shadowOffsetX/Y, 设置图形的阴影效果。
                            },
                        },
                        data: data.yData.reverse(),
                    },
                ],
            };
            var myechart = echarts.init(document.querySelector(data.className));
            myechart.setOption(option);
            window.addEventListener('resize', function () {
                myechart.resize();
            })
        },
        getData() {
            axios({
                method: 'get',
                url: `${this.server}/borche-snms-service/board/data`,
            }).then(res => {
                this.loading = false
                let data = res.data.data
                data.dailyParseAmount = data.dailyParseAmount * 100
                this.amount = res.data.data
            })
        },
        getDetail() {
            axios({
                method: 'get',
                url: `${this.server}/borche-snms-service/board/detail`,
            }).then(res => {
                const data = res.data.data
                if (!!data && data.length > 0) {
                    localStorage.setItem('exListData', JSON.stringify(data))
                    this.detail = data
                } else {
                    let exListData = localStorage.getItem('exListData')
                    if (exListData) {
                        this.detail = JSON.parse(exListData)
                    }
                }
            })
        },
        getRecent() {
            axios({
                method: 'get',
                url: `${this.server}/borche-snms-service/board/recent`,
            }).then(res => {
                const data = res.data.data
                let register = {
                    xData: [],
                    yData: [],
                    className: '.register',
                    lineColor1: '#fff500',
                    lineColor2: 'rgba(255, 245, 0, 0.9)',
                    shadowColor: "rgba(209, 199, 10, 0.9)",
                }
                let parse = {
                    xData: [],
                    yData: [],
                    className: '.analysis',
                    lineColor1: '#3deaff',
                    lineColor2: 'rgba(61,234,255, 0.9)',
                    shadowColor: "rgba(53,142,215, 0.9)",
                }
                for (prop in data.registerMap) {
                    register.xData.push(prop.split('-')[1] + '-' + prop.split('-')[2])
                    register.yData.push(data.registerMap[prop] * 1)
                }
                for (prop in data.parseMap) {
                    parse.xData.push(prop.split('-')[1] + '-' + prop.split('-')[2])
                    parse.yData.push(data.parseMap[prop] * 100)
                }
                this.drawline(register)
                this.drawline(parse)
            })
        },
        setIntervalFun() {
            this.loading = true;
            setTimeout(() => {
                this.loading = false
            }, 200);
            setInterval(() => {
                this.getData()
            }, 30000);
            setInterval(() => {
                this.darwMap()
            }, 50000);
            setInterval(() => {
                this.getDetail()
                this.getRecent()
            }, 7200000);
        }
    }
})