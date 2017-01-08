class Template {
    constructor(tpl) {
        /**
         * 模板截取方法
         * 
         * 我们写一个方法，传入模板
         * 返回第一个语法字段，和被语法字段分割的左侧和右侧字段。
         * 这样操作，左侧的字段一定是字符串，右侧的字段可能是字符串，也可能是字符串+模板语法字段
         */
        var find = (template) => {
            var ret = {
                str0: template // 首先把左侧字段赋值，防止没找到情况下返回是空对象
            };
            template.replace(/{{.+?}}/, (str, index) => {
                ret = {
                    syntax: str.replace('{{', '').replace('}}', ''), //语法字段，需要去掉语法标志
                    str0: template.substring(0, index), //左侧字段是从0到index位置
                    str1: template.substring(index + str.length) //右侧字段，是从当前index+语法字段长度开始到最终结束
                }
            });
            return ret;
        };

        /**
         * 将模板解析为数组对象
         */
        var parse2array = (tpl) => {
            // 先缓存模板，之后每次要反复替换
            var curTpl = tpl;
            // 建立语法分析对象数组
            var arr = [];
            // 将模板解析为数组对象
            while (curTpl) {
                var temp = find(curTpl);
                if (temp.str0) arr.push({
                    type: 'string',
                    content: temp.str0
                }); //左侧字符串，需要对象返回，否则最终无法判断每一个数组字段哪个是字符串哪个是语法
                if (temp.syntax) {
                    //当前语法字段
                    if (temp.syntax.indexOf('#') === 0) {
                        //高级语法
                        arr.push({
                            type: 'syntaxAdvance',
                            content: temp.syntax
                        });
                    } else {
                        //普通语法字段
                        arr.push({
                            type: 'syntax',
                            content: temp.syntax
                        });
                    }
                }
                if (temp.str1) {
                    curTpl = temp.str1; //缓存右侧部分，进入下一次迭代
                } else {
                    curTpl = null;
                }
            }
            return arr;
        };

        /**
         * 将高级语法字段解析为js代码
         */
        var syntaxParse = (str) => {
            if (str.indexOf('each') === 0) {
                str = str.substring(4);
                var arr = str.split('as');
                var arr0 = arr[0].trim();
                var arr1 = arr[1].trim();

                var ret = `t2 = typeof ${arr0}==='function' ? ${arr0}() : ${arr0};\n`;
                ret += `for(var $index=0,$length=t2.length;$index<$length;$index++){\nvar ${arr1}=t2[$index];`;
                return ret;
            } else if (str.indexOf('if') === 0) {
                str = str.substring(2).trim();
                return `if(${str}){`;
            } else if (str.indexOf('else') === 0) {
                return `}else{`
            } else if (str.indexOf('endeach') === 0 || str.indexOf('endif') === 0) {
                return `}`;
            }
        };

        // 首先将模板中的换行回车去掉
        tpl = tpl.replace(/\r/g, '').replace(/\n/g, '');
        // 解析为语法数组
        var arr = parse2array(tpl);
        // 至此，我们已经解析完毕字符串模板了，之后要进行编译为函数
        var retFnStr = `var ret = '',t1,t2;\nwith(obj){\n`;
        var isSyntaxAdvance = false;
        arr.forEach(value => {
            if (value.type === 'string') {
                //字符串要拼上双引号
                retFnStr += `ret += "${value.content.replace(/"/g,'\\"')}";\n`;
            } else if (value.type === 'syntax') {
                //语法对象
                retFnStr += `t1 = ${value.content};\n`;
                retFnStr += `t1 = typeof t1==='function' ? t1() : t1;\n`;
                retFnStr += `ret += t1;\n`;
            } else if (value.type === 'syntaxAdvance') {
                let s = value.content.trim().substring(1).trim();
                // 高级语法解析
                retFnStr += syntaxParse(s) + '\n';
            }
        })
        retFnStr += '};\nreturn ret;';

        // 最终函数的内容
        var retFn = new Function('obj', retFnStr);
        return retFn;
    }
};