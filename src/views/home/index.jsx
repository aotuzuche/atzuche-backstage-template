import React from 'react'
import './style.scss'
import Event from './event'
import { connect } from 'react-redux'
import ATTable from 'src/components/table'
import moment from 'moment'
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
        data: '签约主体,contractCompany',
      },
      {
        data: '收款编号,receiptNumber',
      },
      {
        data: '车牌号,plateCode',
      },
      {
        data: '租客姓名,tenantName',
      },
      {
        data: '租客手机,tenantMobile',
      },
      {
        data: '金额,earnestAmount',
      },
      {
        data: '实收金额,earnestPaidAmount',
      },
      {
        data: '支付状态,paid',
      },
      {
        data: '支付方式,payType',
      },
      {
        data: '支付凭证,payOrder',
      },
      {
        data: '支付时间,payTime',
        render: e => {
          return e ? moment(e).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
      },
      {
        data: '抵扣状态,used',
      },
      {
        data: '抵扣流水编号,deductionReceiptNumber',
      },
      {
        data: '所属合同水编号,orderSerialNumber',
      },
      {
        data: '抵扣时间,useTime',
        render: e => {
          return e ? moment(e).format('YYYY-MM-DD HH:mm:ss') : '-'
        },
      },
      {
        data: '操作',
        renderConsole: e => {
          return (
            <div>
              <span>434</span>
            </div>
          )
        },
      },
    ]
    return (
      <ATTable
        listName="data"
        pageSizeName="size"
        pageNumName="page"
        rowKey="_id"
        columns={columns}
        api="/apigateway/settlementServer/console/earnests"
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
