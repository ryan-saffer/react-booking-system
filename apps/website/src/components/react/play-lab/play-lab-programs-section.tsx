import { useEffect, useState } from "react";

import { Button } from "../ui/button";
import type { CustomImage } from "@/types/types";
import PlayLabProgramCard from "./play-lab-program-card";
import { cn } from "../lib/utils";

type Module = "little-explorers" | "create-kinders" | "all-playz" | null;

const PlayLabProgramsSection = ({
  littleExplorersImage,
  creativeKindersImage,
  allPlaysImage,
}: {
  littleExplorersImage: CustomImage;
  creativeKindersImage: CustomImage;
  allPlaysImage: CustomImage;
}) => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    setIsMobile(window.innerWidth < 1000);
    const onResize = () => {
      setIsMobile(window.innerWidth < 1000);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [selectedModule, setSelectedModule] = useState<Module>(null);
  const [queuedModule, setQueuedModule] = useState<Module>(null);

  useEffect(() => {
    if (selectedModule === null && queuedModule !== null) {
      const t = window.setTimeout(() => {
        setSelectedModule(queuedModule);
        setQueuedModule(null);
      }, 700);
      return () => window.clearTimeout(t);
    }
  }, [selectedModule, queuedModule]);

  const handleModuleClicked = (newModule: Module) => {
    // handle a card is already queued to be closed
    if (selectedModule === null && queuedModule !== null) {
      setQueuedModule(newModule);
    } else if (selectedModule === null) {
      setSelectedModule(newModule);
    } else if (selectedModule === newModule) {
      setSelectedModule(null);
    } else {
      if (isMobile) {
        setSelectedModule(newModule);
      } else {
        setQueuedModule(newModule);
        setSelectedModule(null);
      }
    }
  };

  return (
    <div
      className={cn("mb-16 grid grid-cols-3 gap-8", {
        "grid-cols-1 gap-4": isMobile,
      })}
    >
      <PlayLabProgramCard
        position={1}
        isMobile={isMobile}
        onClick={() => handleModuleClicked("little-explorers")}
        selected={selectedModule === "little-explorers"}
        queued={queuedModule === "little-explorers"}
        content={{
          img: littleExplorersImage,
          color: "#4DC5D9",
          title: "Little Explorers",
          subtitle: "18 months - 3 years",
          description:
            "Designed for toddlers on the move, experience sensory-rich fun that supports early development through play.",
          buttons: [
            {
              color: "#F6BA33",
              content: "Stay and play",
              tooltip:
                "A parent or guardian is expected to stay and play with the child for the entire session.",
            },
          ],
        }}
      >
        <div className="relative left-1/2 -translate-x-1/2 rounded-3xl bg-[#4DC5D9]/60 p-4 sm:p-8 lg:p-16">
          <p className="text-center font-lilita text-4xl text-white sm:text-6xl">
            Little Explorers
          </p>
          <p className="mt-2 text-center font-lilita text-2xl font-semibold">
            18 months - 3 years
          </p>
          <p className="mt-4 text-center text-lg">
            Designed for toddlers on the move, experience sensory-rich fun that
            supports early development through play.
          </p>
          <img
            className="my-12 h-60 w-full rounded-lg object-cover"
            src={littleExplorersImage.image.src}
            alt="ALl ages banner"
          />
          <div className="flex flex-col gap-12 md:flex-row">
            <div className="flex w-full flex-col gap-8 md:w-1/2">
              <div className="relative z-10 h-full rounded-lg bg-white p-8 shadow-md">
                <p className="mb-4 font-lilita text-4xl text-[#8C52FF]">When</p>
                <p className="text-xl font-extrabold">Thursdays</p>
                <p className="text-lg">9:15am - 10:00am</p>
              </div>
              <div className="relative z-10 h-full rounded-lg bg-white p-8 shadow-md">
                <p className="mb-4 font-lilita text-4xl text-[#42D4F3]">
                  Pricing
                </p>
                <p className="text-xl font-extrabold">Casual</p>
                <p className="mb-2 text-lg">$35</p>
                <p className="text-xl font-extrabold">Term Pack</p>
                <p className="text-lg">
                  $240 <span className="italic">($30 pw)</span>
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col rounded-lg bg-white p-8 shadow-md md:w-1/2">
              <p className="mb-4 text-2xl font-bold">
                Learning grows week by week over the term, guided by past
                adventures.
              </p>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="mb-2 font-gotham text-xl">
                    Activities include:
                  </p>
                  <ul className="mb-4 list-disc pl-4">
                    <li>Dry Sensory Play Stations</li>
                    <li>Wet Sensory Play Stations</li>
                    <li>Creative Art Stations</li>
                    <li>Magnet Gravity Play Wall</li>
                    <li>Sensory Swing (yes, an actual swing!)</li>
                    <li>Weaving Peg Wall Station</li>
                    <li>
                      Dancing, music games & imaginative group activities!
                    </li>
                  </ul>
                </div>
                <Button className="bg-[#9044E2] hover:bg-[#9044E2]/90">
                  Register Interest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PlayLabProgramCard>
      <PlayLabProgramCard
        position={2}
        isMobile={isMobile}
        onClick={() => handleModuleClicked("create-kinders")}
        selected={selectedModule === "create-kinders"}
        queued={queuedModule === "create-kinders"}
        content={{
          img: creativeKindersImage,
          color: "#9ECC45",
          title: "Creative Kinders",
          subtitle: "3 - 5 years",
          description:
            "Hands-on fun designed to inspire creativity, confidence, and messy curiosity!",
          buttons: [
            {
              color: "#F6BA33",
              content: "Stay and play",
              tooltip:
                "A parent or guardian is welcome to stay and play with the child for the entire session.",
            },
            {
              color: "#EE1071",
              content: "Drop and go",
              tooltip:
                "Kids can be left with us for the session, or you are welcome to stay and play!",
            },
          ],
        }}
      >
        <div className="relative left-1/2 -translate-x-1/2 rounded-3xl bg-[#9ECC45]/60 p-4 sm:p-8 lg:p-16">
          <p className="text-center font-lilita text-4xl text-white sm:text-6xl">
            Creative Kinders
          </p>
          <p className="mt-2 text-center font-lilita text-2xl font-semibold">
            3 - 5 years
          </p>
          <p className="mt-4 text-center text-lg">
            Hands-on fun designed to inspire creativity, confidence, and messy
            curiosity!
          </p>
          <img
            className="my-12 h-60 w-full rounded-lg object-cover"
            src={creativeKindersImage.image.src}
            alt="ALl ages banner"
          />
          <div className="flex flex-col gap-12 md:flex-row">
            <div className="flex w-full flex-col gap-8 md:w-1/2">
              <div className="relative z-10 h-full rounded-lg bg-white p-8 shadow-md">
                <p className="mb-4 font-lilita text-4xl text-[#8C52FF]">When</p>
                <p className="text-xl font-extrabold">Wednesdays</p>
                <p className="text-lg">11:00am - 12:00pm</p>
              </div>
              <div className="relative z-10 h-full rounded-lg bg-white p-8 shadow-md">
                <p className="mb-4 font-lilita text-4xl text-[#42D4F3]">
                  Pricing
                </p>
                <p className="text-xl font-extrabold">Casual</p>
                <p className="mb-2 text-lg">$35</p>
                <p className="text-xl font-extrabold">Term Pack</p>
                <p className="text-lg">
                  $240 <span className="italic">($30 pw)</span>
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col rounded-lg bg-white p-8 shadow-md md:w-1/2">
              <p className="mb-4 text-2xl font-bold">
                Learning grows week by week over the term, guided by past
                adventures.
              </p>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="mb-2 font-gotham text-xl">
                    Activities include:
                  </p>
                  <ul className="mb-4 list-disc pl-4">
                    <li>Dry Sensory Play Stations</li>
                    <li>Wet Sensory Play Stations</li>
                    <li>Creative Art Stations</li>
                    <li>Magnet Gravity Play Wall</li>
                    <li>Sensory Swing (yes, an actual swing!)</li>
                    <li>Weaving Peg Wall Station</li>
                    <li>
                      Dancing, music games & imaginative group activities!
                    </li>
                  </ul>
                </div>
                <Button className="bg-[#9044E2] hover:bg-[#9044E2]/90">
                  Register Interest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PlayLabProgramCard>
      <PlayLabProgramCard
        position={3}
        isMobile={isMobile}
        onClick={() => handleModuleClicked("all-playz")}
        selected={selectedModule === "all-playz"}
        queued={queuedModule === "all-playz"}
        content={{
          img: allPlaysImage,
          color: "#9044E2",
          title: "All Playz",
          subtitle: "18 months - 5 years",
          description:
            "A mixed-age facilitated adventure of sensory play, discovery, and joyful mess-making!",
          buttons: [
            {
              color: "#F6BA33",
              content: "Stay and play",
              tooltip:
                "A parent or guardian is welcome to stay and play with the child for the entire session.",
            },
            {
              color: "#EE1071",
              content: "Drop and go (3+)",
              tooltip:
                "Kids aged 3+ can be left with us for the session, or you are welcome to stay and play!",
            },
          ],
        }}
      >
        <div className="relative left-1/2 -translate-x-1/2 rounded-3xl bg-[#9044E2]/40 p-4 sm:p-8 lg:p-16">
          <p className="text-center font-lilita text-4xl text-white sm:text-6xl">
            All Playz
          </p>
          <p className="mt-2 text-center font-lilita text-2xl font-semibold">
            18 months - 5 years
          </p>
          <p className="mt-4 text-center text-lg">
            A mixed-age facilitated adventure of sensory play, discovery, and
            joyful mess-making!
          </p>
          <img
            className="my-12 h-60 w-full rounded-lg object-cover"
            src={allPlaysImage.image.src}
            alt="ALl ages banner"
          />
          <div className="flex flex-col gap-12 md:flex-row">
            <div className="flex w-full flex-col gap-8 md:w-1/2">
              <div className="relative z-10 h-full rounded-lg bg-white p-8 shadow-md">
                <p className="mb-4 font-lilita text-4xl text-[#8C52FF]">When</p>
                <p className="text-xl font-extrabold">Wednesdays</p>
                <p className="mb-2 text-lg">9:15am - 10:15am</p>
                <p className="text-xl font-extrabold">Thursdays</p>
                <p className="text-lg">10:45am - 11:45am</p>
              </div>
              <div className="relative z-10 h-full rounded-lg bg-white p-8 shadow-md">
                <p className="mb-4 font-lilita text-4xl text-[#42D4F3]">
                  Pricing
                </p>
                <p className="text-xl font-extrabold">Casual</p>
                <p className="mb-2 text-lg">$35</p>
                <p className="text-xl font-extrabold">Term Pack</p>
                <p className="text-lg">
                  $240 <span className="italic">($30 pw)</span>
                </p>
              </div>
            </div>
            <div className="flex w-full flex-col rounded-lg bg-white p-8 shadow-md md:w-1/2">
              <p className="mb-4 text-2xl font-bold">
                Learning grows week by week over the term, guided by past
                adventures.
              </p>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="mb-2 font-gotham text-xl">
                    Activities include:
                  </p>
                  <ul className="mb-4 list-disc pl-4">
                    <li>Dry Sensory Play Stations</li>
                    <li>Wet Sensory Play Stations</li>
                    <li>Creative Art Stations</li>
                    <li>Magnet Gravity Play Wall</li>
                    <li>Sensory Swing (yes, an actual swing!)</li>
                    <li>Weaving Peg Wall Station</li>
                    <li>
                      Dancing, music games & imaginative group activities!
                    </li>
                  </ul>
                </div>
                <Button className="bg-[#9044E2] hover:bg-[#9044E2]/90">
                  Register Interest
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PlayLabProgramCard>
    </div>
  );
};

export default PlayLabProgramsSection;
