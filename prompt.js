const readline = require('readline')

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function prompt(){
    rl.question("What is your name ? ", function(name) {
        console.log(`You typed : ${name}`);
        if(name == 'exit'){
            rl.close();
        }
        else{
            prompt()
        }
    });
}


rl.on("close", function() {
    console.log("\nBYE BYE !!!");
    process.exit(0);
});

prompt()

