const PATH = require('path');
const {
  getFileInfo,
  storeClient,
  deleteFile,
} = require('../../tools');
module.exports = async (props) => {
  const {
    file,
    data,
    storeUrl
  } = props;
  const {mediaPath, timePath, vid, toc, ext, disposition} = data;
  const filePath = file.path;
  const filenamePath = `${vid}.${ext}`;
  const path = PATH.join(mediaPath, timePath, filenamePath);
  const time = (new Date(toc)).getTime();
  await storeClient(storeUrl, {
    filePath: filePath,
    path,
    time
  });
  const {size, hash, height, width} = await getFileInfo(filePath);
  const filesInfo = {
    def: {
      ext,
      size,
      hash,
      height,
      width,
      filename: filenamePath,
      disposition,
    }
  };
  await deleteFile(filePath);
  return filesInfo;
};