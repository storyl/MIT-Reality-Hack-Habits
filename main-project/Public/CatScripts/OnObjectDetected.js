// -----JS CODE-----
//@input Component.ScriptComponent mlOutputDecoderScript
//@input SceneObject goodAnimation = null
//@input SceneObject badAnimation = null

const CupClass = 1;
const CatClass = 3;
const DogClass = 5;

function onDetectionsUpdated(results) {
    var isObjectDetected = false;  
    var detectedObjectClass = 0;
    
//    print("onDetectionsUpdated called")
    var resultsKeys = Object.keys(results)
//    print("resultsKeys count = " + resultsKeys.length)
//    print("resultsKeys = " + resultsKeys)
    
    for (var i = 0; i < resultsKeys.length; i += 1) {
        var result = results[i]
        if (result) {
            print(i + ": box = " + result.box)
            print("   score = " + result.score)
            print("   class = " + result.class)
            isObjectDetected = true;
            detectedObjectClass = result.class
        }
        else {
//            print(i + ": undefined")
        }
    }

    if (script.goodAnimation) {
        script.goodAnimation.enabled = false
        if (isObjectDetected && (detectedObjectClass === CatClass || detectedObjectClass === CupClass)) {
            script.goodAnimation.enabled = true
        }
    }
    else {
        print("script.goodAnimation undefined")
    }
    
    if (script.badAnimation) {
        script.badAnimation.enabled = false
        if (isObjectDetected && detectedObjectClass === DogClass) {
            script.badAnimation.enabled = true
        }
    }
    else {
        print("script.badAnimation undefined")
    }
}

if (script.mlOutputDecoderScript && script.mlOutputDecoderScript.api.addCallback) {
    script.mlOutputDecoderScript.api.addCallback(onDetectionsUpdated)
}
