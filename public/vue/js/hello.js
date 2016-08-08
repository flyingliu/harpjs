new Vue({
    el: '#app',
    data: {
        message: 'Hello Vue.js!',
        todos: [{
            text: 'Learn a'
        }, {
            text: 'Learn b'
        }, {
            text: 'Learn c'
        }, {
            text: 'Learn JavaScript'
        }]
    },
    methods: {
        reverseMessage: function() {
            this.message = this.message.split('').reverse().join('');
            console.log(this);
        }
    }
})


new Vue({
    el: '#todo',
    data: {
        newTodo: '',
        todos: [{
            text: 'Add some todos'
        }]
    },
    methods: {
        addTodo: function() {
            var text = this.newTodo.trim()
            if (text) {
                this.todos.push({
                    text: text
                })
                this.newTodo = ''
            }
        },
        removeTodo: function(index) {
            this.todos.splice(index, 1);
            console.log(this,index,b,c);

        }
    }
})


// 这是我们的 Model
var exampleData = {
  name: 'Vue.js',
  greeting: true
}

// 创建一个 Vue 实例或 "ViewModel"
// 它连接 View 与 Model
var exampleVM = new Vue({
  el: '#example',
  data: exampleData
})


Vue.directive('demo', {
    bind: function() {
        console.log('demo bound!')
    },
    update: function(value) {
        this.el.innerHTML =
            'name - ' + this.name + '<br>' +
            'expression - ' + this.expression + '<br>' +
            'argument - ' + this.arg + '<br>' +
            'modifiers - ' + JSON.stringify(this.modifiers) + '<br>' +
            'value - ' + value
    }
})



var _list = [{
    name: "小明",
    age: 23
}, {
    name: "小红",
    age: 20
}, {
    name: "Sigma",
    age: 28
}];

var data = {
    a: 1,

    firstName: 'Foo',
    lastName: 'Bar',
    classObject: {
        red: true,
        bg: true
    },
    ok: false,
    parentMessage: 'Parent',
    items: [
      { message: 'Foo' },
      { message: 'Fooabc' },
      { message: 'Bar' }
    ],
    list: _list,
    checked: []

}


var vm = new Vue({
    el: '#page',
    data: data,

    // 在 `methods` 对象中定义方法
    methods: {
        greet: function(event) {
            // 方法内 `this` 指向 vm
            alert('Hello ' + this.parentMessage + '!')
                // `event` 是原生 DOM 事件
            alert(event.target.tagName)
        }
    },
    created: function() {
        // `this` 指向 vm 实例
        console.log('created a is: ' + this.a)
    },
    compiled: function() {
        console.log('compiled a is: ' + this.a)
    },
    destroyed: function() {
        console.log('destroyed a is: ' + this.a)
    },
    ready: function() {
        console.log('ready a is: ' + this.a)
    },
    computed: {
        fullName: {
            get: function() {
                return this.firstName + ' ' + this.lastName
            },
            set: function(newValue) {
                var names = newValue.split(' ')
                this.firstName = names[0]
                this.lastName = names[names.length - 1]
            }
        },
        className: {
            get: function() {
                return "red";
            }
        },

        allChecked: {
            get: function() {
                return this.checkedCount == this.list.length;
            },
            set: function(value) {
                if (value) {
                    this.checked = this.list.map(function(item) {
                        return item.name
                    })
                } else {
                    this.checked = []
                }
            }
        },
        checkedCount: {
            get: function() {
                return this.checked.length;
            }
        },


        classA: function() {
            return "bg";
        }
    }
})

vm.items = vm.items.filter(function (item) {
  return item.message.match(/Foo/)
})

vm.$data === data // -> true
vm.$el === document.getElementById('page') // -> true

// $watch 是一个实例方法
vm.$watch('a', function (newVal, oldVal) {

    console.log(newVal, oldVal);
})