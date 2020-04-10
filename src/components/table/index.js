import React, { useState, useEffect, isValidElement, cloneElement } from 'react'
import _ from 'lodash'
import { DownOutlined, FilterOutlined, UpOutlined, SearchOutlined } from '@ant-design/icons'
import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {
  Table,
  message,
  Affix,
  Button,
  Drawer,
  Row,
  Divider,
  Col,
  Typography,
  Input,
  InputNumber,
  Popconfirm,
  DatePicker,
  TimePicker,
} from 'antd'
import './style'
import { httpConsole } from 'auto-libs'
import { useLocation, withRouter } from 'react-router-dom'
import ATModalForm from '../modalForm'
import ATButton from '../button'
import moment from 'moment'
import { useWindowSize } from 'react-use'

/**
 * @class ATTable
 * 基于 https://ant.design/components/table-cn/ 二次封装，支持下面的参数
 *
 */
function ATTable({
  /**
   * 接口完成的回调
   * @type {() => void}
   */
  afterFetch,
  /**
   * api地址，如果需要改变请求方式(默认get请求)的话，参数为 'patch:url' 或'post:url'等
   * 支持直接传入数据
   * @type {string | data[]}
   */
  api,
  /**
   * @type {column[]} columns 数据结构
   * @type {string} column.data  '标题,key'
   * @type {() => React.ReactNode} column.render 自定义渲染
   * @type {() => React.ReactNode} column.renderConsole 自定义渲染（操作栏）
   * 其余参数 https://ant.design/components/table-cn/#Column
   */
  columns = [],
  /**
   * 是否禁用加载后自动请求数据
   * @type {boolean}
   */
  disableAutoFetch = false,
  /**
   * 默认情况下当前 Table 的状态会存储，如果不想可以使用这个参数禁用，比如 Modal 里面有个 Table，会和外面的 Table 冲突
   * @type {boolean}
   */
  disableStoreState,
  /**
   * 是否允许出现搜索栏
   */
  enableSearch,
  /**
   * 搜索栏是否是 drawer 模式，侧边栏弹出模式可以提高 table 的展示空间
   */
  enableSearchFixed,
  /**
   * 获取 table 实例
   */
  getInstance = () => void 0,
  history,
  /**
   * 默认第几页
   */
  initialPageNum = 1,
  /**
   * 默认显示的 search bar 数量
   */
  initialSearchItemCount = 7,
  /**
   * 接口携带的额外参数
   */
  keywords = {},
  /**
   * 接口返回携带数据的 key
   * @type {string}
   */
  listName = 'list',
  /**
   * 监听分页，过滤和排序，如果不是翻页则需要自己控制请求数据
   * @type {(pagination, filters, sorter, extra: { currentDataSource: [] }) => void}
   */
  onChange,
  /**
   * 接口返回当前页的 key
   */
  pageNumName = 'pageNum',
  /**
   * 分页大小
   */
  pageSize = 50,
  /**
   * 接口返回携带分页大小的 key
   */
  pageSizeName = 'pageSize',
  /**
   * 搜索栏数据结构
   * @type {string} column.title 标题
   * @type {column[]} columns 数据结构
   * @type {string} column.key 传给后台的 key，一般对应着搜索参数
   * @type {(fields) => React.ReactNode} column.render 自定义渲染（默认是 Input）,参数是当前搜索栏所有的数据集合
   * @type {number} column.span 分栏，默认是 6，Grid 基于 24 栅格，所以默认是每行 4 个
   * @type {string} column.type 数据类型 - title 小标题
   * 其余参数见 https://ant.design/components/form-cn/#getFieldDecorator(id,-options)-%E5%8F%82%E6%95%B0
   *
   */
  searchColumns,
  /**
   * 点击搜索的过滤函数
   */
  searchFilter = data => data,
  /**
   * 点击搜索的过滤函数
   */
  onSearchReset = _.noop,
  /**
   * 默认全局分栏
   */
  span = 6,
  /**
   * 接口返回总页大小的 key
   */
  totalName = 'total',
  /**
   * 转换请求到的数据
   */
  transformData = data => data,
  /**
   * 新增行的事件
   */
  onAddRow,
  /**
   * 编辑行的事件
   */
  onEditRow,
  /**
   * 删除行的事件
   */
  onDeleteRow,
  /**
   * editForm 的 props
   */
  editFormProps = {},
  rowKey = 'id',
  /**
   * 包装下 Table 的 footer
   */
  footer,
  title,
  /**
   * 是否需要强制更新
   * 可能会存在不同路由但是接口相同的页面，API 不变的情况下数据还是上一个页面的
   */
  isForceFetch,
  /**
   * 排序回调函数
   * @return 排序参数
   */
  onSort = () => {},
  /**
   * 筛选回调函数
   * @return 筛选参数
   */
  onFilter = () => {},
  /**
   * Table 实例，使用 useTable 生成
   */
  table,
  form,
  scroll = {},
  ...otherProps
}) {
  // 如果是 enableSearchFixed 模式分栏 12 更适合
  span = enableSearchFixed && span === 6 ? 12 : span

  // 判断下是否需要 table 滚动，如果 columns 数量不多，没有必要滚动显示
  let isNeedScrollTable = columns.length >= 6

  // 编辑form的句柄
  let editForm = null

  const { validateFields, getFieldDecorator, getFieldsValue, resetFields } = form
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState([])
  const [down, setDown] = useState(false)
  const [filterVisible, setFilterVisible] = useState(false)
  const [skip, setSkip] = useState(initialPageNum)
  const [total, setTotal] = useState(0)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editData, setEditData] = useState(void 0)
  const location = useLocation()
  const { state } = location
  const { height } = useWindowSize()

  const editFormColumns = (columns || [])
    .filter(col => !!col.renderEdit)
    .map(col => {
      const v = (col.data || '').split(',')
      return {
        title: v[0],
        key: v[1],
        required: col.required,
        initialValue: col.initialValue,
        render: col.renderEdit,
      }
    })
  editFormColumns.push({
    title: '__rowKey__',
    required: false,
    key: rowKey,
  })

  // 整合请求参数
  const getFetchParams = async (params, isForce) => {
    const searchData = await getSearchData()

    if (searchData === false) {
      return Promise.reject(new Error('ATTable(fetchData)-error: 参数校验失败'))
    }

    // 处理接口参数
    const data = _.pickBy(
      searchFilter({
        ...(disableStoreState || isForce ? {} : state),
        // 搜索参数
        ...searchData,
        // 额外的参数
        ...keywords,
        // 分页
        [pageSizeName]: pageSize,
        [pageNumName]: skip,
        // 传递进来的参数
        ...params,
      }),
      v => v !== '' && v !== null && v !== void 0,
    )

    return data
  }

  // 刷新
  const refresh = () => {
    return fetchData()
  }

  /**
   * 请求数据
   * 1. 支持 API 和 直接传入数据
   * 2. 请求完成后更新 分页和数据
   * 3. 传入参数可控，不要保存参数到全局，导致参数流转混乱
   */
  const fetchData = async ({ isForce, ...params } = {}) => {
    let result
    try {
      setLoading(true)

      // Dva 或者 Redux 的时候没有清掉上次的数据导致显示旧数据
      if (!api) return

      // 支持直接传入数据
      if (Array.isArray(api)) {
        result = {
          [listName]: [...api],
        }
      } else {
        let url = api
        let method = 'get'
        // 支持 post:api
        if (api.indexOf(':') !== -1) {
          const v = api.split(':')
          url = v[1]
          method = v[0]
        }

        const data = await getFetchParams(params, isForce)

        // 整合请求参数
        const request = {
          method,
          url,
        }
        if (method.toLowerCase() === 'get') {
          request.params = data
        } else {
          request.data = data
        }

        // 请求数据
        result = await httpConsole.request(request)

        // 翻页
        setSkip(data[pageNumName] || 1)

        // 存储状态
        repalceStateWithPageData(data)
      }

      result = transformData(result)

      if (!result || !result[listName] || !result[listName].length) {
        result = {
          ...result,
          [pageNumName]: skip,
          [pageSizeName]: pageSize,
          [totalName]: 0,
          [listName]: [],
        }
      }

      setTotal(result[totalName])

      // 如果有回调钩子，执行它
      if (afterFetch) {
        afterFetch(result)
      }
    } catch (e) {
      console.error('ATTable(fetchData)-error', e)
      e.msg && message.error(e.msg)
    } finally {
      setDataSource(result)
      setLoading(false)
    }
  }

  // 处理 Table 排序、分页、筛选
  // 排序和筛选本质也是传递参数，所以需要单独抽出来
  const onTableChange = (pagination, filters, sorter) => {
    console.log(pagination, filters, sorter)
    return fetchData({
      [pageNumName]: pagination.current,
      // 排序回调
      ...onSort(sorter),
      // 筛选回调用
      ...onFilter(filters),
    })
  }

  // 编辑
  const onEditRowClick = record => {
    setEditData(record)
    setEditModalVisible(true)
  }

  // 关闭编辑框
  const onCloseEditModal = () => {
    setEditModalVisible(false)
  }

  // 编辑框点击确定
  const onEditModalOk = async () => {
    return new Promise(resolve => {
      editForm
        .validateFields()
        .then(() => {
          const values = editForm.getFieldsValue()
          if (editData === void 0) {
            delete values[rowKey]
            resolve(onAddRow(values))
            return
          }
          resolve(onEditRow(values))
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  // 新建
  const onAddRowClick = () => {
    setEditData(void 0)
    setEditModalVisible(true)
  }

  // 重置页面的 location state
  const resetPageState = () => {
    const { pathname, search = '' } = location

    history.replace(pathname + search, {})
  }

  // 当前状态存到 location state 上
  const repalceStateWithPageData = async data => {
    try {
      if (disableStoreState) return

      const searchData = await getSearchData()

      const storeData = {
        ...data,
        ...searchData,
      }

      const { pathname, search = '' } = location

      history.replace(
        pathname + search,
        _.mapValues(storeData, (v, k) => {
          // Picker 或者 RangePicker 过滤下格式，不然报错
          if (v && v._isAMomentObject) {
            return {
              _isAMomentObject: true,
              value: v.format(),
            }
          }
          if (Array.isArray(v) && v.length === 2 && v[0]._isAMomentObject) {
            return [
              {
                _isAMomentObject: true,
                value: v[0].format ? v[0].format() : v[0],
              },
              {
                _isAMomentObject: true,
                value: v[1].format ? v[1].format() : v[1],
              },
            ]
          }
          return v
        }),
      )
    } catch (error) {
      console.error('ATTable(repalceStateWithPageData)-error', error)
    }
  }

  const transformColumns = () => {
    if (!columns || !columns.length) {
      return []
    }

    const newColumns = columns.map(column => {
      // 支持字符串写法
      if (typeof column === 'string') {
        column = { data: column }
      }

      const { data = '', render, renderConsole, ...otherData } = column
      const customData = typeof data === 'string' ? data.split(',').map(res => res.trim()) : []
      const title = customData[0]
      const dataIndex = customData[1]?.split('.')

      // renderConsole 如果有则认为是操作栏，自动加上 `fixed: right` 属性，但是 isNeedScrollTable === false 的时候不需要 fixed
      const consoleDefualt =
        renderConsole && isNeedScrollTable
          ? {
              fixed: 'right',
            }
          : {}

      return {
        ...consoleDefualt,
        title,
        dataIndex,
        align: 'center',
        render: (text, record, index) => {
          // eslint-disable-next-line no-undefined
          text = text === null || text === undefined ? '-' : text
          if (render) return render(text, record, index)
          if (renderConsole) return renderConsole(record, index)
          return text
        },
        ...otherData,
      }
    })

    if (onEditRow || onDeleteRow) {
      newColumns.push({
        title: '',
        width: 160,
        align: 'center',
        render: d => {
          return (
            <>
              {onEditRow && (
                <Button size="small" type="link" onClick={onEditRowClick.bind(null, d)}>
                  编辑
                </Button>
              )}
              {onDeleteRow && (
                <Popconfirm title="确定要删除吗？" onConfirm={onDeleteRow.bind(null, d)}>
                  <Button size="small" type="link">
                    删除
                  </Button>
                </Popconfirm>
              )}
            </>
          )
        },
      })
    }

    return newColumns
  }

  const renderSearchBar = () => {
    if (!enableSearch || !searchColumns || !searchColumns.length) {
      return null
    }

    if (enableSearchFixed) {
      return (
        <>
          <Affix offsetTop={100} style={{ position: 'absolute', top: 100, right: 0, zIndex: 1 }}>
            <FilterOutlined
              onClick={onChangeFilterVisible}
              style={{
                padding: 10,
                opacity: 0.8,
                fontSize: 30,
                color: '#fff',
                backgroundColor: '#1890ff',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            />
          </Affix>
          <Drawer width={600} visible={filterVisible} onClose={onChangeFilterVisible}>
            <Form
              layout="vertical"
              onSubmit={e => {
                onSubmit(e, true)
              }}
            >
              <Row
                gutter={24}
                style={{
                  marginBottom: enableSearchFixed ? 50 : 0,
                }}
              >
                {transformSearchColumns()}
              </Row>
              {renderSubmit()}
            </Form>
          </Drawer>
        </>
      )
    }
    return (
      <>
        <Form
          layout="vertical"
          onSubmit={e => {
            onSubmit(e, true)
          }}
        >
          <Row
            type="flex"
            gutter={24}
            style={{
              marginBottom: enableSearchFixed ? 50 : 0,
            }}
          >
            {transformSearchColumns()}
            {renderSubmit()}
          </Row>
        </Form>
        {!enableSearchFixed && <Divider dashed />}
      </>
    )
  }

  const onChangeFilterVisible = () => {
    setFilterVisible(!filterVisible)
  }

  /**
   * 提交搜索
   * 1. 成功后返回到第一页
   * 2. 成功后数据存到 route state，方便切换后保存状态
   */
  const onSubmit = async (e, isForce) => {
    e && e.preventDefault()
    try {
      await fetchData({
        [pageNumName]: 1,
        isForce,
      })
      onSort({})
      onFilter({})

      onChangeFilterVisible()
    } catch (error) {
      console.error('ATSearchBar(onSubmit)-error', error)
    }
  }

  const onReset = async e => {
    try {
      setLoading(true)
      resetPageState()
      await resetFields()

      onSort({})
      onFilter({})

      await onSearchReset()
      await fetchData({ isForce: true })
      onChangeFilterVisible()
    } catch (error) {
      console.error('ATSearch:onReset-error', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleUpDown = e => {
    setDown(!down)
  }

  const transformSearchColumns = () => {
    let cols = []

    cols = searchColumns.map((column, index) => {
      // eslint-disable-next-line no-unused-vars
      const { title, render, key, span: columnSpan, type, ...options } = column

      const initialValue = _.get(form.getFieldsValue(), key)
      // Render 默认为输入框
      let Component = render ? (
        render(initialValue, getFieldsValue(), form)
      ) : (
        <Input placeholder={`请输入${title}`} />
      )

      let isContainInput = false
      let placeholder = `请输入${title}`
      // 组装下 placeholder
      if (isValidElement(Component)) {
        isContainInput = isValidElement(Component) && [Input, InputNumber].includes(Component.type)
        const isPicker = [DatePicker, DatePicker.RangePicker, TimePicker].includes(Component.type)
        placeholder = `请${isContainInput ? '输入' : '选择'}${title}`
        Component = cloneElement(
          Component,
          isPicker
            ? null
            : {
                placeholder: Component.props.placeholder || placeholder,
              },
        )
      }

      if (type === 'title') {
        return (
          <Col span={24} key={key || index}>
            <Typography.Title level={4}>{title}</Typography.Title>
          </Col>
        )
      }

      // 如果没有 key 则不使用 getFieldDecorator
      return (
        <Col span={columnSpan || span} key={key || index}>
          <Form.Item label={title}>
            {key && Component ? getFieldDecorator(key, options)(Component) : Component}
          </Form.Item>
        </Col>
      )
    })

    // 超出 initialItemCount 数量的隐藏, fixedFooter 下不需要隐藏
    if (!down && !enableSearchFixed) {
      cols = cols.slice(0, initialSearchItemCount)
    }

    return cols
  }

  const getSearchData = async () => {
    try {
      const result = await validateFields()
      return result
    } catch (error) {
      return false
    }
  }

  const renderSubmit = () => {
    const ButtonStyles = enableSearchFixed
      ? {
          position: 'absolute',
          left: 0,
          bottom: 0,
          backgroundColor: '#fff',
          padding: '10px 16px',
          margin: 0,
          width: '100%',
          borderTop: '1px solid #e8e8e8',
        }
      : {
          flex: '1 0 auto',
          paddingRight: 12,
          display: 'flex',
          alignItems: 'center',
        }

    return (
      <Row type="flex" justify="end" gutter={12} style={ButtonStyles}>
        <Col>
          <ATButton type="primary" htmlType="submit">
            <SearchOutlined />
            搜索
          </ATButton>
        </Col>
        <Col>
          <ATButton type="default" onClick={onReset}>
            重置
          </ATButton>
        </Col>
        {searchColumns.length > initialSearchItemCount && !enableSearchFixed && (
          <Col>
            <Button
              onClick={toggleUpDown}
              type="link"
              style={{
                padding: 0,
              }}
            >
              {down ? '收起 ' : '展开 '}
              {down ? (
                <UpOutlined style={{ fontSize: 12 }} />
              ) : (
                <DownOutlined style={{ fontSize: 12 }} />
              )}
            </Button>
          </Col>
        )}
      </Row>
    )
  }

  useEffect(() => {
    // 传出去一些实例方法，使用 withRouter 后 forwardRef 失效
    getInstance({
      form,
      refresh,
      getSearchData,
      getFetchParams,
      search: fetchData,
    })
  }, [getInstance])

  useEffect(() => {
    const { state } = location
    if (disableAutoFetch && (!state || !Object.keys(state).length)) {
      return
    }
    fetchData()
  }, [api, isForceFetch])

  return (
    <>
      {renderSearchBar()}
      <Table
        dataSource={dataSource && dataSource[listName]}
        columns={transformColumns()}
        onChange={onTableChange}
        loading={loading}
        tableLayout="auto"
        scroll={{
          x: isNeedScrollTable ? 'max-content' : false,
          scrollToFirstRowOnChange: true,
          y: height - 376 - ~~scroll.offsetY,
          ...scroll,
        }}
        pagination={{
          defaultCurrent: 1,
          current: skip,
          pageSize,
          total,
          showTotal: total => `共 ${total} 条数据`,
          showQuickJumper: true,
          hideOnSinglePage: true,
        }}
        rowKey={rowKey}
        footer={footer && (() => footer(dataSource))}
        title={title && (pageData => title(dataSource, pageData))}
        {...otherProps}
      />
      {onAddRow && <br />}
      {onAddRow && (
        <Button block type="dashed" onClick={onAddRowClick}>
          新增
        </Button>
      )}
      {(onEditRow || onAddRow) && (
        <ATModalForm
          title={editData === void 0 ? '新增' : '编辑'}
          columns={editFormColumns}
          infoApi={editData || {}}
          visible={editModalVisible}
          getInstance={res => {
            editForm = res.form
          }}
          onCancel={onCloseEditModal}
          onOk={onEditModalOk}
          {...editFormProps}
        />
      )}
    </>
  )
}

export default withRouter(
  Form.create({
    mapPropsToFields(props) {
      const { location } = props
      const state = location.state || {}
      return _.mapValues(state, v => {
        let value = v

        if (v && !v._isAMomentObject && _.isPlainObject(v)) {
          return _.mapValues(v, d => {
            let value = d

            // Picker 或者 RangePicker 反过滤
            if (d && d._isAMomentObject) {
              value = moment(d.value)
            }
            if (Array.isArray(d) && d.length === 2 && d[0]._isAMomentObject) {
              value = [moment(d[0].value), moment(d[1].value)]
            }

            return Form.createFormField({
              value,
            })
          })
        }
        // Picker 或者 RangePicker 反过滤
        if (v && v._isAMomentObject) {
          value = moment(v.value)
        }
        if (Array.isArray(v) && v.length === 2 && v[0]._isAMomentObject) {
          value = [moment(v[0].value), moment(v[1].value)]
        }

        return Form.createFormField({
          value,
        })
      })
    },
  })(ATTable),
)
