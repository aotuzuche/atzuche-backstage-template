// 路由深度查询
const deepFind = (id, arr, key = 'id') => {
  if (!(arr instanceof Array)) {
    return null
  }
  let result = null
  for (let i = 0; i < arr.length; i++) {
    if (arr[i][key] === id) {
      result = arr[i]
      break
    }

    if (arr[i].children instanceof Array) {
      result = deepFind(id, arr[i].children, key)
      if (result) {
        break
      }
      continue
    }
  }
  return result
}

// 获取所有父集节点
const getParents = (e, arr) => {
  const path = e ? e : []

  const pathItem = path.map(item => {
    return deepFind(item, arr)
  })

  return [...pathItem]
}

// 获取所有的路径
const deepFindPath = (path, arr, keyPaths = []) => {
  if (!(arr instanceof Array)) {
    return null
  }

  for (let i = 0; i < arr.length; i++) {
    if (arr[i].url === path) {
      arr[i].pid && keyPaths.push(arr[i].pid)
      keyPaths.push(arr[i].id)
      return keyPaths
    }

    if (arr[i].children instanceof Array) {
      deepFindPath(path, arr[i].children, keyPaths)
    }
  }

  return keyPaths
}

/**
 * Generate a tree structure from flat data.
 *
 * @param {!Object[]} flatData
 * @param {!function=} getKey - Function to get the key from the nodeData
 * @param {!function=} getParentKey - Function to get the parent key from the nodeData
 * @param {string|number=} rootKey - The value returned by `getParentKey` that corresponds to the root node.
 *                                  For example, if your nodes have id 1-99, you might use rootKey = 0
 *
 * @return {Object[]} treeData - The flat data represented as a tree
 */
const getTreeFromFlatData = ({
  flatData,
  getKey = node => node.id,
  getParentKey = node => node.parentId,
  rootKey = '0',
}) => {
  if (!flatData) {
    return []
  }

  const childrenToParents = {}
  flatData.forEach(child => {
    const parentKey = getParentKey(child)

    if (parentKey in childrenToParents) {
      childrenToParents[parentKey].push(child)
    } else {
      childrenToParents[parentKey] = [child]
    }
  })

  if (!(rootKey in childrenToParents)) {
    return []
  }

  const trav = parent => {
    const parentKey = getKey(parent)
    if (parentKey in childrenToParents) {
      return {
        ...parent,
        children: childrenToParents[parentKey].map(child => trav(child)),
      }
    }

    return { ...parent }
  }

  return childrenToParents[rootKey].map(child => trav(child))
}

export { deepFind, getParents, deepFindPath, getTreeFromFlatData }
