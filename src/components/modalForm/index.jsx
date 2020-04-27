import React, { useState } from 'react'
import { Modal } from 'antd'
import ATForm from 'src/components/form'

/**
 * Modal 和 单个 ATForm 的封装
 * 使用便捷的表单，复杂且需要组合显示的可以自行封装
 * 支持所有的 ATForm 属性
 *
 * - 默认 destroyOnClose，防止麻烦自己清理状态
 */
export default function ATModalForm({
  width,
  onOk,
  onCancel,
  visible,
  footer,
  title,
  ...formProps
}) {
  const [loading, setLoading] = useState(false)
  let formInstance = null

  const getFormInstance = intance => {
    formInstance = intance
  }

  const onModalOk = async () => {
    try {
      setLoading(true)
      if (formInstance) {
        const { onFormSubmit } = formInstance
        await onFormSubmit()
      }
      const done = onOk ? await onOk() : true
      done !== false && onCancel() // 如果要让提交后不关闭弹框，async func 使用return false, promise 使用 resolve(false)
    } catch (error) {
      console.error('ATModalForm(onModalOk)-error', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      width={width}
      onOk={onModalOk}
      onCancel={onCancel}
      visible={visible}
      footer={footer}
      title={title}
      okButtonProps={{
        loading,
      }}
      destroyOnClose
    >
      <ATForm footer={null} getInstance={getFormInstance} {...formProps} />
    </Modal>
  )
}
