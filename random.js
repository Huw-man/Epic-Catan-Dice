/*Used to request random number from RANDOM.org*/
console.log("random js");
var randomDecimalArray = []; //holds random numbers
var index = 0;
// console.log(randomDecimalArray[index]);
// requestRandomDotOrg();
function requestRandomDotOrg() {
    var xhr = new XMLHttpRequest();
    var url = "https://api.random.org/json-rpc/1/invoke";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-type", "application/json");
    xhr.onreadystatechange = function () {
        console.log("steady state change");
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json);
            randomDecimalArray = randomDecimalArray.concat(json.result.random.data);
            // console.log(randomDecimalArray);
        } else {
            alert("error in request to Random.org");
        }
    };
    var data = JSON.stringify({
        "jsonrpc": "2.0",
        "method": "generateDecimalFractions",
        "params": {
            "apiKey": "a7ebe9ec-3c8e-41a9-ac97-bcb8c949d5a2",
            "n": 10,
            "decimalPlaces": 16,
            "replacement": true
        },
        "id": 99
    });
    xhr.send(data);
}

function getNextRandomNum() {
    index ++;
    if (!randomDecimalArray[index]) {
        console.log("generating");
        for (var i=0; i<10; i++){
            randomDecimalArray.push(Math.random());
        }
    }

    // if (randomDecimalArray.length - index < 5){ //running out of random numbers
    //     requestRandomDotOrg();
    // }
    // console.log(index);
    // console.log(randomDecimalArray)
    // console.log(randomDecimalArray[index]);
    return randomDecimalArray[index];
}

/*Generates random unit vector in R3
* used for direction*/
function generateRandomVector() {
    var angle = getNextRandomNum() * 2 *Math.PI;
    var z = getNextRandomNum() *2 -1;
    return {"x": Math.sqrt( 1 - z*z) * Math.cos(angle),
        "y": Math.sqrt( 1 - z*z) * Math.sin(angle),
        "z": z};
}

function generateSixRandomVectors() {
    var array = [];
    for (var i = 0; i<7; i++){
        var r = generateRandomVector();
        array.push(new THREE.Vector3(r.x, r.y, r.z));
    }
    return array;
}