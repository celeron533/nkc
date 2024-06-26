<template lang="pug">
  .resource-selector
    mixin resourcePaging
      .resource-paging(v-if="paging && paging.buttonValue")
        .paging-button(v-if="paging.buttonValue.length > 1")
          a.button.radius-left(title="上一页" @click="changePage('last')")
            .fa.fa-angle-left
          a.button.radius-right(title="下一页" @click="changePage('next')")
            .fa.fa-angle-right
        .paging-button(v-if="screenType !== 'sm'")
          span(v-for="(b, index) in paging.buttonValue")
            span(v-if="b.type === 'active'")
              a.button.active(@click="getResources(b.num)"
                :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
              ) {{b.num+1}}
            span(v-else-if="b.type === 'common'")
              a.button(@click="getResources(b.num)"
                :class="{'radius-left': !index, 'radius-right': (index+1)===paging.buttonValue.length}"
              ) {{b.num+1}}
            span(v-else)
              a.button ..
        .paging-button(v-if="paging.buttonValue.length")
          span(style="font-size: 1rem;") 跳转到&nbsp;
          input.input.radius-left(type="text" v-model.number="pageNumber")
          a.button.radius-right(@click="fastSelectPage") 确定
    .module-sr-body
      .module-sr-header
        .module-sr-title(ref="draggableHandle") 插入资源
        .fa.fa-remove(@click="close")
      .module-sr-content(v-if="pageType === 'list'")
        .selected-resources
          .resource-types
            //- (v-if="allowedExt && allowedExt.length > 1")
            .resource-type(v-if="show.all" :class="{'active':resourceType === 'all'}" @click="selectResourceType('all')") 全部
            .resource-type(v-if="show.picture" :class="{'active':resourceType === 'picture'}" @click="selectResourceType('picture')") 图片
            .resource-type(v-if="show.video" :class="{'active':resourceType === 'video'}" @click="selectResourceType('video')") 视频
            .resource-type(v-if="show.audio" :class="{'active':resourceType === 'audio'}" @click="selectResourceType('audio')") 音频
            .resource-type(v-if="show.attachment" :class="{'active':resourceType === 'attachment'}" @click="selectResourceType('attachment')") 附件
          .resource-types
            .resource-type(:class="{'active':category === 'all'}" @click="selectCategory('all')") 全部
            .resource-type(:class="{'active':category === 'unused'}" @click="selectCategory('unused')") 未使用
            .resource-type(:class="{'active':category === 'used'}" @click="selectCategory('used')") 已使用
            .resource-type(v-if="files.length" :class="{'active':category === 'upload'}" @click="selectCategory('upload')") 正在上传
        .resources-paging
          +resourcePaging
        .resources-body(v-if="category === 'upload'")
          .resource-info(v-if="!files.length") 空空如也~
          .resource(v-else v-for="f, index in files")
            .resource-upload-body(v-if="f.status === 'uploading'")
              .resource-picture.upload(v-if="f.progress !== 100")
                span 上传中..{{f.progress}}%
                .fa.fa-spinner.fa-spin.fa-fw
              .resource-picture.upload(v-else)
                span 处理中..
                .fa.fa-spinner.fa-spin.fa-fw
            .resource-upload-body(v-if="f.status === 'unUpload'")
              .resource-picture.upload(v-if="f.error")
                .remove-file
                  .fa.fa-remove(@click="removeFile(index)")
                span.pointer(@click="startUpload(f)") 上传失败，点击重试
              .resource-picture.upload(v-else)
                span 等待中...
                .fa.fa-spinner.fa-spin.fa-fw
            .resource-name
              span {{f.name}}
        .resources-body(v-else)
          .resource-info(v-if="!resources.length") 空空如也~
          //- 资源显示
          .resource(v-else v-for="r, index in resources"
            :title="'时间：'+ timeFormat(r.toc)+'\\n文件名：' + r.oname")
            span(v-if='r.state === "usable"')
              .resource-picture(v-if="r.mediaType === 'uploading'" :style="'background-image:url(/rt/' + r.rid + ')'")
              .resource-picture.media-picture(v-if="r.mediaType === 'mediaPicture'" :style="'background-image:url(' + getUrl('resourceCover', r.rid) + ')'")
              .resource-picture.media-picture(v-if="r.mediaType === 'mediaVideo'" :style="'background-image:url(' + getUrl('resourceCover', r.rid) + ')'")
              .resource-picture.icon(v-if="r.mediaType === 'mediaAudio'" :style="'background-image:url(/attachIcon/mp3.png)'")
              .resource-picture.icon(v-if="r.mediaType === 'mediaAttachment'" :style="'background-image:url(/attachIcon/'+r.ext+'.png)'")
            span(v-else)
              .resource-picture.resource-in-process-bg
            .resource-name
              span(v-if="r.mediaType === 'mediaVideo'") (视频)
              span {{r.oname}}
            span(v-if='r.state === "usable"')
              .resource-options(v-if="selectedResourcesId.indexOf(r.rid) !== -1" )
                .resource-mask.active(@click="fastSelectResource(r)")
                .fa.fa-check-square-o.active(@click="selectResource(r)")
                .resource-index {{selectedResourcesId.indexOf(r.rid) + 1}}
              .resource-options(v-else)
                //-.resource-mask(@click="fastSelectResource(r)" @mouseenter="viewPicture($event, r)" @mouseleave="closePicture() @touchstart="onTouch"")
                .resource-mask(@click="fastSelectResource(r)")
                .fa.fa-edit(@click="editImage(r)" v-if="r.mediaType === 'mediaPicture'")
                .fa.fa-square-o(@click="selectResource(r)")
            span(v-else-if='r.state === "inProcess"')
              .resource-in-process
                span 处理中..
                .fa.fa-spinner.fa-spin.fa-fw
            span(v-else)
              .resource-in-process
                span 处理失败
                .fa.fa-exclamation-circle.pointer(v-if='r.errorInfo' :title='r.errorInfo' @click='showErrorInfo(r)')
        .module-sr-footer
          .pull-left
            input.hidden(ref='inputElement' type="file" multiple="true" @change="selectedFiles")
            button.btn.btn-default.btn-sm(@click="clickInput") 上传
            button.btn.btn-default.btn-sm.m-r-05(v-if='isApp' @click="takePicture") 拍照
            button.btn.btn-default.btn-sm.m-r-05(v-if='isApp' @click="takeVideo") 录像
            button.btn.btn-default.btn-sm.m-r-05(v-if='isApp' @click="recordAudio") 录音
            .text-left.hidden-xs.hidden-sm.paste-content(ref='pasteContent' @click="readyPaste") 拖拽或粘贴文件到此处即可上传
            span.size-limit.hidden-xs.hidden-sm(@click='showFileSizeLimit' :title='fileSizeLimit' v-if='fileSizeLimit') 大小限制
              .fa.fa-question-circle
          button(type="button" class="btn btn-primary btn-sm" v-if="!selectedResourcesId.length" disabled title="请先勾选图片") 确定
          button(type="button" class="btn btn-primary btn-sm" @click="done" v-else) 确定
      .edit-picture-body(v-else-if="pageType === 'editPicture'")
        img.image(ref='imageElement')
        .module-sr-footer.m-t-1
          .pull-left
            button.btn.btn-default.btn-sm.m-r-05(@click="rotate('left')") 左旋
            button.btn.btn-default.btn-sm(@click="rotate('right')") 右旋
          button(type="button" class="m-r-05 btn btn-default btn-sm" @click="cancelCropPicture") 取消
          button(type="button" class="m-r-05 btn btn-primary btn-sm" disabled v-if="croppingPicture") 裁剪中..
            .fa.fa-spinner.fa-spin.fa-fw
          button(type="button" class="btn btn-primary btn-sm" @click="cropPicture" v-else) 确定
</template>

<style lang="less" scoped>
  img.image{
    max-width: 100%;
    height: 30rem;
  }
  .resource-selector{
    display: none;
    position: fixed;
    width: 46rem;
    max-width: 100%;
    top: 100px;
    right: 0;
    background-color: #fff;
    box-shadow: 0 0 5px rgba(0,0,0,0.2);
    border: 1px solid #c7c7c7;
  }
  .module-sr-footer{
    text-align: right;
    height: 3rem;
    margin-top: 0.5rem;
  }
  .module-sr-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;
  }
  .module-sr-title{
    cursor: move;
    //font-weight: 700;
    margin-left: 1rem;
  }
  .module-sr-header .fa{
    cursor: pointer;
    color: #aaa;
    width: 3rem;
    position: absolute;
    top: 0;
    right: 0;
    height: 3rem;
    line-height: 3rem;
    text-align: center;
  }
  .module-sr-header .fa:hover, .module-sr-header .fa:active{
    background-color: rgba(0,0,0,0.08);
    color: #777;
  }
  .module-sr-content{
    padding: 1rem;
  }
  .resource-selector .selected-resources{
    max-height: 4.8rem;
    overflow: hidden;
  }
  .resource-selector .resources-paging{
    height: 3rem;
    overflow: hidden;
    padding-top: 0.5rem;
  }
  .resource-selector .resource-type{
    height: 2rem;
    font-size: 1.2rem;
    line-height: 2rem;
    padding: 0 1rem 0 0;
    border-radius: 3px;
    display: inline-block;
    cursor: pointer;
    //font-weight: 700;
    color: #555;
    transition: background-color 100ms, color 100ms;
  }
  .resource-selector .resource-type:hover, .resource-selector .resource-type.active{
    /*background-color: #2b90d9;*/
    color: #2b90d9;
  }
  .resource-selector  .resource-picture{
    height: 100%;
    width: 100%;
    background-size: cover;
  }
  .resource-selector  .resource-picture.icon{
    background-size: 50%;
    background-position: center;
    background-repeat: no-repeat;
  }
  .resource-selector .resource-picture.upload{
    background-color: #eee;
    font-size: 1rem;
    position: relative;
    overflow: hidden;
    padding-top: 2.3rem;
    text-align: center;
  }
  .resource-selector .resource-picture.upload .remove-file{
    position: absolute;
    top: 0;
    right: 0;
    height: 1.5rem;
    width: 1.5rem;
    line-height: 1.5rem;
    font-size: 1rem;
    cursor: pointer;
    color: #aaa;
    text-align: center;
  }
  .resource-selector  .resources-body{
    font-size: 0;
    position: relative;
    height: 28rem;
  }
  .resource-selector .resource-upload-body{
    height: 100%;
    width: 100%;
  }
  .resource-selector .upload-list{
    overflow-y: scroll;
    margin: 0.5rem 0;
  }
  .resource-selector  .resource{
    width: 23.5%;
    height: 6.5rem;
    margin: 0 1% 1% 0;
    position: relative;
    font-size: 0;
    /*cursor: pointer;*/
    display: inline-block;
  }
  .resource-selector  .selected-resource-header{
    margin-bottom: 0.5rem;
  }
  .resource-selector  .resource>div{
  }
  .resource-selector  .resource-name{
    position: absolute;
    width: 100%;
    bottom: 0;
    left: 0;
    overflow: hidden;
    word-break: break-all;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    height: 1.6rem;
    color: #fff;
    line-height: 1.6rem;
    text-align: center;
    font-size: 1rem;
    background-color: rgba(0,0,0,0.2);
  }
  .resource-selector  .resource-mask{
    position: absolute;
    width: 100%;
    height: 100%;
    cursor: pointer;
    font-size: 1.4rem;
    padding-right: 0.4rem;
    color: #fff;
    text-align: right;
    top: 0;
    left: 0;
    background-color: rgba(0,0,0,0.1);
  }
  .resource-selector  .resource-mask.active{
    background-color: rgba(0,0,0,0.6);
  }
  .resource-selector  .resource-mask.active .fa{
    color: #00ff04;
  }
  .resource-selector  .resource-index{
    position: absolute;
    margin: auto;
    color: #fff;
    z-index: 1000;
    font-size: 1.25rem;
    top: 0;
    font-weight: 700;
    left: 0.3rem;
  }
  .resource-selector .resource-link{
    height: 100%;
    width: 100%;
  }
  .resource-selector .resource-info{
    font-size: 1.2rem;
    height: 15rem;
    line-height: 15rem;
    font-weight: 700;
    text-align: center;
  }
  .resource-selector .file-lists{
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .resource-selector .file-li{
    position: relative;
    margin-bottom: 0.5rem;
    word-break: break-all;
    min-height: 4rem;
    color: #fff;
    border-radius: 3px;
    background-color: #575757;
  }
  .resource-selector .file-li.active{
    background-color: #47c449;
  }
  .resource-selector .file-name{
    display: -webkit-box;
    -webkit-line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
    padding-top: 0.6rem;
  }
  .resource-selector .file-size{
    font-size: 1rem;
  }
  .resource-selector .file-btn{
    height: 4rem;
    top: 0;
    right: 0;
    vertical-align: top;
    font-size: 1rem;
    width: 7rem;
    line-height: 4rem;
    text-align: center;
    position: absolute;
  }
  .resource-selector .file-info{
    overflow: hidden;
    margin-right: 7rem;
    padding-left: 1rem;
  }
  .resource-selector .file-hidden{
    /*width: 10000px;*/
  }
  .resource-selector .file-btn>.fa{
    cursor: pointer;
    width: 2.5rem;
    height: 2.5rem;
    border: 2px solid #777;
    color: #eee;
    border-radius: 50%;
    text-align: center;
    line-height: 2.4rem;
    margin-right: 0.5rem;
  }
  .resource-selector .file-btn .fa.fa-remove:hover{
    border-color: #aaa;
  }
  .resource-selector .file-btn .fa.fa-arrow-up:hover{
    border-color: #aaa;
  }
  .resource-selector .file-btn .fa.upload-progress{
    border:none;
    width: 6.5rem;
  }
  .resource-selector .file-progress{
    position: absolute;
    height: 3px;
    width: 0;
    transition: width 200ms;
    bottom: 0;
    background-color: #57cd59;
    border-radius: 2px;
  }
  .resource-selector .upload-success{
    border-color: #e6e6e6!important;
  }
  .resource-selector .file-error {
    color: #ff6c6a;
    margin-left: 1rem;
    font-size: 1rem;
  }
  .resource-selector  .resource-options{
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  .resource-selector  .resource-options .fa{
    color: #fff;
    cursor: pointer;
    font-size: 1.4rem;
    position: absolute;
    top: 5px;
    right: 5px;
  }
  .resource-selector  .resource-options .fa.fa-edit{
    right: 24px;
  }
  .resource-selector .edit-picture-body{
    margin: 1rem;
  }
  .resource-selector  .resource-options .fa.active{
    color: #00ff04;
  }
  .resource-selector  .paste-content{
    display: inline-block;
    width: 20rem;
    height: 2.5rem;
    line-height: 2.3rem;
    margin-left: 1rem;
    text-align: center;
    border: 2px dotted #9baec8;
    background-color: #d9e1e8;
    vertical-align: top;
    font-size: 1rem;
    cursor: pointer;
    margin-bottom: 0.2rem;
  }

  .resource-selector .resource-in-process{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    height: 2rem;
    width: 100%;
    color: #777;
    text-align: center;
    font-size: 1.1rem;
  }

  .resource-selector .resource-in-process-bg{
    background-color: #dfdfdf;
  }

  .resource-picture.media-picture {
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center center;
    background-color: black;
  }

  .size-limit{
    margin-left: 0.5rem;
    font-size: 1rem;
  }
  .size-limit .fa{
    color: #555;
  }

</style>

<script>
  import 'cropperjs/dist/cropper.css';
  import Cropper from 'cropperjs';
  import {DraggableElement} from "../js/draggable";
  import {getFileMD5, blobToFile} from "../js/file";
  import {getSize, timeFormat, getUrl} from "../js/tools";
  import {debounce} from '../js/execution';
  import {visitUrl} from "../js/pageSwitch";
  import {nkcAPI, nkcUploadFile} from "../js/netAPI";
  import {getState} from '../js/state';
  import {screenTopWarning} from '../js/topAlert';
  const {isApp} = getState();
  import {
    RNTakePictureAndUpload,
    RNTakeAudioAndUpload,
    RNTakeVideoAndUpload
  } from '../js/reactNative';

  export default {
    data: () => ({
      isApp,
      uid: "",
      user: "",
      pageType: "list", // list: 资源列表, uploader: 上传
      category: "all", // all: 全部，unused: 未使用, used: 已使用, upload: 正在上传的文件
      resourceType: "", // all, picture, video, audio, attachment
      quota: 16,
      paging: {},
      pageNumber: "",
      resources: [],
      allowedExt: [],
      countLimit: 10,
      selectedResources: [],
      loading: true,
      fastSelect: false,
      pictureExt: ['swf', 'jpg', 'jpeg', 'gif', 'png', 'svg', 'bmp'],
      files: [],
      croppingPicture: false,
      isTouchEmit: false,
      sizeLimit: null,
      callback: null,

      cropper: null,

      draggableElement: null,
      socketEventListener: null,
      imgInfo:{},
      reduction:[0,180,-180],
      minContainerHeight:500
    }),
    mounted() {
      this.initDraggableElement();
      this.initSocketEvent();
      this.initDragUploadEvent();
    },
    destroyed() {
      this.removeSocketEvent();
      this.destroyCropper();
      this.destroyDraggable();
      this.disableDragUploadEvent();
    },
    computed: {
      fileSizeLimit: function() {
        var sizeLimit = this.sizeLimit;
        if(!sizeLimit) return '';
        var arr = [];
        arr = arr.concat(sizeLimit.others);
        arr.push({
          ext: '其他',
          size: sizeLimit.default
        });
        var str = '文件大小限制\n', sweetStr = '';
        for(var i = 0; i < arr.length; i++) {
          var a = arr[i];
          if(i > 0) str += '\n';
          str += a.ext.toUpperCase() + '：' + getSize(a.size * 1024, 1);
        }
        return str;
      },
      show: function() {
        var obj = {};
        var allowedExt = this.allowedExt;
        if(allowedExt.indexOf("audio") !== -1) {
          obj.audio = true;
        }
        if(allowedExt.indexOf("video") !== -1) {
          obj.video = true;
        }
        if(allowedExt.indexOf("picture") !== -1) {
          obj.picture = true;
        }
        if(allowedExt.indexOf("attachment") !== -1) {
          obj.attachment = true;
        }
        if(
          allowedExt.indexOf("all") !== -1 ||
          (obj.audio && obj.video && obj.picture && obj.attachment)
        ) {
          obj.all = true;
        }
        return obj
      },
      windowWidth: function() {
        return $(window).width();
      },
      windowHeight: function() {
        return $(window).height();
      },
      screenType: function() {
        return this.windowWidth < 700? "sm": "md";
      },
      selectedResourcesId: function() {
        var arr = [];
        var selectedResources = this.selectedResources;
        for(var i = 0; i < selectedResources.length; i++) {
          var r = selectedResources[i];
          if(arr.indexOf(r.rid) === -1) {
            arr.push(r.rid);
          }
        }
        return arr;
      }
    },
    methods: {
      timeFormat: timeFormat,
      getUrl: getUrl,
      initCropper() {
        if(this.cropper) return;
        this.cropper = new Cropper(this.$refs.imageElement, {
          viewMode: 0,
          aspectRatio: 1,
          minContainerHeight:this.minContainerHeight,
          crop:(e)=>{
          if(this.$refs.imageElement.height > this.$refs.imageElement.width){
            this.imgInfo.radio = this.$refs.imageElement.width / this.$refs.imageElement.height
            this.imgInfo.max = 'height'
            this.imgInfo.value = this.$refs.imageElement.height
          }else{
            this.imgInfo.radio = this.$refs.imageElement.width / this.$refs.imageElement.height
            this.imgInfo.max = 'width'
            this.imgInfo.value = this.$refs.imageElement.width
          }
          this.rotateValue = e.detail.rotate
        }
        });
      },
      destroyCropper() {
        if(!this.cropper || !this.cropper.destroy) return;
        this.cropper.destroy();
        this.cropper = null;
      },
      destroyDraggable() {
        this.draggableElement.destroy();
      },
      showErrorInfo(r) {
        sweetInfo(r.errorInfo);
      },
      initDraggableElement() {
        this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
        this.draggableElement.setPositionCenter();

      },
      // 注册事件，当上传的文件处理成功后更新列表
      initSocketEvent() {
        const self = this;
        this.socketEventListener = function(data) {
          if(data.state === "fileProcessFailed") {
            sweetError(`文件处理失败\n${data.err}`);
          }
          self.getResources(0);
        }
        window.socket.on("fileTransformProcess", this.socketEventListener);
      },
      // 销毁注册的 socket 事件
      removeSocketEvent() {
        if(!this.socketEventListener) return;
        // 销毁事件
        window.socket.off('fileTransformProcess', this.socketEventListener);
      },
      //创建拖拽和粘贴上传事件
      initDragUploadEvent() {
        const $dragDom = $(this.$refs.pasteContent);
        let originText = "";
        const self = this;
        $dragDom.on({
          dragenter: function(e) {
            e.stopPropagation();
            e.preventDefault();
            originText = $dragDom.text();
            $dragDom.text("松开鼠标上传文件")
          },
          dragleave: function(e) {
            e.stopPropagation();
            e.preventDefault();
            $dragDom.text(originText);
          },
          dragover: function(e) {
            e.stopPropagation();
            e.preventDefault();
          },
          drop: function(e) {
            e.preventDefault();
            e.stopPropagation();
            $dragDom.text(originText);
            var files = [].slice.call(e.originalEvent.dataTransfer.files);
            if(!files.length) return;
            self.uploadSelectFile(files);
          }
        });
      },
      disableDragUploadEvent() {
        $(this.$refs.pasteContent).draggable('disable');
      },
      checkFileSize: function(filename, size) {
        var sizeLimit = this.sizeLimit;
        if(!sizeLimit) return;
        var ext = filename.split('.');
        ext = ext.pop().toLowerCase();
        var limit;
        for(var i = 0; i < sizeLimit.others.length; i++) {
          var s = sizeLimit.others[i];
          if(s.ext.toLowerCase() === ext) {
            limit = s;
            break;
          }
        }
        if(!limit) limit = {
          ext: ext,
          size: sizeLimit.default
        };
        var _limitSize = limit.size * 1024;
        if(size > _limitSize) throw ext.toUpperCase() + '文件大小不能超过' + getSize(_limitSize, 1);
      },
      showFileSizeLimit: function() {
        asyncSweetCustom(this.fileSizeLimit.replace(/\n/ig, '<br>'));
      },
      cancelCropPicture: function() {
        this.destroyCropper();
        this.changePageType("list");
      },
      rotateZoom(originValue, nextValue){
        if(this.reduction.includes(this.rotateValue)){
          this.cropper.scale(1);
        }else{
          const scaleRadio = originValue / nextValue;
          this.cropper.scale(scaleRadio);
        }
      },
      rotate: function(type) {
        const self = this;
        if(type === "left") {
          self.cropper.rotate(-90);
        } else {
          self.cropper.rotate(90);
        }
      // crop执行> 再执行的下面的代
        const contaiorWidth = parseInt(document.querySelector('.cropper-container').style.width);
        const imgWidthInCanvas = self.minContainerHeight * self.imgInfo.radio;
        if(self.imgInfo.value > 500 && self.imgInfo.max === 'width'){
          // 宽占满两边
          if(contaiorWidth <= imgWidthInCanvas){
            const nextImgWidthInCanvas = (self.minContainerHeight / contaiorWidth) * (contaiorWidth / self.imgInfo.radio)
            if(nextImgWidthInCanvas > contaiorWidth){
              this.rotateZoom(contaiorWidth, self.minContainerHeight)
            }else{
              this.rotateZoom(self.minContainerHeight, contaiorWidth)
            }
          }else{
            const nextImgWidthInCanvas = (imgWidthInCanvas / self.minContainerHeight) * self.minContainerHeight
            if(nextImgWidthInCanvas > contaiorWidth){
              this.rotateZoom(imgWidthInCanvas, self.minContainerHeight)
            }else{
              this.rotateZoom(self.minContainerHeight, imgWidthInCanvas)
            }
          }
        }else if(self.imgInfo.max === 'height'){
        // 宽占满
          if(contaiorWidth <= imgWidthInCanvas){
            this.rotateZoom(self.minContainerHeight, contaiorWidth)
          // 高占满
          }else{
            const nextImgHeightInCanvas = (contaiorWidth / self.minContainerHeight) * (imgWidthInCanvas)
            if(nextImgHeightInCanvas > self.minContainerHeight){
              this.rotateZoom(self.minContainerHeight, imgWidthInCanvas)
            }else{
              this.rotateZoom(contaiorWidth, self.minContainerHeight)
            }
          }
      }
    },
      editImage: function(r) {
        const self = this;
        this.croppingPicture = false;
        this.changePageType("editPicture");
        setTimeout(() => {
          self.initCropper();
          let src = '';
          if(r.originId) {
            src = getUrl('resourceOrigin', r.originId);
          } else {
            src = getUrl('resource', r.rid);
          }
          self.cropper.replace(src);
        });
      },
      cropPicture: function() {
        const self = this;
        self.croppingPicture = true;
        setTimeout(function() {
          try{
            self.cropper.getCroppedCanvas().toBlob(function(blob) {
              var file = blobToFile(blob, Date.now() + ".png");
              self.uploadSelectFile(file);
              self.changePageType("list");
              self.destroyCropper();
            }, "image/jpeg");
          } catch(err) {
            console.log(err);
            self.croppingPicture = false;
            sweetError(err);
          }
        }, 10);
      },
      readyPaste: function() {
        var self = this;
        var dom = $(this.$refs.pasteContent);
        dom.off("paste");
        dom.one("paste", function(e) {
          var clipboardData = e.clipboardData || e.originalEvent && e.originalEvent.clipboardData || {};
          var files = clipboardData.items || [];
          var _files = [];
          for(var i = 0; i < files.length; i ++) {
            var file = files[i].getAsFile();
            if(!file) continue;
            _files.push(file);
          }
          if(!_files.length) return;
          self.uploadSelectFile(_files);
        });
      },
      close: function() {
        this.hideDom();
        this.destroyCropper();
        const self = this;
        setTimeout(function() {
          self.selectedResources = [];
          self.resourceType = "all";
          self.category = "all";
        }, 500);
      },
      showDom() {
        this.draggableElement.show();
      },
      hideDom() {
        this.draggableElement.hide();
      },
      open: function(callback, options = {}) {
        this.destroyCropper();
        const {
          countLimit = 50,
          allowedExt = ['all', 'audio', 'video', 'attachment', 'picture'],
          pageType = 'list',
          fastSelect = false
        } = options;
        const resourceType = options.resourceType || allowedExt[0];

        this.callback = callback;
        this.countLimit = countLimit;
        this.allowedExt = allowedExt;
        this.resourceType = resourceType;
        this.pageType = pageType;
        this.fastSelect = fastSelect;
        this.showDom();
        this.getResources(0);
      },
      selectCategory: function(c) {
        this.category = c;
        this.getResources(0);
      },
      getResources: debounce(function(skip = 0) {
        const {
          quota,
          resourceType,
          category,
        } = this;
        const url = `/me/media?quota=${quota}&skip=${skip}&type=${resourceType}&c=${category}&t=${Date.now()}`;
        const self = this;
        nkcAPI(url, "GET")
          .then(function(data) {
            self.sizeLimit = data.sizeLimit;
            self.paging = data.paging;
            self.pageNumber = self.paging.page + 1;
            self.resources = data.resources;
            self.loading = false;
          })
          .catch(function(data) {
            sweetError(data);
          });
      }, 300),
      changePage: function(type) {
        var paging = this.paging;
        if(paging.buttonValue.length <= 1) return;
        if(type === "last" && paging.page === 0) return;
        if(type === "next" && paging.page + 1 === paging.pageCount) return;
        var count = type === "last"? -1: 1;
        this.getResources(paging.page + count);
      },
      clickInput: function() {
        if(this.files.length >= 20) sweetInfo("最多仅允许20个文件同时上传，请稍后再试。");
        var input = this.$refs.inputElement;
        if(input) input.click();
      },
      removeFile: function(index) {
        this.files.splice(index, 1);
      },
      startUpload: function(f) {
        f.error = "";
        this.selectCategory("upload");
        const self = this;
        return Promise.resolve()
          .then(function() {
            self.checkFileSize(f.data.name, f.data.size);
            if(f.status === "uploading") throw "文件正在上传...";
            if(f.status === "uploaded") throw "文件已上传成功！";
            f.status = "uploading";
            // 获取文件md5
            return getFileMD5(f.data)
          })
          .then(function(md5) {
            // 将md5发送到后端检测文件是否已上传
            return nkcAPI('/rs/md5', 'POST', {
              md5,
              filename: f.name
            });
          })
          .then(function(data) {
            if(!data.uploaded) {
              // 后端找不到相同md5的文件（仅针对附件），则将本地文件上传
              var formData = new FormData();
              formData.append("file", f.data, f.data.name || (Date.now() + '.png'));
              return nkcUploadFile("/r", "POST", formData, function(e, progress) {
                f.progress = progress;
              }, 60 * 60 * 1000);
            }
          })
          .then(function() {
            f.status = "uploaded";
            var index = self.files.indexOf(f);
            self.files.splice(index, 1);
          })
          .catch(function(data) {
            f.status = "unUpload";
            f.progress = 0;
            f.error = data.error || data;
            screenTopWarning(data.error || data);
          })
      },
      newFile: function(file) {
        return {
          name: file.name,
          ext: file.type.slice(0, 5) === "image"?"picture": "file",
          size: getSize(file.size, 1),
          data: file,
          error: /*file.size >  200*1024*1024?"文件大小不能超过200MB":*/ "",
          progress: 0,
          status: "unUpload"
        }
      },
      uploadSelectFile: function(f) {
        var self = this;
        if(f.constructor === Array) {
          // 这个数组中文件的顺序和用户选择的顺序相反，即先选的靠后，后选的靠前
          f.forEach(function(file) {
            if(!file.name && file.type.indexOf('image') !== -1) {
              file.name = Date.now() + Math.round(Math.random()*1000) + '.png';
            }
            self.files.push(self.newFile(file));
          });
        } else {
          f = this.newFile(f);
          this.files.unshift(f);
        }
        // return console.log(self.files);
        function uploadFileSeries() {
          var file;
          for(var i = 0; i < self.files.length; i++) {
            var f = self.files[i];
            if(f.status !== 'unUpload' || f.error) continue;
            file = f;
            break;
          }
          // var file = self.files[0];
          if(!file) return Promise.resolve();
          return self.startUpload(file)
            .then(new Promise(function(resolve, _) {
              console.log("【上传成功】", file.name);
              setTimeout(resolve, 1000);
            }))
            .then(function() {
              return uploadFileSeries();
            })
        }
        // var promise = this.startUpload(f);
        return uploadFileSeries()
          .then(function() {
            console.log("【全部上传完成】");
            if(self.category === "upload" && !self.files.length) {
              setTimeout(function() {
                self.category = "all";
                self.getResources(0);
              }, 500)
            }
          })
      },
      // 用户已选择待上传的文件
      selectedFiles: function() {
        var self = this;
        var input = this.$refs.inputElement;
        // 这个数组中文件的顺序和用户选择的顺序相反，即先选的靠后，后选的靠前
        var files = [].slice.call(input.files);
        input.value = "";
        if(files.length <= 0) return;
        self.uploadSelectFile(files);
      },
      changePageType: function(pageType) {
        var self = this;
        this.pageType = pageType;
        if(pageType === "list") {
          this.crash();
        }
      },
      crash: function() {
        var paging = this.paging;
        this.getResources(paging.page);
      },
      done: function() {
        if(!this.callback) return;
        var selectedResources = this.selectedResources;
        var selectedResourcesId = this.selectedResourcesId;
        this.callback({
          resources: selectedResources,
          resourcesId: selectedResourcesId
        });
        this.close();
      },
      fastSelectPage: function() {
        var pageNumber = this.pageNumber - 1;
        var paging = this.paging;
        if(!paging || !paging.buttonValue.length) return;
        var lastNumber = paging.buttonValue[paging.buttonValue.length - 1].num;
        if(pageNumber < 0 || lastNumber < pageNumber) return sweetInfo("输入的页数超出范围");
        this.getResources(pageNumber);
      },
      getIndex: function(arr, r) {
        var index = -1;
        for(var i = 0; i < arr.length; i++) {
          if(arr[i].rid === r.rid) {
            index = i;
            break;
          }
        }
        return index;
      },
      visitUrl: function(url) {
        visitUrl(url, true);
      },
      removeSelectedResource: function(index) {
        this.selectedResources.splice(index, 1);
      },
      fastSelectResource: function(r) {
        if(this.fastSelect) {
          if(this.callback) this.callback(r);
        } else {
          this.selectResource(r);
        }
      },
      selectResource: function(r) {
        var index = this.getIndex(this.selectedResources, r);
        if(index !== -1) {
          this.selectedResources.splice(index, 1);
        } else {
          if(this.selectedResources.length >= this.countLimit) return;
          this.selectedResources.push(r);
        }
      },
      selectResourceType: function(t) {
        this.resourceType = t;
        this.getResources(0);
      },
      takePicture: function() {
        const self = this;
        RNTakePictureAndUpload({}, () => {
          self.crash();
        });
      },
      takeVideo: function() {
        const self = this;
        RNTakeVideoAndUpload({}, () => {
          self.crash();
        });
      },
      recordAudio: function() {
        const self = this;
        RNTakeAudioAndUpload({}, () => {
          self.crash();
        });
      },
    },
  };
</script>
