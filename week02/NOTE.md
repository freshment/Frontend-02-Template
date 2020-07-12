# week2-学习笔记
### 产生式（BNF 巴斯克诺儿范式）
>语法
* 用尖括号括起来的名称来表示语法结构名
* 语法结构分为 基础结构 和 需要用其他语法结构定义的复合结构
  * 基础结构称为 终结符
  * 复合结构称为 非终结符
* 引号和中间字符表示终结符
* 可以有括号
* \* 表示多次
* | 表示或
* + 表示至少一次

### 形式语言（乔姆斯基谱系）
>分类
0. 无限制文法
  * ？::=？
1. 上下文相关文法
  * ？<A>?::=?<A>?
2. 上下文无关文法
  * <A>::=?
3. 正则文法
  * <A>::=<A>?
>Question:
那么JavaScript属于哪种文法呢？
答：上下文无关文法 & 上下文相关文法
   上下文相关语法的例子比如  { get() {} },  { get: 1 }

### 语言分类
* 数据描述语言
  1. HTML
  2. CSS
  3. JSON
  4. XML
  5. SQL
* 编程语言
  1. JavaScript
  2. jAVA
  3. Python
  4. Go
  ...
* 声明型语言
(现有的声明型 与数据描述语言相近)
* 命令型语言
(现有的命令型语言 与编程语言相近)

### 编程语言的性质
* 图灵完备性
* 动态与静态
  * 动态
    * 在用户设备/在线服务器上
    * 产品实际运行时
    * Runtime
  * 静态
    * 在程序员设备上
    * 产品开发时
    * Compiletime
* 类型系统

### 一般命令式编程语言
```
* Atom
  * Identifier
  * Literal
* Expression
  * Atom
  * Operator
  * Punctuator
* Statement
  * Expression
  * Keyword
  * punctuator
* Structure
  * Function
  * Class
  * Process
  * Namespace
  ...
* Program
  * Program
  * Module
  * Package
  * Library
```

### JavaScript 数据类型
1. Number
2. String
3. Boolean
4. Object
5. Null
6. Undefined
7. Symbol
8. BigInt（草案中）

>Number
* IEEE 754 双精度浮点类型 （64位）
  * Sign - 符号 （1）
  * Exponent - 指数（11）
  * Fraction - 精度 (52)
*JS支持 十进制(Dec)， 二进制(Bin)， 八进制(Oct)， 十六进制(Hex)*
>String
* 字符集
  * ASCII
  * Unicode （通用）
  * UCS
  * GB
* 编码方式
  * UTF8
    * 8个bit表示一个字符，兼容ASCII （中文一般2-3个字符）
  * UTF16
    * 16个bit表示一个字符
>Boolean
* true 关键字
* false 关键字
>Null & Undefined
* Null 是关键字 代表赋值了并且赋值为空，typeof Null === 'object'
* Undefined 代表未被声明， 是变量 属于设计失误， 尽量用void 0 来代替
>Object & Symbol
* Object
对象由三个核心的要素组成：
  * Identifier
  * State
  * Behavior

类-Class 是一种常见的描述对象的方式。
”归类“和”分类“是两个主要的流派

* Prototype
原型是一种更接近人类原始认知的描述对象的方法。

* Object in JavaScript
  * 使用内存地址确保对象唯一性
  * 原型链
  * key: value 形式
    * key为 String 或 Symbol, Symbol只能用变量进行引用
  * 数据属性 & 访问器属性
    * 数据属性: value, writable, enumerable, configurable
    * 访问器属性: get, set, enumerable(影响Object.keys, forEach行为), configurable
  * API
    * {} / [] / Object.defineProperty
    * Object.create / Object.setPrototypeOf / Object.getPrototypeOf
    * new / Class / extends (推荐es6)
    * new / function / prototype (before es6)
  * Host Object (与运行环境相关)
