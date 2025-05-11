import * as cocossd from "@tensorflow-models/coco-ssd";

export const drawRect = (
  detections: cocossd.DetectedObject[],
  ctx: CanvasRenderingContext2D
) => {
  detections.forEach((prediction) => {
    //get prediction results
    const [x, y, width, height] = prediction["bbox"];
    const text = prediction["class"];

    //set styling
    const color = "red";
    ctx.strokeStyle = color;
    ctx.font = "18px Arial";
    ctx.fillStyle = color;

    //draw rectangles and texts
    ctx.beginPath();
    ctx.fillText(text, x, y);
    ctx.rect(x, y, width, height);
    ctx.stroke();
  });
};
