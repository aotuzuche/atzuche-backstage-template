const fs = require('fs-extra')
const path = require('path')
const argv = require('minimist')(process.argv.slice(2))
const yaml = require('yamljs')
const nameReg = /@name [^\n]*/
const methodReg = /@method [^\n]*/
const linkReg = /@link [^\n]*/
const funcReg = /@function [^\n]*/
const chunkReg = /\/\*[\s\S]*?\*\//g

// 需要遍历的目录
const dir = argv.input || path.resolve(process.cwd(), './src')
const appConfig = require(path.resolve(process.cwd(), './appConfig.js'))
// 需要读的文件后缀
const suffix = argv.suffix ? argv.suffix.split(',') : ['js', 'jsx', 'ts', 'tsx']
// 输出文件名
const filename = `${appConfig.syscode}.yml`
// 开始解析资源
task()

async function task() {
  const files = await fileList(path.resolve(dir))
  const queue = []
  files.forEach(v => {
    queue.push(readFile(v))
  })
  const results = await Promise.all(queue)
  const source = [].concat(...results)
  const pathIsExist = await fs.pathExists(filename)
  let ymlJsonData = {}
  if (pathIsExist) {
    ymlJsonData = yaml.load(filename)
  }
  const result = [
    getSystemContent(ymlJsonData.system),
    getMenuContent(ymlJsonData.menu),
    getResourceContent(source),
    getFunctionContent(source, ymlJsonData.function),
  ]
  fs.outputFile(filename, result.join('\n'), function () {})
}

function getSystemContent(system) {
  if (system) return yaml.stringify({ system }, 2, 2)
  return yaml.stringify(
    {
      system: {
        name: appConfig.titleName,
        systemCode: appConfig.syscode,
        url: `/system/${appConfig.prodPath}`,
      },
    },
    2,
    2,
  )
}

function getMenuContent(menu) {
  if (menu) return yaml.stringify({ menu }, 2, 2)
  return yaml.stringify(
    {
      menu: [
        ['菜单名称1', '菜单地址', '菜单icon', null],
        ['菜单名称2', '菜单地址', '菜单icon', '菜单名称1'],
      ],
    },
    2,
    2,
  )
}

function getResourceContent(source = []) {
  if (source.length === 0) {
    return yaml.stringify(
      {
        resource: [['资源名称', '资源地址', '资源调用类型']],
      },
      2,
      2,
    )
  }
  return yaml.stringify({ resource: source.map(item => item.slice(0, 3)) }, 2, 2)
}

function getFunctionContent(source, oldFunction = {}) {
  if (source.length === 0) {
    return yaml.stringify(
      {
        function: {
          功能1: {
            menu: ['菜单名称', '菜单名称'],
            resource: ['资源名称', '资源名称'],
          },
        },
      },
      3,
      2,
    )
  }
  const result = {}
  source.forEach(item => {
    const resourceName = item[0]
    const functionArr = item[3].split(',')
    functionArr.forEach(func => {
      if (result[func]) {
        result[func].resource.push(resourceName)
      } else {
        result[func] = {
          menu: (oldFunction[func] || {}).menu || [],
          resource: [resourceName],
        }
      }
    })
  })
  return yaml.stringify({ function: result }, 3, 2)
}

function readFile(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf-8', (error, data) => {
      if (error) reject(error)
      const results = []
      const mathch = data.match(chunkReg)
      mathch &&
        mathch.forEach(v => {
          const name = v.match(nameReg) && v.match(nameReg)[0].replace(/@name /, '')
          const method =
            v.match(methodReg) &&
            v
              .match(methodReg)[0]
              .replace(/@method /, '')
              .toUpperCase()
          const link = v.match(linkReg) && v.match(linkReg)[0].replace(/@link /, '')
          const func = v.match(funcReg) && v.match(funcReg)[0].replace(/@function /, '')
          if (!name || !method || !link || !func) {
            return
          }
          results.push([name, link, method, func])
        })
      resolve(results)
    })
  })
}

async function fileList(filePath) {
  const results = await readDir(filePath)
  return results
}

function readDir(filePath) {
  return new Promise((resolve, reject) => {
    fs.readdir(filePath, function (err, files) {
      if (err) {
        reject(err)
      } else {
        const results = []
        const queue = []
        // 遍历读取到的文件列表
        files.forEach(function (filename) {
          // 获取当前文件的绝对路径
          const filedir = path.join(filePath, filename)
          // 根据文件路径获取文件信息，返回一个fs.Stats对象
          const stats = fs.statSync(filedir)
          let isFile = stats.isFile()
          let isDir = stats.isDirectory()
          if (isFile) {
            // 只读符合条件的文件
            const reg = new RegExp(`\.(${suffix.join('|')})$`)
            if (reg.test(filedir)) {
              results.push(filedir)
            }
          }
          if (isDir) {
            queue.push(readDir(filedir))
          }
        })
        Promise.all(queue).then(res => {
          resolve(results.concat(...res))
        })
      }
    })
  })
}
