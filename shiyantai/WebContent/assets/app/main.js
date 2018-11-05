/*
 *@File 判断是实时数据或者历史数据,实时数据用webSocket，历史数据用http
 */

var IP = "112.124.0.254",
      USERNAME = "yang",
      PASSWORD = "456789";
var LAB_HREF = {a:['系统自检','selfChecking.html'],
                  b:['防滑阀测试','index.html'],
                  c:['压力开关测试','pressureSwitch.html'],
                  d:['传感器测试','sensor.html'],
                  e:['主机实验','hostMachine.html'],
                  f:['压力标定','calibratePressure.html']};

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&#]*)/gi,
        function(m,key,value) {
            vars[key] = value;
        }
    );
    return vars;
}

//根据数据项判断是什么实验,然后跳转到相应的页面
function autoLocation(msg) {
    var type = typeof msg == 'object' && Object.keys(msg)[0].replace(/\d+/g,'') || msg;
    //判断时候是当前页
    var path_now = location.pathname.split('/').pop();
    if(path_now != LAB_HREF[type][1]) {
        var r = confirm("当前实验类型是：" + LAB_HREF[type][0] + "，是否跳转？");
        if (r == true) {
            location.href = LAB_HREF[type][1]+"?"+location.href.split('?').pop();
        } else {
        }
    }
}

var on_connect = function(){
    var id = client.subscribe("/exchange/"+getUrlVars()["id"]+"/current",function(d){
        var msg = JSON.parse(d.body);
        autoLocation(msg);
        processMsg(msg);
    });
};

var on_error = function(){
    $('#myModal').modal('show');
    console.log('connect filed!');
};
var client = {};
$(function(){
   var v = getUrlVars();
   //
    var $a = $('.navbar-nav').find('a');
    $a.each(function(i){
        this.href = this.href +"?"+location.href.split('?').pop();
    });
   if(v['type'] == "current"){
       //新建webSocket client对象
       if(location.search === '?ws'){
            client = Stomp.client('ws://'+IP+':15674/ws');
       }else{
           var ws = SockJS('http://'+IP+':15674/stomp');
            client = Stomp.over(ws);
       }
       client.debug = function(str){
           $(".modal-body").html(str);
       };
       //取消接收发送心跳
       client.heartbeat.outgoing = 0;
       client.heartbeat.incoming = 0;
       //连接socket
       client.connect(USERNAME,PASSWORD,on_connect,on_error,'/');
   }else if(v['type'] == "history"){
       autoLocation(v['lab_name']);
        $.ajax({
            type: "GET",
            url: v['api']+"device/lab/hisdata",
            dataType: "JSON",
            data: {
                // 'devId':v['devid'],
                'labId':v['id']
                // 'labName':v['lab_name']
            },
            success: function(d){
                processMsg(d);
            },
            error: function(){
                alert('错误');
            }
        });
   }
});