!function(t){"function"==typeof define&&define.amd?define(t):t()}((function(){"use strict";var t=NKC.methods.getDataById("data");new Vue({el:"#app",data:{loginSettings:t.loginSettings},methods:{save:function(){var t=this.loginSettings;nkcAPI("/e/settings/login","PUT",t).then((function(){sweetSuccess("保存成功")})).catch((function(t){sweetError(t)}))}}})}));
