!function a(i,r,o){function u(e,t){if(!r[e]){if(!i[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(s)return s(e,!0);throw(n=new Error("Cannot find module '"+e+"'")).code="MODULE_NOT_FOUND",n}n=r[e]={exports:{}},i[e][0].call(n.exports,function(t){return u(i[e][1][t]||t)},n,n.exports,a,i,r,o)}return r[e].exports}for(var s="function"==typeof require&&require,t=0;t<o.length;t++)u(o[t]);return u}({1:[function(t,e,n){"use strict";function a(t){t=t.type;"custom"===t?$("#custom").show():($("#custom").hide(),i(t))}function i(t){var e="/nkc?type="+t;"custom"===t&&(e="/nkc?type="+t+"&time1="+$('#custom input[name="time1"]').val()+"&time2="+$('#custom input[name="time2"]').val()),nkcAPI(e,"GET",{}).then(function(t){var e;e=t.results,t=echarts.init(document.getElementById("main")),e={title:{text:""},tooltip:{trigger:"axis"},legend:{data:["发表文章","发表回复","用户注册"]},xAxis:{data:e.x},yAxis:{},series:[{name:"发表文章",type:"line",stack:"发表文章",data:e.threadsData},{name:"发表回复",type:"line",stack:"发表回复",data:e.postsData},{name:"用户注册",type:"line",stack:"用户注册",data:e.usersData}]},t.setOption(e)}).catch(function(t){screenTopWarning(t.error||t)})}$(function(){$(".time").datetimepicker({language:"zh-CN",format:"yyyy-mm",autoclose:1,todayHighlight:1,startView:4,minView:3,forceParse:0}),a({type:"today"});var n=$('input:radio[name="statusType"]');n.on("ifChanged",function(){for(var t=0;t<n.length;t++){var e=n.eq(t);e.prop("checked")&&a({type:e.attr("data-type")})}})}),window.getResults=a,window.reset=function(){$('#custom input[name="time1"]').val(""),$('#custom input[name="time2"]').val("")},window.getData=i},{}]},{},[1]);