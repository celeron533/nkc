class ComplaintSelector extends NKC.modules.DraggablePanel {
  constructor() {
    const domId = `#moduleComplaintSelector`;
    super(domId);
    const self = this;
    self.dom = $(domId);
    self.app = new Vue({
      el: domId + 'App',
      data: {
        loading: true,
        reasonTypeId: "",
        reasonDescription: "",
        submitted: false,
        reasonType: "",
        type: "",
        id: "",
        reasons: [],
        tip: ''
      },
      computed: {
      },
      mounted() {
      },
      methods: {
        getUrl: NKC.methods.tools.getUrl,
        open(type, id) {
          this.submitted = false;
          this.reasonTypeId = "";
          this.reasonDescription = "";
          this.type = type;
          this.id = id;
          this.getList();
          self.showPanel();
        },
        close() {
          self.hidePanel();
        },
        getList() {
          var _this=this
          nkcAPI('/complaint/type', 'GET', {})
            .then(function(data) {
              _this.reasons = data.complaintTypes;
              _this.loading = false;
              _this.tip = data.complaintTip;
            })
            .catch(function(data) {
              sweetError(data);
            })
        },
        selectReason(r) {
          this.reasonTypeId = r._id;
          this.reasonType = r.type;
        },
        hide() {
          $("#moduleComplaint").hide();
          stopBodyScroll(false);
        },
        show() {
          closeDrawer();
          $("#moduleComplaint").show();
          this.submitted = false;
          this.reasonDescription = "";
          this.reasonTypeId = "";
          stopBodyScroll(true);
        },
        // open: function(type, id) {
        //   this.type = type;
        //   this.id = id;
        //   this.show();
        //   this.getList();
        // },
        submit() {
          var _this = this;
          nkcAPI("/complaint", "POST", {
            type: _this.type,
            id: _this.id,
            reasonTypeId: _this.reasonTypeId,
            reasonType: _this.reasonType,
            reasonDescription: _this.reasonDescription
          })
            .then(function() {
              _this.submitted = true;
            })
            .catch(function(data) {
              screenTopWarning(data);
            })
        }
      }
    })
  }
  open(type, id) {
    this.app.open(type, id);
  }
}
NKC.modules.ComplaintSelector = ComplaintSelector;
