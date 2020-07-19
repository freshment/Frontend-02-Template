# week03-学习笔记

### 运算符和表达式
* 运算符
>运算符优先级排列:
> Memory Expression > New Expression > Call Expression >
> Unary Expression > Multiplicate | Addtive | Shift(位运算) | Relationship >
> Equliaty > Bitwise(& ^ |) > Logical > Conditional(三元运算符) 
在写代码时注意优先级，及降级的情况。

>引用类型: 
>虽然不属于基本类型 但它是js运行时的一个类型，称作标准中的类型而不是语言中的类型
>obj.key 为引用类型
>delete, assign 是用到了引用类型
>执行 + - 运算时会 解引用

* 表达式
> Left Handside(Left) & Rgiht Handside(Right)
> 只有 Left 才能放置 "=" 左边, "=" 可以放置 Left 也可放置 Right
> 注意： JS中唯一右结合的运算: **,   2 ** 1 ** 3 = 6

### 类型转换
|   | Number | String | Boolean | Undefined | Null | Object | Symbol |
| - | ------ | ------ | ------- | --------- | ---- | ------ | ------ |
| Number | - | 1 ==> '1' | 0/1, true/false | x | x | boxing | x |
| String | '1' ==> 1, NaN | - | 'true'/'false', true/false | x | x | boxing | x |
| Boolean | 0/1 | 'true'/'false' | x | x | boxing | x | 
| Undefined | NaN | 'Undefined' | - | - | - | 
| Null | 0 | ‘Null' | false | x | - | x | x |
| object | valueOf | toString,valueOf | true | x | x | - | x |
| Symbol | x | x | x | x | x | boxing | - |

* Unboxing(拆箱)
拆箱转换是对象转为基本数据类型的过程即 ToPremitive 过程
对象的三个方法可影响ToPremitive过程：
  * toString
  * valueOf
  * [Symbol.toPremitive]
如果定义了 Symbol.toPremitive，会忽略 toString 与 valueOf
位运算先转为Number类型

### 运行时
* Completion Records
  * return
  * break
  * continue
  * throw
* 语句
  * 简单语句 a = b;
  * 组合语句 if switch while
    * 注意try catch finally 不是block构成的
  * 声明 
    * var function 声明会有变量提升特性(预处理)
    * class const let 声明也有预处理过程，但是在声明之前就调用会有报错机制
* Event Loop
  * 宏任务 （传递给JS引擎的任务）
  * 微任务 （JS内部发起的任务： Promise, nextTick）

### 函数调用
函调调用会形成一个stack数据结构。
* Execution Context
  * code evaluation state(用于异步的函数)
  * Function
  * Script or Module
  * Generator (generator函数独有)
  * Realm
  * LexicalEnvironment(词法环境)
  * VariablEnvironment
>LexicalEnvironment
>存储运行时的所有变量
>* this
>* new.target
>* super
>* 变量

* Environment Records(ER)
  * Declaretive ER
    * Function ER
    * module ER
  * Global ER
  * Object ER

* 函数 - 闭包 Function - Closure
每个函数它都会生成一个闭包
闭包定义：代码部分 和 环境部分（定义时的部分，会将ER保存在自身函数对象上成为一个属性），ER是一个链式结构

* Realm
在一个JS引擎的实例里面，它所有的内置对象会放进一个realm中，
在不同realm实例之间是完全独立的，不同realm之间可以传递对象，但这个对象Prototype是不一致的。
