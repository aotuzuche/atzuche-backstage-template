import React from 'react'
import { Message, Input, Form, Col, Row, Spin, Button, Icon } from 'antd'
import './style'
import qs from 'qs'
import classnames from 'classnames'
import moment from 'moment'

/**
 * 参数
 * columns 数据骨架Object
 * columns.title 显示的标题
 * columns.key 字段名称
 * columns.initialValue 默认值
 * columns.render 渲染组件，默认为Input组件
 * columns.span 重写分栏的宽度，会覆盖colSpan的值
 * colSpan 分栏，默认为6，即24 / 6 = 4，一行显示4个
 * initialItemCount 默认显示的选项个数（按columns排序），超出部分将隐藏，点击展开按钮时才显示
 * onSearch 表单提交时的方法，需返回一个promise实例，reject传递报错信息文字，无错误时resolve，然后执行相关的操作
 * onReset 表单重置的回调
 */

@Form.create()
class AutoSearchBar extends React.Component {
  constructor(props) {
    super(props)

    const columns = props.columns ? props.columns : []
    const fileds = {}

    columns.forEach(res => {
      fileds[res.key] = {
        value: res.initialValue,
      }
    })

    this.state = {
      down: false,
      loading: false,
      initialItemCount:
        props.initialItemCount && ~~props.initialItemCount === props.initialItemCount
          ? props.initialItemCount
          : 4,
      initialFileds: fileds,
    }
  }

  createItem = ({ title, render, initialValue, key, span }, layout = {}) => {
    const { getFieldDecorator, getFieldsValue } = this.props.form

    // render默认为input输入框
    if (!render) {
      render = () => <Input placeholder={`请输入${title}`} />
    }

    // 初始化值
    let val
    if (typeof initialValue !== 'undefined') {
      val = {
        initialValue,
      }
    }

    // 得到组件，若组件没有会生成不了相应的value，导致一直出不来，所以组件返回null时就渲染一个空div
    const comp = render(getFieldsValue())

    const colSpan =
      span && ~~span === span
        ? span
        : this.props.colSpan && ~~this.props.colSpan === this.props.colSpan
        ? this.props.colSpan
        : 6

    if (!comp) {
      return null
    }

    // to moment
    if (comp.type && comp.type.name === 'PickerWrapper') {
      if (val && val.initialValue && typeof val.initialValue === 'string') {
        val.initialValue = moment(val.initialValue - 0)
      } else if (!val) {
        val = {
          initialValue: '',
        }
      }
    }

    return (
      <Col span={colSpan} key={key}>
        <Form.Item {...layout} label={title} className={`form-item__${key}`}>
          {getFieldDecorator(key, val)(comp)}
        </Form.Item>
      </Col>
    )
  }

  onSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      try {
        this.setState({
          loading: true,
        })

        if (err) {
          throw new Error('系统错误')
        }
        if (this.props.onSearch) {
          await this.props.onSearch(values)
        }
      } catch (e) {
        if (typeof e === 'string') {
          Message.error(e)
        } else {
          Message.error(e.msg || e.message)
        }
      } finally {
        this.setState({
          loading: false,
        })
      }
    })
  }

  onReset = e => {
    this.props.form.setFields(this.state.initialFileds)
    this.props.onReset && this.props.onReset()
  }

  toggleUpDown = e => {
    this.setState({
      down: !this.state.down,
    })
  }

  renderSubmit() {
    return (
      <Row gutter={24} className={'auto-search-bar__submit'}>
        <Col span={24}>
          <Button type="primary" htmlType="submit">
            {!this.state.loading ? <Icon type="search" /> : <Icon type="loading" />}
            搜索
          </Button>
          <Button type="default" onClick={this.onReset} disabled={this.state.loading}>
            重置
          </Button>
          {this.props.addonButton && this.props.addonButton()}
          {this.props.columns.length > this.state.initialItemCount && (
            <a
              href="javascript:;"
              className={'auto-search-bar__up-down'}
              onClick={this.toggleUpDown}
            >
              {this.state.down ? '收起 ' : '展开 '}
              {this.state.down ? (
                <Icon type="up" style={{ fontSize: 12 }} />
              ) : (
                <Icon type="down" style={{ fontSize: 12 }} />
              )}
            </a>
          )}
        </Col>
      </Row>
    )
  }

  get _search() {
    return window.location.search ? qs.parse(window.location.search.replace(/^\?/, '')) : {}
  }

  render() {
    let cols = []

    const s = this._search || {}
    if (this.props.columns && this.props.columns.length) {
      // 把所有组件的从props中整理出来
      const columns = []
      this.props.columns.forEach(res => {
        columns.push({ ...res })
      })

      // 把所有组件的值赋进去，包括search上的值
      // 然后再把值都存到一个对象中，在下面一个循环中需要使用
      const values = {}
      for (let i = 0; i < columns.length; i++) {
        const it = columns[i]
        it.initialValue = s[it.key] ? s[it.key] : it.initialValue
        values[it.key] = it.initialValue
      }

      // 循环所有组件查看其是否有value方法，如果有则调用它
      // 然后创建这些组件
      for (let i = 0; i < columns.length; i++) {
        const it = columns[i]
        if (typeof it.value === 'function') {
          it.initialValue = it.value(it.initialValue, values)
        }
        const item = this.createItem(it)
        if (item) {
          cols.push(item)
        }
      }
    }

    if (!this.state.down) {
      cols = cols.slice(0, this.state.initialItemCount)
    }

    const css = classnames('auto-search-bar', this.props.className)

    return (
      <div className={css}>
        <Spin spinning={this.state.loading === true}>
          <Form onSubmit={this.onSubmit}>
            <Row gutter={24}>{cols}</Row>
            {this.renderSubmit()}
          </Form>
        </Spin>
      </div>
    )
  }
}

export default AutoSearchBar
