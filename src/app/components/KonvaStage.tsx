"use client";

import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import dynamic from "next/dynamic";
import Konva from "konva";

// Dynamically import Konva components so they are client-only
const Stage = dynamic(
  async () => (await import("react-konva")).Stage,
  { ssr: false }
);
const Layer = dynamic(
  async () => (await import("react-konva")).Layer,
  { ssr: false }
);
const KonvaImage = dynamic(
  async () => (await import("react-konva")).Image,
  { ssr: false }
);
const Text = dynamic(
  async () => (await import("react-konva")).Text,
  { ssr: false }
);
const Transformer = dynamic(
  async () => (await import("react-konva")).Transformer,
  { ssr: false }
);

export interface KonvaStageHandle {
  getEditedFile: () => Promise<File>;
}

interface KonvaStageProps {
  imageSrc: string;
  filter: "none" | "grayscale" | "brightness" | "contrast";
  textOverlay: string;
  fontSize?: number;
  fontFamily?: string;
  textColor?: string;
}

const KonvaStage = forwardRef<KonvaStageHandle, KonvaStageProps>(
  (
    {
      imageSrc,
      filter,
      textOverlay,
      fontSize = 24,
      fontFamily = "Arial",
      textColor = "white",
    },
    ref
  ) => {
    const stageRef = useRef<Konva.Stage>(null);
    const imageRef = useRef<Konva.Image>(null);
    const textRef = useRef<Konva.Text>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [stageSize, setStageSize] = useState({ width: 400, height: 400 });

    // Load image
    useEffect(() => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setImage(img);
        const aspectRatio = img.width / img.height;
        const maxSize = 400;
        let newWidth = maxSize;
        let newHeight = maxSize;

        if (aspectRatio > 1) {
          newHeight = maxSize / aspectRatio;
        } else {
          newWidth = maxSize * aspectRatio;
        }

        setStageSize({ width: newWidth, height: newHeight });
      };
      img.src = imageSrc;
    }, [imageSrc]);

    // Apply filters
    useEffect(() => {
      if (!imageRef.current) return;

      const imageNode = imageRef.current;
      imageNode.cache();

      switch (filter) {
        case "grayscale":
          imageNode.filters([Konva.Filters.Grayscale]);
          break;
        case "brightness":
          imageNode.filters([Konva.Filters.Brighten]);
          imageNode.brightness(0.3);
          break;
        case "contrast":
          imageNode.filters([Konva.Filters.Contrast]);
          imageNode.contrast(20);
          break;
        default:
          imageNode.filters([]);
          break;
      }

      imageNode.getLayer()?.batchDraw();
    }, [filter]);

    // Handle selection
    useEffect(() => {
      if (!transformerRef.current) return;

      const transformer = transformerRef.current;
      if (selectedId) {
        const selectedNode = stageRef.current?.findOne(`#${selectedId}`);
        if (selectedNode) {
          transformer.nodes([selectedNode]);
        }
      } else {
        transformer.nodes([]);
      }

      transformer.getLayer()?.batchDraw();
    }, [selectedId]);

    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
      const target = e.target;
      if (!target) return;
    
      const clickedOnEmpty = target.getStage() === target;
      if (clickedOnEmpty) {
        setSelectedId(null);
        return;
      }
    
      const parent = target.getParent();
      const clickedOnTransformer = parent?.className === "Transformer";
      if (clickedOnTransformer) {
        return;
      }
    
      const name = target.name();
      const id = target.id();
      if (name === "text" || name === "image") {
        setSelectedId(id);
      } else {
        setSelectedId(null);
      }
    };
    

    useImperativeHandle(ref, () => ({
      getEditedFile: async (): Promise<File> => {
        if (!stageRef.current) throw new Error("Stage not ready");

        if (transformerRef.current) {
          transformerRef.current.hide();
        }

        const dataURL = stageRef.current.toDataURL({
          mimeType: "image/png",
          quality: 1,
          pixelRatio: 2,
        });

        if (transformerRef.current) {
          transformerRef.current.show();
        }

        const response = await fetch(dataURL);
        const blob = await response.blob();
        return new File([blob], "edited-image.png", { type: "image/png" });
      },
    }));

    return (
      <div className="flex flex-col items-center">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-6 rounded-3xl shadow-2xl border border-zinc-700 mb-4">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">
            Live Preview
          </h3>

          <div className="bg-white rounded-xl p-4 shadow-inner">
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onMouseDown={handleStageClick}
              onTouchStart={handleStageClick}
              className="border border-gray-300 rounded-lg"
            >
              <Layer>
                {image && (
                  <KonvaImage
                    ref={imageRef}
                    id="background-image"
                    name="image"
                    image={image}
                    width={stageSize.width}
                    height={stageSize.height}
                    onClick={() => setSelectedId("background-image")}
                  />
                )}

                <Text
                  ref={textRef}
                  id="text-overlay"
                  name="text"
                  text={textOverlay}
                  x={50}
                  y={50}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                  fill={textColor}
                  stroke="black"
                  strokeWidth={2}
                  draggable
                  onClick={() => setSelectedId("text-overlay")}
                  onTap={() => setSelectedId("text-overlay")}
                />

                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    if (newBox.width < 10 || newBox.height < 10) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  rotateEnabled={true}
                  enabledAnchors={[
                    "top-left",
                    "top-right",
                    "bottom-left",
                    "bottom-right",
                    "middle-left",
                    "middle-right",
                  ]}
                />
              </Layer>
            </Stage>
          </div>
        </div>

        <div className="text-center text-sm text-zinc-400 max-w-xs">
          <p className="mb-2">
            🎨 <strong>Click and drag</strong> the text to move it around
          </p>
          <p>
            📐 <strong>Select and resize</strong> text using the corner handles
          </p>
        </div>
      </div>
    );
  }
);

KonvaStage.displayName = "KonvaStage";

export default KonvaStage;
