!function i(a,d,s){function l(e,t){if(!d[e]){if(!a[e]){var o="function"==typeof require&&require;if(!t&&o)return o(e,!0);if(c)return c(e,!0);var n=new Error("Cannot find module '"+e+"'");throw n.code="MODULE_NOT_FOUND",n}var r=d[e]={exports:{}};a[e][0].call(r.exports,function(t){return l(a[e][1][t]||t)},r,r.exports,i,a,d,s)}return d[e].exports}for(var c="function"==typeof require&&require,t=0;t<s.length;t++)l(s[t]);return l}({1:[function(t,e,o){"use strict";var n=NKC.methods.getDataById("forumInfo"),r=n.fid,d=n.page,s=n.digest,l=n.sort;$(function(){var t=$("#navbar_custom_dom"),e=$("#leftDom");t.html(e.html()),NKC.configs.lid&&(window.Library=new NKC.modules.Library({lid:NKC.configs.lid,folderId:NKC.configs.folderId,tLid:NKC.configs.tLid,closed:NKC.configs.closed,uploadResourcesId:NKC.configs.uploadResourcesId?NKC.configs.uploadResourcesId.split("-"):[]}));var o=$("#threadUrlSwitch");o.length&&(a("true"===localStorage.getItem(i)),o.on("click",function(){a($(this).prop("checked"))})),NKC.configs.uid&&function(){socket.on("connect",function(){c()}),socket.on("forumMessage",function(t){var e=t.html,o=t.tid,n=t.contentType,r=$("div.normal-thread-list"),i=r.find('div[data-tid="'+o+'"]');if(0!==d||!(!s||s&&t.digest)||"thread"!==n&&"tlm"!==l){if(!i)return}else i.length?i.remove():function(){var t=$("div.normal-thread-list>.thread-panel"),e=t.length;if(0===e)return;t.eq(e-1).remove()}(),i=$(e),r.prepend(i);var a=NKC.methods.getThreadListNewPostCount(o);a++,NKC.methods.setThreadListNewPostCount(o,a),u(o,a),floatUserPanel.initPanel(),floatForumPanel.initPanel()}),socket.connected&&c();(function t(){setTimeout(function(){f(),t()},1e4)})(),document.body.addEventListener("click",function(t){var e,o,n=t.target;"a"===n.tagName.toLowerCase()&&(e=(n=$(n)).attr("href"),/^\/t\/([0-9]+)\??/gi.test(e)&&(o=RegExp.$1,NKC.methods.setThreadListNewPostCount(o,0),u(o,0)))}),f()}()});var i="forum_thread_a_target";function a(t){var e,o=t?"_blank":"_self";$(".thread-panel-url").attr("target",o),$("#threadUrlSwitch").prop("checked",!!t),e=t,localStorage.setItem(i,e)}function c(){socket.emit("joinRoom",{type:"forum",data:{forumId:r}})}function f(){for(var t=$("div.normal-thread-list").find(".thread-panel"),e=0;e<t.length;e++){var o=t.eq(e).attr("data-tid");u(o,NKC.methods.getThreadListNewPostCount(o))}}function u(t,e){var o,n=$("div.normal-thread-list"),r=n.find('div[data-tid="'+t+'"] .thread-panel-author-info');r.length&&(n.find('div[data-tid="'+t+'"] span.thread-panel-point').remove(),0!==e&&(o=$("<span class='thread-panel-point' data-count='"+e+"'></span>"),r.append(o)))}window.openEditSite=function(){var t=window.location.origin+"/editor?type=forum&id="+r;"reactNative"===NKC.configs.platform?NKC.methods.rn.emit("openEditorPage",{url:t}):"apiCloud"===NKC.configs.platform?api.openWin({name:t,url:"widget://html/common/editorInfo.html",pageParam:{realUrl:t,shareType:"common"}}):NKC.methods.visitUrl(t,!0)}},{}]},{},[1]);