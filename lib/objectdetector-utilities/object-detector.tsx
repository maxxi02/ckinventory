"use client";

import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import Webcam from "react-webcam";
import { drawRect } from "@/lib/objectdetector-utilities/utilities";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2, Camera } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface DetectedObject {
  className: string;
  score: number;
  bbox: [number, number, number, number];
}

interface ObjectDetectorProps {
  onDetection: (objects: DetectedObject[]) => void;
  isActive: boolean;
  onActivationChange: (active: boolean) => void;
  autoCapture?: boolean;
  captureThreshold?: number;
}

const ObjectDetector = ({
  onDetection,
  isActive,
  onActivationChange,
  autoCapture = false,
  captureThreshold = 0.7,
}: ObjectDetectorProps) => {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [model, setModel] = useState<cocossd.ObjectDetection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
  const detectionRef = useRef<NodeJS.Timeout | null>(null);
  const [autoCloseEnabled, setAutoCloseEnabled] = useState(autoCapture);

  // Initialize TensorFlow.js and load the model
  useEffect(() => {
    const loadModel = async () => {
      try {
        await tf.ready();
        await tf.setBackend("webgl");
        console.log("Using tensorflow backend:", tf.getBackend());

        setIsLoading(true);
        const loadedModel = await cocossd.load();
        setModel(loadedModel);
        setIsLoading(false);

        console.log("Object detection model loaded successfully");
      } catch (error) {
        console.error("Error loading model:", error);
        setIsLoading(false);
        onActivationChange(false); // Disable detection on error
      }
    };

    if (isActive) {
      loadModel();
    }

    return () => {
      if (detectionRef.current) {
        clearInterval(detectionRef.current);
        detectionRef.current = null;
      }
    };
  }, [isActive, onActivationChange]);

  // Run object detection
  useEffect(() => {
    if (!isActive || !model || isLoading) return;

    const runDetection = async () => {
      if (detectionRef.current) {
        clearInterval(detectionRef.current);
      }

      detectionRef.current = setInterval(async () => {
        const detections = await detect();
        if (detections && detections.length > 0) {
          setDetectedObjects(detections);

          // Auto-capture if enabled and we have high confidence detections
          if (autoCloseEnabled) {
            const highConfidenceDetection = detections.find(
              (obj) => obj.score >= captureThreshold
            );

            if (highConfidenceDetection) {
              onDetection(detections);
              // Stop detection after auto-capture when autoClose is enabled
              onActivationChange(false);
            }
          }
        }
      }, 100);
    };

    runDetection();

    return () => {
      if (detectionRef.current) {
        clearInterval(detectionRef.current);
        detectionRef.current = null;
      }
    };
  }, [
    model,
    isActive,
    isLoading,
    autoCloseEnabled,
    captureThreshold,
    onDetection,
    onActivationChange,
  ]);

  // Update autoClose state when the prop changes
  useEffect(() => {
    setAutoCloseEnabled(autoCapture);
  }, [autoCapture]);

  // Perform a single detection
  const detect = async (): Promise<DetectedObject[] | null> => {
    if (!model || !webcamRef.current || !canvasRef.current) return null;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) return null;

    // Get video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    // Set video width and height
    video.width = videoWidth;
    video.height = videoHeight;

    // Set canvas height and width
    canvasRef.current.width = videoWidth;
    canvasRef.current.height = videoHeight;

    try {
      // Make detections
      const rawDetections = await model.detect(video);

      // Convert to our DetectedObject type
      const formattedDetections: DetectedObject[] = rawDetections.map(
        (detection) => ({
          className: detection.class,
          score: detection.score,
          bbox: detection.bbox as [number, number, number, number],
        })
      );

      // Draw detections on canvas
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, videoWidth, videoHeight);
        drawRect(rawDetections, ctx);
      }

      return formattedDetections;
    } catch (error) {
      console.error("Detection error:", error);
      return null;
    }
  };

  // Handle manual capture
  const handleCapture = () => {
    if (detectedObjects.length > 0) {
      onDetection(detectedObjects);
      if (autoCloseEnabled) {
        onActivationChange(false);
      }
    }
  };

  // Handle close
  const handleClose = () => {
    if (detectionRef.current) {
      clearInterval(detectionRef.current);
      detectionRef.current = null;
    }
    onActivationChange(false);
  };

  // Toggle auto-close feature
  const toggleAutoClose = () => {
    setAutoCloseEnabled(!autoCloseEnabled);
  };

  if (!isActive) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <Button
          onClick={() => onActivationChange(true)}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Camera size={16} />
          Start Object Detection
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] overflow-hidden border rounded-md">
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center z-20">
        <p className="text-sm font-medium text-white">Object Detector</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-7 px-2 text-xs text-white hover:bg-black hover:bg-opacity-30"
        >
          <XCircle size={16} />
        </Button>
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-white" />
            <p className="text-white text-sm">
              Loading object detection model...
            </p>
          </div>
        </div>
      )}

      <div className="relative w-full h-full">
        <Webcam
          ref={webcamRef}
          muted={true}
          mirrored={true}
          audio={false}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            facingMode: "environment",
          }}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 flex justify-between items-center z-20">
        <div className="flex items-center">
          <Switch
            id="auto-capture"
            checked={autoCloseEnabled}
            onCheckedChange={toggleAutoClose}
            className="mr-2"
          />
          <Label htmlFor="auto-capture" className="text-xs text-white">
            Auto Capture
          </Label>
        </div>
        <Button
          onClick={handleCapture}
          disabled={detectedObjects.length === 0}
          variant="outline"
          size="sm"
          className="h-7 px-2 text-xs bg-white hover:bg-gray-100"
        >
          Capture
        </Button>
      </div>
    </div>
  );
};

export default ObjectDetector;
