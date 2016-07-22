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




var data = {
    a: 1,

    firstName: 'Foo',
    lastName: 'Bar'

}
var vm = new Vue({
    el: '#page',
    data: data,
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
        }
    }
})

vm.$data === data // -> true
vm.$el === document.getElementById('page') // -> true

// $watch 是一个实例方法
vm.$watch('a', function (newVal, oldVal) {

    console.log(newVal, oldVal);
})