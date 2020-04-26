import React from 'react'
import './style.scss'
import Event from './event'
import { connect } from 'react-redux'
import ATTable from 'src/components/table'
import { Layout } from 'antd'
import ATSearchBar from 'src/components/searchBar'

class HomeView extends Event {
  renderSearchBar = () => {
    const columns = [
      {
        title: '支付凭证',
        key: 'payOrder',
      },
      {
        title: '合同编号',
        key: 'orderSerialNumber',
      },
      {
        title: '支付状态',
        key: 'paid',
      },
      {
        title: '支付方式',
        key: 'payType',
      },
      {
        title: '抵扣方式',
        key: 'used',
      },
    ]

    return (
      <ATSearchBar
        columns={columns}
        onSearch={data => {
          return this.table.search(data)
        }}
        onReset={() => {
          return this.table.search()
        }}
      />
    )
  }

  renderTable = () => {
    const columns = [
      {
        data: '唯一标识,id',
      },
      {
        data: '名称,name',
      },
      {
        data: '操作',
        renderConsole: e => {
          return (
            <div>
              <a>查看</a>
            </div>
          )
        },
      },
    ]
    return (
      <ATTable
        listName="list"
        pageSizeName="pageSize"
        pageNumName="pageNum"
        rowKey="_id"
        columns={columns}
        api="/demo/fetchTableList"
        ref={table => {
          this.table = table
        }}
      />
    )
  }
  render() {
    return (
      <Layout>
        {this.renderSearchBar()}
        {this.renderTable()}
      </Layout>
    )
  }
}

export default connect(({ home }) => ({
  home,
}))(HomeView)
