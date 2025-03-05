import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import {
  getExpressions,
  registerFaceFollower,
} from "../services/faceFilterService";

const styleBox = {
  position: "absolute",
  background: "rgba(255,255,255,0.5)",
  padding: "5px",
  borderRadius: "5px",
  zIndex: 1000,
};

const FaceFollower = ({ faceIndex, selectedModel }) => {
  const objRef = useRef();
  const mouthOpenRef = useRef();
  const mouthSmileRef = useRef();

  const [modelScale, setModelScale] = useState(0);
  const [verticalOffset, setVerticalOffset] = useState(0);
  const [horizontalOffset, setHorizontalOffset] = useState(0);

  // States for loaded GLTF model
  const [gltfModel, setGltfModel] = useState(null);

  // load GLTF model
  useEffect(() => {
    if (selectedModel !== "cube") {
      const loader = new GLTFLoader();
      const modelUrl = selectedModel.startsWith("/")
        ? selectedModel
        : `/${selectedModel}`;
      loader.load(
        modelUrl,
        (gltf) => {
          setGltfModel(gltf);
          setModelScale(8);
        },
        undefined,
        (error) => {
          console.error("load GLTF model:", error);
          setGltfModel(null);
        }
      );
    } else {
      setGltfModel(null);
      setModelScale(1);
    }
    setVerticalOffset(0);
    setHorizontalOffset(0);
  }, [selectedModel]);

  // Register FaceFollower to update position
  useEffect(() => {
    if (objRef.current) {
      registerFaceFollower(faceIndex, objRef.current);
    }
  }, [faceIndex]);

  useFrame(() => {
    // If you use the "cube" fallback, you can update the animation of expressions
    if (selectedModel === "cube") {
      const expressions = getExpressions();
      if (expressions && expressions.length > 0) {
        const expression = expressions[0];
        if (mouthOpenRef.current) {
          const scale = Math.max(0.001, expression.mouthOpen);
          mouthOpenRef.current.scale.set(scale, 1, scale);
        }
        if (mouthSmileRef.current) {
          const scale = Math.max(0.001, expression.mouthSmile);
          mouthSmileRef.current.scale.set(scale, 1, scale);
        }
      }
    }
  });

  return (
    <>
      {/* The main object that controls the face tracking position */}
      <object3D ref={objRef}>
        {/* The group into which the transformations from the sliders are implemented */}
        <group
          scale={[modelScale, modelScale, modelScale]}
          position={[horizontalOffset, verticalOffset, 0]}
        >
          {selectedModel === "cube" || !gltfModel ? (
            // Displaying a standard 3D model (cube) with additional primitives
            <>
              <mesh name="mainCube">
                <primitive object={new THREE.BoxGeometry(1, 1, 1)} />
                <meshNormalMaterial />
              </mesh>
              <mesh
                ref={mouthOpenRef}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, -0.2, 0.2]}
              >
                <cylinderGeometry args={[0.3, 0.3, 1, 32]} />
                <meshBasicMaterial color={0xff0000} />
              </mesh>
              <mesh
                ref={mouthSmileRef}
                rotation={[Math.PI / 2, 0, 0]}
                position={[0, -0.2, 0.2]}
              >
                <cylinderGeometry
                  args={[0.5, 0.5, 1, 32, 1, false, -Math.PI / 2, Math.PI]}
                />
                <meshBasicMaterial color={0xff0000} />
              </mesh>
            </>
          ) : (
            // If the model is loaded successfully, we display it
            <primitive object={gltfModel.scene} />
          )}
        </group>
      </object3D>

      {/* HTML elements for controls (rendered via <Html> from drei) */}
      {/* Scale slider - left, vertical */}
      <Html fullscreen>
        <div
          style={{
            ...styleBox,
            top: "50%",
            left: "10px",
            transform: "translateX(-40%) rotate(-90deg)",
          }}
        >
          -
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={modelScale}
            onChange={(e) => setModelScale(parseFloat(e.target.value))}
            style={{ width: "150px" }}
          />
          +
        </div>

        {/* Vertical offset slider - right, vertical */}
        <div
          style={{
            ...styleBox,
            top: "50%",
            right: "10px",
            transform: "translateX(40%) rotate(-90deg)",
          }}
        >
          <input
            type="range"
            min="-5"
            max="5"
            step="0.1"
            value={verticalOffset}
            onChange={(e) => setVerticalOffset(parseFloat(e.target.value))}
            style={{ width: "150px" }}
          />
        </div>

        {/* Horizontal offset slider - bottom, horizontal */}
        <div
          style={{
            ...styleBox,
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={horizontalOffset}
            onChange={(e) => setHorizontalOffset(parseFloat(e.target.value))}
            style={{ width: "150px" }}
          />
        </div>
      </Html>
    </>
  );
};

export default FaceFollower;
