// components/UploadSection.tsx
"use client";
import React, { useState, useCallback } from "react";
import Image from "next/image";
import { Camera, Upload, RefreshCw } from "lucide-react";
import ReactCrop, { Crop, PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import styles from "@/app/page.module.css";

interface UploadSectionProps {
  file: File | null;
  previewUrl: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleReset: () => void;
  isProcessing: boolean;
  onCroppedImage?: (croppedImageUrl: string) => void;
  onProcessImage?: () => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({
  file,
  previewUrl,
  handleFileChange,
  handleDrop,
  handleDragOver,
  handleReset,
  isProcessing,
  onCroppedImage,
  onProcessImage,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop({ unit: "%", width: 50, height: 50, x: 25, y: 25 });
    },
    []
  );

  const applyCrop = useCallback(() => {
    if (completedCrop?.width && completedCrop?.height && previewUrl) {
      const image = new window.Image();
      image.src = previewUrl;

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      canvas.width = completedCrop.width;
      canvas.height = completedCrop.height;

      ctx.drawImage(
        image,
        completedCrop.x,
        completedCrop.y,
        completedCrop.width,
        completedCrop.height,
        0,
        0,
        completedCrop.width,
        completedCrop.height
      );

      const croppedImageUrl = canvas.toDataURL("image/jpeg");
      if (onCroppedImage) {
        onCroppedImage(croppedImageUrl);
      }
    }
  }, [completedCrop, previewUrl, onCroppedImage]);

  return (
    <section className={styles.uploadSection}>
      <div
        className={styles.dropZone}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {previewUrl ? (
          <div className={styles.previewContainer}>
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
            >
              <Image
                src={previewUrl}
                alt="Preview"
                width={400}
                height={300}
                className={styles.previewImage}
                onLoad={onImageLoad}
              />
            </ReactCrop>

            <div className={styles.imageControls}>
              <button
                className={styles.controlButton}
                onClick={applyCrop}
                disabled={
                  isProcessing ||
                  !completedCrop?.width ||
                  !completedCrop?.height
                }
              >
                Apply Crop
              </button>

              <button
                className={styles.resetButton}
                onClick={handleReset}
                disabled={isProcessing}
              >
                <RefreshCw size={16} />
                New Image
              </button>

              <button
                className={styles.processButton}
                onClick={onProcessImage}
                disabled={isProcessing}
              >
                Process Image
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.uploadPrompt}>
            <div className={styles.uploadIcon}>
              <Upload size={48} />
            </div>
            <h3>Drag & Drop or Click to Upload</h3>
            <p>Supported formats: JPG, PNG, JPEG (max 5MB)</p>
            <label className={styles.fileInputLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className={styles.fileInput}
              />
              <Camera size={16} />
              Choose Image
            </label>
          </div>
        )}
      </div>
    </section>
  );
};

export default UploadSection;
