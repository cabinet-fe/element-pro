import { shallowRef, watch, nextTick, computed } from 'vue'
import type { ElTree, CheckedInfo, TreeNodeData } from '@element-ultra/components/tree'
import type { TreeSelectProps } from './tree-select'

export default function useTreeSelect(props: TreeSelectProps, emit) {
  /** 树的引用 */
  const treeRef = shallowRef<InstanceType<typeof ElTree>>()
  /** 下拉框显隐 */
  const treeVisible = shallowRef(false)
  /** 是否已渲染 */
  const hasRendered = shallowRef(false)

  /** 是否可清除 */
  const clearable = computed(() => {
    const { modelValue, multiple } = props
    const hasValue = Array.isArray(modelValue)
      ? modelValue.length
      : !!(modelValue || modelValue === 0)

    return hasValue
  })
  const stopWatchVisible = watch(treeVisible, v => {
    if (v) {
      hasRendered.value = true
      stopWatchVisible()
      nextTick(() => {
        setTreeChecked()
      })
    }
  })

  type EmitModelValue = {
    (v: string | number, label: string, model: Record<string, any> | undefined): void
    (v: (string | number)[], label: string[], model: Record<string, any>[]): void
  }

  const emitModelValue: EmitModelValue = (value, label, model) => {
    emit('update:modelValue', value, label, model)
  }

  /** 计算dropdown的位置 */
  const treeSelectRef = shallowRef<HTMLDivElement>()
  const dropdownStyle = shallowRef({
    width: '',
    top: '',
    left: ''
  })
  const calcDropdownStyle = () => {
    const rect = treeSelectRef?.value?.getBoundingClientRect()
    if (rect) {
      dropdownStyle.value = {
        width: rect.width + 'px',
        top: rect.bottom + 16 + 'px',
        left: rect.left + 'px'
      }
    }
  }

  const icon = shallowRef<'down' | 'up' | 'close'>('down')

  const showTree = () => {
    hasRendered.value = true
    treeVisible.value = true
    icon.value = 'up'
    calcDropdownStyle()
  }

  const hideTree = () => {
    treeVisible.value = false
    icon.value = 'down'
  }

  // TODO应该通过类来变换
  const hideCloseIcon = () => {
    treeVisible.value ? (icon.value = 'up') : (icon.value = 'down')
  }
  const showCloseIcon = () => {
    icon.value = 'close'
  }

  // 值相关操作---------------------------------------

  /** 多选值的tag, 如果子节点全部被选中， 那么tag只现实父节点一个 */
  const tagList = shallowRef<Record<string, any>[]>([])

  /** 单选值 */
  const selectedLabel = shallowRef<string | number>('')

  /** 关闭标签 */
  const handleCloseTag = (data: Record<string, any>, i: number) => {
    const tree = treeRef.value
    const { modelValue, labelKey, valueKey } = props
    if (!tree || !Array.isArray(modelValue)) return

    tagList.value.splice(i, 1)
    tree.setChecked(data[valueKey], false)

    const { nodes, keys } = tree.getChecked()
    const labels = nodes.map(node => node[labelKey])
    emitModelValue(keys, labels, nodes)
  }

  /** 设置树的选中状态 */
  const setTreeChecked = () => {
    const tree = treeRef.value
    if (!tree) return

    const { modelValue, multiple, labelKey } = props

    if (Array.isArray(modelValue)) {
      if (!multiple) return
      tree.setCheckedKeys(modelValue)
      tagList.value = tree.getChecked().nodes
    } else {
      if (!modelValue && modelValue !== 0) return
      tree.setCurrentKey(modelValue)
      selectedLabel.value = tree.getCurrentNode()?.[labelKey] ?? ''
    }
  }

  /** 单选 */
  const handleSelectChange = (data: Record<string, any>) => {
    const { labelKey, valueKey, multiple } = props
    if (multiple) return
    const value = data[valueKey]
    const label = data[labelKey]
    selectedLabel.value = label
    emitModelValue(value, label, data)
    hideTree()
  }

  /** 多选 */
  const handleCheck = (_, info: CheckedInfo) => {
    const { checkedKeys, checkedNodes } = info
    const { labelKey } = props
    const checkedLabels = checkedNodes.map(node => node[labelKey])
    emitModelValue(checkedKeys, checkedLabels, checkedNodes)
    nextTick(() => {
      calcDropdownStyle()
    })
  }

  /** 过滤方法 */
  const filterMethod = (query: string, node: TreeNodeData) => {
    const { labelKey } = props
    if (!query) return true
    return node[labelKey].includes(query)
  }

  return {
    treeRef,
    treeSelectRef,
    treeVisible,
    clearable,
    icon,
    hideCloseIcon,
    showCloseIcon,
    hasRendered,
    emitModelValue,
    tagList,
    selectedLabel,
    setTreeChecked,
    handleCheck,
    filterMethod,
    handleSelectChange,
    showTree,
    hideTree,
    dropdownStyle,
    handleCloseTag
  }
}