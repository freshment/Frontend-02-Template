const EOF = Symbol('EOF') // End Of File
let currentToken = null
let currentAttribute = null
let currentTextNode = null

let stack = [{ type: 'document', children: [] }] // 初始化值
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
      if (p !== 'type' && p !== 'tagName') {
        element.attributes.push({
          name: p,
          value: token[p]
        })
      }
    }
    // 对偶操作
    top.children.push(element)
    element.parent = top
    // 是 开始标签 就 入栈
    if (!token.isSelfClosing) stack.push(element)

    currentTextNode = null
  } else if (token.type === 'endTag') {
    if (top.tagName !== token.tagName) {
      throw new Error('Tag start end doesnt match!')
    } else {
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
      this.children.push(currentTextNode)
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
    return beforeAttributeName
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
  } else if (c === '\u0000') {

  } else if (c === EOF) {
    
  } else {
    currentAttribute.value += c
    return doubleQuotedAttributeValue
  }
}

function afterQuotedAttributeValue(c) {
  if (c.match(/^[\t\n\f ]$/)) {
    return beforeAttributeName
  } else if (c === '/') {
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

module.exports.parseHTML = function parseHTML(html) {
  let state = data
  for(let c of html) {
    state = state(c)
  }
  state = state(EOF)
}
