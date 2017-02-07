var store = {
    state: {
        message: 'Hello!'
    },
    actionA: function() {
        this.state.message = 'action A triggered'
    },
    actionB: function() {
        this.state.message = 'action B triggered'
    }
}

var vmA = new Vue({
    el: '#app',
    data: {
        privateState: {},
        sharedState: store.state
    }
})

var vmB = new Vue({
    el: "#appb",
    data: {
        privateState: {},
        sharedState: store.state
    }
})

setTimeout(function(){
    store.actionA();


},5000)