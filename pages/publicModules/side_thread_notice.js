//编辑文章通告内容
import { sweetConfirm, sweetError, sweetSuccess } from '../lib/js/sweetAlert';
//编辑通告内容
async function editNotice(target, nid) {
  const threadNotice = target.closest('.thread-notice');
  const spanElement = threadNotice.querySelector('.thread-notice-content span');
  const newNoticeContent = await sweetEditNotice(
    '编辑公告',
    nid,
    spanElement.textContent,
  );
  if (newNoticeContent) {
    spanElement.textContent = newNoticeContent;
  }
}
//屏蔽通告内容
async function shieldNotice(target, nid, isShield) {
  let text = isShield ? '确定屏蔽？' : '解除屏蔽？';
  sweetConfirm(text).then(() => {
    nkcAPI('/p/' + nid + '/shieldNotice', 'PUT', { isShield })
      .then(() => {
        sweetSuccess('修改成功');
      })
      .catch((err) => {
        sweetError(err);
      });
  });
}

//为了考虑到文章通告的内容编辑，定制的一个弹窗，不可复用
function sweetEditNotice(title, nid, content = '') {
  return new Promise((resolve) => {
    Swal.fire({
      title,
      input: 'textarea',
      inputAttributes: {
        autocapitalize: 'off',
        maxlength: 200,
      },
      inputValue: content,
      allowOutsideClick: () => !Swal.isLoading(),
      showCancelButton: true,
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      showLoaderOnConfirm: true,
      preConfirm: (text) => {
        return nkcAPI('/p/' + nid + '/editNotice', 'PUT', {
          noticeContent: text,
        })
          .then(() => {
            resolve(text);
          })
          .catch(({ error }) => {
            Swal.showValidationMessage(error);
          });
      },
    }).then((result) => {
      if (result.value) {
        sweetSuccess('提交成功');
      }
    });
  });
}
export { editNotice, shieldNotice };
