import React, { useState, useEffect, isValidElement, cloneElement } from 'react'
import { Form, Icon } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import {
  Row,
  Col,
  Button,
  Input,
  Typography,
  message,
  Divider,
  Popover,
  InputNumber,
  Spin,
} from 'antd'
import './style'
import { httpConsole } from 'auto-libs'
import _ from 'lodash'
import { useHistory } from 'react-router-dom'

const loop = data => data

function getUrlMethod(api, defaultMethod) {
  let url = api
  let method = defaultMethod
  if (url.includes(':')) {
    const v = url.split(':')
    url = v[1]
    method = v[0]
  }
  return [url, method]
}

// 处理 null undefined '' 这些不显示的字符
function getDisplayValue(value) {
  if (value === null || value === '' || value === void 0) {
    return '-'
  }
  return value
}

/**
 * @class ATForm
 * 基于 https://ant.design/components/form-cn/ 二次封装
 */
function ATForm({
  /**
   * 是否是单行模式
   * 单行模式下 label 和组件保持在一行，缩小空间，适用于表单项较少的场景
   */
  single = true,
  /**
   * 查看模式还是编辑模式
   * @typedef {'view' | 'edit'}
   */
  mode = 'edit',
  /**
   * 全局分栏
   */
  span = 6,
  /**
   * 数据结构
   * @typedef {column[]}
   * @type {string} @prop {column.title} 标题
   * @type {string} @prop {column.key} 传给后台的 key
   * @typedef {(currentField, fields, form) => React.ReactNode} @prop {column.render} edit 模式下的自定义渲染（默认是 Input）,fields 是当前搜索栏所有的数据集合, form 是当前表单的实例
   * @type {number} @prop {column.span} 分栏，默认是 6，Grid 基于 24 栅格，所以默认是每行 4 个,优先级大于全局的 span
   * @type {string} @prop {column.type} 数据类型 - title 标题 subTitle 子标题
   * @typedef {'view' | 'edit'} @prop {column.mode} 查看模式还是编辑模式, 优先级大于全局的 mode
   * @typedef {React.ReactNode} @prop {column.suffix} 需要显示的后缀, 如果mode 是 edit 模式，需要自行定义组件的宽度
   * @typedef {React.ReactNode} @prop {column.extra} type === 'title' 模式下有效，Title标题 右侧需要显示的后缀
   * @typedef {(fields) => boolean} @prop {column.isHidden} 是否需要隐藏，默认不隐藏，可以根据条件显影表单项
   * @typedef {boolean} @prop {column.required} 是否必填或者必选，优先级大于全局的 required，该参数会帮助建立中文提示信息
   * @type {(currentField, fields, form) => React.ReactNode} @prop {column.renderView} view 模式下自定义渲染（默认是 span）,fields 是当前搜索栏所有的数据集合, form 是当前表单的实例
   * 其余参数见 https://ant.design/components/form-cn/#getFieldDecorator(id,-options)-%E5%8F%82%E6%95%B0
   */
  columns,
  /**
   * @typedef {'edit' | 'add' ｜ React.ReactNode}
   * 显示标题 - edit 编辑 - add 新增 或者自定义
   */
  title,
  form,
  /**
   * 提交文字 为 ReactNode 时替换默认的提交按钮
   * @type {string｜ React.ReactNode}
   */
  okText = '提交',
  /**
   * 取消文字
   * @type {string}
   */
  cancelText,
  /**
   * 自定义页脚
   * @typedef {React.ReactNode}
   */
  footer,
  /**
   * 详情 API，支持直接传入数据，默认 get 方式
   * @typedef {string | data[]}
   */
  infoApi,
  /**
   * 编辑或新增 API，默认 post 方式
   * @type {string | (values) => Promise}
   */
  submitApi,
  /**
   * 提交前处理数据，返回处理后的数据，如果是 false 则不进行下一步
   * 遇到复杂的场景可以return false，自行调用 API 提交表单数据
   */
  beforeSubmit = loop,
  /**
   * 提交数据完成后的回调
   */
  afterSubmit = loop,
  /**
   * infoApi 请求到的数据会经过这，返回处理后的数据
   */
  transformData = loop,
  /**
   * infoApi 接口携带的额外参数
   */
  keywords = {},
  /**
   * 获取 ATForm 的实例
   */
  getInstance = () => void 0,
  /**
   * 是否必填或者必选
   */
  required = false,
  /**
   * 表单任何值改变的时候会触发的回调
   */
  onFieldsChange = (changedValues, allValues) => {},
  /**
   * 表单取消触发时间，默认 goBack
   */
  onCancel,
  /**
   * layout布局
   */
  layout = {
    labelCol: {
      span: 24,
    },
    wrapperCol: {
      span: 12,
    },
  },
}) {
  const [loading, setLoading] = useState(false)
  const [dataSource, setDataSource] = useState(null)
  const history = useHistory()

  const fetchData = async () => {
    try {
      setLoading(true)

      if (!infoApi) return

      let result

      // 支持直接传入数据
      if (_.isObjectLike(infoApi)) {
        result = infoApi
      } else {
        const [url, method] = getUrlMethod(infoApi, 'get')

        // 整合请求参数
        const data = {
          ...keywords,
        }
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
      }

      setDataSource(transformData(result))
    } catch (error) {
      console.error('ATForm(fetchData)-error', error)
      error.msg && message.error(error.msg)
    } finally {
      setLoading(false)
    }
  }

  const transformColumns = () => {
    try {
      if (!columns || !columns.length) {
        return null
      }
      let cols = []

      cols = columns.map((column, index) => {
        const {
          title,
          render,
          renderView,
          key,
          span: columnSpan,
          type,
          mode: columnMode = mode,
          tips,
          suffix,
          extra,
          required: columnRequired = required,
          rules = [],
          isHidden = () => false,
          initialValue: columnInitialValue,
          labelCol,
          wrapperCol,
          ...options
        } = column
        const { getFieldDecorator, getFieldsValue } = form

        const ColSpan = single ? columnSpan || 24 : columnSpan || span
        const initialValue = _.get(dataSource, key, columnInitialValue)

        // 组合下表单和接口的数据
        const data = {
          ...dataSource,
          ...getFieldsValue(),
        }

        if (isHidden(data)) {
          return null
        }

        const tipsComponent = typeof tips === 'function' ? tips(data) : tips

        // Render 默认为输入框
        let EditComponent = render ? render(initialValue, data, form) : <Input />

        // renderView
        const ViewComponent = renderView ? (
          getDisplayValue(renderView(initialValue, data, form))
        ) : (
          <span>{getDisplayValue(initialValue)}</span>
        )

        let isContainInput = false
        let placeholder = `请输入${title}`
        // 组装下 placeholder
        if (isValidElement(EditComponent)) {
          isContainInput =
            isValidElement(EditComponent) && [Input, InputNumber].includes(EditComponent.type)
          placeholder = `请${isContainInput ? '输入' : '选择'}${title}`
          EditComponent = cloneElement(EditComponent, {
            placeholder: EditComponent.props.placeholder || placeholder,
          })
        }

        if (['title', 'subTitle'].includes(type)) {
          return (
            <Col span={24} key={key || index}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                {type === 'title' ? (
                  <Typography.Title level={4}>{title}</Typography.Title>
                ) : (
                  <h6
                    style={{
                      fontSize: 18,
                    }}
                  >
                    {title}
                  </h6>
                )}
                {!!extra && extra}
              </div>
              {extra && title && (
                <Divider
                  dashed
                  style={{
                    margin: '10px 0',
                  }}
                />
              )}
            </Col>
          )
        }

        return (
          <Col
            span={ColSpan}
            key={key || index}
            style={title === '__rowKey__' ? { display: 'none' } : void 0}
          >
            <Form.Item
              colon={!!title}
              labelCol={labelCol || layout.labelCol}
              wrapperCol={wrapperCol || layout.wrapperCol}
              label={
                !!title && (
                  <span>
                    {title}
                    {!!tipsComponent && (
                      <>
                        &nbsp;
                        <Popover content={tipsComponent}>
                          <Icon type="question-circle-o" />
                        </Popover>
                      </>
                    )}
                  </span>
                )
              }
            >
              {columnMode === 'edit' && EditComponent ? (
                <div>
                  {getFieldDecorator(key, {
                    initialValue,
                    rules: [
                      {
                        required: columnRequired,
                        message: placeholder,
                      },
                      ...rules,
                    ],
                    ...options,
                  })(EditComponent)}
                  {suffix}
                </div>
              ) : (
                <div
                  style={
                    ColSpan === 24
                      ? {}
                      : {
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }
                  }
                >
                  {ViewComponent}
                  {suffix}
                </div>
              )}
            </Form.Item>
          </Col>
        )
      })

      return cols
    } catch (error) {
      console.error('ATForm(transformColumns)-error', error)
    }
  }

  const renderTitle = () => {
    // 如果没有 title 就不显示
    if (!title) {
      return null
    }

    let node = title
    const iconProps = {
      style: {
        marginRight: 10,
        fontSize: 36,
      },
    }

    if (title === 'add') {
      node = (
        <>
          <Icon type="file-add" {...iconProps} />
          新增
        </>
      )
    } else if (title === 'edit') {
      node = (
        <>
          <Icon type="edit" {...iconProps} />
          编辑
        </>
      )
    }

    return <Typography.Title level={2}>{node}</Typography.Title>
  }

  const renderFooter = () => {
    if (footer !== void 0) {
      return footer
    }

    return (
      <Row type="flex" gutter={24}>
        <Divider dashed />

        <Col>
          {typeof okText === 'string' ? (
            <Button htmlType="submit" type="primary" loading={loading}>
              {okText}
            </Button>
          ) : (
            okText
          )}
        </Col>
        <Col>
          <Button
            type="danger"
            onClick={() => {
              if (onCancel) {
                return onCancel()
              }
              history.goBack()
            }}
          >
            {cancelText || '取消'}
          </Button>
        </Col>
      </Row>
    )
  }

  const onFormSubmit = async e => {
    try {
      e && e.preventDefault && e.preventDefault()
      setLoading(true)

      let values = await form.validateFieldsAndScroll()

      values = await beforeSubmit(values)

      if (values === false) {
        return
      }

      // 如果 submitApi 没有直接 return 就行
      if (!submitApi || (typeof submitApi !== 'string' && typeof submitApi !== 'function')) {
        return
      }

      let result = null

      if (typeof submitApi === 'string') {
        const [url, method] = getUrlMethod(submitApi, 'post')

        result = await httpConsole.request({
          url,
          method,
          data: values,
        })
      } else {
        result = await submitApi(values)
      }

      await afterSubmit(result)
    } catch (error) {
      console.log('ATForm(onFormSubmit)-error', error)
      error.msg && message.error(error.msg)
      return Promise.reject(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getInstance({
      form,
      // 把 submit 抛出去，方便可以手动触发
      onFormSubmit,
      fetchData,
    })
  }, [getInstance])

  useEffect(() => {
    fetchData()
  }, [infoApi])

  if (!single) {
    layout = {}
  } else if (_.isArray(layout) && layout.length === 2) {
    layout = {
      labelCol: {
        span: layout[0],
      },
      wrapperCol: {
        span: layout[1],
      },
    }
  }

  return (
    <Spin spinning={loading}>
      <Form layout="vertical" {...layout} onSubmit={onFormSubmit}>
        {renderTitle()}
        <Row gutter={16}>{transformColumns()}</Row>
        {renderFooter()}
      </Form>
    </Spin>
  )
}

export default Form.create({
  onFieldsChange(props, changedValues, allValues) {
    const { onFieldsChange } = props

    onFieldsChange && onFieldsChange(changedValues, allValues)
  },
  onValuesChange(props, changedValues, allValues) {
    const { onValuesChange } = props

    onValuesChange && onValuesChange(changedValues, allValues)
  },
})(ATForm)
