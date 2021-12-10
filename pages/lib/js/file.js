import SparkMD5 from '../../../public/external_pkgs/spark-md5/spark-md5.min';
export function fileToBase64(file) {
  return new Promise(function(resolve, reject) {
    var reads = new FileReader();
    reads.onerror = reject;
    reads.onload = function (e) {
      resolve(this.result);
    };
    reads.readAsDataURL(file);
  });
}

export function getFileMD5(file) {
  return new Promise(function(resolve, reject) {
    var blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice,
      chunkSize = 2097152,                             // Read in chunks of 2MB
      chunks = Math.ceil(file.size / chunkSize),
      currentChunk = 0,
      spark = new SparkMD5.ArrayBuffer(),
      fileReader = new FileReader();
    fileReader.onload = function (e) {
      console.log('read chunk nr', currentChunk + 1, 'of', chunks);
      spark.append(e.target.result);                   // Append array buffer
      currentChunk++;

      if (currentChunk < chunks) {
        loadNext();
      } else {
        console.log('finished loading');
        //- console.info('computed hash', spark.end());  // Compute hash
        resolve(spark.end());
      }
    };

    fileReader.onerror = function (err) {
      console.log(err);
      reject(err);
    };

    function loadNext() {
      var start = currentChunk * chunkSize,
        end = ((start + chunkSize) >= file.size) ? file.size : start + chunkSize;

      fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
    }
    loadNext();
  });
}