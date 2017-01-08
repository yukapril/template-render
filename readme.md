# 简易模板引擎实现

> 未经过编译，仅支持ES6浏览器


支持语法：

* 字段赋值
* if 
* for


写法例如：

html

```html
<h1>{{metro}}</h1>
<h2>I'm {{user.name}}, {{user.age}} years old!</h2>
{{# if user.age < 22 }} 
<p>I like "StarCraftⅡ"!</p>
{{# else }}
<p>I don't like games!</p>
{{# endif }} 
<p>My hobbys is:</p>
<ul>
    {{# each hobbys as item }}
    <li>{{$index+1}}/{{$length}} - {{item}}</li>
    {{# endeach }}
</ul>
```

js

```js
var tl = new Template(tpl);
var result = tl(data);
```