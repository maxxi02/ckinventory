// lib/objectDetector.ts
import toast from "react-hot-toast";
import * as tf from "@tensorflow/tfjs";

type ObjectDetectionModel = tf.GraphModel;

interface ObjectDetectorOptions {
  onDetectionSuccess: (detections: DetectedObject[]) => void;
  onDetectionError?: (errorMessage: string) => void;
  onDetectorClosed?: () => void;
  confidenceThreshold?: number;
  maxDetections?: number;
  autoCloseOnDetection?: boolean;
}

export interface DetectedObject {
  className: string;
  score: number;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

class ObjectDetector {
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private model: ObjectDetectionModel | null = null;
  private animationFrameId: number | null = null;
  private options: ObjectDetectorOptions;
  private detectorDivId: string;
  private isActive = false;
  private stream: MediaStream | null = null;

  constructor(detectorDivId: string, options: ObjectDetectorOptions) {
    this.detectorDivId = detectorDivId;
    this.options = {
      confidenceThreshold: 0.5,
      maxDetections: 5,
      autoCloseOnDetection: false,
      ...options,
    };
  }

  async start(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    this.stop();

    try {
      // Load the COCO-SSD model
      const loadingToast = toast.loading("Loading object detection model...");

      // Use the correct COCO-SSD model URL format
      this.model = await tf.loadGraphModel(
        "https://tfhub.dev/tensorflow/tfjs-model/ssd_mobilenet_v2/1/default/1",
        { fromTFHub: true }
      );

      // Verify the model loaded correctly
      if (!this.model) {
        throw new Error("Failed to load the object detection model");
      }

      toast.dismiss(loadingToast);
      toast.success("Object detection model loaded");

      // Get access to the camera
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Find or create the detector container
      const detectorElement = document.getElementById(this.detectorDivId);
      if (!detectorElement) {
        console.error(`Detector element ${this.detectorDivId} not found`);
        return false;
      }

      detectorElement.innerHTML = "";

      // Create video element
      this.video = document.createElement("video");
      this.video.setAttribute("autoplay", "true");
      this.video.setAttribute("playsinline", "true");
      this.video.style.width = "100%";
      this.video.style.height = "100%";
      this.video.style.objectFit = "cover";
      detectorElement.appendChild(this.video);

      // Create canvas for drawing detection results
      this.canvas = document.createElement("canvas");
      this.canvas.style.position = "absolute";
      this.canvas.style.top = "0";
      this.canvas.style.left = "0";
      this.canvas.style.width = "100%";
      this.canvas.style.height = "100%";
      detectorElement.appendChild(this.canvas);

      // Set up the video stream
      this.video.srcObject = this.stream;
      await new Promise<void>((resolve) => {
        if (this.video) {
          this.video.onloadedmetadata = () => {
            resolve();
          };
        }
      });

      // Start video playback
      await this.video.play();

      // Resize canvas to match video dimensions
      if (this.canvas && this.video) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      }

      // Start detection loop
      this.isActive = true;
      this.detectFrame();
      return true;
    } catch (error) {
      this.handleError(error as Error);
      return false;
    }
  }

  private async detectFrame(): Promise<void> {
    if (!this.model || !this.video || !this.isActive) return;

    try {
      // Detect objects in the video frame
      const tfImg = tf.browser.fromPixels(this.video);
      const expandedImg = tfImg.expandDims(0);

      // Execute model and handle output tensors correctly
      const result = (await this.model.executeAsync(
        expandedImg
      )) as tf.Tensor[];

      // Fix: COCO-SSD TFHub model returns tensors in different format
      // Get correct tensors based on model output structure
      let boxes: number[][] = [];
      let scores: number[] = [];
      let classes: number[] = [];

      // For TFHub SSD MobileNet V2 model, the output format is:
      // - First tensor: Detection boxes
      // - Second tensor: Detection scores
      // - Third tensor: Detection classes
      // - Fourth tensor: Number of detections
      if (result.length >= 4) {
        // Standard TFHub format
        boxes = (await result[1].arraySync()) as number[][];
        scores = (await result[2].arraySync()) as number[];
        classes = (await result[0].arraySync()) as number[];
      } else if (result.length >= 2) {
        // Alternative TFHub format (some models return fewer tensors)
        const detections = (await result[0].arraySync()) as number[][][];
        const numDetections = (await result[1].arraySync()) as number[];

        // Extract data from combined tensor
        if (detections && detections.length > 0 && detections[0].length > 0) {
          const validDetections = Math.min(
            numDetections[0],
            detections[0].length
          );

          for (let i = 0; i < validDetections; i++) {
            // Format: [y1, x1, y2, x2, score, class]
            if (detections[0][i].length >= 6) {
              const y1 = detections[0][i][0];
              const x1 = detections[0][i][1];
              const y2 = detections[0][i][2];
              const x2 = detections[0][i][3];

              // Convert to [y, x, height, width] format
              boxes.push([y1, x1, y2 - y1, x2 - x1]);
              scores.push(detections[0][i][4]);
              classes.push(detections[0][i][5]);
            }
          }
        }
      }

      // Clean up tensors to prevent memory leaks
      tfImg.dispose();
      expandedImg.dispose();
      result.forEach((tensor) => tensor.dispose());

      // Process detections if we have valid results
      if (boxes.length > 0 && scores.length > 0 && classes.length > 0) {
        // Draw bounding boxes and extract detection data
        const detections = this.processDetections(boxes, scores, classes);

        // Call success callback with detected objects
        if (detections.length > 0) {
          this.options.onDetectionSuccess(detections);

          // Auto close after successful detection if enabled
          if (this.options.autoCloseOnDetection) {
            this.stop();
            return;
          }
        }
      }

      // Continue detection loop only if still active
      if (this.isActive) {
        this.animationFrameId = requestAnimationFrame(() => this.detectFrame());
      }
    } catch (error) {
      console.error("Detection error:", error);
      if (this.options.onDetectionError) {
        this.options.onDetectionError((error as Error).message);
      }
      this.stop();
    }
  }

  private processDetections(
    boxes: number[][],
    scores: number[],
    classes: number[]
  ): DetectedObject[] {
    const ctx = this.canvas?.getContext("2d");
    if (!ctx || !this.canvas) return [];

    // Clear previous drawings
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Add semi-transparent overlay for better visibility of labels
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    const detectedObjects: DetectedObject[] = [];

    // Process each detection
    for (let i = 0; i < scores.length; i++) {
      // Use safe threshold access with fallback
      const threshold = this.options.confidenceThreshold ?? 0.5;

      if (scores[i] >= threshold) {
        const className = this.getClassName(classes[i]);
        const score = scores[i];

        // Get bounding box coordinates
        // Handle potential undefined values
        if (!boxes[i] || boxes[i].length < 4) continue;

        const [y, x, height, width] = boxes[i];
        const boundingBox = {
          x: x * this.canvas.width,
          y: y * this.canvas.height,
          width: width * this.canvas.width,
          height: height * this.canvas.height,
        };

        // Generate a color based on class name for consistency
        const hue = Math.abs(
          className
            .split("")
            .reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
        );
        const boxColor = `hsla(${hue}, 100%, 50%, 0.9)`;
        const textColor = `hsla(${hue}, 100%, 85%, 1)`;

        // Draw bounding box with thicker line
        ctx.lineWidth = 3;
        ctx.strokeStyle = boxColor;
        ctx.setLineDash([]);
        ctx.strokeRect(
          boundingBox.x,
          boundingBox.y,
          boundingBox.width,
          boundingBox.height
        );

        // Add dashed outline for better visibility
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.setLineDash([5, 5]);
        ctx.strokeRect(
          boundingBox.x,
          boundingBox.y,
          boundingBox.width,
          boundingBox.height
        );
        ctx.setLineDash([]);

        // Create label text
        const label = `${className}: ${Math.round(score * 100)}%`;

        // Set up font for better readability
        ctx.font = "bold 16px Arial";
        const textWidth = ctx.measureText(label).width;
        const padding = 8;

        // Draw label background - ensure it stays within canvas
        ctx.fillStyle = boxColor;
        const labelY = Math.max(boundingBox.y - 30, padding);
        ctx.fillRect(boundingBox.x, labelY, textWidth + padding * 2, 30);

        // Add border to label background
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.strokeRect(boundingBox.x, labelY, textWidth + padding * 2, 30);

        // Draw label text
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillText(label, boundingBox.x + padding, labelY + 20);

        // Add outline to text for better visibility
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = textColor;
        ctx.strokeText(label, boundingBox.x + padding, labelY + 20);

        // Draw confidence meter at bottom of bounding box if there's room
        if (boundingBox.height > 40) {
          const meterWidth = boundingBox.width;
          const meterHeight = 8;
          const meterY = boundingBox.y + boundingBox.height + 5;

          // Background
          ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
          ctx.fillRect(boundingBox.x, meterY, meterWidth, meterHeight);

          // Fill based on confidence
          ctx.fillStyle = boxColor;
          ctx.fillRect(boundingBox.x, meterY, meterWidth * score, meterHeight);
        }

        // Add to detected objects array
        detectedObjects.push({
          className,
          score,
          boundingBox,
        });

        // Limit number of detections
        // Safe access to maxDetections with fallback
        const maxDetections = this.options.maxDetections ?? 5;
        if (detectedObjects.length >= maxDetections) {
          break;
        }
      }
    }

    // Add overall detection info at top of screen if objects were detected
    if (detectedObjects.length > 0) {
      const infoText = `Detected ${detectedObjects.length} object${detectedObjects.length !== 1 ? "s" : ""}`;
      ctx.font = "bold 18px Arial";
      const infoWidth = ctx.measureText(infoText).width;

      // Draw info background
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(
        (this.canvas.width - infoWidth) / 2 - 15,
        10,
        infoWidth + 30,
        35
      );

      // Draw info text
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(infoText, (this.canvas.width - infoWidth) / 2, 35);
    }

    return detectedObjects;
  }

  // Map class IDs to class names (COCO dataset classes)
  private getClassName(classId: number): string {
    const cocoClasses = [
      "person",
      "bicycle",
      "car",
      "motorcycle",
      "airplane",
      "bus",
      "train",
      "truck",
      "boat",
      "traffic light",
      "fire hydrant",
      "stop sign",
      "parking meter",
      "bench",
      "bird",
      "cat",
      "dog",
      "horse",
      "sheep",
      "cow",
      "elephant",
      "bear",
      "zebra",
      "giraffe",
      "backpack",
      "umbrella",
      "handbag",
      "tie",
      "suitcase",
      "frisbee",
      "skis",
      "snowboard",
      "sports ball",
      "kite",
      "baseball bat",
      "baseball glove",
      "skateboard",
      "surfboard",
      "tennis racket",
      "bottle",
      "wine glass",
      "cup",
      "fork",
      "knife",
      "spoon",
      "bowl",
      "banana",
      "apple",
      "sandwich",
      "orange",
      "broccoli",
      "carrot",
      "hot dog",
      "pizza",
      "donut",
      "cake",
      "chair",
      "couch",
      "potted plant",
      "bed",
      "dining table",
      "toilet",
      "tv",
      "laptop",
      "mouse",
      "remote",
      "keyboard",
      "cell phone",
      "microwave",
      "oven",
      "toaster",
      "sink",
      "refrigerator",
      "book",
      "clock",
      "vase",
      "scissors",
      "teddy bear",
      "hair drier",
      "toothbrush",
    ];

    // Check for valid index
    return classId >= 0 && classId < cocoClasses.length
      ? cocoClasses[classId]
      : "unknown";
  }

  private handleError(error: Error): void {
    console.error("Object detector error:", error);
    toast.error(
      error.message.includes("Permission")
        ? "Camera access denied. Please enable permissions."
        : "Object detection failed. Check device support."
    );
    this.stop();
  }

  captureDetection(): Promise<DetectedObject[]> {
    return new Promise((resolve) => {
      if (!this.isActive || !this.video || !this.canvas || !this.model) {
        resolve([]);
        return;
      }

      // Single frame detection
      const runDetection = async () => {
        try {
          const tfImg = tf.browser.fromPixels(this.video!);
          const expandedImg = tfImg.expandDims(0);

          // Execute model and handle output tensors
          const result = (await this.model!.executeAsync(
            expandedImg
          )) as tf.Tensor[];

          // Fix: Handle different model output formats
          let boxes: number[][] = [];
          let scores: number[] = [];
          let classes: number[] = [];

          if (result.length >= 4) {
            // Standard TFHub format
            boxes = (await result[1].arraySync()) as number[][];
            scores = (await result[2].arraySync()) as number[];
            classes = (await result[0].arraySync()) as number[];
          } else if (result.length >= 2) {
            // Alternative format
            const detections = (await result[0].arraySync()) as number[][][];
            const numDetections = (await result[1].arraySync()) as number[];

            if (
              detections &&
              detections.length > 0 &&
              detections[0].length > 0
            ) {
              const validDetections = Math.min(
                numDetections[0],
                detections[0].length
              );

              for (let i = 0; i < validDetections; i++) {
                if (detections[0][i].length >= 6) {
                  const y1 = detections[0][i][0];
                  const x1 = detections[0][i][1];
                  const y2 = detections[0][i][2];
                  const x2 = detections[0][i][3];

                  boxes.push([y1, x1, y2 - y1, x2 - x1]);
                  scores.push(detections[0][i][4]);
                  classes.push(detections[0][i][5]);
                }
              }
            }
          }

          // Clean up tensors
          tfImg.dispose();
          expandedImg.dispose();
          result.forEach((tensor) => tensor.dispose());

          // Process detections
          if (boxes.length > 0 && scores.length > 0 && classes.length > 0) {
            const detections = this.processDetections(boxes, scores, classes);

            // Auto close after capturing if enabled
            if (detections.length > 0 && this.options.autoCloseOnDetection) {
              this.stop();
            }

            resolve(detections);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error("Capture error:", error);
          resolve([]);
        }
      };

      runDetection();
    });
  }

  stop(): void {
    // Set inactive state first to prevent new animation frames
    this.isActive = false;

    // Stop animation frame
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // Stop media stream
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    // Clean up video element
    if (this.video) {
      this.video.srcObject = null;
      this.video.pause();
      this.video = null;
    }

    // Clear canvas
    if (this.canvas) {
      const ctx = this.canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      this.canvas = null;
    }

    // Clean up model resources
    if (this.model) {
      // No need to dispose the model as it might be reused
      this.model = null;
    }

    // Call close callback
    if (this.options.onDetectorClosed) {
      this.options.onDetectorClosed();
    }
  }

  isDetecting(): boolean {
    return this.isActive;
  }
}

export default ObjectDetector;
