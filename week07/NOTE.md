# week07 学习笔记

### 什么是盒？
标签(Tag)   元素(Element)   盒(Box)
* HTML代码中可以书写开始*标签*，结束*标签*，和自封闭*标签*
* 一对起止*标签*，表示一个*元素*
* DOM树中存储的是*元素*和其他类型的节点（Node）
* CSS选择器选中的是*元素*
* CSS选择器选中的*元素*，在排版时可能产生多个*盒*
* 排版和渲染的基本单位是*盒*

盒模型是排版的一个基本单位

### 正常流排版
> 步骤：
* 收集盒进 行
* 计算盒在 行 中的排布
* 计算 行 的排布

> 规则
```
行内盒：当一个盒 元素 文字，在一个行里时，是从左往右排布 （IFC） Inline-level-Formatting-Context
块级盒：块级独占一行，从上往下进行排布 （BFC）Block-level-Formatting-Context
```

> IFC
```
line-top      文字上缘  文字与盒混排，会有line-top偏移问题，盒的先后顺序和尺寸会影响line-top
text-top      文字顶缘  由font-size决定
base-line     基线，用于对齐英文字母
text-bottom   文字底缘  由font-size决定
line-bottom   文字下缘  文字与盒混排，会有line-top偏移问题，盒的先后顺序和尺寸会影响line-bottom
```

> BFC
*概念:*
```
* Block Container: 里面有BFC
* Block-level Box: 外面有BFC
* Block box = Block Container + Block-level Box, 里外都有BFC
```
*创建BFC:*
* 浮动的元素
* 绝对定位的元素 absolute
* Block Container: inline-block; table-cells (不是 Block-level Box: flex item)
* overflow: hidden

*BFC合并:*
1. Block Box
2. overflow: visible

*BFC合并影响:*
1. float
2. 边距折叠 (只会发生在一个BFC里)