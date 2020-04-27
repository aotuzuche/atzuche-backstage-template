import React from 'react'
import { Modal } from 'antd'
import ATTable from 'src/components/table'

/**
 * Modal 和 单个 ATTable 的封装
 * 使用便捷的 Table 显示
 * 支持所有的 ATTable 属性
 *
 */
export default function ATModalTable({
  width,
  onOk,
  onCancel,
  visible,
  title,
  tableTitle,
  children,
  // 默认不显示 Modal 的 Footer, 传 true 进来可以显示，用来一些需要确认的操作
  modalFooter = null,
  okButtonProps,
  ...tableProps
}) {
  return (
    <Modal
      width={width || 800}
      onCancel={onCancel}
      visible={visible}
      footer={modalFooter ? void 0 : modalFooter}
      title={title}
      onOk={onOk}
      destroyOnClose
      okButtonProps
    >
      {children}
      <ATTable bordered disableStoreState title={tableTitle} {...tableProps} />
    </Modal>
  )
}
