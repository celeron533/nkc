!function r(n,i,a){function d(t,e){if(!i[t]){if(!n[t]){var o="function"==typeof require&&require;if(!e&&o)return o(t,!0);if(c)return c(t,!0);throw(o=new Error("Cannot find module '"+t+"'")).code="MODULE_NOT_FOUND",o}o=i[t]={exports:{}},n[t][0].call(o.exports,function(e){return d(n[t][1][e]||e)},o,o.exports,r,n,i,a)}return i[t].exports}for(var c="function"==typeof require&&require,e=0;e<a.length;e++)d(a[e]);return d}({1:[function(e,t,o){"use strict";var r=NKC.methods.getDataById("forumInfo"),n=r.fid,d=r.page,c=r.digest,l=r.sort;$(function(){window.SubscribeTypes||new NKC.modules.SubscribeTypes;var e=$("#navbar_custom_dom"),t=$("#leftDom");e.html(t.html()),NKC.configs.lid&&(window.Library=new NKC.modules.Library({lid:NKC.configs.lid,folderId:NKC.configs.folderId,tLid:NKC.configs.tLid,closed:NKC.configs.closed,uploadResourcesId:NKC.configs.uploadResourcesId?NKC.configs.uploadResourcesId.split("-"):[]}));t=$("#threadUrlSwitch");t.length&&(a("true"===localStorage.getItem(i)),t.on("click",function(){a($(this).prop("checked"))})),NKC.configs.uid&&(socket.on("connect",function(){s()}),socket.on("forumMessage",function(e){var t=e.html,o=e.tid,r=e.contentType,n=$("div.normal-thread-list"),i=n.find('div[data-tid="'+o+'"]'),a=n.find('div[data-tid="'+o+'"] span.thread-panel-counter'),o=0;if(a.length&&(o=Number(a.attr("data-count"))),0!==d||c!==e.digest||"thread"!==r&&"tlm"!==l){if(!i)return;a.remove()}else i.remove(),i=$(t),n.prepend(i);o++;o=$("<span class='thread-panel-counter' data-count='"+o+"' title='"+o+"条更新'>"+o+"</span>");i.prepend(o),floatUserPanel.initPanel(),floatForumPanel.initPanel()}),socket.connected&&s())});var i="forum_thread_a_target";function a(e){var t=e?"_blank":"_self";$(".thread-panel-url").attr("target",t),$("#threadUrlSwitch").prop("checked",!!e),e=e,localStorage.setItem(i,e)}function s(){socket.emit("joinRoom",{type:"forum",data:{forumId:n}})}window.openEditSite=function(){var e=window.location.origin+"/editor?type=forum&id="+n;"reactNative"===NKC.configs.platform?NKC.methods.rn.emit("openEditorPage",{url:e}):"apiCloud"===NKC.configs.platform?api.openWin({name:e,url:"widget://html/common/editorInfo.html",pageParam:{realUrl:e,shareType:"common"}}):NKC.methods.visitUrl(e,!0)}},{}]},{},[1]);