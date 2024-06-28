import { AnimatePresence, motion } from "framer-motion";

import { ChevronDown } from "lucide-react";
import type { GetImageResult } from "astro";
import IncursionExpandable from "@/react-components/incursions/incursion-expandable";
import type { Module } from "./incursion-modules-section";
import type { SingleIncursionProps } from "./incursion-expandable-item";
import { cn } from "../lib/utils";

type Props = {
  position: number;
  isMobile: boolean;
  svg: string;
  title: string;
  subtitle: string;
  incursions: SingleIncursionProps[];
  color: string;
  selected: boolean;
  onClick: () => void;
};

export const IncursionModule = ({
  position,
  isMobile,
  svg,
  title,
  subtitle,
  incursions,
  color,
  selected,
  onClick,
}: Props) => {
  return (
    <>
      <div
        className="relative flex min-h-[340px] cursor-pointer flex-col justify-between rounded-md p-8 shadow-lg hover:bg-gray-50"
        style={{
          gridRowStart: isMobile ? position * 2 - 1 : 1,
          gridColumnStart: isMobile ? 1 : position,
          ...(selected && {
            boxShadow: selected && `0px 0px 30px 10px ${color}`,
          }),
        }}
        onClick={onClick}
      >
        <div className="flex flex-col gap-4">
          <img src={svg} className="h-20 w-fit" />
          <h5 className="font-lilita text-2xl">{title}</h5>
          <p className="text-xs">{subtitle}</p>
        </div>
        <p className="text-center text-xs uppercase text-cyan-400">
          Click to view incursions
        </p>
        <div
          className={cn(
            "absolute bottom-[-28px] left-0 right-0 m-auto flex h-14 w-14 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-500",
            { "-rotate-180": selected },
          )}
        >
          <ChevronDown color="#42D4F3" className="h-7 w-7" />
        </div>
      </div>
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: "auto",
              opacity: 1,
              transition: {
                height: {
                  duration: 0.3,
                },
                opacity: {
                  duration: 0.3,
                  repeatDelay: 0.15,
                },
              },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: {
                height: {
                  duration: 0.5,
                },
                opacity: {
                  duration: 0.25,
                },
              },
            }}
            style={{
              gridColumnStart: 1,
              gridColumnEnd: isMobile ? 1 : 5,
              gridRowStart: isMobile ? position * 2 : 2,
              gridRowEnd: isMobile ? position * 2 : 2,
            }}
          >
            <IncursionExpandable
              position={position}
              isMobile={isMobile}
              title={title}
              incursions={incursions}
              color={color}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
