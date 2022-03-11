export interface ElementPlusResolverOptions {
  /**
   * use commonjs lib & source css or scss for ssr
   */
  ssr?: boolean

  /**
   * auto import for directives
   *
   * @default true
   */
  directives?: boolean

  /**
   * exclude component name, if match do not resolve the name
   */
  exclude?: RegExp
}

type ElementPlusResolverOptionsResolved = Required<
  Omit<ElementPlusResolverOptions, 'exclude'>
> &
  Pick<ElementPlusResolverOptions, 'exclude'>


function getSideEffects(
  dirName: string,
  options: ElementPlusResolverOptionsResolved
): any {
  const { ssr } = options
  const themeFolder = '@element-ultra/theme-chalk'
  const esComponentsFolder = '@element-ultra/components'

  return ssr
    ? `${themeFolder}/src/${dirName}.scss`
    : `${esComponentsFolder}/${dirName}/style/index`
}

function kebabCase(key: string) {
  const result = key.replace(/([A-Z])/g, ' $1').trim()
  return result.split(' ').join('-').toLowerCase()
}

function resolveComponent(
  name: string,
  options: ElementPlusResolverOptionsResolved
): any | undefined {
  if (options.exclude && name.match(options.exclude)) return

  if (!name.match(/^El[A-Z]/)) return

  const partialName = kebabCase(name.slice(2)) // ElTableColumn -> table-column


  // >=1.1.0-beta.1
  return {
    importName: name,
    path: `element-ultra`,
    sideEffects: getSideEffects(partialName, options),
  }
}

function resolveDirective(
  name: string,
  options: ElementPlusResolverOptionsResolved
): any | undefined {
  if (!options.directives) return

  const directives: Record<string, { importName: string; styleName: string }> =
    {
      Loading: { importName: 'ElLoadingDirective', styleName: 'loading' },
      Popover: { importName: 'ElPopoverDirective', styleName: 'popover' },
      InfiniteScroll: {
        importName: 'ElInfiniteScroll',
        styleName: 'infinite-scroll',
      },
    }

  const directive = directives[name]
  if (!directive) return

  return {
    importName: directive.importName,
    path: `element-ultra`,
    sideEffects: getSideEffects(directive.styleName, options),
  }
}

export function ElementPlusResolver(
  options: ElementPlusResolverOptions = {}
): any[] {
  let optionsResolved: ElementPlusResolverOptionsResolved

  async function resolveOptions() {
    if (optionsResolved) return optionsResolved
    optionsResolved = {
      ssr: false,
      directives: true,
      exclude: undefined,
      ...options,
    }
    return optionsResolved
  }

  return [
    {
      type: 'component',
      resolve: async (name: string) => {
        return resolveComponent(name, await resolveOptions())
      },
    },
    {
      type: 'directive',
      resolve: async (name: string) => {
        return resolveDirective(name, await resolveOptions())
      },
    },
  ]
}
