!function o(n,c,a){function i(t,e){if(!c[t]){if(!n[t]){var r="function"==typeof require&&require;if(!e&&r)return r(t,!0);if(d)return d(t,!0);throw(r=new Error("Cannot find module '"+t+"'")).code="MODULE_NOT_FOUND",r}r=c[t]={exports:{}},n[t][0].call(r.exports,function(e){return i(n[t][1][e]||e)},r,r.exports,o,n,c,a)}return c[t].exports}for(var d="function"==typeof require&&require,e=0;e<a.length;e++)i(a[e]);return i}({1:[function(e,t,r){"use strict";var o=!1;window.payForDownloadResource=function(e){var t=document.createElement("a");o?t.href="/r/".concat(e,"?t=attachment&random=").concat(Math.random()):(t.href="/r/".concat(e,"?c=download&random=").concat(Math.random()),t.setAttributeNode(document.createAttribute("download")),o=!0),t.click(),$(".resource-scores").remove(),$(".error-code").remove(),$(".resource-downloaded-tip").show(),$(".download-button").text("重新下载")},window.previewPDFResource=function(e){var t=document.createElement("a");o?(t.href=NKC.methods.tools.getUrl("pdf",e),t.setAttribute("target","_blank"),t.click()):(t.href="/r/".concat(e,"?c=preview_pdf&random=").concat(Math.random()),t.setAttribute("target","_blank"),t.click(),o=!0)},window.closePage=function(){"reactNative"===NKC.configs.platform?NKC.methods.appClosePage():window.close()}},{}]},{},[1]);