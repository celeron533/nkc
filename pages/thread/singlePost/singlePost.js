!function a(r,s,d){function c(e,t){if(!s[e]){if(!r[e]){var n="function"==typeof require&&require;if(!t&&n)return n(e,!0);if(m)return m(e,!0);var o=new Error("Cannot find module '"+e+"'");throw o.code="MODULE_NOT_FOUND",o}var i=s[e]={exports:{}};r[e][0].call(i.exports,function(t){return c(r[e][1][t]||t)},i,i.exports,a,r,s,d)}return s[e].exports}for(var m="function"==typeof require&&require,t=0;t<d.length;t++)c(d[t]);return c}({1:[function(t,e,n){"use strict";function s(t,e){var n;if("undefined"==typeof Symbol||null==t[Symbol.iterator]){if(Array.isArray(t)||(n=function(t,e){if(!t)return;if("string"==typeof t)return d(t,e);var n=Object.prototype.toString.call(t).slice(8,-1);"Object"===n&&t.constructor&&(n=t.constructor.name);if("Map"===n||"Set"===n)return Array.from(t);if("Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))return d(t,e)}(t))||e&&t&&"number"==typeof t.length){n&&(t=n);var o=0,i=function(){};return{s:i,n:function(){return o>=t.length?{done:!0}:{done:!1,value:t[o++]}},e:function(t){throw t},f:i}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}var a,r=!0,s=!1;return{s:function(){n=t[Symbol.iterator]()},n:function(){var t=n.next();return r=t.done,t},e:function(t){s=!0,a=t},f:function(){try{r||null==n.return||n.return()}finally{if(s)throw a}}}}function d(t,e){(null==e||e>t.length)&&(e=t.length);for(var n=0,o=new Array(e);n<e;n++)o[n]=t[n];return o}function i(t,e){for(var n=0;n<e.length;n++){var o=e[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}var o=new(function(){function t(){!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.editors={},this.tid=null,this.postPermission={permit:!1,warning:null}}var e,n,o;return e=t,(n=[{key:"getPostHeightFloat",value:function(){var t=$('.hidden[data-type="hidePostContentSettings"]');if(!t.length)throw"未读取到与post内容隐藏相关的配置";return(t=NKC.methods.strToObj(t.html())).float}},{key:"getPostMaxHeight",value:function(){var t=$(document).width(),e=$('.hidden[data-type="hidePostContentSettings"]');if(!e.length)throw"未读取到与post内容隐藏相关的配置";return e=NKC.methods.strToObj(e.html()),t<768?e.xs:t<992?e.sm:e.md}},{key:"autoHidePostContent",value:function(){for(var t=$(".single-post-container"),e=0;e<t.length;e++){var n=t.eq(e),o=n.attr("data-hide"),i=n.attr("data-pid");"not"!==o&&this.getPostMaxHeight()<n.find(".single-post-center").height()&&this.hidePostContent(i)}}},{key:"hidePostContent",value:function(t){var e=$('.single-post-container[data-pid="'.concat(t,'"]')),n=e.find(".single-post-center"),o=this.getPostHeightFloat(),i=this.getPostMaxHeight();n.css({"max-height":i*o+"px"});var a=e.find(".switch-hidden-status");a.find(".switch-hidden-status-button").html('<div class="fa fa-angle-down"> 加载全文</div>'),e.attr("data-hidden","true"),a.removeClass("hidden")}},{key:"showPostContent",value:function(t){var e=$('.single-post-container[data-pid="'.concat(t,'"]'));e.find(".single-post-center").css({"max-height":"none"});var n=e.find(".switch-hidden-status");n.find(".switch-hidden-status-button").html('<div class="fa fa-angle-up"> 收起</div>'),e.attr("data-hidden","false"),n.removeClass("hidden")}},{key:"switchPostContent",value:function(t){var e,n;"true"===$('.single-post-container[data-pid="'.concat(t,'"]')).attr("data-hidden")?(e=$(document).scrollTop(),this.showPostContent(t),scrollTo(0,e)):(n=new NKC.modules.PagePosition,this.hidePostContent(t),n.restore())}},{key:"getPostContainer",value:function(t){return $('.single-post-container[data-pid="'.concat(t,'"]'))}},{key:"getCommentContainer",value:function(t){return $('[data-type="singlePostCommentContainer"][data-pid="'.concat(t,'"]'))}},{key:"getSingleComment",value:function(t){return $('.single-comment[data-pid="'.concat(t,'"]'))}},{key:"getCommentButton",value:function(t){return $('[data-type="singlePostCommentButton"][data-pid="'.concat(t,'"]'))}},{key:"createCommentElements",value:function(t){var e=$('.single-comments[data-pid="'.concat(t,'"]'));return e.length||(e=$('<div class="single-comments" data-pid="'.concat(t,'"></div>'))),e}},{key:"getPages",value:function(t,e){var n=$('.single-comment-paging[data-pid="'.concat(t,'"]'));n.length||(n=$('<div class="single-comment-paging" data-pid="'.concat(t,'"></div>'))),n.html("");var o,i=s(e.buttonValue);try{for(i.s();!(o=i.n()).done;){var a=o.value,r=$('<span class="'.concat(a.type,'">..</span>'));"null"!==a.type&&(r.text(a.num+1),r.attr("onclick","NKC.methods.getPostCommentsByPage('".concat(t,"', ").concat(a.num,")"))),n.append(r)}}catch(t){i.e(t)}finally{i.f()}return n}},{key:"switchPostBackgroundColor",value:function(t,e){this.getPostContainer(t).attr("data-show-comments",e?"true":"false")}},{key:"showPostComment",value:function(c,t,e){var m=this,n=1<arguments.length&&void 0!==t?t:0,o=(2<arguments.length&&void 0!==e?e:{}).highlightCommentId,u=void 0===o?null:o;this.removeAllEditorApp(c);var l=this,h=this.getCommentContainer(c);this.switchPostBackgroundColor(c,!0);var i=this.getCommentButton(c),p=$("<div class=\"single-post-comment-loading\"><div class='fa fa-spinner fa-spin'></div>加载中...</div>");"true"!==h.attr("data-opened")&&h.append(p),h.attr("data-hide","false"),i.attr("data-show-number","false"),this.renderPostCommentNumber(c),this.getPostComments(c,n).then(function(t){p.remove();var e=t.tid,n=t.htmlContent,o=t.paging,i=t.postPermission;o.page+1>=o.pageCount?h.attr("data-last-page","true"):h.attr("data-last-page","false"),l.postPermission=i,l.tid=e;var a=m.createCommentElements(c);a.html(n);var r=l.getPages(c,o);"true"!==h.attr("data-opened")&&(h.append(r),h.append(a),h.append(r.clone(!0)),h.attr("data-opened","true"));var s,d=l.getEditorApp(c,h,{cancelEvent:"switchPostComment",keepOpened:!0,position:"bottom"});d.show=!0,d.container.show(),u&&(s=$('.single-comment[data-pid="'.concat(u,'"]>.single-comment-center')),NKC.methods.scrollToDom(s),NKC.methods.markDom(s)),l.autoSaveDraft(c)}).then(function(){l.initNKCSource()}).catch(sweetError)}},{key:"initNKCSource",value:function(){floatUserPanel.initPanel(),NKC.methods.initSharePanel(),NKC.methods.initPostOption(),NKC.methods.initStickerViewer(),NKC.configs.isApp||NKC.methods.initImageViewer(),NKC.methods.initVideo()}},{key:"removeAllEditorApp",value:function(t){for(var e=this.getCommentContainer(t).find(".single-comment"),n=0;n<e.length;n++){var o=e.eq(n);this.removeEditorApp(o.attr("data-pid"))}this.removeEditorApp(t)}},{key:"hidePostComment",value:function(t){this.switchPostBackgroundColor(t,!1);var e=this.getCommentContainer(t),n=this.getCommentButton(t);e.attr("data-hide","true"),n.attr("data-show-number","true"),this.renderPostCommentNumber(t)}},{key:"renderPostCommentNumber",value:function(t){var e,n=this.getCommentButton(t),o=Number(n.attr("data-number"));"true"===n.attr("data-show-number")?(e="评论",0<o&&(e+="(".concat(o,")"))):e="折叠评论",n.text(e)}},{key:"setPostCommentNumber",value:function(t,e){var n=this.getCommentButton(t),o=Number(n.attr("data-number"));n.attr("data-number",o+1)}},{key:"switchPostComment",value:function(t,e,n){var o;"false"===this.getCommentContainer(t).attr("data-hide")?e?(o=new NKC.modules.PagePosition,this.hidePostComment(t),o.restore()):this.hidePostComment(t):this.showPostComment(t,n)}},{key:"getPostComments",value:function(t,e){var n=1<arguments.length&&void 0!==e?e:0;return nkcAPI("/p/".concat(t,"/comments?page=").concat(n),"GET")}},{key:"removeEditorApp",value:function(t){var e=this.getEditorAppData(t);e&&(clearTimeout(e.timeoutId),e.app&&e.app.destroy&&e.app.destroy(),e.container&&e.container.remove&&e.container.remove(),delete this.editors[t])}},{key:"getEditorAppData",value:function(t){return this.editors[t]}},{key:"getEditorApp",value:function(t,e,n){var o=2<arguments.length&&void 0!==n?n:{};o.keepOpened=o.keepOpened||!1;var i,a,r,s,d,c,m,u,l=o.cancelEvent,h=void 0===l?"switchCommentForm":l,p=o.position,f=void 0===p?"top":p;return void 0===this.editors[t]&&(i=e,a=$('<div class="single-comment-editor-container"></div>'),(r=$('<div class="single-comment-warning"></div>')).html(this.postPermission.warning),a.append(r),this.postPermission.permit&&(s=$('<div class="single-comment-editor" id="singlePostEditor_'.concat(t,'">')),c=$('<div class="single-comment-prompt">200字以内，仅用于支线交流，主线讨论请采用回复功能。</div>'),m=$('<div class="single-comment-button"></div>'),u="NKC.methods.".concat(h,'("').concat(t,'", true)'),m.append($('<button class="btn btn-default btn-sm" onclick=\''.concat(u,"'>取消</button>"))),m.append($('<button class="btn btn-default btn-sm" onclick="NKC.methods.saveDraft(\''.concat(t,"')\">存草稿</button>"))),m.append($('<button class="btn btn-primary btn-sm" data-type="post-button" onclick="NKC.methods.postData(\''.concat(t,"')\">提交</button>"))),a.append(c).append(s).append(m)),"top"===f?i.prepend(a):i.append(a),s&&(d=UE.getEditor(s.attr("id"),NKC.configs.ueditor.commentConfigs)),a.hide(),this.editors[t]={app:d,draftId:null,options:o,container:a,pid:t,show:!1,timeoutId:null}),this.editors[t]}},{key:"switchCommentForm",value:function(t){if(!NKC.configs.uid)return NKC.methods.toLogin();var e=this.getSingleComment(t).children(".single-comment-bottom"),n=this.getEditorApp(t,e);if(n.show){if(n.options.keepOpened)return;n.show=!1,n.container.hide(),clearTimeout(n.timeoutId),this.removeEditorApp(t)}else n.show=!0,n.container.show(),this.autoSaveDraft(t)}},{key:"getEditorContent",value:function(t){return this.getEditorApp(t).app.getContent()}},{key:"clearEditorContent",value:function(t){this.getEditorApp(t).app.setContent("")}},{key:"changeEditorButtonStatus",value:function(t,e){var n=this.getEditorApp(t).container.find("[data-type=post-button]");n.attr("disabled",e),e?n.html('<div class="fa fa-spinner fa-spin"></div> 提交中...'):n.html("提交")}},{key:"postData",value:function(e){var t=this.getEditorContent(e),n=this;return Promise.resolve().then(function(){if(!t)throw"评论内容不能为空";return n.changeEditorButtonStatus(e,!0),nkcAPI("/t/"+n.tid,"POST",{postType:"comment",post:{c:t,l:"html",parentPostId:e}})}).then(function(){screenTopAlert("发表成功"),n.clearEditorContent(e),n.changeEditorButtonStatus(e,!1),n.switchCommentForm(e)}).catch(function(t){sweetError(t),n.changeEditorButtonStatus(e,!1)})}},{key:"saveDraftData",value:function(t){var e=this.getEditorApp(t),n=this.getEditorContent(t),o=this;return Promise.resolve().then(function(){if(n)return nkcAPI("/u/".concat(NKC.configs.uid,"/drafts"),"POST",{post:{c:n,l:"html"},draftId:e.draftId,desType:"thread",desTypeId:o.tid})}).then(function(t){return t?(e.draftId=t.draft.did,{saved:!0}):{saved:!1,error:"草稿内容不能为空"}})}},{key:"saveDraft",value:function(t){this.saveDraftData(t).then(function(t){var e=t.saved,n=t.error;e?sweetSuccess("草稿已保存"):sweetError(n)}).catch(sweetError)}},{key:"autoSaveDraft",value:function(e){var n=this,t=n.getEditorApp(e);t&&t.show&&(clearTimeout(t.timeoutId),t.timeoutId=setTimeout(function(){n.saveDraftData(e).then(function(){n.autoSaveDraft(e)}).catch(function(t){screenTopWarning(t),n.autoSaveDraft(e)})},1e4))}},{key:"insertComment",value:function(t,e,n){var o=this.getCommentContainer(t);if(o.length){if("false"===o.attr("data-last-page"))return;o.children('.single-comments[data-pid="'.concat(t,'"]')).children('.single-comments[data-pid="'.concat(t,'"]')).append($(n))}else{this.getSingleComment(t).children(".single-comment-bottom").children('.single-comments[data-pid="'.concat(t,'"]')).append($(n))}this.setPostCommentNumber(e,1),this.renderPostCommentNumber(e),this.initNKCSource()}}])&&i(e.prototype,n),o&&i(e,o),t}());NKC.methods.autoHidePostContent=function(){o.autoHidePostContent()},NKC.methods.switchPostContent=function(t){o.switchPostContent(t)},NKC.methods.switchPostComment=function(t,e,n){o.switchPostComment(t,e,n)},NKC.methods.switchCommentForm=function(t){o.switchCommentForm(t)},NKC.methods.postData=function(t){o.postData(t)},NKC.methods.saveDraft=function(t){o.saveDraft(t)},NKC.methods.getPostCommentsByPage=function(t,e){o.showPostComment(t,e)},NKC.methods.showPostComment=function(t,e,n){o.showPostComment(t,e,n)},NKC.methods.insertComment=function(t,e,n){o.insertComment(t,e,n)}},{}]},{},[1]);