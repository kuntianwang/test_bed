/*var name = 'crrcqd';
var password = 'crrcqd01';
var deviceId = '1433863169';*/

//var clientW = document.documentElement.clientWidth;
//var clientH = document.documentElement.clientHeight;
//@ sourceURL=datafetcher.js

var baseUrl = "http://115.29.178.40:8600";
var token = null;
var devices = null; //1433863169
var dataType = null; //currentdata

var stimestamp = null;
var etimestamp = null;
var ctimestamp = null;

var rulers = null;

validation();

function getUrlParam(){
	 var param = location.href;
	 var start = param.indexOf('?');
	 if(start == -1){
	 	console.log("invail url request");
	 	return null;
	 }else{
	 	return param.substring(start+1, param.length);
	 }
}

function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
	var r = window.location.search.substr(1).match(reg);
	if(r != null) {
		return decodeURI(r[2]);
	} else {
		return null;
	}
}


function getNum(text) {
	var value = text.replace(/[^0-9]/ig, "");
	return value;
}

function dateFtt(fmt, date) {
	var o = {
		"M+": date.getMonth() + 1, //月份   
		"d+": date.getDate(), //日   
		"h+": date.getHours(), //小时   
		"m+": date.getMinutes(), //分   
		"s+": date.getSeconds(), //秒   
		"q+": Math.floor((date.getMonth() + 3) / 3), //季度   
		"S": date.getMilliseconds() //毫秒   
	}
	if(/(y+)/.test(fmt))
		fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt))
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}

function validation() {
	token = getQueryString("token");
	var deviceIds = getQueryString("deviceIds");
	dataType = getQueryString("dataType");
		//add begin
	var title = getQueryString("title");
    document.title = title;
    //end add
	if(token != null) {
		console.log("token is:" + token);
	} else {
		console.log("get token failed!");
	}

	if(deviceIds != null && deviceIds != '') {
		console.log("deviceIds is:" + deviceIds);
		devices = deviceIds.split(',');
	} else {
		console.log("get deviceIds failed!");
	}

	if(dataType != null) {
		console.log("dataType:" + dataType);
		if(dataType == "currentdata") {
			console.log("request currentdata");
		} else if(dataType == "historydata/list") {
			console.log("request history");
			var stime = getQueryString("stime");
			var etime = getQueryString("etime");
			if(stime == null || etime == null) {
				console.log("loss of necessary params for history");
				dataType = null;
			} else {
				stimestamp = stime;
				etimestamp = etime;
				ctimestamp = getQueryString("ctime");
				if(ctimestamp == null) {
					ctimestamp = stimestamp;
				}
			}
		} else {
			console.log("invalid dataType");
			dataType = null;
		}
	}
}

function getCurrentData(itemIds, dataHandler) {
	if(devices == null){
		return;
	}
	for(var i = 0; i < devices.length; ++i) {
		var deviceId = devices[i];
		$.ajax({
			url: baseUrl + '/currentdata?token=' + token + '&hash=test' + '&deviceid=' + deviceId + '&itemids=' + itemIds,
			type: 'get',
			success: function(resp) {
				var values = {};
				var json = eval('(' + resp + ')');
				if(json["status"] == "100") {
					if(json["data"] != null) {
						var data = json["data"];
						for(var i=0; i<data.length; ++i){
							values[data[i].itemid] = data[i].val;							
						}
						
						dataHandler(values);
					}
				} else {
					console.log("获取实时数据失败！");
				//	console.log("getCurrentData=" + JSON.stringify(resp));
				}
			},
			error: function(data) {
				console.log(data);
			}
		});
	}
}

function getDeviceInfo(dataHandler) {
	if(devices == null){
		return;
	}

	$.ajax({
	//	url: baseUrl + '/devicelist?token=' + token + '&hash=test' + '&deviceid=' + deviceId,
		url: 'http://112.124.0.254:8666/device/list?token=' + token + '&hash=test' + '&page=1&perPage=1000&serial=1400460',
		type: 'get',
		success: function(resp, status) {
		//	console.log("getDeviceInfo=" + JSON.stringify(resp));
			var json = resp; //eval('(' + resp + ')');
			if(json["status"] == "100") {
				if(json["result"] != null) {
					var data = json["result"].data;
					for(var i=0; i<data.length; ++i){
						dataHandler(data[i].base);											
					}
				}
			} else {
				console.log("获取实时数据失败！");
			}
		},
		error: function(data) {
			console.log(data);
		}
	});
	
}

function getGatewayInfo(dataHandler) {
	if(devices == null){
		return;
	}
	 
	$.ajax({
		url: baseUrl + '/agentList/condition',
		type: 'POST',
		dataType:"json",
		contentType:'application/json',
		data: JSON.stringify({
			"agentIds": [1400460],
			"token": token
		}),
		success: function(resp, status) {
		//	console.log("getGatewayInfo=" + JSON.stringify(resp));
			var json = resp; //eval('(' + resp + ')');
			if(json["status"] == "100") {
				if(json["data"] != null) {
					var data = json["data"];
					if(data.length > 0){
						dataHandler(data[0].condition);
					}					
				}
			} else {
				console.log("getGatewayInfo获取实时数据失败！");
			}
		},
		error: function(data) {
			console.log(data);
		}
	});	 
}