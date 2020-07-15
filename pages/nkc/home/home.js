(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var data = NKC.methods.getDataById("data");

var modifyAd = function modifyAd(ad, type) {
  ad.type = type;
};

for (var i = 0; i < data.ads.movable.length; i++) {
  var ad = data.ads.movable[i];
  modifyAd(ad, "movable");
}

for (var _i = 0; _i < data.ads.fixed.length; _i++) {
  var _ad = data.ads.fixed[_i];
  modifyAd(_ad, "fixed");
}

var app = new Vue({
  el: "#app",
  data: {
    page: {},
    recommendThreads: data.recommendThreads,
    ads: data.ads,
    recommendForums: data.recommendForums,
    columns: data.columns,
    goods: data.goods,
    toppedThreads: data.toppedThreads,
    showShopGoods: data.showGoods ? "t" : "",
    // 首页“最新原创”文章条目显示模式，为空就默认为简略显示
    originalThreadDisplayMode: data.originalThreadDisplayMode
  },
  mounted: function mounted() {
    window.SelectImage = new NKC.methods.selectImage();
    window.MoveThread = new NKC.modules.MoveThread();
  },
  computed: {
    selectedRecommendForumsId: function selectedRecommendForumsId() {
      return data.recommendForums.map(function (f) {
        return f.fid;
      });
    },
    nav: function nav() {
      var pageId = this.pageId;
      var arr = [{
        id: 'other',
        name: '其他'
      }, {
        id: 'movable',
        name: '轮播图'
      }, {
        id: 'fixed',
        name: '固定图'
      }];
      arr.map(function (a) {
        a.active = a.id === pageId;
      });
      return arr;
    }
  },
  methods: {
    checkString: NKC.methods.checkData.checkString,
    checkNumber: NKC.methods.checkData.checkNumber,
    getUrl: NKC.methods.tools.getUrl,
    floatUserInfo: NKC.methods.tools.floatUserInfo,
    visitUrl: NKC.methods.visitUrl,
    getRecommendTypeName: function getRecommendTypeName(id) {
      return {
        movable: '轮播图',
        fixed: '固定图'
      }[id];
    },
    selectPage: function selectPage(page) {
      this.page = page;
    },
    selectLocalFile: function selectLocalFile(ad) {
      var options = {};

      if (ad.type === "movable") {
        options.aspectRatio = 800 / 336;
      } else {
        options.aspectRatio = 400 / 253;
      }

      SelectImage.show(function (data) {
        var formData = new FormData();
        formData.append("cover", data);
        formData.append("topType", ad.type);
        formData.append("tid", ad.tid);
        nkcUploadFile("/nkc/home", "POST", formData).then(function (data) {
          ad.cover = data.coverHash;
        })["catch"](sweetError);
        SelectImage.close();
      }, options);
    },
    move: function move(ad, type) {
      var ads;

      if (ad.type === "movable") {
        ads = this.ads.movable;
      } else {
        ads = this.ads.fixed;
      }

      var index = ads.indexOf(ad);
      if (type === "left" && index === 0 || type === "right" && index + 1 === ads.length) return;
      var newIndex;

      if (type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      var otherAd = ads[newIndex];
      ads.splice(index, 1, otherAd);
      ads.splice(newIndex, 1, ad);
    },
    saveAds: function saveAds() {
      var _this$ads = this.ads,
          movable = _this$ads.movable,
          fixed = _this$ads.fixed,
          movableOrder = _this$ads.movableOrder,
          fixedOrder = _this$ads.fixedOrder;
      var self = this;
      Promise.resolve().then(function () {
        movable.concat(fixed).map(function (ad) {
          self.checkString(ad.title, {
            name: "标题",
            minLength: 1,
            maxLength: 200
          });
          if (!ad.cover) throw "封面图不能为空";
          if (!ad.tid) throw "文章ID不能为空";
        });
        return nkcAPI("/nkc/home", "PATCH", {
          operation: "saveAds",
          movable: movable,
          fixed: fixed,
          movableOrder: movableOrder,
          fixedOrder: fixedOrder
        });
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    remove: function remove(ads, index) {
      ads.splice(index, 1);
      /*sweetQuestion("确定要执行删除操作？")
        .then(() => {
          ads.splice(index, 1)
        })
        .catch(() => {})*/
    },
    addForum: function addForum() {
      var self = this;
      MoveThread.open(function (data) {
        var originForums = data.originForums;
        originForums.map(function (forum) {
          if (!self.selectedRecommendForumsId.includes(forum.fid)) {
            self.recommendForums.push(forum);
          }
        });
        MoveThread.close();
      }, {
        hideMoveType: true
      });
    },
    moveForum: function moveForum(arr, f, type) {
      var index = arr.indexOf(f);
      if (type === "left" && index === 0 || type === "right" && index + 1 === arr.length) return;
      var newIndex;

      if (type === "left") {
        newIndex = index - 1;
      } else {
        newIndex = index + 1;
      }

      var otherAd = arr[newIndex];
      arr.splice(index, 1, otherAd);
      arr.splice(newIndex, 1, f);
    },
    removeForum: function removeForum(arr, index) {
      arr.splice(index, 1);
      /*const self = this;
      sweetQuestion("确定要执行删除操作？")
        .then(() => {
          arr.splice(index, 1);
        })
        .catch(() => {})*/
    },
    saveRecommendForums: function saveRecommendForums() {
      var forumsId = this.recommendForums.map(function (forum) {
        return forum.fid;
      });
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveRecommendForums",
        forumsId: forumsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveColumns: function saveColumns() {
      var columnsId = this.columns.map(function (c) {
        return c._id;
      });
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveColumns",
        columnsId: columnsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveGoods: function saveGoods() {
      var goodsId = this.goods.map(function (g) {
        return g.productId;
      });
      var showShopGoods = !!this.showShopGoods;
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveGoods",
        goodsId: goodsId,
        showShopGoods: showShopGoods
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveToppedThreads: function saveToppedThreads() {
      var toppedThreadsId = this.toppedThreads.map(function (t) {
        return t.tid;
      });
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveToppedThreads",
        toppedThreadsId: toppedThreadsId
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    },
    saveOriginalThreadDisplayMode: function saveOriginalThreadDisplayMode() {
      var originalThreadDisplayMode = this.originalThreadDisplayMode;
      nkcAPI("/nkc/home", "PATCH", {
        operation: "saveOriginalThreadDisplayMode",
        originalThreadDisplayMode: originalThreadDisplayMode
      }).then(function () {
        sweetSuccess("保存成功");
      })["catch"](sweetError);
    }
  }
});
console.log(app);

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJwYWdlcy9ua2MvaG9tZS9ob21lLm1qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDQUEsSUFBTSxJQUFJLEdBQUcsR0FBRyxDQUFDLE9BQUosQ0FBWSxXQUFaLENBQXdCLE1BQXhCLENBQWI7O0FBQ0EsSUFBTSxRQUFRLEdBQUcsU0FBWCxRQUFXLENBQUMsRUFBRCxFQUFLLElBQUwsRUFBYztBQUM3QixFQUFBLEVBQUUsQ0FBQyxJQUFILEdBQVUsSUFBVjtBQUNELENBRkQ7O0FBSUEsS0FBSSxJQUFJLENBQUMsR0FBRyxDQUFaLEVBQWUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxDQUFpQixNQUFwQyxFQUE0QyxDQUFDLEVBQTdDLEVBQWlEO0FBQy9DLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxDQUFpQixDQUFqQixDQUFYO0FBQ0EsRUFBQSxRQUFRLENBQUMsRUFBRCxFQUFLLFNBQUwsQ0FBUjtBQUNEOztBQUVELEtBQUksSUFBSSxFQUFDLEdBQUcsQ0FBWixFQUFlLEVBQUMsR0FBRyxJQUFJLENBQUMsR0FBTCxDQUFTLEtBQVQsQ0FBZSxNQUFsQyxFQUEwQyxFQUFDLEVBQTNDLEVBQStDO0FBQzdDLE1BQU0sR0FBRSxHQUFHLElBQUksQ0FBQyxHQUFMLENBQVMsS0FBVCxDQUFlLEVBQWYsQ0FBWDtBQUNBLEVBQUEsUUFBUSxDQUFDLEdBQUQsRUFBSyxPQUFMLENBQVI7QUFDRDs7QUFFRCxJQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUosQ0FBUTtBQUNsQixFQUFBLEVBQUUsRUFBRSxNQURjO0FBRWxCLEVBQUEsSUFBSSxFQUFFO0FBQ0osSUFBQSxJQUFJLEVBQUUsRUFERjtBQUVKLElBQUEsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLGdCQUZuQjtBQUdKLElBQUEsR0FBRyxFQUFFLElBQUksQ0FBQyxHQUhOO0FBSUosSUFB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WSxDQUFDLE1BQUQsQ0FBWjtBQUNELE9BTkgsV0FPUyxVQVBUO0FBUUQ7QUF0TE07QUE1Q1MsQ0FBUixDQUFaO0FBc09BLE9BQU8sQ0FBQyxHQUFSLENBQVksR0FBWiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGRhdGEgPSBOS0MubWV0aG9kcy5nZXREYXRhQnlJZChcImRhdGFcIik7XHJcbmNvbnN0IG1vZGlmeUFkID0gKGFkLCB0eXBlKSA9PiB7XHJcbiAgYWQudHlwZSA9IHR5cGU7XHJcbn07XHJcblxyXG5mb3IobGV0IGkgPSAwOyBpIDwgZGF0YS5hZHMubW92YWJsZS5sZW5ndGg7IGkrKykge1xyXG4gIGNvbnN0IGFkID0gZGF0YS5hZHMubW92YWJsZVtpXTtcclxuICBtb2RpZnlBZChhZCwgXCJtb3ZhYmxlXCIpO1xyXG59XHJcblxyXG5mb3IobGV0IGkgPSAwOyBpIDwgZGF0YS5hZHMuZml4ZWQubGVuZ3RoOyBpKyspIHtcclxuICBjb25zdCBhZCA9IGRhdGEuYWRzLmZpeGVkW2ldO1xyXG4gIG1vZGlmeUFkKGFkLCBcImZpeGVkXCIpO1xyXG59XHJcblxyXG5jb25zdCBhcHAgPSBuZXcgVnVlKHtcclxuICBlbDogXCIjYXBwXCIsXHJcbiAgZGF0YToge1xyXG4gICAgcGFnZToge30sXHJcbiAgICByZWNvbW1lbmRUaHJlYWRzOiBkYXRhLnJlY29tbWVuZFRocmVhZHMsXHJcbiAgICBhZHM6IGRhdGEuYWRzLFxyXG4gICAgcmVjb21tZW5kRm9ydW1zOiBkYXRhLnJlY29tbWVuZEZvcnVtcyxcclxuICAgIGNvbHVtbnM6IGRhdGEuY29sdW1ucyxcclxuICAgIGdvb2RzOiBkYXRhLmdvb2RzLFxyXG4gICAgdG9wcGVkVGhyZWFkczogZGF0YS50b3BwZWRUaHJlYWRzLFxyXG4gICAgc2hvd1Nob3BHb29kczogKGRhdGEuc2hvd0dvb2RzPyBcInRcIjogXCJcIiksXHJcbiAgICAvLyDpppbpobXigJzmnIDmlrDljp/liJvigJ3mlofnq6DmnaHnm67mmL7npLrmqKHlvI/vvIzkuLrnqbrlsLHpu5jorqTkuLrnroDnlaXmmL7npLpcclxuICAgIG9yaWdpbmFsVGhyZWFkRGlzcGxheU1vZGU6IGRhdGEub3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZVxyXG4gIH0sXHJcbiAgbW91bnRlZCgpIHtcclxuICAgIHdpbmRvdy5TZWxlY3RJbWFnZSA9IG5ldyBOS0MubWV0aG9kcy5zZWxlY3RJbWFnZSgpO1xyXG4gICAgd2luZG93Lk1vdmVUaHJlYWQgPSBuZXcgTktDLm1vZHVsZXMuTW92ZVRocmVhZCgpO1xyXG4gIH0sXHJcbiAgY29tcHV0ZWQ6IHtcclxuICAgIHNlbGVjdGVkUmVjb21tZW5kRm9ydW1zSWQoKSB7XHJcbiAgICAgIHJldHVybiBkYXRhLnJlY29tbWVuZEZvcnVtcy5tYXAoZiA9PiBmLmZpZCk7XHJcbiAgICB9LFxyXG4gICAgbmF2KCkge1xyXG4gICAgICBjb25zdCB7cGFnZUlkfSA9IHRoaXM7XHJcbiAgICAgIGNvbnN0IGFyciA9IFtcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpZDogJ290aGVyJyxcclxuICAgICAgICAgIG5hbWU6ICflhbbku5YnXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICBpZDogJ21vdmFibGUnLFxyXG4gICAgICAgICAgbmFtZTogJ+i9ruaSreWbvidcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgIGlkOiAnZml4ZWQnLFxyXG4gICAgICAgICAgbmFtZTogJ+WbuuWumuWbvidcclxuICAgICAgICB9XHJcbiAgICAgIF07XHJcbiAgICAgIGFyci5tYXAoYSA9PiB7XHJcbiAgICAgICAgYS5hY3RpdmUgPSBhLmlkID09PSBwYWdlSWQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICByZXR1cm4gYXJyO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgbWV0aG9kczoge1xyXG4gICAgY2hlY2tTdHJpbmc6IE5LQy5tZXRob2RzLmNoZWNrRGF0YS5jaGVja1N0cmluZyxcclxuICAgIGNoZWNrTnVtYmVyOiBOS0MubWV0aG9kcy5jaGVja0RhdGEuY2hlY2tOdW1iZXIsXHJcbiAgICBnZXRVcmw6IE5LQy5tZXRob2RzLnRvb2xzLmdldFVybCxcclxuICAgIGZsb2F0VXNlckluZm86IE5LQy5tZXRob2RzLnRvb2xzLmZsb2F0VXNlckluZm8sXHJcbiAgICB2aXNpdFVybDogTktDLm1ldGhvZHMudmlzaXRVcmwsXHJcbiAgICBnZXRSZWNvbW1lbmRUeXBlTmFtZShpZCkge1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIG1vdmFibGU6ICfova7mkq3lm74nLFxyXG4gICAgICAgIGZpeGVkOiAn5Zu65a6a5Zu+J1xyXG4gICAgICB9W2lkXVxyXG4gICAgfSxcclxuICAgIHNlbGVjdFBhZ2UocGFnZSkge1xyXG4gICAgICB0aGlzLnBhZ2UgPSBwYWdlO1xyXG4gICAgfSxcclxuICAgIHNlbGVjdExvY2FsRmlsZShhZCkge1xyXG4gICAgICBjb25zdCBvcHRpb25zID0ge307XHJcbiAgICAgIGlmKGFkLnR5cGUgPT09IFwibW92YWJsZVwiKSB7XHJcbiAgICAgICAgb3B0aW9ucy5hc3BlY3RSYXRpbyA9IDgwMC8zMzY7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgb3B0aW9ucy5hc3BlY3RSYXRpbyA9IDQwMC8yNTM7XHJcbiAgICAgIH1cclxuICAgICAgU2VsZWN0SW1hZ2Uuc2hvdyhkYXRhID0+IHtcclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChcImNvdmVyXCIsIGRhdGEpO1xyXG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChcInRvcFR5cGVcIiwgYWQudHlwZSk7XHJcbiAgICAgICAgZm9ybURhdGEuYXBwZW5kKFwidGlkXCIsIGFkLnRpZCk7XHJcbiAgICAgICAgbmtjVXBsb2FkRmlsZShcIi9ua2MvaG9tZVwiLCBcIlBPU1RcIiwgZm9ybURhdGEpXHJcbiAgICAgICAgICAudGhlbihkYXRhID0+IHtcclxuICAgICAgICAgICAgYWQuY292ZXIgPSBkYXRhLmNvdmVySGFzaDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICAgICAgU2VsZWN0SW1hZ2UuY2xvc2UoKTtcclxuICAgICAgfSwgb3B0aW9ucyk7XHJcbiAgICB9LFxyXG4gICAgbW92ZShhZCwgdHlwZSkge1xyXG4gICAgICBsZXQgYWRzO1xyXG4gICAgICBpZihhZC50eXBlID09PSBcIm1vdmFibGVcIikge1xyXG4gICAgICAgIGFkcyA9IHRoaXMuYWRzLm1vdmFibGU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgYWRzID0gdGhpcy5hZHMuZml4ZWQ7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgaW5kZXggPSBhZHMuaW5kZXhPZihhZCk7XHJcbiAgICAgIGlmKCh0eXBlID09PSBcImxlZnRcIiAmJiBpbmRleCA9PT0gMCkgfHwgKHR5cGUgPT09IFwicmlnaHRcIiAmJiBpbmRleCsxID09PSBhZHMubGVuZ3RoKSkgcmV0dXJuO1xyXG4gICAgICBsZXQgbmV3SW5kZXg7XHJcbiAgICAgIGlmKHR5cGUgPT09IFwibGVmdFwiKSB7XHJcbiAgICAgICAgbmV3SW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3SW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgb3RoZXJBZCA9IGFkc1tuZXdJbmRleF07XHJcbiAgICAgIGFkcy5zcGxpY2UoaW5kZXgsIDEsIG90aGVyQWQpO1xyXG4gICAgICBhZHMuc3BsaWNlKG5ld0luZGV4LCAxLCBhZCk7XHJcbiAgICB9LFxyXG4gICAgc2F2ZUFkcygpe1xyXG4gICAgICBjb25zdCB7bW92YWJsZSwgZml4ZWQsIG1vdmFibGVPcmRlciwgZml4ZWRPcmRlcn0gPSB0aGlzLmFkcztcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIFByb21pc2UucmVzb2x2ZSgpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgbW92YWJsZS5jb25jYXQoZml4ZWQpLm1hcChhZCA9PiB7XHJcbiAgICAgICAgICAgIHNlbGYuY2hlY2tTdHJpbmcoYWQudGl0bGUsIHtcclxuICAgICAgICAgICAgICBuYW1lOiBcIuagh+mimFwiLFxyXG4gICAgICAgICAgICAgIG1pbkxlbmd0aDogMSxcclxuICAgICAgICAgICAgICBtYXhMZW5ndGg6IDIwMFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgaWYoIWFkLmNvdmVyKSB0aHJvdyBcIuWwgemdouWbvuS4jeiDveS4uuepulwiO1xyXG4gICAgICAgICAgICBpZighYWQudGlkKSB0aHJvdyBcIuaWh+eroElE5LiN6IO95Li656m6XCI7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybiBua2NBUEkoXCIvbmtjL2hvbWVcIiwgXCJQQVRDSFwiLCB7XHJcbiAgICAgICAgICAgIG9wZXJhdGlvbjogXCJzYXZlQWRzXCIsXHJcbiAgICAgICAgICAgIG1vdmFibGUsXHJcbiAgICAgICAgICAgIGZpeGVkLFxyXG4gICAgICAgICAgICBtb3ZhYmxlT3JkZXIsXHJcbiAgICAgICAgICAgIGZpeGVkT3JkZXJcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHJlbW92ZShhZHMsIGluZGV4KXtcclxuICAgICAgYWRzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgLypzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5omn6KGM5Yig6Zmk5pON5L2c77yfXCIpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgYWRzLnNwbGljZShpbmRleCwgMSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7fSkqL1xyXG5cclxuICAgIH0sXHJcbiAgICBhZGRGb3J1bSgpIHtcclxuICAgICAgY29uc3Qgc2VsZiA9IHRoaXM7XHJcbiAgICAgIE1vdmVUaHJlYWQub3BlbihkYXRhID0+IHtcclxuICAgICAgICBjb25zdCB7b3JpZ2luRm9ydW1zfSA9IGRhdGE7XHJcbiAgICAgICAgb3JpZ2luRm9ydW1zLm1hcChmb3J1bSA9PiB7XHJcbiAgICAgICAgICBpZighc2VsZi5zZWxlY3RlZFJlY29tbWVuZEZvcnVtc0lkLmluY2x1ZGVzKGZvcnVtLmZpZCkpIHtcclxuICAgICAgICAgICAgc2VsZi5yZWNvbW1lbmRGb3J1bXMucHVzaChmb3J1bSlcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBNb3ZlVGhyZWFkLmNsb3NlKCk7XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBoaWRlTW92ZVR5cGU6IHRydWVcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBtb3ZlRm9ydW0oYXJyLCBmLCB0eXBlKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gYXJyLmluZGV4T2YoZik7XHJcbiAgICAgIGlmKCh0eXBlID09PSBcImxlZnRcIiAmJiBpbmRleCA9PT0gMCkgfHwgKHR5cGUgPT09IFwicmlnaHRcIiAmJiBpbmRleCsxID09PSBhcnIubGVuZ3RoKSkgcmV0dXJuO1xyXG4gICAgICBsZXQgbmV3SW5kZXg7XHJcbiAgICAgIGlmKHR5cGUgPT09IFwibGVmdFwiKSB7XHJcbiAgICAgICAgbmV3SW5kZXggPSBpbmRleCAtIDE7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbmV3SW5kZXggPSBpbmRleCArIDE7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3Qgb3RoZXJBZCA9IGFycltuZXdJbmRleF07XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEsIG90aGVyQWQpO1xyXG4gICAgICBhcnIuc3BsaWNlKG5ld0luZGV4LCAxLCBmKTtcclxuICAgIH0sXHJcbiAgICByZW1vdmVGb3J1bShhcnIsIGluZGV4KSB7XHJcbiAgICAgIGFyci5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAvKmNvbnN0IHNlbGYgPSB0aGlzO1xyXG4gICAgICBzd2VldFF1ZXN0aW9uKFwi56Gu5a6a6KaB5omn6KGM5Yig6Zmk5pON5L2c77yfXCIpXHJcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xyXG4gICAgICAgICAgYXJyLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goKCkgPT4ge30pKi9cclxuICAgIH0sXHJcbiAgICBzYXZlUmVjb21tZW5kRm9ydW1zKCkge1xyXG4gICAgICBjb25zdCBmb3J1bXNJZCA9IHRoaXMucmVjb21tZW5kRm9ydW1zLm1hcChmb3J1bSA9PiBmb3J1bS5maWQpO1xyXG4gICAgICBua2NBUEkoXCIvbmtjL2hvbWVcIiwgXCJQQVRDSFwiLCB7XHJcbiAgICAgICAgb3BlcmF0aW9uOiBcInNhdmVSZWNvbW1lbmRGb3J1bXNcIixcclxuICAgICAgICBmb3J1bXNJZFxyXG4gICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgc3dlZXRTdWNjZXNzKFwi5L+d5a2Y5oiQ5YqfXCIpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKHN3ZWV0RXJyb3IpO1xyXG4gICAgfSxcclxuICAgIHNhdmVDb2x1bW5zKCl7XHJcbiAgICAgIGNvbnN0IGNvbHVtbnNJZCA9IHRoaXMuY29sdW1ucy5tYXAoYyA9PiBjLl9pZCk7XHJcbiAgICAgIG5rY0FQSShcIi9ua2MvaG9tZVwiLCBcIlBBVENIXCIsIHtcclxuICAgICAgICBvcGVyYXRpb246IFwic2F2ZUNvbHVtbnNcIixcclxuICAgICAgICBjb2x1bW5zSWRcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgc2F2ZUdvb2RzKCkge1xyXG4gICAgICBjb25zdCBnb29kc0lkID0gdGhpcy5nb29kcy5tYXAoZyA9PiBnLnByb2R1Y3RJZCk7XHJcbiAgICAgIGNvbnN0IHNob3dTaG9wR29vZHMgPSAhIXRoaXMuc2hvd1Nob3BHb29kcztcclxuICAgICAgbmtjQVBJKFwiL25rYy9ob21lXCIsIFwiUEFUQ0hcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJzYXZlR29vZHNcIixcclxuICAgICAgICBnb29kc0lkLFxyXG4gICAgICAgIHNob3dTaG9wR29vZHNcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcik7XHJcbiAgICB9LFxyXG4gICAgc2F2ZVRvcHBlZFRocmVhZHMoKSB7XHJcbiAgICAgIGNvbnN0IHRvcHBlZFRocmVhZHNJZCA9IHRoaXMudG9wcGVkVGhyZWFkcy5tYXAodCA9PiB0LnRpZCk7XHJcbiAgICAgIG5rY0FQSShcIi9ua2MvaG9tZVwiLCBcIlBBVENIXCIsIHtcclxuICAgICAgICBvcGVyYXRpb246IFwic2F2ZVRvcHBlZFRocmVhZHNcIixcclxuICAgICAgICB0b3BwZWRUaHJlYWRzSWRcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH0sXHJcbiAgICBzYXZlT3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZSgpIHtcclxuICAgICAgY29uc3Qgb3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZSA9IHRoaXMub3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZTtcclxuICAgICAgbmtjQVBJKFwiL25rYy9ob21lXCIsIFwiUEFUQ0hcIiwge1xyXG4gICAgICAgIG9wZXJhdGlvbjogXCJzYXZlT3JpZ2luYWxUaHJlYWREaXNwbGF5TW9kZVwiLFxyXG4gICAgICAgIG9yaWdpbmFsVGhyZWFkRGlzcGxheU1vZGVcclxuICAgICAgfSlcclxuICAgICAgICAudGhlbigoKSA9PiB7XHJcbiAgICAgICAgICBzd2VldFN1Y2Nlc3MoXCLkv53lrZjmiJDlip9cIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goc3dlZXRFcnJvcilcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG5cclxuY29uc29sZS5sb2coYXBwKTtcclxuXHJcbiJdfQ==
