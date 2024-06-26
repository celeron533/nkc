/*
* @param {File} file 文件对象
* @param {Object} resource 资源对象
* @param {Object} user 用户对象
* */
const imageMagick = require('../../../tools/imageMagick');
const {addImageTextWaterMaskForImage} = require('../../../tools/ffmpeg');
const FILE = require("../../../nkcModules/file");
const PATH = require('path');
const fsPromise = require('fs').promises;
const db = require('../../../dataModels');
module.exports = async (options) => {
  const {file, resource, user, pictureType} = options;
  const {path, size} = file;
  const {rid, toc, ext} = resource;
  // 构建文件目标目录
  const fileFolder = await FILE.getPath('mediaPicture', toc);
  const normalPath = PATH.resolve(fileFolder, `./${rid}.${ext}`);
  let originId;
  let outputPath = path;
  if(pictureType === 'sticker') {
    // 表情上传
    await imageMagick.stickerify(path);
  } else {
    // 普通图片上传

    const thumbnailPath = PATH.resolve(fileFolder, `./${rid}_sm.${ext}`);
    const mediumPath = PATH.resolve(fileFolder, `./${rid}_md.${ext}`);
    originId = await db.SettingModel.operateSystemID('originImg', 1);
    const originFolder = await FILE.getPath('mediaOrigin', toc);
    const originPath = PATH.resolve(originFolder, `./${originId}.${ext}`);

    /*// 保存原图
    if(ext !== 'gif' && (width > 3840 || size > 5242880)) {
      await imageMagick.originify(path, originPath);
    } else {
      await fsPromise.copyFile(path, originPath);
    }*/

    await fsPromise.copyFile(path, originPath);

    const origin = db.OriginImageModel({
      originId,
      ext,
      toc,
      uid: user.uid
    });
    await origin.save();

    // 识别图片方向信息并自动旋转、去掉图片的元信息
    await imageMagick.allInfo(path);

    // 获取图片尺寸
    const {width, height} = await imageMagick.info(path);

    // 保存缩略图
    if((width > 150 || size > 51200) && ext !== 'gif') {
      await imageMagick.thumbnailify(path, thumbnailPath);
    } else {
      await fsPromise.copyFile(path, thumbnailPath);
    }

    // 保存中号图
    if((width > 640 || size > 102400) && ext !== 'gif') {
      await imageMagick.mediumify(path, mediumPath);
    } else {
      await fsPromise.copyFile(path, mediumPath);
    }

    if(ext !== 'gif') {
      // 获取用户水印设置
      const usersGeneral = await db.UsersGeneralModel.findOnly({uid: user.uid});
      const waterSetting = usersGeneral? usersGeneral.waterSetting: {
        waterAdd: true,
        waterStyle: 'siteLogo',
        waterGravity: 'southeast'
      };
      let username = '';
      const {websiteName} = await db.SettingModel.getSettings('server');
      if(waterSetting.waterStyle === 'userLogo') {
        username = user.username || websiteName;
      } else if(waterSetting.waterStyle === 'coluLogo') {
        const column = await db.ColumnModel.findOne({uid: user.uid});
        if(column) {
          username = column.name;
        }
      }

      // 计算名称长度
      const usernameLength = username.replace(/[^\x00-\xff]/g,"01").length;
      let usernameWidth = usernameLength * 12;
      //获取小水印图
      let waterSmallPath = await db.SettingModel.getWatermarkFilePath('small', 'picture');
      //获取大水印图
      let waterBigPath = await db.SettingModel.getWatermarkFilePath('normal', 'picture');
      //获取水印透明度
      const watermarkSettings = await db.SettingModel.getWatermarkSettings('picture');
      //获取图片水印尺寸
      const watermarkPictureInfo = await imageMagick.info(waterSmallPath);
      //水印长度
      const siteLogoWidth = parseInt(watermarkPictureInfo.width);
      //水印高度
      const siteLogoHeight = parseInt(watermarkPictureInfo.height);
      usernameWidth += siteLogoWidth * 0.1; /* logo和文字之间的间隙 */

      // 计算水印位置
      const positions = {
        // 正中心
        center: [`-${parseInt(usernameWidth / 2 + 23)}+0`, `+0+0`],
        //右下
        southeast: [`+${parseInt(usernameWidth + 10)}+10`, `+10+${parseInt((siteLogoHeight - 24) / 2 + 10)}`],
        //右上
        southwest: [`+10+10`, `+${parseInt(siteLogoWidth + 10)}+${parseInt((siteLogoHeight - 24) / 2 + 10)}`],
        //左下
        northeast: [`+${parseInt(usernameWidth+10)}+10`, `+10+${parseInt((siteLogoHeight - 24) / 2 + 10)}`],
        //左上
        northwest: [`+10+10`, `+${parseInt(siteLogoWidth+10)}+${parseInt((siteLogoHeight - 24) / 2 + 10)}`],
      };
      const [logoCoor, userCoor] = positions[waterSetting.waterGravity] || [`+0+0`, `+0+0`];

      // 如果图片宽度或尺寸达到限定值，则将图片压缩至1920
      if(size > 500000 || width > 1920) {
        await imageMagick.imageNarrow(path);
      }
      // 打水印
      if(
        width >= watermarkSettings.minWidth &&
        height >= watermarkSettings.minHeight &&
        watermarkSettings.enabled &&
        waterSetting.waterAdd
      ) {
        if(waterSetting.waterStyle === 'siteLogo') {
          await imageMagick.watermarkify(watermarkSettings.transparency, waterSetting.waterGravity, waterBigPath, path);
        } else {
          // await imageMagick.watermarkifyLogo(watermarkSettings.transparency, logoCoor, waterSetting.waterGravity, waterSmallPath, path);
          // await imageMagick.watermarkifyFont(watermarkSettings.transparency, userCoor, username, waterSetting.waterGravity, path);
          let position;
          // 右下角
          if(waterSetting.waterGravity === "southeast") {
            position = {
              x: "W-w-10",
              y: "H-h-10"
            }
          }
          // 右上角
          if(waterSetting.waterGravity === "northeast") {
            position = {
              x: "W-w-10",
              y: "10"
            }
          }
          // 左上角
          if(waterSetting.waterGravity === "northwest") {
            position = {
              x: "10",
              y: "10"
            }
          }
          // 左下角
          if(waterSetting.waterGravity === "southwest") {
            position = {
              x: "10",
              y: "H-h-10"
            }
          }
          // 正中间
          if(waterSetting.waterGravity === "center") {
            position = {
              x: "(W-w)/2",
              y: "(H-h)/2"
            }
          }

          let ffmpegTransparency = (watermarkSettings.transparency / 100).toFixed(2);
          outputPath = path + `.ffmpeg.${ext}`;
          //调用ffmpge给图片打水印
          await addImageTextWaterMaskForImage({
            input: path,
            output: outputPath,
            image: waterSmallPath,
            text: username,
            transparency: ffmpegTransparency,
            position
          });
        }
      }
    }
  }
  // 移动文件
  await fsPromise.copyFile(outputPath, normalPath);

  // 获取裁剪后图片的宽高
  const pictureInfo = await imageMagick.info(normalPath);
  const newHeight = pictureInfo.height;
  const newWidth = pictureInfo.width;
  await resource.updateOne({
    width: newWidth,
    height: newHeight,
    originId,
    state: 'usable'
  });
};
