function getStyle(element) {
  if (!element.style) element.style = {}

  for(let prop in element.computedStyle) {
    const p = element.computedStyle.value
    element.style[prop] = element.computedStyle[prop].value

    if (element.style[prop].toString().match(/px$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }

    if (element.style[prop].toString().match(/^[0-9\.]+$/)) {
      element.style[prop] = parseInt(element.style[prop])
    }
  }
  return element.style
}

function layout(element) {
  if (!element.computedStyle) return false

  const elementStyle = getStyle(element)
  if (elementStyle.display !== 'flex') return

  // 过滤文本节点
  const items = element.children.filter(e => e.type === 'element')
  items.sort(function(a, b) {
    return (a.order || 0) - (b.order || 0)
  })

  const style = elementStyle

  Array.from(['width', 'height']).forEach(size => {
    if (style[size] === 'auto' || style[size] === '') {
      style[size] = null
    }
  })

  // ----------------- 预处理 Start ----------------- //
  if (!style.flexDirection || style.flexDirection === 'auto')
    style.flexDirection = 'row'
  if (!style.alignItems || style.alignItems === 'auto')
    style.alignItems = 'stretch'
  if (!style.justifyContent || style.justifyContent === 'auto')
    style.justifyContent = 'flex-start'
  if (!style.flexWrap || style.flexWrap === 'auto')
    style.flexWrap = 'nowrap'
  if (!style.alignContent || style.alignContent === 'auto')
    style.alignContent = 'stretch'
  
  let mainSize, mainStart, mainEnd, mainSign, mainBase,
  crossSize, crossStart, crossEnd, crossSign, crossBase
  if (style.flexDirection === 'row') {
    mainSize = 'width'
    mainStart = 'left'
    mainEnd = 'right'
    mainSign = +1
    mainBase = 0

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }

  if (style.flexDirection === 'row-reverse') {
    mainSize = 'width'
    mainStart = 'right'
    mainEnd = 'start'
    mainSign = -1
    mainBase = style.width

    crossSize = 'height'
    crossStart = 'top'
    crossEnd = 'bottom'
  }

  if (style.flexDirection === 'column') {
    mainSize = 'height'
    mainStart = 'top'
    mainEnd = 'bottom'
    mainSign = +1
    mainBase = 0

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if (style.flexDirection === 'row-reverse') {
    mainSize = 'height'
    mainStart = 'bottom'
    mainEnd = 'top'
    mainSign = -1
    mainBase = style.height

    crossSize = 'width'
    crossStart = 'left'
    crossEnd = 'right'
  }

  if (style.flexDirection === 'wrap-reverse') {
    const tmp = crossStart
    crossStart = crossEnd
    crossEnd = tmp
    crossSign = -1
  } else {
    crossSign = 1
    crossBase = 0
  }
  // ----------------- 预处理 End ----------------- // 

  let isAutoMainSize = false
  // 特殊情况： 父盒子 主轴未设定比如 height: auto / width: auto
  if (!style[mainSize]) {
    elementStyle[mainSize] = 0
    // items 内容节点
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0))
        elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
    }
    isAutoMainSize = true
  }

  // 将元素收进 行
  const flexLine = []
  const flexLines = [flexLine]

  let mainSpace = elementStyle[mainSize]
  let crossSpace = 0

  for(let i = 0; i < items.length; i++) {
    const item = items[i]
    const itemStyle = getStyle(item)

    if (itemStyle[mainSize] === null) itemStyle[mainSize] = 0

    if (itemStyle.flex) {
      flexLine.push(item)
    } else if (style.flexWrap === 'nowrap' && isAutoMainSize) {
      // 不换行逻辑
      mainSpace -= itemStyle[mainSize]
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
        // 取交叉轴的最大值
        crossSpace = Math.max(crossSpace, itemStyle[crossSize ])
      flexLine.push(item)
    } else {
      // 换行的逻辑
      if (itemStyle[mainSize] > style[mainSize]) {
        itemStyle[mainSize] = style[mainSize]
      }
      if (mainSpace < itemStyle[mainSize]) {
        flexLine.mainSpace = mainSpace
        flexLine.crossSpace = crossSpace
        flexLine = [item]
        flexLines.push(flexLine)
        mainSpace = style[mainSize]
        crossSpace = 0
      } else {
        flexLine.push(item)
      }
      if (itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
        crossSpace = Math.max(crossSpace, itemStyle[crossSize])
      mainSpace -= itemStyle[mainSize]
    }
  }
  flexLine.mainSpace = mainSpace

  // 计算主轴
  if (style.flexWrap === 'nowrap' || isAutoMainSize) {
    flexLine.crossSpace = (style[crossSize] !== undefined) ? style[crossSize] : crossSpace
  } else {
    flexLine.crossSpace = crossSpace
  }

  if (mainSpace < 0) {
    // 这种情况会对所有元素进行等比压缩 （单行）
    const scale = style[mainSize] / style[mainSize] - mainSpace
    const currentMain = mainBase
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemStyle = getStyle(item)
      
      if (itemStyle.flex) {
        itemStyle[mainSize] = 0
      }

      itemStyle[mainSize] = itemStyle[mainSize] * scale

      itemStyle[mainStart] = currentMain
      itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
      currentMain = itemStyle[mainEnd]
    }
  } else {
    // flex-wrap: wrap, 进行多行处理
    flexLines.forEach(function (items) {
      const mainSpace = items.mainSpace
      let flexTotal = 0
      for (i = 0; i < items.length; i++) {
        const item = items[i]
        const itemStyle = getStyle(item)

        if ((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
          flexTotal += itemStyle.flex
          continue
        }

        if (flexTotal > 0) {
          // 将mainSpace 均匀分给每个元素
          const currentMain = mainBase
          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            const itemStyle = getStyle(item)

            if (itemStyle.flex) {
              itemStyle[mainSize] = (mainSpace / flexTotal) * itemStyle.flex
            }
            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            currentMain = itemStyle[mainEnd]
          }
        } else {
          // 没有flex属性 就使用 justify-content属性进行计算
          let currentMain = null
          let step = 0
          if (style.justifyContent === 'flex-start') {
            currentMain = mainBase
            step = 0 // 元素之间的间隔
          }
          if (style.justifyContent === 'flex-end') {
            currentMain = mainSpace * mainSign + mainBase
            step = 0
          }
          if (style.justifyContent === 'center') {
            currentMain = mainSpace / 2 * mainSign + mainBase
            step = 0
          }
          if (style.justifyContent === 'space-between') {
            step = mainSpace / (items.length - 1) * mainSign
            currentMain = mainBase
          }
          if (style.justifyContent === 'space-around') {
            step = mainSpace / items.length * mainSign
            currentMain = step / 2 + mainBase
          }

          for (let i = 0; i < items.length; i++) {
            const item = items[i]
            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            currentMain = itemStyle[mainEnd] + step
          }
        }
      }
    })
  }

  // 计算交叉轴
  // align-items, align-self
  crossSpace

  if (!style[crossSize]) { // auto Sizing
    crossSize = 0
    elementStyle[crossSize] = 0
    for (let i = 0; i < flexLines.length; i++) {
      elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
    }
  } else {
    crossSpace = style[crossSize]
    for(let i = 0; i < flexLines.length; i++) {
      crossSpace -= flexLines[i].crossSpace
    }
  }

  if (style.flexWrap === 'wrap-reverse') {
    crossBase = style[crossSize]
  } else {
    crossBase = 0
  }
  let lineSize = style[crossSize] / flexLines.length

  let step = null
  if (style.alignContent === 'flex-start') {
    crossBase += 0
    step = 0 
  }
  if (style.alignContent === 'flex-end') {
    crossBase += crossSign * crossSpace
    step = 0 
  }
  if (style.alignContent === 'center') {
    crossBase += crossSign * crossSpace / 2
    step = 0
  }
  if (style.alignContent === 'space-between') {
    crossBase += 0
    step = crossSpace / (flexLines.length - 1)
  }
  if (style.alignContent === 'space-around') {
    step = crossSpace / (flexLines.length)
    crossBase += crossSign * step / 2
  }

  if (style.alignContent === 'stretch') {
    crossBase += 0
    step = 0
  }

  flexLines.forEach(function (items) {
    const lineCrossSize = style.alignContent === 'stretch' ?
      items.crossSpace + crossSpace / flexLines.length : items.crossSpace
    
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      const itemStyle = getStyle(item)

      const align = itemStyle.alignSelf || style.alignItems
      if (item === null) {
        itemStyle[crossSize] = align === 'stretch' ? lineCrossSize : 0
      }

      if (align === 'flex-start') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'flex-end') {
        itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
        itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
      }
      if (align === 'center') {
        itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
        itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
      }
      if (align === 'stretch') {
        itemStyle[crossStart] = crossBase
        itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) ? itemStyle[crossSize] : lineCrossSize)
        itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
      }
    }
    crossBase += crossSign * (lineCrossSize + step)
  })
  console.log(items)
}

module.exports = layout
