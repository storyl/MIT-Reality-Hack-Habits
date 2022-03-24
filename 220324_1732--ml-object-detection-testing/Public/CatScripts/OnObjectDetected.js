// -----JS CODE-----
//@input Component.ScriptComponent mlOutputDecoderScript
//@input SceneObject sceneObject = null


function onDetectionsUpdated(results) {
    var isObjectDetected = false;    
    
    print("onDetectionsUpdated called")
    var resultsKeys = Object.keys(results)
    print("resultsKeys count = " + resultsKeys.length)
    print("resultsKeys = " + resultsKeys)
    
    for (var i = 0; i < resultsKeys.length; i += 1) {
        var result = results[i.toString()]
        if (result) {
            print(i + ": box = " + result.box)
            print("   score = " + result.score)
            print("   class = " + result.class)
            isObjectDetected = true;
        }
        else {
            print(i + ": undefined")
        }
    }
    
    if (script.sceneObject) {
        script.sceneObject.enabled = isObjectDetected
    }
}

if (script.mlOutputDecoderScript && script.mlOutputDecoderScript.api.addCallback) {
    script.mlOutputDecoderScript.api.addCallback(onDetectionsUpdated)
}
