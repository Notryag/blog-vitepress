const fs = require('fs');
const path = require('path');

function readDir(src) {
  const stats = fs.statSync(src);

  if (stats.isFile()) {
    return { name: path.basename(src), path: src };
  } else if (stats.isDirectory()) {
    const files = fs.readdirSync(src);
    const result = {};

    for (const file of files) {
      const filePath = path.join(src, file);
      const fileStats = fs.statSync(filePath);

      if (fileStats.isFile()) {
        result[file] = { name: file, path: filePath };
      } else if (fileStats.isDirectory()) {
        const subFiles = fs.readdirSync(filePath);
        const subResult = {};

        for (const subFile of subFiles) {
          const subFilePath = path.join(filePath, subFile);
          const subFileStats = fs.statSync(subFilePath);

          if (subFileStats.isFile()) {
            subResult[subFile] = { name: subFile, path: subFilePath };
            break;
          }
        }

        if (Object.keys(subResult).length > 0) {
          result[file] = subResult;
        }
      }
    }

    return result;
  }
}

const result = readDir('myBolg');
console.log(result);
