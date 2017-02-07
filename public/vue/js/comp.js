
// var MyComponent = Vue.extend({
//     template: '<div>A custom component!</div>'
// })

// // 全局注册组件，tag 为 my-component
// Vue.component('my-component', MyComponent)

// 在一个步骤中扩展与注册
Vue.component('hello-temp', {
  template: '#hello-temp',
  props: {
    data: Array
  }
})


// 定义
var MyComponent = Vue.extend({

    template: '<span>wewe{{parentMsg}}</span>',
    data: function() {
        return {
            parentMsg: 'Message from parent'
        }
    }
})

Vue.component('mytemp', MyComponent)

// new Vue({
//     el: '#demo-2',
//     data: {
//         parentMsg: 'Message from parent'
//     },
//     components: {
//         child: {
//             props: ['myMessage'],
//             template: '<span>{{myMessage}}</span>'
//         }
//     }
// })


// 创建根实例
new Vue({
    el: '#demo',
    data: {
        grid: [{
            name: 'Chuck Norris',
            power: Infinity
        }, {
            name: 'Bruce Lee',
            power: 9000
        }, {
            name: 'Jackie Chan',
            power: 7000
        }, {
            name: 'Jet Li',
            power: 8000
        }],
        ps: [{
            name: 'Flying',
            power: 2000
        }

        ]
    }
})

(function(fn){
    if(typeof define === "function" && define.amd){
        require(["//cdn.bootcss.com/vue/1.0.26/vue.js"],fn)
    } else {
        fn(Vue) 
    }

}(function(Vue){
    console.log(Vue);
}))




