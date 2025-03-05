import { JEELIZFACEFILTER, NN_4EXPR } from "facefilter";
import { JeelizThreeFiberHelper } from "../faceFilter/JeelizThreeFiberHelper";

// Constants and global variables for FaceFilter
const maxFacesDetected = 1;
const faceFollowers = new Array(maxFacesDetected);
let expressions = null;
let isFaceFilterInitialized = false;

// Initializing an array of expressions for face tracking
export const initExpressions = () => {
  expressions = [];
  for (let i = 0; i < maxFacesDetected; i++) {
    expressions.push({
      mouthOpen: 0,
      mouthSmile: 0,
      eyebrowFrown: 0,
      eyebrowRaised: 0,
    });
  }
};

// Getting the current array of expressions
export const getExpressions = () => expressions;

// Register an object that will track the position of the face
export const registerFaceFollower = (faceIndex, object3D) => {
  faceFollowers[faceIndex] = object3D;
};

// Callback for face tracking update
const callbackTrack = (detectStatesArg, threeFiberCamera) => {
  // console.log("INFO: JEELIZFACEFILTER IS TRACK");
  const detectStates = Array.isArray(detectStatesArg)
    ? detectStatesArg
    : [detectStatesArg];

  // Updating faceFollowers positions with helper
  JeelizThreeFiberHelper.update(detectStates, threeFiberCamera);

  // Video texture render
  JEELIZFACEFILTER.render_video();

  // Updating facial expression parameters
  detectStates.forEach((detectState, faceIndex) => {
    const exprIn = detectState.expressions;
    const expression = expressions[faceIndex];
    expression.mouthOpen = exprIn[0];
    expression.mouthSmile = exprIn[1];
    expression.eyebrowFrown = exprIn[2];
    expression.eyebrowRaised = exprIn[3];
  });
};

const callbackDetect = (faceIndex, isDetected) => {
  console.log(isDetected ? "DETECTED" : "LOST");
};

const callbackReady = (errCode, spec) => {
  console.log("INFO: START");
  if (errCode) {
    console.error("AN ERROR HAPPENS. ERR =", errCode);
    return;
  }

  console.log("INFO: JEELIZFACEFILTER IS READY");
  if (spec.videoElement) {
    spec.videoElement.addEventListener("loadedmetadata", () => {
      console.log(
        "Video metadata loaded:",
        spec.videoElement.videoWidth,
        spec.videoElement.videoHeight
      );
    });
  } else {
    console.warn("videoElement is missing from spec");
  }
  // Initializing faceFollowers via helper
  JeelizThreeFiberHelper.init(spec, faceFollowers, callbackDetect);
};

// FaceFilter initialization function
export const initFaceFilter = (faceFilterCanvasRef, threeFiberCamera) => {
  if (isFaceFilterInitialized) return;
  isFaceFilterInitialized = true;

  JEELIZFACEFILTER.init({
    canvas: faceFilterCanvasRef.current,
    NNC: NN_4EXPR,
    maxFacesDetected: maxFacesDetected,
    followZRot: true,
    callbackReady,
    callbackTrack: (detectStates) => callbackTrack(detectStates, threeFiberCamera),
  });
};

export const resizeFaceFilter = () => {
  JEELIZFACEFILTER.resize();
};

export const getMaxFacesDetected = () => maxFacesDetected;
