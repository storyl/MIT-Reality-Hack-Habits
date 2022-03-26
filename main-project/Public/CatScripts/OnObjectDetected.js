// -----JS CODE-----
//@input Component.ScriptComponent mlOutputDecoderScript
//@input Component.ScriptComponent onPointerEventScript
//@input SceneObject pointerObjectTrackingHint = null
//@input SceneObject goodAnimation = null
//@input Component.AudioComponent goodSound = null
//@input SceneObject badAnimation1 = null
//@input SceneObject badAnimation2 = null
//@input Component.AudioComponent badSound = null

const DisableDetectionStates = false

const CupClass = 1
const CatClass = 3
const DogClass = 5
const BottleClass = 7

const PointEndEventDelay = 5
const ObjectDetectionEndEventDelay = 5
const PositiveReinforcementTime = 10
const NegativeReinforcementTime = 9

var pointEndEventDelayRemaining = 0
var isPointing = false

var objectDetectEndEventDelayRemaining = 0
var objectWasDetected = false
var isObjectDetectionOn = false
var detectedObjectClass = -1

var positiveReinforcementTimeRemaining = 0
var isDoingPositiveReinforcement = false

var negativeReinforcementTimeRemaining = 0
var isDoingNegativeReinforcement = false


function resetReinforcements() {
    if (!isDoingPositiveReinforcement) {
        if (script.goodAnimation) script.goodAnimation.enabled = false    
    }
    if (!isDoingNegativeReinforcement) {
        if (script.badAnimation1) script.badAnimation1.enabled = false
        if (script.badAnimation2) script.badAnimation2.enabled = false
    }
}

function doPositiveReinforcement() {
    if (script.goodAnimation) script.goodAnimation.enabled = true
    else print("script.goodAnimation undefined")
    
    if (script.goodSound && !script.goodSound.isPlaying())
        script.goodSound.play(1)
    
    positiveReinforcementTimeRemaining = PositiveReinforcementTime
    isDoingPositiveReinforcement = true
    isDoingNegativeReinforcement = false
}

function doNegativeReinforcement() {
    if (script.badAnimation1) script.badAnimation1.enabled = true
    else print("script.badAnimation1 undefined")
    
    if (script.badAnimation2) script.badAnimation2.enabled = true
    else print("script.badAnimation2 undefined")
    
    if (script.badSound && !script.badSound.isPlaying())
        script.badSound.play(1)
    
    negativeReinforcementTimeRemaining = NegativeReinforcementTime
    isDoingNegativeReinforcement = true
    isDoingPositiveReinforcement = false
}

function continueReinforcements() {
    if (isDoingPositiveReinforcement) {
        if (positiveReinforcementTimeRemaining > 0) {
            positiveReinforcementTimeRemaining -= getDeltaTime()
            if (positiveReinforcementTimeRemaining <= 0) {
                isDoingPositiveReinforcement = false
            }
        }
    }
    if (isDoingNegativeReinforcement) {
        if (negativeReinforcementTimeRemaining > 0) {
            negativeReinforcementTimeRemaining -= getDeltaTime()
            if (negativeReinforcementTimeRemaining <= 0) {
                isDoingNegativeReinforcement = false
            }
        }
    }
}


function updateObjectDetectionState() {
    if (DisableDetectionStates) {
        return
    }
    
    resetReinforcements()
    if (objectWasDetected) {
        if (detectedObjectClass === CupClass) {
            doNegativeReinforcement()
        }
        else if (detectedObjectClass === BottleClass) {
            doPositiveReinforcement()
        }
    }
    continueReinforcements()

    if (script.pointerObjectTrackingHint) {
        if (isObjectDetectionOn) {
            script.pointerObjectTrackingHint.enabled = false
        }
        else {
            script.pointerObjectTrackingHint.enabled = !isObjectDetectionOn
                && !isDoingPositiveReinforcement
                && !isDoingNegativeReinforcement
        }
    }
    else {
        print("script.pointerObjectTrackingHint undefined")
    }  
}

var frameCount = 0

function onFrameUpdateEvent(e) {
    if (frameCount % 2 != 0) {
        return
    }
    
    if (script.onPointerEventScript === undefined) {
        print("onPointerEventScript is undefined")
        return
    }
    
    if (script.onPointerEventScript.api.isPointing) {
        if (!isPointing) {
            print("Setting isPointing = true")
        }
        isPointing = true
        isObjectDetectionOn = true
        pointEndEventDelayRemaining = PointEndEventDelay
    }
    else if (pointEndEventDelayRemaining > 0) {
        pointEndEventDelayRemaining -= getDeltaTime()
        if (pointEndEventDelayRemaining <= 0) {
            print("point end delay expired")
            print("Setting isPointing = false")
            isPointing = false
        }
    }
    
    if (objectWasDetected || isPointing) {
        isObjectDetectionOn = true
        objectDetectEndEventDelayRemaining = ObjectDetectionEndEventDelay
    }
    else if (objectDetectEndEventDelayRemaining > 0) {
        objectDetectEndEventDelayRemaining -= getDeltaTime()
        if (objectDetectEndEventDelayRemaining <= 0) {
            print("object detection delay expired")
            isObjectDetectionOn = false
            objectWasDetected = false
        }
    }
    
    updateObjectDetectionState()
}

var frameUpdateEvent = script.createEvent("UpdateEvent")
frameUpdateEvent.bind(onFrameUpdateEvent)


function onDetectionsUpdated(results) {
    if (!isPointing && !isObjectDetectionOn) {
        return
    }
//    print("isObjectDetectionOn = " + isObjectDetectionOn)
    print("Doing object detection handling ...")
    
    var isObjectDetected = false
    
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
            isObjectDetected = false
//            print(i + ": undefined")
        }
    }
    
    objectWasDetected = isObjectDetected
}

if (script.mlOutputDecoderScript && script.mlOutputDecoderScript.api.addCallback) {
    script.mlOutputDecoderScript.api.addCallback(onDetectionsUpdated)
}
