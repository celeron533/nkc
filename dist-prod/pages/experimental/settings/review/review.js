!function(t){"function"==typeof define&&define.amd?define(t):t()}((function(){"use strict";function t(){return(t=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var i=arguments[e];for(var s in i)Object.prototype.hasOwnProperty.call(i,s)&&(t[s]=i[s])}return t}).apply(this,arguments)}var e=NKC.methods.getDataById("data"),i=e.reviewSettings.keyword.wordGroup;for(var s in i)i[s].status="display",i[s].input="";var n=new Vue({el:"#app",data:{tab:"thread",grades:e.grades,certs:e.certs,reviewSettings:e.reviewSettings,users:e.users,uid:{blacklist:"",whitelist:""},conditions:[],selectedCertId:"",leastKeywordTimes:e.reviewSettings.keyword.condition.leastKeywordTimes,leastKeywordCount:e.reviewSettings.keyword.condition.leastKeywordCount,relationship:e.reviewSettings.keyword.condition.relationship,wordGroup:e.reviewSettings.keyword.wordGroup||[],newWordGroupName:"",newWordGroupKeywords:null},watch:{tab:function(){this.extendConditions()}},computed:{selectedCerts:function(){for(var t=[],e=this.reviewSettings.certsId,i=0;i<e.length;i++){var s=this.getCertById(e[i]);s&&t.push(s)}return t},review:function(){return this.reviewSettings[this.tab]},blacklistUsers:function(){for(var t=[],e=0;e<this.review.special.blacklistUid.length;e++)t.push(this.getUserById(this.review.special.blacklistUid[e]));return t},whitelistUsers:function(){for(var t=[],e=0;e<this.review.special.whitelistUid.length;e++)t.push(this.getUserById(this.review.special.whitelistUid[e]));return t}},mounted:function(){this.extendConditions()},methods:{getUrl:NKC.methods.tools.getUrl,saveCertId:function(){nkcAPI("/e/settings/review","PUT",{type:"saveCertsId",certsId:n.reviewSettings.certsId}).then((function(){screenTopAlert("保存成功")})).catch((function(t){screenTopWarning(t)}))},removeCertId:function(t){var e=this.reviewSettings.certsId.indexOf(t);-1!==e&&this.reviewSettings.certsId.splice(e,1)},addCertId:function(){var t=this.selectedCertId;t&&-1===this.reviewSettings.certsId.indexOf(t)&&this.reviewSettings.certsId.push(t)},getCertById:function(t){for(var e=0;e<this.certs.length;e++)if(this.certs[e]._id===t)return this.certs[e]},extendConditions:function(){var t=[];t.push({name:"海外手机注册用户",id:"foreign",status:this.review.blacklist.foreign.status?[!0]:[],type:this.review.blacklist.foreign.type,count:this.review.blacklist.foreign.count}),t.push({name:"未通过A卷考试的用户",id:"notPassedA",status:this.review.blacklist.notPassedA.status?[!0]:[],type:this.review.blacklist.notPassedA.type,count:this.review.blacklist.notPassedA.count});for(var e=0;e<this.grades.length;e++){var i=this.grades[e],s=this.getSettings(i._id);t.push({name:"【用户等级】"+i.displayName,id:i._id,isGrade:!0,status:s.status?[!0]:[],type:s.type,count:s.count})}this.conditions=t},getUserById:function(t){for(var e=0;e<this.users.length;e++){var i=this.users[e];if(i.uid===t)return i}},switchTab:function(t){this.tab=t},getSettings:function(t){for(var e=0;e<this.review.blacklist.grades.length;e++){var i=this.review.blacklist.grades[e];if(t===i.gradeId)return i}return{gradeId:t,status:!1,type:"all",count:10}},addUser:function(t){var e=this.uid[t];if(!e)return screenTopWarning("请输入用户ID");nkcAPI("/e/settings/review","PUT",{tab:this.tab,type:"addUser",listType:t,uid:e}).then((function(e){var i=e.targetUser;n.users.push(i),"blacklist"===t?-1===n.review.special.blacklistUid.indexOf(i.uid)&&n.review.special.blacklistUid.push(i.uid):-1===n.review.special.whitelistUid.indexOf(i.uid)&&n.review.special.whitelistUid.push(i.uid)})).catch((function(t){screenTopWarning(t)}))},removeUser:function(t,e){nkcAPI("/e/settings/review","PUT",{tab:this.tab,type:"removeUser",listType:e,uid:t}).then((function(){var i;"blacklist"===e?-1!==(i=n.review.special.blacklistUid.indexOf(t))&&n.review.special.blacklistUid.splice(i,1):-1!==(i=n.review.special.whitelistUid.indexOf(t))&&n.review.special.whitelistUid.splice(i,1)}))},saveBlacklist:function(){for(var t={grades:[],notPassedA:{},foreign:{}},e=0;e<this.conditions.length;e++){var i=this.conditions[e];i.isGrade?t.grades.push({gradeId:i.id,status:i.status.length>0,type:i.type,count:i.count}):"foreign"===i.id?t.foreign={status:i.status.length>0,type:i.type,count:i.count}:"notPassedA"===i.id&&(t.notPassedA={status:i.status.length>0,type:i.type,count:i.count})}nkcAPI("/e/settings/review","PUT",{type:"saveBlacklist",tab:this.tab,blacklist:t}).then((function(t){n.reviewSettings[n.tab].blacklist=t.reviewSettings[n.tab].blacklist,screenTopAlert("保存成功")})).catch((function(t){screenTopWarning(t)}))},saveWhitelist:function(){nkcAPI("/e/settings/review","PUT",{type:"saveWhitelist",tab:this.tab,whitelist:n.review.whitelist}).then((function(t){n.reviewSettings[n.tab].whitelist=t.reviewSettings[n.tab].whitelist,screenTopAlert("保存成功")})).catch((function(t){screenTopWarning(t)}))}}});t(window,{wordGroup:i,app:n})}));
