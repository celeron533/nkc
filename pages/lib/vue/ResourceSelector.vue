<template lang="pug">
  .module-dialog-body
    .module-dialog-header
      .module-dialog-title(ref="draggableHandle") 插入资源
      .module-dialog-close(@click="close")
        .fa.fa-remove
    .module-dialog-content
      resource-selector-core(ref="resourceSelectorCore" watch-type="select")
</template>

<style lang="less" scoped>
@import "../../publicModules/base";
.module-dialog-body{
  display: none;
  position: fixed;
  width: 56rem;
  max-width: 100%;
  top: 100px;
  right: 0;
  z-index: 1050;
  background-color: #fff;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  border: 1px solid #ddd;
  margin: 1rem;
  .module-dialog-header{
    height: 3rem;
    line-height: 3rem;
    background-color: #f6f6f6;
    padding-right: 3rem;
    .module-dialog-close{
      cursor: pointer;
      color: #aaa;
      width: 3rem;
      position: absolute;
      top: 0;
      right: 0;
      height: 3rem;
      line-height: 3rem;
      text-align: center;
      &:hover{
        background-color: rgba(0,0,0,0.08);
        color: #777;
      }
    }
    .module-dialog-title{
      cursor: move;
      font-weight: 700;
      margin-left: 1rem;
    }
  }
  .module-dialog-content{
    padding: 0 1rem;
  }
}
</style>

<script>
import {DraggableElement} from "../js/draggable";
import ResourceSelectorCore from "./ResourceSelectorCore";

export default {
  data: () => ({
    show: false,
  }),
  components: {
    'resource-selector-core': ResourceSelectorCore,
  },
  mounted() {
    this.initDraggableElement();
  },
  destroyed(){
    this.draggableElement && this.draggableElement.destroy();
  },
  methods: {
    initDraggableElement() {
      this.draggableElement = new DraggableElement(this.$el, this.$refs.draggableHandle);
      this.draggableElement.setPositionCenter();
    },
    open(callback, options) {
      const self = this;
      self.draggableElement.show();
      self.show = true;
      return self.$refs.resourceSelectorCore.open(function (res){
        if(res) {
          callback(res);
        }
      }, options);
    },
    close() {
      this.draggableElement.hide();
      this.show = false;
      this.$refs.resourceSelectorCore.close();
    },
  }
}
</script>
