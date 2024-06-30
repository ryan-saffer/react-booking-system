import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  type HoverCardContentProps,
  type HoverCardProps,
  type HoverCardTriggerProps,
} from "@radix-ui/react-hover-card";
import {
  type PopoverContentProps,
  type PopoverProps,
  type PopoverTriggerProps,
} from "@radix-ui/react-popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

const TouchContext = createContext<boolean | undefined>(undefined);
const useTouch = () => useContext(TouchContext);

export const TouchProvider = (props: PropsWithChildren) => {
  const [isTouch, setTouch] = useState<boolean>();

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
    const onResize = () => {
      setTouch(window.matchMedia("(pointer: coarse)").matches);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    setTouch(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  return <TouchContext.Provider value={isTouch} {...props} />;
};

export const HybridHoverCard = (props: HoverCardProps & PopoverProps) => {
  const isTouch = useTouch();

  return isTouch ? <Popover {...props} /> : <HoverCard {...props} />;
};

export const HybridHoverCardTrigger = (
  props: HoverCardTriggerProps & PopoverTriggerProps,
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverTrigger {...props} asChild />
  ) : (
    <HoverCardTrigger {...props} />
  );
};

export const HybridHoverCardContent = (
  props: HoverCardContentProps & PopoverContentProps,
) => {
  const isTouch = useTouch();

  return isTouch ? (
    <PopoverContent {...props} />
  ) : (
    <HoverCardContent {...props} />
  );
};
