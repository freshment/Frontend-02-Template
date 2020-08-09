const css = require('css')
const EOF = Symbol('EOF') // End Of File
const layout = require('./layout') // 布局函数

let currentToken = null
let currentAttribute = null
let currentTextNode = null

let stack = [{ type: 'document', children: [] }] // 初始化值

// 加入一个新函数，addCSSRules,这里我们把CSS规则暂存到一个数组里
let rules = []
function addCSSRules(text) {
  const ast = css.parse(text)
  rules.push(...ast.stylesheet.rules)
}

// 进行 elemtn 与 选择器 匹配
function match(element, selector) {
  if (!selector || !element.attributes) return false
  if (selector.charAt(0) === '#') {
    const attr = element.attributes.filter(attr => attr.name === 'id')[0]
    if (attr && attr.value === selector.replace('#', '')) return true
  } else if (selector.charAt(0) === '.') {
    const attr = element.attributes.filter(attr => attr.name === 'class')
    if (attr && attr.value === selector.replace('.', '')) return true
  } else {
    if (element.tagName === selector) {
      return true
    }
  }
  return false
}

// css优先级比较原理
function specificity(selector) {
  const p = [0, 0, 0, 0] // 行内样式, id, class, TagName
  const selectorParts = selector.split(' ')
  // 假设只有简单选择器
  for (let part of selectorParts) {
    if (part.charAt(0) === '#') {
      p[1]++
    } else if (part.charAt(0) === '.') {
      P[2]++
    } else {
      p[3]++
    }
  }
  return p
}

// 比较两个选择器的优先级
function compare(sp1, sp2) {
  if (sp1[0] - sp2[0]) return sp1[0] - sp2[0]
  if (sp1[1] - sp2[1]) return sp1[1] - sp2[1]
  if (sp1[2] - sp2[2]) return sp1[2] - sp2[2]
  return sp1[3] - sp2[3]
}

function computeCSS(element) {
  // 获取父元素序列
  // 调用slice是复制一遍stack,防止之后stack变化造成的污染
  // 获得和计算父元素匹配的顺序是从内向外 所以需要做一个 reverse 操作
  const elements = stack.slice().reverse()

  if(!elements.computedStyle) element.computedStyle = {}

  for(let rule of rules) {
    const selectorParts = rule.selectors[0].split(' ').reverse()
    if (!match(element, selectorParts[0])) continue
    let matched = false
    
    let j = 1
    for(let i = 0; i < elements.length && j < selectorParts.length; i++) {
      if (match(elements[i], selectorParts[j])) {
        j++
      }
    }

    if (j >= selectorParts.length) matched = true

    if (matched) {
      const sp = specificity(rule.selectors[0])
      const computedStyle = element.computedStyle
      for(let declaration of rule.declarations) {
        if (!computedStyle[declaration.property]) computedStyle[declaration.property] = {}

        if (!computedStyle[declaration.property].specificity) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
          computedStyle[declaration.property].value = declaration.value
          computedStyle[declaration.property].specificity = sp
        }
      }
      console.log(element.computedStyle)
    }
  }
  console.log(rules)
  console.log('compute CSS for Element', element)
}

function emit(token) {
  let top = stack[stack.length - 1]

  if (token.type === 'startTag') {
    let element = {
      type: 'element',
      children: [],
      attributes: []
    }

    element.tagName = token.tagName

    for (let p in token) {
      if (p !== 'type' || p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }

    computeCSS(element)

    // 对偶操作
    top.children.push(element)
    // element.parent = top
    // 是 开始标签 就 入栈
    if (!token.isSelfClosing) stack.push(element)

    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Tag start end doesnt match!')
    } else {
      // --------------- 遇到style标签时，执行添加CSS规则的操作 ---------------//
      if (top.tagName === 'style') {
        addCSSRules(top.children[0].content)
      }
      // 进行布局
      layout(top)
      // 相同则 出栈
      stack.pop()
    }
    currentTextNode = null
  } else if (token.type === 'text') {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: ''
      }
      top.children.push(currentTextNode)
    }
    currentTextNode.content += token.content
  }
}

// 开始
function data(c) {
  if (c === '<') {
    return tagOpen
  } else if (c === EOF) {
    emit({
      type: 'EOF'
    })
    return 
  } else {
    emit({
      type: 'text',
      content: c
    })
    return data
  }
}

// 标签开始
function tagOpen(c) {
  if (c === '/') {
    return endTagOpen
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'startTag',
      tagName: ''
    }
    return tagName(c)
  } else {
    return
  }
}

// 结束标签
function endTagOpen(c) {
  if (c.match(/^[a-zA-Z]$/)) {
    currentToken = {
      type: 'endTag',
      tagName: ''
    }
    return tagName(c)
  } else if (c === EOF) {
    // 报错
  } else {
    // 报错
  }
}

// 标签名 以空白符结束
// <div class>
// <div />
function tagName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    // 属性
    return beforeAttributeName
  } else if (c === '/') {
    // 自封闭标签
    return selfClosingStartTag
  } else if (c.match(/^[a-zA-Z]$/)) {
    currentToken.tagName += c //.toLowerCase()
    return tagName
  } else if (c === '>') {
    emit(currentToken)
    // 普通标签结束  返回开始状态
    return data
  } else {
    return tagName
  }
}

// 自封闭标签
function selfClosingStartTag(c) {
  if (c === '>') {
    currentToken.isSelfClosing = true
    emit(currentToken)
    return data
  } else if (c === 'EFO') {
    // 报错
  } else {
    // 报错
  }
}

// 属性
function beforeAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  } else if (c === '=') {
    // return beforeAttributeName
  } else {
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

// 处理属性
function attributeName(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c)
  } else if (c === '=') {
    return beforeAttributeValue
  } else if (c === '\u0000') {

  } else if (c === `"` || c === `'` || c === "<") {

  } else {
    currentAttribute.name += c
    return attributeName
  }
}

// 处理属性的值
function beforeAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue
  } else if (c === `"`) {
    return doubleQuotedAttributeValue
  } else if (c === `'`) {
    return singleQuotedAttributeValue
  } else if (c === '>') {

  } else {
    return unquotedAttributeValue(c)
  }
}

// 双引号属性值
function doubleQuotedAttributeValue(c) {
  if (c === `"`) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '\u0000') {

  } else if (c === EOF) {
    
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

// 单引号属性值
function singleQuotedAttributeValue(c) {
  if (c === `'`) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return afterQuotedAttributeValue
  } else if (c === '\u0000') {

  } else if (c === EOF) {
    
  } else {
    currentAttribute.value += c
    return singleQuotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
    emit(currentToken)
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function unquotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    currentToken[currentAttribute.name] = currentAttribute.value
    return beforeAttributeName
  } else if (c === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return selfClosingStartTag
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === '\u0000') {

  } else if (c === `"` || c === `'` || c === '<' || c === '=' || c === '`') {

  } else if (c === EOF) {

  } else {
    currentAttribute.value += c
    return unquotedAttributeValue
  }
}

function afterAttributeName(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return afterAttributeName
  } else if (c === '/') {
    return selfClosingStartTag
  } else if (c === '=') {
    return beforeAttributeValue
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value
    emit(currentToken)
    return data
  } else if (c === EOF) {
    
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value
    currentAttribute = {
      name: '',
      value: ''
    }
    return attributeName(c)
  }
}

module.exports.parseHTML = function parseHTML(html) {
  let state = data
  for(let c of html) {
    if (state) state = state(c)
  }
  state = state(EOF)
  return stack[0]
}
