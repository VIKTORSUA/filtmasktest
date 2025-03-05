import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import FaceFollower from "./components/FaceFollower";
import ThreeGrabber from "./components/ThreeGrabber";
import {
  initFaceFilter,
  initExpressions,
  resizeFaceFilter,
} from "./services/faceFilterService";

// Function for calculating canvas sizes
const computeSizing = () => {
  const height = window.innerHeight;
  const wWidth = window.innerWidth;
  const width = Math.min(wWidth, height);
  const top = 0;
  const left = (wWidth - width) / 2;
  return { width, height, top, left };
};

const App = () => {
  const [sizing, setSizing] = useState(computeSizing());
  const [threeCamera, setThreeCamera] = useState(null);
  const faceFilterCanvasRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState("glasses.glb");

  // Initialize an array of expressions for face tracking
  useEffect(() => {
    initExpressions();
  }, []);

  // Handling window resizing
  const timerResize = useRef(null);
  const handleResize = () => {
    if (timerResize.current) {
      clearTimeout(timerResize.current);
    }
    timerResize.current = setTimeout(() => {
      setSizing(computeSizing());
    }, 200);
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  useEffect(() => {
    resizeFaceFilter();
  }, [sizing]);

  // Initializing FaceFilter with delay
  useLayoutEffect(() => {
    const timer = setTimeout(() => {
      console.log("Initializing FaceFilter with delay");
      if (threeCamera) {
        initFaceFilter(faceFilterCanvasRef, threeCamera);
      } else {
        console.warn("Three.js camera not ready yet");
      }
    }, 1000);
    return () => {
      clearTimeout(timer);
      if (window.JEELIZFACEFILTER) {
        window.JEELIZFACEFILTER.destroy();
      }
    };
  }, [threeCamera]);

  console.log("Rendering App component");
  return (
    <div>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          right: "10px",
          display: "flex",
          justifyContent: "center",
          zIndex: 1000,
        }}
      >
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="cube">Cube</option>
          <option value="glasses.glb">Glasses 1</option>
        </select>
      </div>
      <Canvas
        className="mirrorX"
        style={{
          position: "fixed",
          zIndex: 2,
          ...sizing,
        }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <ThreeGrabber sizing={sizing} setThreeFiberCamera={setThreeCamera} />
        <FaceFollower faceIndex={0} selectedModel={selectedModel} />
      </Canvas>

      <canvas
        className="mirrorX"
        ref={faceFilterCanvasRef}
        style={{
          position: "fixed",
          zIndex: 1,
          ...sizing,
        }}
        width={sizing.width}
        height={sizing.height}
      />
    </div>
  );
};

export default App;
