foo(); // "c"

var a = true;
if (a) {
    function foo() { console.log("a"); }
} else {
    function foo() { console.log("b"); }
}

    function foo() { console.log("c"); }

for (let i=1; i<=5; i++) {
    setTimeout( function timer() {
        console.log( i );
    }, i*1000 );
}