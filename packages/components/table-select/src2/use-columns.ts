import { ElCheckbox } from '@element-ultra/components/checkbox'
import { ElRadio } from '@element-ultra/components/radio'
import type { TableColumn } from '@element-ultra/components/table'
import { h, ComputedRef, computed, ShallowRef } from 'vue'
import type { TableSelectProps } from './table-select'
interface Options {
  allChecked: ComputedRef<boolean>
  indeterminate: ComputedRef<boolean>
  props: TableSelectProps
  selected: ShallowRef<Record<string, any>>
  checkedData: ShallowRef<Record<string, any>>
  toggleAllChecked: (check: boolean) => void
  handleToggleCheck: (checked: boolean, row: any) => void
  handleSelect: (row: any) => void
}

export default function useColumns(options: Options) {
  const {
    props,
    allChecked,
    indeterminate,
    checkedData,
    selected,
    toggleAllChecked,
    handleToggleCheck,
    handleSelect
  } = options
  // 列
  const columns = computed(() => {
    const { valueKey, multiple } = props

    const extra: TableColumn[] = multiple
      ? [
          {
            name: () => {
              return h(ElCheckbox, {
                modelValue: allChecked.value,
                indeterminate: indeterminate.value,
                'onUpdate:modelValue'(v) {
                  toggleAllChecked(v as boolean)
                }
              })
            },
            align: 'center',
            fixed: 'left',
            width: 60,
            render: ({ row }) =>
              h(ElCheckbox, {
                checked: !!checkedData.value[row[valueKey]],
                onClick: (e: MouseEvent) => {
                  e.stopPropagation()
                },
                onChange: checked => {
                  handleToggleCheck(checked, row)
                }
              }),
            key: '$_check'
          }
        ]
      : [
          {
            name: '单选',
            align: 'center',
            fixed: 'left',
            width: 60,
            render: ({ row }) => {
              const { valueKey } = props
              return h(ElRadio, {
                value: row[valueKey],
                onClick(e: MouseEvent) {
                  e.stopPropagation()
                },
                onChange() {
                  handleSelect(row)
                },
                modelValue: selected.value?.[valueKey]
              })
            },
            key: '$_selection'
          }
        ]

    return [...extra, ...props.columns]
  })

  return columns
}
