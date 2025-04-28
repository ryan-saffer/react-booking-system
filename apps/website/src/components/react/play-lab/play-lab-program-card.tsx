import { useEffect, useRef, useState, type ReactNode } from "react";

import { Button } from "../ui/button";
import { ChevronDown } from "lucide-react";
import type { CustomImage } from "@/types/types";
import { HoverTag } from "./tooltip-tag";
import PrimaryButton from "@/components/primary-button.astro";
import { cn } from "../lib/utils";

const PlayLabProgramCard = ({
  position,
  isMobile,
  selected,
  queued,
  content,
  onClick,
  children,
}: {
  position: number;
  isMobile: boolean;
  selected: boolean;
  queued: boolean;
  content: {
    img: CustomImage;
    color: string;
    title: string;
    subtitle: string;
    description: string;
    buttons: { content: string; color: string; tooltip: string }[];
  };
  onClick: () => void;
  children: ReactNode;
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [maxH, setMaxH] = useState("0px");

  useEffect(() => {
    if (contentRef.current && typeof window !== "undefined") {
      setMaxH(selected ? `${contentRef.current.scrollHeight}px` : "0px");
    }
  }, [selected]);

  return (
    <>
      <div
        className="relative flex min-h-[340px] cursor-pointer flex-col rounded-xl shadow-lg hover:bg-gray-50"
        style={{
          gridRowStart: isMobile ? position * 2 - 1 : 1,
          gridColumnStart: isMobile ? 1 : position,
          ...(selected && {
            boxShadow: selected && `0px 0px 30px 10px ${content.color}`,
          }),
          ...(queued && {
            boxShadow: queued && `0px 0px 30px 10px ${content.color}`,
          }),
        }}
        onClick={onClick}
      >
        <div className="h-52 flex-shrink-0 overflow-hidden rounded-t-xl">
          <img
            src={content.img.image.src}
            alt={content.img.alt}
            width={500}
            className="h-full w-full rounded-t-xl object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
          />
        </div>
        <div
          slot="content"
          className="flex h-max flex-grow flex-col justify-between p-8 @container"
        >
          <div>
            <p
              className="font-lilita text-4xl"
              style={{ color: content.color }}
            >
              {content.title}
            </p>
            <p className="mt-2 text-lg font-semibold">{content.subtitle}</p>
            <p className="mt-5">{content.description}</p>
          </div>
          <div className="mb-4 mt-6 flex flex-col gap-4 @[18rem]:flex-row">
            {content.buttons.map((button) => (
              <HoverTag
                color={button.color}
                text={button.content}
                tooltip={button.tooltip}
              />
            ))}
          </div>
        </div>
        <div
          className={cn(
            "absolute bottom-[-28px] left-0 right-0 m-auto flex h-14 w-14 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500",
            { "-rotate-180": selected },
          )}
        >
          <ChevronDown color="#42D4F3" className="h-7 w-7" />
        </div>
      </div>

      <div
        ref={contentRef}
        style={{
          maxHeight: maxH,
          transition: "max-height .7s ease",
          gridColumnStart: 1,
          gridColumnEnd: isMobile ? 1 : 5,
          gridRowStart: isMobile ? position * 2 : 2,
          gridRowEnd: isMobile ? position * 2 : 2,
        }}
        className="mt-8 overflow-hidden"
      >
        {children}
      </div>
    </>
  );
};

export default PlayLabProgramCard;
