({
    appDir: "./",
    baseUrl: "js",
    dir: "../build",
    paths: {
        'jquery':'libs/jquery-1.8.2',
        'easyDialog':'utils/easyDialog',
        'easySwitch':'utils/easySwitch',
        'easyValidator':'utils/easyValidator',
        'miniNotification':'utils/miniNotification',
        'scoreToRank':'utils/scoreToRank',
        'score-intro':'app/score-intro',
        'convert-center':'app/convert-center'
    },
    shim:{
        'easyDialog': ['jquery'],
        'easySwitch':['jquery'],
        'easyValidator':['jquery'],
        'miniNotification':['jquery']
    },
    modules: [{
        name: 'score-intro'
    },{
        name: 'convert-center'
    }]
})