
function loadimages(imglist,cb){
  var loadedImages = 0;
  var pastList = [];
  download(imglist, cb, loadedImages, pastList)
}

function download(imglist, cb, loadedImages, pastList){

  wx.downloadFile({
    url: imglist[loadedImages],
    success: function (res) {
      // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
      if (res.statusCode === 200) {
        pastList.push(res.tempFilePath);
        if (++loadedImages >= imglist.length) {
          cb(pastList);
        }else{
          download(imglist, cb, loadedImages, pastList)
        }
      }
    }
  })

}

module.exports = loadimages;