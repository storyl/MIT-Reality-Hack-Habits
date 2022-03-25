// -----JS CODE-----

var i = 0

script.api.onPointerStart = function() {
    print(i + ": onPointerStart called")    
    i++
}

script.api.onPointerEnd = function() {
    print(i + ": onPointerEnd called")
    i++
}
