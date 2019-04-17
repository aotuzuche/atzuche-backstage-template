# 1. consoleCreator使用

## 开始

着手写项目时，先clone该分支(master)，然后切换一个新分支(业务逻辑分支)，然后删除__template目录（不删也不影响...），该目录为后台模板，所以切记不要删除master分支的该文件

## 创建项目

```
$ create <项目中文名> <系统码>
```

注意命令中的空格，如果有意外的空格或是非英文空格可能系统会不认，系统码需要在权限系统中配置，如果只想本地测试，系统码输入demo，会给一套本地的测试数据


例：
```
$ create 用户管理后台 userConsole
```

## 添加模板

```
$ view <文件名> <模板类型> <路由>
```

1. 同个项目中文件名必须唯一（系统也会判断）
2. 模板类型只允许 table / search_table / form 三种之一
3. 路由必须以 / 开头
4. 路由不能使用params，即所有的参数都以search的方式携带

例：

```
$ view userList table /user/list

$ view userSearchList search_table /user/searchList

$ view userDetail form /user/detail
```

# 2. 组件

## Table

用于列表数据的展示

例子：

```jsx
import AutoTable from 'src/container/table'

// 列表的数据结构
// data: <title> <key> <width> <align>
const columns = [{
    data: 'ID,id,80,center'
}, {
    data: '头像,header,200,center',
    className: 'header',
    render: (header, data) => {
    	return <img src={header} />
    }
}, {
    data: '用户名,username,150'
}, {
	data: '内容,comment'
}, {
	data: '时间,date,140,center'
}, {
	data: '操作,x,150,center',
	renderConsole: data => {
		const other = (
            <Popconfirm
                key="2"
                okText="是"
                cancelText="否"
                title="确认要干啥吗？"
                onConfirm={this.evt.todoB.bind(null, data)}
            >
                <a>操作B</a>
            </Popconfirm>
        )
        return [
            <a
            	disabled
            	key="1"
            	onClick={this.evt.todoA.bind(null, data)}>
            	操作A
            </a>,
            other
        ]
	}
}]

<AutoTable
	columns={columns}
    listName="list"
    totalName="total"
    pageSizeName="pageSize"
    pageNumName="pageNum"
    rowKey="id"
	api="get:/mock/59bcb5d0e0dc663341ac40f3/consoleDemo/tabledata"
	ref={e => this.table = e}
/>
```


|属性|说明|类型|默认值|
|-|-|-|-|
|columns|骨架，用于展示table的展示内容|[Object]Array|-|
|columns[].data|数据，共4个字段，用,(逗号)分隔开，分别为标题、对应的字段、占用宽度与对齐方式。例：标题,title,200,center。宽可以省略，即：标题,title,center，这样宽就会自适应。或者最简单的方式：标题,title，宽会自适应且默认左对齐|String|-|
|columns[].className|样式名|String|-|
|columns[].render|返回一个组件的方法，如果不写的话直接将数据内容纯文字展示。该方法有两个参数，第一个为字段的值，第二个为该行的所有数据|Function|-|
|columns[].renderConsole|用于放置操作组件，同样返回一个组件的方法。该方法只有一个参数，即该行的所有数据|Function|-|
|api|接口请求地址，默认get请求，如果需要用其他方式请求使用method:url的方式，返回数据成功时应该为{ data:{ list: [...列表数据], resCode: '000000' } }，即：resCode需要为'000000'，然后有个列表数据的数组|String|-|
|listName|接口返回数据的列表字段的key|String|list|
|totalName|接口返回数据的数据总数的key|String|total|
|pageSizeName|接口返回数据的页大小的key|String|pageSize|
|pageSize|接口返回数据的页大小的key|String|10|
|pageNumName|接口返回数据的第几页的key|String|pageNum|
|initialPageNum|默认在第几页|String|1|
|afterFetch|接口请求完成的钩子，返回获取到的数据|Function|-|
|keyword|搜索条件关键字，get请求放在params中，post放在data中|Object|{}|
|ref|React自带的ref，在下方的ref相关方法中用到|Function|-|


**ref相关的方法**

```jsx
<AutoTable
	...
	ref={e => this.table = e}
/>

// this.table将有下列方法供使用
```

|属性|说明|
|-|-|
|search|搜索，需要携带一个keyword关键字(Object)，同上方的keyword，同时将会翻回第一页，也可以不带任何参数，相当于reset|
|refresh|刷新，保留所有请求参数，第几页、搜索条件之类的，纯粹刷新，一般用于操作后刷新一下让内容更新为最新的状态|
|pageTo|翻页，带页号请求|
|loading|显示loading|
|unloading|关闭loading|

额外说明：

search、refresh、pageTo会返回一个Promise，可以await这些方法完成后做后续操作



## SearchBar

搜索栏，一般与table组合使用

例子：
```jsx
import AutoSearchBar from 'src/container/searchBar'

const columns = [{
    title: '用户名',
    key: 'username',
    initialValue: '自带默认值'
}, {
    title: '内容',
    key: 'comment'
}, {
    title: '下拉菜单',
    key: 'select',
    initialValue: '',
    value: v => String(v),
    render: () => {
        return (
            <Select>
                <Select.Option value="">请选择</Select.Option>
                <Select.Option value="A">选项A</Select.Option>
                <Select.Option value="B">选项B</Select.Option>
                <Select.Option value="C">选项C</Select.Option>
            </Select>
        )
    }
}, {
    title: '另一个',
    key: 'other1'
}, {
    title: '另一个2',
    key: 'other2',
    render: () => {
        return <Input placeholder="输入一些值看看有什么变化" />
    }
}, {
    title: '另一个3',
    key: 'other3',
    render: formData => {
        if (formData.other2) {
            return <Input placeholder="当另一个2有值的时候显示" />
        }
        return null
    }
}]

<AutoSearchBar
    columns={columns}
    colSpan={6}
    initialItemCount={4}
    onSearch={formData => {
        return new Promise(async (resolve, reject) => {
            if (this.table) {
                await this.table.search(formData)
                resolve()
            }
            else {
                reject('error')
            }
        })
    }}
    onReset={() => {
        this.table && this.table.search()
    }}
/>
```

|属性|说明|类型|默认值|
|-|-|-|-|
|columns|骨架，用于展示搜索栏的展示内容|[Object]Array|-|
|columns[].title|标题，就是每项搜索条件的标题|String|-|
|columns[].key|每项搜索条件的对应字段名|String|-|
|columns[].initialValue|初始值，一般为空，或有特定需求时指定|String|-|
|columns[].value|针对initialValue或者浏览器地址中的search取回来的值做封装，并返回符合格式的值；两个参数，1.该组件的值；2.整个表单的值|Function|-|
|columns[].render|搜索项渲染的组件，需返回一个组件，且组件需要有value和onChange两个props（ant.design规定），默认是个Input组件，该方法参数为这个搜索栏所有项的key和value（一个Object），如果返回null，则该项不渲染|Function|-|
|colSpan|分栏，算法为：24 / colSpan = 分栏数，默认为6，就是分4栏|Int|6|
|initialItemCount|默认展示搜索项的个数（前n个），如果超过将会在点击更多按钮后显示|Int|4|
|onSearch|在点击搜索按钮时会调用该回调，该方法的参数为整个搜索栏的key和value(一个Object)，注意该方法需要返回一个Promise，reject('错误提示')将停止搜索显示错误信息；若没有问题，先执行搜索方法，比如Table组件的search()方法并携带该方法返回的参数，然后调用resolve()|Function<-Promise|-|
|onReset|点击重置时调用的方法，无参数，一般我们在该方法里调用Table组件的search()方法，注意search可以不带任何参数|Function|-|


## Form

用于详情的表单，目前只支持表单和接口1对1的形式，如果一个接口请求数据中要分别展示到n个表单（即表单列表）的方式，还是使用ant.design默认的组件进行组合

例子：
```jsx
const columns = [{
    title: '字段标题',
    key: 'key1',
    initialValue: '',
    span: 8,
    render: () => {
    	return <Input />
    }
}, {
    render: () => {
      return <hr key="hr" />
    }
}, {
    title: '字段标题',
    key: 'key2',
    initialValue: '',
    span: 8,
    render: () => {
    	return <Input />
    }
}, {
    title: '字段标题',
    key: 'key3',
    initialValue: '',
    span: 8,
    render: () => {
    	return <Input />
    }
}]

return (
	<AutoForm
		columns={columns}
        newForm={!this.search.id}
        apiList={{
            read: 'get:/apigateway/community/console/article/getEditInfo?articleId=' + this.search.id,
            create: 'post:/apigateway/community/console/article/create',
            update: 'post:/apigateway/community/console/article/edit'
        }}
        checkForm={this.evt.checkForm}
        afterSubmit={this.evt.afterSubmit}
	/>
)
```


|属性|说明|类型|默认值|
|-|-|-|-|
|columns|骨架，用于展示表单的内容|[Object]Array|-|
|columns[].title|标题，就是每项的标题，这里有个技巧：有时我们需要两个组件看起来是一组的，比如省份选择和城市选择，城市选择的这项不写title，在显示上他就会和他前面的一个并作一个组的形式|String|-|
|columns[].key|每项的对应字段名|String|-|
|columns[].value|处理初始值的方法，他会将表单的请求数据作为参数，需要返回一个值作为该组件的值|Function|-|
|columns[].span|组件区域所占用的宽度，左边栏占了6，所以理论上span最大可用的是18（共24）|Int|8|
|columns[].render|该项目的组件，需返回一个组件，且组件需要有value和onChange两个props（ant.design规定），默认是个Input组件，该方法参数为该表单所有项的key和value（一个Object），如果返回null，则该项不渲染；如果没有key，但有render方法，将会渲染一个与表单无关的组件，比如一条分割线，注意：这时组件必须要有个key，不然会报错。|Function|-|
|newForm|表示这个表单的作用是新建表单还是修改表单，新建为true，初始化时不调用接口，否则调用apiList的read字段对应的接口|Boolean|false|
|afterFetch|获取数据之后，仅在newForm为false时会发生，将请求的返回值作为参数带回|Function|-|
|apiList|请求接口的列表，接口地址以method:url的方式给到，method：read默认为get，create和update默认为post方式|Object|-|
|apiList.read|修改表单在初始化时调用的请求地址，newForm为false时才有效|String|-|
|apiList.update|修改表单在提交表单时的请求地址，newForm为false时才有效|String|-|
|apiList.create|新建表单在保存时的请求地址，newForm为true时才有效|String|-|
|labelSpan|标题栏的宽度，默认6|Int|6|
|wrapperSpan|主体栏的宽度，默认8，单项修改的话可以用columns[].span修改|Int|8|
|checkForm|提交前验证表单，该方法的参数有两个，第一个为整个表单的key和value(一个Object)，第二个是初始化请求接口的返回值(修改表单时才有)，注意该方法需要返回一个Promise，reject('错误提示')将停止提交动作并显示错误信息；若没有问题，调用resolve()，注意：resolve如果为空，会将表单的key/value提交，如果带参数，则提交参数内的值|Function<-Promise|-|
|afterSubmit|提交完成后的回调方法，可以在这里操作返回列表页+提示'操作成功'字样|Function|-|



## Fetch

该组件只做接口请求，完成后返回一个组件

例子：
```jsx
import AutoFetch from 'src/container/fetch'

<AutoFetch
    api="get:/api/what/user"
    data={{name:'admin'}}
    render={(data, ok) => {
        if (ok) {
            return <p>{data.name}</p>
        }
        return null
    }}
    cache
/>
```

|属性|说明|类型|默认值|
|-|-|-|-|
|api|接口地址，形式为method:url|String|-|
|data|请求的参数，get用params形式，post等用data形式|Object|-|
|render|方法，返回一个渲染的组件，参数为两个，第一个为接口的返回值，第二个为是否请求完成的bool|Functioni|-|
|cache|缓存，如果为true，路由切换时不会重新请求接口，只有刷新页面才请求|Boolean|false|

**技巧：有时候会需要在该组件不变动的情况下二次请求数据，比如城市选择的第二三级，它并不会卸载再
 重新加载，而是动态的传入api和data去做不同请求，可以给它加一个key，key根据请求给不同值，它
 值一变该组件也会卸载原先并新加载一个同样的组件，便做到了再次请求的工作**


## Upload

**用于form表单内**

上传图片到oss，他有value和onChange两个props，在使用上与Input等组件并无太大区别

例子：
```jsx
import AutoUpload from 'src/container/upload'

<AutoUpload
    signApi="get:/api/upload/ossSign"
    thumb={true}
    thumbAddon={() => {
        return <a href="javascript:;" onClick={...}>删除</a>
    }}
/>
```
|属性|说明|类型|默认值|
|-|-|-|-|
|signApi|请求oss签名的地址，有固定格式，一般只要配置好地址就能正常使用|String|-|
|thumb|是否显示缩略图|Boolean|false|
|thumbAddon|在缩略图位置的挂载组件，比如要加个删除按钮之类的|Function|-|

