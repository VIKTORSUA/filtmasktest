import React, { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { JeelizThreeFiberHelper } from "../faceFilter/JeelizThreeFiberHelper";

const ThreeGrabber = ({ sizing, setThreeFiberCamera }) => {
  const { camera } = useThree();

  // Pass the camera to the parent component
  useEffect(() => {
    setThreeFiberCamera(camera);
  }, [camera, setThreeFiberCamera]);

  useFrame(() => {
    JeelizThreeFiberHelper.update_camera(sizing, camera);
  });

  return null;
};

export default ThreeGrabber;
