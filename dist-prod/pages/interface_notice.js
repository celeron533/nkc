!function(n){"function"==typeof define&&define.amd?define(n):n()}((function(){"use strict";window.submit=function(n){var e=$("#productionCode").val();if(""===e)return screenTopWarning("请输入产品系列号。");nkcAPI("/u/"+n+"/production","POST",{code:e}).then((function(){screenTopAlert("验证序列号成功。"),setTimeout((function(){window.location.reload()}),2e3)})).catch((function(n){screenTopWarning(n.error)}))}}));
