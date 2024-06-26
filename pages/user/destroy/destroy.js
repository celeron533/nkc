const data = NKC.methods.getDataById("data");
const app = new Vue({
  el: "#app",
  data: {
    verifyEmail: data.verifyEmail,
    verifyMobile: data.verifyMobile,
    verifyPassword: data.verifyPassword,

    mobileCode: "",
    emailCode: "",
    password: "",

    passed: (!data.verifyEmail && !data.verifyMobile && !data.verifyPassword),

    mobileTime: 0,
    emailTime:  0
  },
  computed: {
    disableVerifyButton() {
      const {
        verifyEmail, verifyMobile, verifyPassword,
        mobileCode, emailCode, password
      } = this;
      return (verifyPassword && !password) || (verifyEmail && !emailCode) || (verifyMobile && !mobileCode);
    }
  },
  methods: {
    reduceTime(type) {
      const self = this;
      setTimeout(() => {
        self[type] --;
        if(self[type] > 0) {
          self.reduceTime(type);
        }
      }, 1000)
    },
    sendEmailCode() {
      if(this.emailTime > 0) return;
      const self = this;
      NKC.methods.sendEmailCode("destroy")
        .then(() => {
          sweetSuccess("验证码已发送");
          self.emailTime = 120;
          self.reduceTime("emailTime");
        })
        .catch(sweetError);
    },
    sendMobileCode() {
      if(this.mobileTime > 0) return;
      const self = this;
      NKC.methods.sendMobileCode("destroy")
        .then(() => {
          sweetSuccess("验证码已发送");
          self.mobileTime = 120;
          self.reduceTime("mobileTime");
        })
        .catch(sweetError);
    },
    verify() {
      const self = this;
      const {
        emailCode, mobileCode, password
      } = this;
      nkcAPI(`/u/${NKC.configs.uid}/destroy`, "POST", {
        type: "verify",
        form: {
          emailCode,
          mobileCode,
          password
        }
      })
        .then(() => {
          self.passed = true;
        })
        .catch(sweetError)
    },
    submit() {
      const {emailCode, mobileCode, password} = this;
      sweetQuestion("确定即会注销，注销后短期内不能使用原有用户名重新注册，你将不能再对该账号、积分、发表的内容进行处置，你想好了吗？")
        .then(() => {
          return nkcAPI(`/u/${NKC.configs.uid}/destroy`, "POST", {
            type: "destroy",
            form: {
              emailCode,
              mobileCode,
              password
            }
          });
        })
        .then(() => {
          // 注销完成
          if(NKC.configs.isApp) {
            emitEvent("logout");
          } else {
            window.location.href = "/";
          }
        })
        .catch(sweetError);
    }
  }
});

window.app = app;