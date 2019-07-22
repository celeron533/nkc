/*
* 页面滚动到指定位置
* @param number 相对页顶的位置
* @param time 滚动执行的时间
* @author pengxiguaa 2019/1/15
* */
NKC.methods.scrollToTop = function(number, time) {
  if (!time) {
    document.body.scrollTop = document.documentElement.scrollTop = number;
    return number;
  }
  var spacingTime = 10;
  var spacingIndex = time / spacingTime;
  var nowTop = document.body.scrollTop + document.documentElement.scrollTop;
  var everTop = (number - nowTop) / spacingIndex;
  var scrollTimer = setInterval(function() {
    if (spacingIndex > 0) {
      spacingIndex--;
      NKC.methods.scrollToTop(nowTop += everTop);
    } else {
      clearInterval(scrollTimer);
    }
  }, spacingTime);
};

/*
* 通过vue渲染分页按钮，计算分页需要的关键数据
* @param paging对象 包含属性page, pageCount
* @return paging对象 包含属性page, pageCount, btnList(数组对象, 对象属性包括：text、page、active)
* @author pengxiguaa 2019/1/15
* */
NKC.methods.paging = function(paging) {
  if(!paging) paging = {
    page: 0,
    pageCount: 0
  };
  var page = paging.page, pageCount = paging.pageCount;
  var min, max;
  var reduce1 = page - 3, reduce2 = page + 3;
  if(reduce1 > 0) {
    if(reduce2 > pageCount) {
      max =  pageCount;
      if(reduce1 - (reduce2 - pageCount) < 0) {
        min = 0
      } else {
        min = reduce1 - (reduce2 - pageCount);
      }
    } else {
      max = reduce2;
      min = reduce1;
    }
  } else {
    min = 0;
    if(reduce2 < pageCount) {
      if(pageCount < reduce2 - reduce1) {
        max = pageCount;
      } else {
        max = reduce2 -reduce1;
      }
    } else {
      max = pageCount - 1;
    }
  }
  var arr = [];
  if(min !== 0) {
    arr.push({
      text: '1',
      page: 0
    });
    if(min >= 2) {
      arr.push({
        text: '...'
      });
    }
  }
  for(var i = min; i < pageCount; i++) {
    if(i <= max) {
      arr.push({
        text: i+1,
        page: i,
        active: page === i
      });
    }
  }
  if(max < pageCount - 2) {
    arr.push({
      text: '...'
    });
  }
  if(max < pageCount - 1) {
    arr.push({
      text: pageCount,
      page: pageCount - 1
    });
  }
  return {
    page: page,
    pageCount: pageCount,
    btnList: arr
  }
};


/*
* 渲染公式
* 异步获取内容渲染dom，需要手动执行该函数渲染公式
* @author pengxiguaa 2019/1/15
* */
NKC.methods.renderFormula = function() {
  if(window.MathJax) {
    window.MathJax.Hub.Queue(["Typeset", MathJax.Hub])
  }
};

/*
* 关注专业（学科、话题）
* @param {String} id 专业ID
* @param {Boolean} sub 是否关注 false: 取消关注, true: 关注
* @author pengxiguaa 2019-7-19
* */
// 返回promise
NKC.methods.subscribeForumPromise = function(id, sub) {
  var method;
  if(sub) {
    method = "POST";
  } else {
    method = "DELETE";
  }
  return nkcAPI("/f/" + id + "/subscribe", method, {});
};
// 执行成功后刷新页面
NKC.methods.subscribeForum = function(id, sub) {
  NKC.methods.subscribeForumPromise(id, sub)
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
};
/*
* 关注专栏
* @param {Number/String} id 专栏ID
* @param {Boolean} sub 是否关注 false: 取消关注, true: 关注
* @author pengxiguaa 2019-7-19
* */
// 返回promise
NKC.methods.subscribeColumnPromise = function(id, sub) {
  return nkcAPI("/m/" + id + "/subscribe", "POST", {
    type: sub? "subscribe":""
  });
};
// 执行成功后刷新页面
NKC.methods.subscribeColumn = function(id, sub) {
  NKC.methods.subscribeForumPromise(id, sub)
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
};
/*
* 关注用户
* @param {String} id 用户ID
* @param {Boolean} sub 是否关注 false: 取消关注, true: 关注
* @author pengxiguaa 2019-7-19
* */
// 返回promise
NKC.methods.subscribeUserPromise = function(id, sub) {
  var method = sub? "POST": "DELETE";
  return nkcAPI("/u/" + id + "/subscribe", method, {});
};
// 执行成功后刷新页面
NKC.methods.subscribeUser = function(id, sub) {
  NKC.methods.subscribeUserPromise(id, sub)
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
};
/*
* 关注文章
* @param {String} id 文章ID
* @param {Boolean} sub 是否关注 false: 取消关注, true: 关注
* @author pengxiguaa 2019-7-19
* */
// 返回promise
NKC.methods.subscribeThreadPromise = function(id, sub) {
  var method = sub? "POST": "DELETE";
  return nkcAPI("/t/" + id + "/subscribe", method, {});
};
// 执行成功后刷新页面
NKC.methods.subscribeThread = function(id, sub) {
  NKC.methods.subscribeThreadPromise(id, sub)
    .then(function() {
      window.location.reload();
    })
    .catch(function(data) {
      sweetError(data);
    })
};