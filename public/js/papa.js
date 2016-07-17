
$(function start() {
    var url = "/js/long-sample.csv"

    Papa.parse(url, {
        download: true,
        // rest of config ...
        complete: function(results, file){
            var data = results.data;
            for(var i in data){
                for(var j in data[i]) {
                    console.log(data[i][j]);

                }
                

            }
            // console.log(results.data);
        }
    })
});
