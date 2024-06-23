import type { GetImageResult } from "astro";
import IncursionExpandableItem from "./incursion-expandable-item";
import type { SingleIncursionProps } from "./incursion-expandable-item";
import { cn } from "../lib/utils";

type Props = {
  position: number;
  isMobile: boolean;
  title: string;
  incursions: SingleIncursionProps[];
  color: string;
  selected: boolean;
  isCollapsing: boolean;
};

const IncursionExpandable = ({
  position,
  isMobile,
  title,
  incursions,
  color,
  selected,
  isCollapsing,
}: Props) => {
  return (
    <div
      className={cn(
        "max-h-0 flex-col overflow-hidden transition-all duration-300 ease-linear",
        {
          "max-h-full": selected && !isCollapsing,
        },
      )}
      style={{
        gridColumnStart: 1,
        gridColumnEnd: isMobile ? 1 : 5,
        gridRowStart: isMobile ? position * 2 : 2,
        gridRowEnd: isMobile ? position * 2 : 2,
      }}
    >
      <h5 className="my-8 font-lilita text-4xl" style={{ color }}>
        {title}
      </h5>
      <div className="flex flex-col gap-4 p-4 min-[1000px]:flex-row">
        {incursions.map((incursion, idx) => (
          <IncursionExpandableItem
            key={idx}
            content={incursion.content}
            image={incursion.image}
            title={incursion.title}
            curriculumLinks={incursion.curriculumLinks}
            color={color}
          />
        ))}
      </div>
    </div>
  );
};

export default IncursionExpandable;
