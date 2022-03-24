// -----JS CODE-----
// @input float speed = 1.0 {"widget": "slider", "min": 0, "max": 10.0, "step": 0.01}
// @input float range = 10.0 {"widget": "slider", "min": 0, "max": 30.0, "step": 0.01}

// Calculate the new height of the Scene Object and store it in newY.
var newY = Math.sin(getTime() * script.speed) * script.range;

// Set the new local position of the Scene Object to [0, newY, 0].
script.getSceneObject().getTransform().setLocalPosition(new vec3(0, newY, 0));

script.get