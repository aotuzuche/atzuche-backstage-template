import React from 'react'
import { Table, Message, Icon } from 'antd'
import http from 'src/utils/http'
import './style'
import qs from 'qs'
import ignore from 'src/utils/ignoreProps'
import classnames from 'classnames'

/**
 * 参数
 * columns={columns} // 骨架
 *     骨架：
 *     data: '标题,key,宽度,对齐方式'
 *     render: 重写组件，有2个参数，第一个是key对应的值，第二个是全量的该条目数据
 *     fixed: 列是否固定，可选 true(等效于 left) 'left' 'right'
 *     className: 样式名
 *     renderConsole: 操作栏的内容，权重比render高，给的参数为全量的该条目数据，需返回一个数组的组件
 *
 * listName="list" // 接口返回数据中数据所在的字段名，默认list
 * initialPageNum={1} // 默认第几页面
 * pageSize={10} // 页大小，默认10
 * pageSizeName="pageSize" // 分页字段名，默认pageSize
 * pageNumName="pageNum" // 分页字段名，默认pageNum
 * totalName="total" // 接口返回数据中总条数的字段名，默认total
 * afterFetch // 接口请求完成的回调
 * keyword={{}} // 默认搜索参数
 * rowKey="id" // rowKey，默认id
 * api={'NewConsole/console/v50/banner/list'} // api地址，如果需要改变请求方式(默认get请求)的话，参数为 'patch:url' 或'post:url'等
 * ref={e => this.table = e} // 若要用到搜索，需要把组件对象给拿出来，在该对象里可以找到search方法，用它做搜索
 *
 * 方法
 * 搜索
 * search(keyword) // 返回一个Promise, 参数： keyword，对象或空，会加到api地址的参数里，并翻到第一页
 * refresh() // 返回一个Promise 刷新，保留当前面及搜索参数
 * pageTo(num) // 返回一个Promise 翻到指定页面
 *
 * loading() // 显示loading
 * unloading() // 不显示loading
 */
class AutoTable extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      loading: true,
      dataSource: [],
    }

    // 定义翻页参数
    const s = this._search

    this.skip = s._p || props.initialPageNum || 1 // 页
    this.limit = props.pageSize || 10 // 页大小
    this.count = 0 // 数据总数

    // 定义搜索关键字
    const keyword = {
      ...s,
      ...props.keyword,
    }
    delete keyword._p
    this.keyword = keyword

    // 定义参数名称
    this.pageSize = props.pageSizeName || 'pageSize'
    this.pageNum = props.pageNumName || 'pageNo'
    this.list = props.listName || 'list'
    this.total = props.totalName || 'total'
  }

  componentDidMount() {
    this.fetchData()
  }

  // loading
  loading = () => {
    this.setState({
      loading: true,
    })
  }

  // unloading
  unloading = () => {
    this.setState({
      loading: false,
    })
  }

  // 搜索，外部通过ref调用
  search = (keyword = {}) => {
    let kw = {}
    // 做一次过滤
    Object.entries(keyword).forEach(([k, v]) => {
      if (typeof v !== 'undefined' && v !== '') {
        if (v._isAMomentObject) {
          kw[k] = v.valueOf()
        } else {
          kw[k] = v
        }
      }
    })

    return new Promise((resolve, reject) => {
      this.keyword = kw
      this.skip = 1
      this.count = 0
      resolve(this.fetchData())
    })
  }

  // 刷新，外部通过ref调用
  refresh = () => {
    return new Promise((resolve, reject) => {
      resolve(this.fetchData())
    })
  }

  // 翻到指定页面，外部通过ref调用
  pageTo = num => {
    return new Promise((resolve, reject) => {
      this.skip = num
      this.count = 0
      resolve(this.fetchData())
    })
  }

  // 请求数据
  fetchData = async e => {
    try {
      this.setState({
        loading: true,
      })

      // 处理接口与请求方式
      let api = this.props.api
      let method = 'get'
      if (api.indexOf(':') !== -1) {
        const v = api.split(':')
        api = v[1]
        method = v[0]
      }

      // 处理数据
      const data = {
        [this.pageSize]: this.limit,
        [this.pageNum]: this.skip,
        ...this.keyword,
      }

      // 整合请求参数
      const request = {
        method: method,
        url: api,
      }
      if (method.toLowerCase() === 'get') {
        request.params = data
      } else {
        request.data = data
      }

      // 请求数据
      let res = await http.request(request)

      // 如果请求到数据是个妈逼的null，但那帮傻缺又返回接口调用成功时
      if (!res || !res[this.list] || !res[this.list].length) {
        res = {
          [this.pageNum]: this.skip,
          [this.pageSize]: this.limit,
          [this.total]: 0,
          [this.list]: [],
        }
      }

      // 将页信息存入
      this.skip = res[this.pageNum]
      this.limit = res[this.pageSize]
      this.count = res[this.total]

      // 数据存入，重渲
      this.setState({
        dataSource: res[this.list],
      })

      // 更新页面search
      if (window.history && window.history.replaceState) {
        const s = {
          ...this.keyword,
        }
        s._p = this.skip
        const url = window.location.pathname + '?' + qs.stringify(s)
        window.history.replaceState(null, '', url)
      }

      // 如果有回调狗子，执行它
      if (this.props.afterFetch) {
        this.props.afterFetch(res)
      }
    } catch (e) {
      Message.error(e.msg)
    } finally {
      this.setState({
        loading: false,
      })
    }
  }

  // 翻页
  onChange = e => {
    this.limit = e.pageSize
    this.skip = e.current
    this.fetchData()
  }

  get _search() {
    return window.location.search ? qs.parse(window.location.search.replace(/^\?/, '')) : {}
  }

  render() {
    const cols = []

    if (this.props.columns && this.props.columns.length) {
      for (let i = 0; i < this.props.columns.length; i++) {
        const it = this.props.columns[i]
        const data = (it.data || '').split(',').map(res => res.trim())

        const item = {
          title: data[0],
          key: data[1],
          className: it.className || `auto-table-item__${data[1]}`,
          dataIndex: data[1],
        }

        // 这项是数字
        data[2] = data[2] - 0
        if (data[2] === ~~data[2]) {
          item.width = data[2]
        } else if (['left', 'center', 'right'].indexOf(data[2]) !== -1) {
          item.align = data[2]
        }
        if (['left', 'center', 'right'].indexOf(data[3]) !== -1) {
          item.align = data[3]
        }

        if (it.render) {
          item.render = it.render
        } else {
          item.render = e => {
            return typeof e !== 'undefined' && e !== null ? e : '-'
          }
        }

        if (it.renderConsole) {
          item.render = (e, d) => {
            const list = it.renderConsole(d) || null
            return <div className="auto-table__console">{list}</div>
          }
        }

        if (it.fixed) {
          item.fixed = it.fixed
        }

        cols.push(item)
      }
    }

    // 过滤封装组件的props，剩下的给table组件
    const tableProps = ignore(this.props, [
      'columns',
      'listName',
      'initialPageNum',
      'pageSize',
      'pageSizeName',
      'pageNumName',
      'totalName',
      'afterFetch',
      'keyword',
      'rowKey',
      'api',
      'ref',
    ])

    const css = classnames('auto-table', this.props.className)

    return (
      <div className={css}>
        <Table
          {...tableProps}
          dataSource={this.state.dataSource}
          columns={cols}
          onChange={this.onChange}
          rowKey={this.props.rowKey || 'id'}
          loading={this.state.loading}
          pagination={{
            defaultCurrent: 1,
            current: this.skip,
            pageSize: this.limit,
            total: this.count,
          }}
          locale={{
            emptyText: (
              <p className="empty-text">
                <Icon type="frown-o" />
                暂无数据
              </p>
            ),
          }}
        />
      </div>
    )
  }
}

export default AutoTable
