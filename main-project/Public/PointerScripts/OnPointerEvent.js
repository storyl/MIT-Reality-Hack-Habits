// -----JS CODE-----

var i = 0

script.api.isPointing = false

script.api.onPointerStart = function() {
    script.api.isPointing = true
    print(i + ": onPointerStart called")    
    i++
}

script.api.onPointerEnd = function() {
    script.api.isPointing = false
    print(i + ": onPointerEnd called")
    i++
}
