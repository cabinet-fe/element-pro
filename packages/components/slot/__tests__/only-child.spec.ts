import { ref, h, nextTick, Comment, Fragment } from 'vue'
import { shallowMount } from '@vue/test-utils'
import { debugWarn } from '@element-ultra/utils'
import { FORWARD_REF_INJECTION_KEY } from '@element-ultra/hooks'
import ElOnlyChild from '../src/only-child'

import type { Slot } from 'vue'

jest.mock('@element-ultra/utils/error', () => ({
  debugWarn: jest.fn(),
}))

const AXIOM = 'rem is the best girl'

describe('<ElOnlyChild />', () => {
  const defaultProvide = {
    [FORWARD_REF_INJECTION_KEY as any]: {
      forwardRef: ref(null),
    },
  }
  const createComponent = (slot: Slot) => {
    return shallowMount(ElOnlyChild, {
      global: {
        provide: defaultProvide,
      },
      // vue test utils adds the entry for us even though default's value is null
      slots: slot
        ? {
            default: slot,
          }
        : null,
    })
  }

  let wrapper: ReturnType<typeof createComponent>

  afterEach(() => {
    ;(debugWarn as jest.MockedFunction<typeof debugWarn>).mockClear()
    wrapper?.unmount()
  })

  it('should be able to render only one child', async () => {
    const kls = 'test_kls'
    wrapper = createComponent(() => [
      h(
        'div',
        {
          class: kls,
        },
        [AXIOM]
      ),
    ])

    await nextTick()

    expect(debugWarn).not.toHaveBeenCalled()
    const renderedChild = wrapper.find(`.${kls}`)
    expect(renderedChild.exists()).toBe(true)
    expect(renderedChild.text()).toBe(AXIOM)
  })

  it('should be able to render string type and wrap it into span', async () => {
    wrapper = createComponent(() => [AXIOM as any])
    await nextTick()

    expect(debugWarn).not.toHaveBeenCalled()
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('should be able to unwrap fragmented children', async () => {
    wrapper = createComponent(() => [h(Fragment, [AXIOM])])
    await nextTick()

    expect(debugWarn).not.toHaveBeenCalled()
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('should skip svg and child type is svg', async () => {
    const wrapper = createComponent(() => [
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          viewBox: '0 0 32 32',
          width: '20',
          height: '20',
        },
        {
          default: () => [
            h('path', {
              d: 'M14.667 14.667v-8h2.667v8h8v2.667h-8v8h-2.667v-8h-8v-2.667z',
            }),
          ],
        }
      ),
    ])
    await nextTick()

    expect(debugWarn).not.toHaveBeenCalled()
    expect(wrapper.find('svg').attributes('viewBox')).toEqual('0 0 32 32')
    expect(wrapper.find('svg').attributes('width')).toEqual('20')
    expect(wrapper.find('svg').attributes('height')).toEqual('20')

    await wrapper.trigger('hover')
    await expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('should skip comment', async () => {
    wrapper = createComponent(() => [
      h(Fragment, [h(Comment, 'some comment'), AXIOM as any]),
    ])
    await nextTick()

    expect(debugWarn).not.toHaveBeenCalled()
    expect(wrapper.find('span').exists()).toBe(true)
  })

  it('should return nothing and warn when no valid children found', async () => {
    wrapper = createComponent(() => [h(Fragment, [])])
    await nextTick()

    expect(debugWarn).toHaveBeenCalled()
  })

  it('should render nothing when invalid node were found', async () => {
    wrapper = createComponent(() => [h(Fragment, null)])
    await nextTick()

    expect(debugWarn).toHaveBeenCalled()
  })

  it('should warns about having multiple children', async () => {
    wrapper = createComponent(() => [AXIOM, AXIOM] as any[])
    await nextTick()

    expect(debugWarn).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toBe('')
  })

  it('should render nothing when no children provided', async () => {
    wrapper = createComponent(null)
    await nextTick()

    expect(debugWarn).not.toHaveBeenCalled()
    expect(wrapper.text()).toBe('')
  })
})
