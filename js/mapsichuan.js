window.onload = function() {
	var map = echarts.init(document.getElementById('map'));//!!!记得使用
	var calender = echarts.init(document.getElementById('calender'));
	var bar = echarts.init(document.getElementById('pie'));
	var result = [];
	var now_data = [];
	var data_area=[];
	var chengdu = [];
	var flag=0;
	var record;
	var str_area=['成都市','自贡市','攀枝花市','泸州市','德阳市','绵阳市','广元市','遂宁市','内江市'
	,'乐山市','南充市','眉山市','宜宾市','广安市','达州市','雅安市','巴中市','资阳市'
	,'甘孜藏族自治州','阿坝藏族羌族自治州','凉山彝族自治州']
	var gf=[];//高风险
	var default_df=[16, 5, 5, 6, 5, 7, 6, 4, 4, 11, 3, 5, 9, 5, 1, 7, 2, 2, 13, 15, 15]
	var default_zf=[4, 1, 0, 1, 1, 2, 1, 1, 1, 0, 6, 1, 1, 2, 6, 1, 3, 1, 2, 0, 2]
	var str=" ";
	d3.json('./json/now.json')//这里是d3v6版本，读取文件方式与v3略有不同
		.then(function(data_now) {
			for (let i of data_now) {
				var quezhen = {
					"name": i.市州,
					"value": i.现有确诊,
					"time":i.统计时间,
				}
				now_data.push(quezhen);
			}
			for (let i of now_data) {
				if (i.name == '成都市') {
					chengdu.push(i.value);
				}
			}
			console.log(now_data)
			drawcalendar(chengdu)
			drawpie(default_df,default_df,gf)
		});
	d3.json('./json/format.json')
		.then(function(data) {
			echarts.registerMap('四川', data, {});//地图用法，暂时不需要管
			d3.json('./json/all.json')
				.then(function(p) {
					//console.log(params);
					for (let param of p) {
						var info = {
							"name": param.市州,
							"value": param.确诊病例,
							"value1": param.治愈,
							"value2": param.死亡,
						}
						result.push(info);
					}
					drawmap(result, p);
					//connect()
					event();
					event_pie();
				});
		});
	d3.json('./json/num.json')
	 	.then(function(data){
	 		//console.log(data)
			for(let d of data){
				//console.log(t)
				var info={
					"name":d.市,
					"time":d.发布时间,
					"level":d.风险级别,
					"num":d.数量
				}
				data_area.push(info)
			}
			//console.log(data_area)
	 	})
	function event() {
		map.on('click', function(params) {//联动函数，params获取参数
			str = params.name;
			var day = [];
			for (let i of now_data) {
				if (i.name == str) {
					day.push(i.value);
					//console.log(i.name,str);
				}
			}
			//console.log(params.value)
			drawcalendar(day)//调用函数，并传入参数
		})
	}
	function event_pie(){
		calender.on('click',function(params){
			console.log(params.data[0])
			//console.log(data_area)
			var df=[];//低风险
			var zf=[];//中风险
			var gf=[];//高风险
			for(let i of data_area){
			 	if(params.data[0]==i.time){
					let j
					//console.log(i.name)
					for(j=0;j<21;j++)
					{
						if(str_area[j]==i.name&&i.level=="低风险")
						{
							df[j]=i.num
							record=j;
							break;
						}
						if(str_area[j]==i.name&&i.level=="中风险")
						{
							zf[j]=i.num
							record=j;
							break;
						}
						if(str_area[j]==i.name&&i.level=="高风险")
						{
							gf[j]=i.num
							record=j;
							break;
						}
					}
			 	}
			 }
			drawpie(df,zf,gf);
		})
	}
	//绘制地图
	function drawmap(data, d) {
		//console.log(data);
		var option = {
			title:{
				text:"四川省2020年1~10月确诊总计",
				left:"center",
				top:"3%"
			},
			visualMap: {
				min: 1,
				max: 500,
				text: ['High', 'Low'],
				left: 'right',
				calculable: true,
				inRange: {
					color: ['#ffaa7f', '#ff5500', '#aa0000']
				}
			},
			tooltip: {
				trigger: 'item',
				show: true,
				formatter: function(data) {
					//console.log(data);
					return data.data.name + "<br>" + "确诊病例：" + data.data.value + "<br>" + "治愈" + data.data.value1 + "<br>" + "死亡：" +
						data.data.value2
				}
			},
			series: [{
				name: "四川",
				type: 'map',
				mapType: "四川",
				data: data,
				label: {
					normal: {
						show: true,
						textStyle: {
							color: '#fff',
							fontSize: 12
						}
					},
					emphasis: {
						show: true,
						textStyle: {
							fontSize: 16
						}
					}
				}
			}]
		}
		map.setOption(option);
	}
	
	
	
	//绘制日历图
	function drawcalendar(day) {
		var option = {
			title: {
				top: 20,
				left: 'center',
				text: "各州市1~10月现有确诊"
			},
			visualMap: {
				min: 1,
				max: 100,
				type: "piecewise", //分段
				orient: 'horizontal', //横向
				left: 'center',
				top: 55,
				textStyle: {
					color: '#000'
				}
			},
			tooltip: {
				trigger: 'item',
				show: true,
				formatter: function(params) {
					//console.log(params.data[1]);
					return params.data[1]
				}
			},
			calendar: {
				top: 120,
				left: 20,
				right: 20,
				cellSize: [10, 12],
				range: "2020",
				itemStyle: {
					borderWidth: 0.5
				},
				yearLabel: {
					show: false
				}
			},
			series: {
				type: 'heatmap',
				coordinateSystem: 'calendar',
				data: getdate(2020, day)
			}
		};
		calender.setOption(option);
	}
	//获取日历图数据
	function getdate(year, day) {
		year = year || '2020';
		var date = +echarts.number.parseDate(year + '-01-21');
		var end = +echarts.number.parseDate(year + '-10-13');
		var daytime = 3600 * 24 * 1000;
		var data_f = [];
		var j = 0;
		//console.log(day);
		for (var i = date; i < end; i += daytime) {
			//console.log(day[j]);
			data_f.push([echarts.format.formatTime('yyyy-MM-dd',i),
			day[j]]);
			j++;
			//data_f.push(all)
		}
		return data_f;
	}
	//画条形图
	function drawpie(df_,zf_,gf_){
		option = {
			title: {
				top: 5,
				left: 'center',
				text: "风险地区"
			},
		    tooltip: {
		        trigger: 'axis',
		        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
		            type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
		        }
		    },
		    legend: {
		        data: ['低风险', '中风险', '高风险'],
				top:30
		    },
		    grid: {
		        left: '3%',
		        right: '4%',
		        bottom: '3%',
		        containLabel: true
		    },
		    xAxis: {
		        type: 'value'
		    },
		    yAxis: {
		        type: 'category',
				axisLabel:{
				            fontSize:10,
							rotate:30
				        },
		        data: str_area
		    },
		    series: [
		        {
		            name: '低风险',
		            type: 'bar',
		            stack: '总量',
		            label: {
		                show: true,
		                position: 'insideRight'
		            },
		            data: df_
		        },
		        {
		            name: '中风险',
		            type: 'bar',
		            stack: '总量',
		            label: {
		                show: true,
		                position: 'insideRight'
		            },
		            data:zf_
		        },
		        {
		            name: '高风险',
		            type: 'bar',
		            stack: '总量',
		            label: {
		                show: true,
		                position: 'insideRight'
		            },
		            data:gf_
		        }
		    ]
		};
		bar.setOption(option)//不要忘记使用setOption函数！！！！
	}
}