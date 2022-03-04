import { withInstallFunction } from '@element-pro/utils'

import Message from './src/message-method'

export const ElMessage = withInstallFunction(Message, '$message')
export default ElMessage

export * from './src/message'
