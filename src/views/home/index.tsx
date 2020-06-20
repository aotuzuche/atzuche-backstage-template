import React from 'react'
import { Layout, message } from 'antd'
import { Table, FormItemProps, TableColumnsType, TableData } from 'at-console-components'
import { httpConsole } from 'auto-libs'
import { Store } from 'antd/lib/form/interface'

interface Data {
  name: string
}

export default function Home() {
  const renderTable = () => {
    const searchItems: FormItemProps[] = [
      {
        label: '支付凭证',
        name: 'payOrder',
      },
      {
        label: '合同编号',
        name: 'orderSerialNumber',
      },
      {
        label: '支付状态',
        name: 'paid',
      },
      {
        label: '支付方式',
        name: 'payType',
      },
      {
        label: '抵扣方式',
        name: 'used',
      },
    ]

    const columns: TableColumnsType<Data>[] = [
      {
        title: '唯一标识',
        dataIndex: 'id',
      },
      {
        title: '名称',
        dataIndex: 'name',
      },
      {
        title: '操作',
        render: () => {
          return (
            <div>
              <a>查看</a>
            </div>
          )
        },
      },
    ]

    const onSearch: (params: Store) => TableData<Data> = params =>
      // @ts-ignore
      httpConsole.get('/demo/fetchTableList').catch(err => {
        message.error(err.msg)
      })

    return (
      <Table
        searchProps={{
          items: searchItems,
        }}
        dataName="list"
        rowKey="_id"
        columns={columns}
        showTools
        onSearch={onSearch}
      />
    )
  }

  return <Layout>{renderTable()}</Layout>
}
