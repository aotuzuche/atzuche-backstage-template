import React, { useState } from 'react'
import { Button } from 'antd'

export default function ATButton({ children, onClick: atOnClick, ...props }) {
  const [loading, setLoading] = useState(false)
  const onClick = async () => {
    try {
      setLoading(true)
      atOnClick && (await atOnClick())
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }
  return (
    <Button loading={loading} onClick={onClick} {...props}>
      {children}
    </Button>
  )
}
