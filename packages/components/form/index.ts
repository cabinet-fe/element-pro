import { withInstall, withNoopInstall } from '@element-ultra/utils'
import Form from './src/form.vue'
import FormItem from './src/form-item.vue'

export const ElForm = withInstall(Form, {
  FormItem,
})

export default ElForm

export const ElFormItem = withNoopInstall(FormItem)

export * from './src/form'