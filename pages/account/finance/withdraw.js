!function i(r,o,s){function a(e,t){if(!o[e]){if(!r[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(c)return c(e,!0);throw(n=new Error("Cannot find module '"+e+"'")).code="MODULE_NOT_FOUND",n}n=o[e]={exports:{}},r[e][0].call(n.exports,function(t){return a(r[e][1][t]||t)},n,n.exports,i,r,o,s)}return o[e].exports}for(var c="function"==typeof require&&require,t=0;t<s.length;t++)a(s[t]);return a}({1:[function(t,e,n){"use strict";var i=NKC.methods.getDataById("data"),r=new Vue({el:"#app",data:{user:"",code:"",password:"",succeed:!1,submitted:!1,timeLimit:0,payment:"",info:"",succeedMoney:0,error:"",withdrawSettings:i.withdrawSettings,countToday:i.countToday,mainScore:i.mainScore,userMainScore:i.userMainScore,alipayAccounts:i.alipayAccounts,bankAccounts:i.bankAccounts,money:"",selectedAccount:"",to:"alipay"},computed:{realMoney:function(){return(this.money*(1-this.withdrawSettings.withdrawFee)).toFixed(2)},timeBegin:function(){var t;return(t=this.getHMS(this.withdrawSettings.startingTime,"string")).hour+":"+t.min+":"+t.sec},timeEnd:function(){var t;return(t=this.getHMS(this.withdrawSettings.endTime,"string")).hour+":"+t.min+":"+t.sec},outTime:function(){var t=new Date,t=60*t.getHours()*60*1e3+60*t.getMinutes()*1e3+1e3*t.getSeconds();if(t<this.withdrawSettings.withdrawTimeBegin||t>this.withdrawSettings.withdrawTimeEnd)return!0},count:function(){return this.withdrawSettings.withdrawCount-this.countToday},payments:function(){var t=[],e=this.withdrawSettings,n=e.weChat;return e.aliPay.enabled&&t.push({type:"aliPay",name:"支付宝"}),n.enabled&&t.push({type:"weChat",name:"微信支付"}),t},payInfo:function(){var t=this.payment,e=this.withdrawSettings;if(t){t=e[t];if(t.enabled&&0<t.fee){t=Number((100*t.fee).toFixed(4));return"服务商（非本站）将收取 ".concat(t,"% 的手续费")}}},fee:function(){var t=this.totalPrice,e=this.money;return Number((e-t).toFixed(2))},totalPrice:function(){var t=this.withdrawSettings,e=this.money,t=t[this.payment].fee;return t&&(e*=1-t),Number(e.toFixed(2))}},mounted:function(){for(var t=0;t<this.alipayAccounts.length;t++){var e=this.alipayAccounts[t];if(e.default){this.selectedAccount=e;break}}this.payments.length&&this.selectPayment(this.payments[0].type)},methods:{selectAccount:function(t){this.selectedAccount=t},selectPayment:function(t){this.payment=t},getHMS:function(t,e){var n=Math.floor(t/36e5),i=Math.floor(t/6e4)%60,t=Math.floor(t/1e3)%60;return"string"===e&&(n<10&&(n="0"+n),i<10&&(i="0"+i),t<10&&(t="0"+t)),{hour:n,min:i,sec:t}},countdown:function(){r.timeLimit<=0||(r.timeLimit--,setTimeout(function(){r.countdown()},1e3))},sendMessage:function(){nkcAPI("/sendMessage/withdraw","POST",{}).then(function(){r.timeLimit=120,r.countdown(),screenTopAlert("短信验证码发送成功")}).catch(function(t){sweetError(t)})},submit:function(){this.error="",this.info="";var e=this,t=this.money,n=this.password,i=this.totalPrice,r=this.code,o=this.payment,s=this.selectedAccount;Promise.resolve().then(function(){if(!(0<t))throw"提现金额不正确";if(!["aliPay","weChat"].includes(o))throw"请选择付款方式";if(!r)throw"请输入短信验证码";if(!n)throw"请输入登录密码";return e.submitted=!0,nkcAPI("/account/finance/withdraw","POST",{money:i,score:t,password:n,code:r,account:s,to:o})}).then(function(){return e.submitted=!1,e.password="",e.money="",sweetSuccess("提现成功")}).catch(function(t){sweetError(t),e.submitted=!1})}}})},{}]},{},[1]);
