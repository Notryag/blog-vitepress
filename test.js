const fs = require('fs');
const path = require('path');



function readDir(dir, level = 1) {
  const files = fs.readdirSync(dir);

  const result = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      // 递归读取子目录

      const subFiles = readDir(filePath, level + 1);
      result.push({
        name: file,
        path: filePath,
        isDirectory: true,
        level,
        parentPath: dir
      }, ...subFiles);
    } else {
      // 存储文件名和路径
      result.push({
        name: file,
        path: filePath,
        level,
        isDirectory: false,
        parentPath: dir
      });
    }
  });

  return result;
}

const files = readDir('./src');
const filesMap = files.map(file => ({[file.name]:file}))
const genNav = () => {
  let nav = []
  const directory = files.filter(file => file.isDirectory && file.level == 1)
  directory.map(dir => {
    dir.items = []
    files.map(file => {
      if(file.parentPath === dir.path) {
        if(file.isDirectory) {
          console.log(findFirstFile(file));
          findFirstFile(file) ? dir.items.push(findFirstFile(file)): null
        } else {
          dir.items.push({
            text: file.name,
            link: file.path
          })
        }
      }
    })
  })
  nav.push(...directory.map(item =>({text: item.name, items: item.items})))
  console.log(JSON.stringify(nav), 'nav')
}

const findFirstFile = (dir) => {
  let res 
  files.map(file => {
    if(file.parentPath === dir.path) {
      if(file.isDirectory) {
        res =  findFirstFile(file)
      } else {
        res =  {
          text: file.name,
          link: file.path
        }
      }
    }
  })
  return res
}
genNav()
