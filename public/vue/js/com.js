Vue.component('demo-grid', {
  template: '#grid-template',
  props: {
    data: Array,
    columns: Array,
    filterKey: String
  },
  data: function () {
    var sortOrders = {}
    this.columns.forEach(function (key) {
      sortOrders[key] = 1
    })
    return {
      sortKey: '',
      sortOrders: sortOrders
    }
  },
  methods: {
    sortBy: function (key) {
      this.sortKey = key
      this.sortOrders[key] = this.sortOrders[key] * -1
    }
  }
})

// bootstrap the demo
var demo = new Vue({
  el: '#demo',
  data: {
    searchQuery: '',
    gridColumns: ['name', 'power'],
    gridData: [
      { name: 'Chuck Norris', power: Infinity },
      { name: 'Bruce Lee', power: 9000 },
      { name: 'Jackie Chan', power: 7000 },
      { name: 'Jet Li', power: 8000 }
    ]
  }
})

// var MyComponent = Vue.extend({
//     template: '<div>A custom component!</div>'
// })

// // 全局注册组件，tag 为 my-component
// Vue.component('my-component', MyComponent)

// 在一个步骤中扩展与注册
// Vue.component('my-component', {
//   template: '<div>A custom component!lorem10 this is a parent</div>'
// })

// 局部注册也可以这么做
// var Parent = Vue.extend({
//   components: {
//     'my-component': {
//       template: '<div>A custom component!</div>'
//     }
//   }
// })
// 
// var Child = Vue.extend({ /* ... */ })

// var Parent = Vue.extend({
//   template: '...',
//   components: {
//     // <my-component> 只能用在父组件模板内
//     'my-component': Child
//   }
// })


// var data = { a: 1 }
// var MyComponent = Vue.extend({
//     data: data
// })


// Vue.component('my-component', MyComponent)



// // 创建根实例
// new Vue({
//   el: '#page'
// })

