// MLOutputDecoder.js
// Version: 0.0.1
// Event: OnAwake
// Description: Configures MLComponent and decodes output

//@input bool modelSettings
//@input string[] labels = {"Background", "Cup", "Car", "Cat", "TV", "Dog", "Potted Plant", "Bottle"} {"showIf" : "modelSettings"}
//@ui {"widget" : "separator", "showIf" : "modelSettings", "showIfValue": "false"}
//@ui {"widget" : "label", "label" : "Processing settings:"}
//@input float scoreThreshold = 0.5 {"widget" : "slider", "min" : 0, "max" : 1, "step" : 0.05}
//@input float iouThreshold = 0.5 {"widget" : "slider", "min" : 0, "max" : 1, "step" : 0.05}
//@input Component.ScriptComponent nmsIou
//@ui {"widget" : "separator"}
//@input bool modelInfo
//@input bool debug 


var classData;
var locatorData;
var anchorData;

var boxes = [];
var scores = [];


//Constants
var variance = [0.1, 0.2];
var SIZE_OF_FLOAT = 4;
var numClasses = script.labels.length;


//initialize
var mlComponent = script.getSceneObject().getComponent("Component.MLComponent");
mlComponent.onLoadingFinished = onLoadingFinished;
mlComponent.inferenceMode = MachineLearning.InferenceMode.CPU;
var outputs = mlComponent.getOutputs();


//list of callbacks to call once detections were processed
var onDetectionsUpdated = [];


function onLoadingFinished() {
    printInfo("Model built");
    
    //save references to the outputs data arrays 
    classData = outputs[0].data;
    locatorData = outputs[1].data;
    anchorData = outputs[2].data;
    
    if (numClasses != outputs[0].shape.x) {
        print("Warning - Number of classes != number of labels");
    }

    printInfo("Model can detect " + numClasses + " classes: ");
    for (var i = 0; i < numClasses; i++) {
        printInfo(i + " : " + "Label " + script.labels[i]);
    }

    script.createEvent("UpdateEvent").bind(onUpdate);
}


function onUpdate() {
    boxes = buildBoxes(anchorData, locatorData);
    scores = buildScores(classData);

    var result = script.nmsIou.api.nms(boxes, scores, script.scoreThreshold, script.iouThreshold);
    result.sort(compareByScoreReversed);

    for (var i = 0; i < onDetectionsUpdated.length; i++) {
        onDetectionsUpdated[i](result);
    }
}


// helper functions
function buildBoxes(anchors, locators) {
    var res = [];
    for (var i = 0; i < anchors.length; i += 4) {
        var xi = i;
        var yi = i + 1;
        var wi = i + 2;
        var hi = i + 3;

        var lx = locators[xi];
        var ly = locators[yi];
        var lw = locators[wi];
        var lh = locators[hi];

        var ax = anchors[xi];
        var ay = anchors[yi];
        var aw = anchors[wi];
        var ah = anchors[hi];

        var x = lx * variance[0] * aw + ax;
        var y = ly * variance[0] * ah + ay;
        var w = Math.exp(lw * variance[1]) * aw;
        var h = Math.exp(lh * variance[1]) * ah;

        res.push([x, y, w, h]);
    }

    return res;
}


function buildScores(scores) {
    var res = [];
    for (var i = 0; i < scores.length; i += 8) {
        var slice = new Float32Array(scores.buffer, (i + 1) * SIZE_OF_FLOAT, numClasses - 1);
        res.push(getMaxScore(slice));
    }

    return res;
}


function getMaxScore(slice) {
    var res = { cls: 0, score: 0 };

    for (var i = 0; i < slice.length; i++) {
        if (slice[i] > res.score) {
            res.score = slice[i];
            res.cls = i + 1;
        }
    }
    return res;
}


function compareByScoreReversed(a, b) {
    return b.score - a.score;
}


function printInfo(msg) {
    if (script.modelInfo) {
        print(msg);
    }
}


//public api
script.api.addCallback = function(cb) {
    onDetectionsUpdated.push(cb);
};

script.api.getLabels = function() {
    return script.labels;
};

