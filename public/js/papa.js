
$(function start() {
    var url = "/js/a.csv"

    Papa.parse(url, {
        download: true,
        // rest of config ...
        complete: function(results, file){
            var data = results.data;
            var html;
            for(var i in data){
                if(data[i][0] == "住宿"){
                    var obj = {};
                    obj.type = data[i][1]
                    obj.title = data[i][2]
                    obj.address = data[i][3]
                    obj.link = data[i][4]
                    console.log(obj);                    
                }


            }
            $("body").append(html);
            // console.log(results.data);
        }
    })
});




