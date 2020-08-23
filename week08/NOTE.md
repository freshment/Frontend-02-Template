# week 08 学习笔记

### em 标签 与 string 标签的区别
em 是一种 语气 的辅助表示（重音），表示该字段在一句中的重要性
strong 表示不改变语义的， 该字段在整篇文章中具有重要性
其实两者表现的形式相同，但“语义“不同

### HTML语法
* Element: <tagName>...</tagName>
* Text: 文本
* Comment: <!-- comment -->
* DocuemntType: <!Doctype html>
* ProcessingInstruction: <?a 1?>
* CDATA: <![CDATA[ ]]> 是文本，不考虑转义问题

>重要的字符引用
* &amp;  (&)
* &lt;   (>)
* &quot; (")

### DOM API
包括：
* 节点 Node：DOM 树形结构中的节点相关 API
* 事件： 触发和监听事件相关 API
 * 冒泡更符合人的直观
 * addEventListener passive 可提高性能， 比如在监听滚动事件时
* Range：操作文字范围相关 API
 * Range + Fragment 可以减少重排，提高DOM性能
* 遍历：遍历 DOM 需要的 API

### CSSOM
* document.styleSheets 可以获取伪元素
* getComputedStyle(elt, pseudoElt)
 * elt 想要获取的元素
 * pseudoElt 伪元素
 * 获取最终渲染计算出的样式属性，transform animation 拖拽

> CSSOM View
* Window
 * window.innerHeight
 * window.innerWidth
 * window.devicePixelRatio

* Scroll window
 * scrollX
 * scrollY
 * scroll(scrollTo)
 * scrollBy

* Scroll element
 * scrollLeft
 * scrollTop
 * scrollWidth
 * scrollHeight
 * scroll(scrollTo)
 * scrollBy
 * scrollIntoView

* Layout (重点~)
 * getClientRects()
  * getClientRects 会返回一个列表，里面包含元素对应的每一个盒所占据的客户端矩形区域，这里每一个矩形区域可以用 x, y, width, height 来获取它的位置和尺寸。
 * getBoundingClientRect()
  * getBoundingClientRect ，这个 API 的设计更接近我们脑海中的元素盒的概念，它返回元素对应的所有盒的包裹的矩形区域，需要注意，这个 API 获取的区域会包括当 overflow 为 visible 时的子元素区域。 （可以实现图片懒加载）
