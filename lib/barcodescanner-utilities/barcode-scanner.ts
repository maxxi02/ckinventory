// lib/barcodescanner-utilities/barcodeScanner.ts
import { Html5QrcodeScanner, Html5QrcodeCameraScanConfig } from "html5-qrcode";
import toast from "react-hot-toast";

// Added proper type for scanner configuration
interface ScannerOptions {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (errorMessage: string) => void;
  onScannerClosed?: () => void;
  fps?: number;
  qrboxSize?: { width: number; height: number }; // Changed to object for better control
  aspectRatio?: number;
}

class BarcodeScanner {
  private scanner: Html5QrcodeScanner | null = null;
  private options: ScannerOptions;
  private scannerDivId: string;
  private isActive = false;

  constructor(scannerDivId: string, options: ScannerOptions) {
    this.scannerDivId = scannerDivId;
    this.options = {
      fps: 10,
      qrboxSize: { width: 500, height: 500 },
      aspectRatio: 1.0,
      ...options,
    };
  }

  async start(): Promise<boolean> {
    if (typeof window === "undefined") return false;
    this.stop();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      // Immediately stop unused stream to prevent memory leaks
      stream.getTracks().forEach((track) => track.stop());

      const scannerElement = document.getElementById(this.scannerDivId);
      if (!scannerElement) {
        console.error(`Scanner element ${this.scannerDivId} not found`);
        return false;
      }

      scannerElement.innerHTML = "";

      const config: Html5QrcodeCameraScanConfig = {
        fps: this.options.fps || 10,
        qrbox: this.options.qrboxSize || { width: 250, height: 150 }, // More rectangular shape for barcodes
        aspectRatio: this.options.aspectRatio || 1.3, // Slightly wider aspect ratio
      };

      this.scanner = new Html5QrcodeScanner(this.scannerDivId, config, false);

      this.scanner.render(
        (decodedText) => this.handleScanSuccess(decodedText),
        (errorMessage) => this.handleScanError(errorMessage)
      );

      this.isActive = true;
      return true;
    } catch (error) {
      this.handleCameraError(error as Error);
      return false;
    }
  }

  private handleScanSuccess(decodedText: string): void {
    this.options.onScanSuccess(decodedText);

    this.stop();
  }

  private handleScanError(errorMessage: string): void {
    if (this.options.onScanError) {
      this.options.onScanError(errorMessage);
    }
  }

  private handleCameraError(error: Error): void {
    console.error("Camera error:", error);
    toast.error(
      error.message.includes("Permission")
        ? "Camera access denied. Please enable permissions."
        : "Camera unavailable. Check device support."
    );
  }

  stop(): void {
    try {
      if (this.scanner) {
        this.scanner.clear().catch((error) => {
          console.error("Cleanup error:", error);
        });
        this.scanner = null;
        this.isActive = false;
        this.options.onScannerClosed?.();
      }
    } catch (error) {
      console.error("Stop error:", error);
    }
  }

  isScanning(): boolean {
    return this.isActive;
  }
}

export default BarcodeScanner;
