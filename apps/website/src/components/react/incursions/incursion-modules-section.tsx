import { useEffect, useState } from "react";

import type { CustomImage } from "@/types/types";
import { IncursionModule } from "./incursion-module";
// @ts-ignore
import blueParachute from "@/assets/images/pages/incursions/blue-parachute.svg";
import { cn } from "../lib/utils";
// @ts-ignore
import greenEarth from "@/assets/images/pages/incursions/green-earth.svg";
// @ts-ignore
import purpleLightbulb from "@/assets/images/pages/incursions/purple-lightbulb.svg";
// SVG IMPORTS
// @ts-ignore
import yellowTube from "@/assets/images/pages/incursions/yellow-tube.svg";

type Props = {
  chemicalImages: CustomImage[];
  physicalImages: CustomImage[];
  lightImages: CustomImage[];
  earthImages: CustomImage[];
};

export type Module = "chemical" | "physical" | "light" | "earth" | null;

const IncursionModulesSection = ({
  chemicalImages,
  physicalImages,
  lightImages,
  earthImages,
}: Props) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 1000);
      3;
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [selectedModule, setSelectedModule] = useState<Module>(null);

  const handleModuleClicked = (newModule: Module) => {
    if (selectedModule === null) {
      setSelectedModule(newModule);
    } else if (selectedModule === newModule) {
      setSelectedModule(null);
    } else {
      setSelectedModule(newModule);
    }
  };

  return (
    <div
      className={cn("grid grid-cols-4 gap-8", {
        "grid-cols-1": isMobile,
        "mb-16": selectedModule === null,
      })}
    >
      <IncursionModule
        position={1}
        isMobile={isMobile}
        svg={yellowTube.src}
        svgAlt="graphic of a yellow test tube"
        title="Chemical Science"
        subtitle="Experiments include Magic Sand, Slime, Chromatography, Lava Lamps, Elephants Toothpaste and more!"
        color="#f6ba3a"
        selected={selectedModule === "chemical"}
        onClick={() => handleModuleClicked("chemical")}
        incursions={[
          {
            image: chemicalImages[0],
            title: "Marvellous Matter (Yr 3-6)",
            content:
              "In this incursion students will understand that there are three states of matter and discuss their observable properties. They will be able understand how states of matter can change by adding or removing heat.",
            curriculumLinks: [
              {
                content:
                  "A change of state between solid and liquid can be caused by adding or removing heat",
                link: {
                  code: "VCSSU059",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU059",
                },
              },
              {
                content:
                  "Solids, liquids and gases behave in different ways and have observable properties that help to classify them",
                link: {
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU076",
                  code: "VCSSU076",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Year 3 to Year 5'",
              },
            ],
          },
          {
            image: chemicalImages[1],
            title: "Radical Reactions (F - Yr 2)",
            content:
              "In this incursion students will understand chemical and physical reactions. They will also learn to identify the difference between reversible and irreversible changes. Students will also look closely at the properties of materials and the effect these might have during an experiment.",
            curriculumLinks: [
              {
                content:
                  "Objects are made of materials that have observable properties",
                link: {
                  code: "VCSSU044",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU044",
                },
              },
              {
                content:
                  "Everyday materials can be physically changed or combined with other materials in a variety of ways for particular purposes",
                link: {
                  code: "VCSSU045",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU045",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Foundation to Year 2",
              },
            ],
          },
          {
            image: chemicalImages[2],
            title: "Radical Reactions Adv (Yr 3-5)",
            content:
              "In this incursion students will understand the difference between a chemical and physical reaction. They will also learn to identify the difference between reversible and irreversible changes to chemicals and materials. Students will also look closely at the properties of materials and the effect these might have during an experiment.",
            curriculumLinks: [
              {
                content:
                  "Solids, liquids and gases behave in different ways and have observable properties that help to classify them",
                link: {
                  code: "VCSSU076",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU076",
                },
              },
              {
                content:
                  "Changes to materials can be reversible, including melting, freezing, evaporating, or irreversible, including burning and rusting",
                link: {
                  code: "VCSSU077",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU077",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Year 3 to Year 5",
              },
            ],
          },
        ]}
      />
      <IncursionModule
        position={2}
        isMobile={isMobile}
        svg={blueParachute.src}
        svgAlt="graphic of a blue parachute"
        title="Physical Sciences"
        subtitle="Experiments include Hexbug Mazes, Salt Pendulums, Kaleidoscopes and more!"
        color="#5ED9F3"
        selected={selectedModule === "physical"}
        onClick={() => handleModuleClicked("physical")}
        incursions={[
          {
            image: physicalImages[0],
            title: "Fabulous Forces (F- Yr 2)",
            content:
              "In this incursion students will understand that the way objects moves depends on a variety of factors. They will also loook at the effect of friction and investigate push and pull forces.",
            curriculumLinks: [
              {
                content:
                  "The way objects move depends on a variety of factors including their size and shape: a push or a pull affects how an object moves or changes shape",
                link: {
                  code: "VCSSU048",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU048",
                },
              },
              {
                content: "People use science in their daily lives",
                link: {
                  code: "VCSSU041",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU041",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Foundation to Year 2",
              },
            ],
          },
          {
            image: physicalImages[1],
            title: "Fabulous Forces Advances (Yr 3-5)",
            content:
              "In this incursion students will understand the effect of forces on an objects behaviour. We will look closely at contact and non contact forces and discuss how simple machines work. At the end of the incursion students will also be able to identity the difference between kinetic and potential energy.",
            curriculumLinks: [
              {
                content:
                  "Forces can be exerted by one object on another through direct contact or from a distance",
                link: {
                  code: "VCSSU064",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU064",
                },
              },
              {
                content:
                  "Science knowledge helps people to understand the effects of their actions",
                link: {
                  code: "VCSSU056",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU056",
                },
              },
              {
                content: "Along with Science Inquiry Skills from Year 3 - 5",
              },
            ],
          },
        ]}
      />
      <IncursionModule
        position={3}
        isMobile={isMobile}
        svg={purpleLightbulb.src}
        svgAlt="graphic of a purple lightbulb"
        title="Light, Sound
and Electricity"
        subtitle="Experiments include Electrical Circuits, Sound and Sting Telephones, Invisible Ink, Shadow Puppets and more!"
        color="#9C59E5"
        selected={selectedModule === "light"}
        onClick={() => handleModuleClicked("light")}
        incursions={[
          {
            image: lightImages[0],
            title: "Light & Sound Spectacular",
            content:
              "In this incursion students will understand how light and sound are produced, sensed and transmitted. Students will also explore the role light and sound play in our everyday lives.",
            curriculumLinks: [
              {
                content:
                  "Light and sound are produced by a range of sources and can be sensed",
                link: {
                  code: "VCSSU049",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU049",
                },
              },
              {
                content: "People use science in their daily lives",
                link: {
                  code: "VCSSU041",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU041",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Foundation to Year 2",
              },
            ],
          },
          {
            image: lightImages[1],
            title: "Electrifying Electricity",
            content:
              "In this incursion students will understand how circuits work. They will dig deeper into different types of circuits, conductors and insulators. Students will also discuss the importance of renewable energy.",
            curriculumLinks: [
              {
                content:
                  "Energy from a variety of sources can be used to generate electricity; electric circuits enable this energy to be transferred to another place and then to be transformed into another form of energy",
                link: {
                  code: "VCSSU081",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU081",
                },
              },
              {
                content:
                  "Scientific understandings, discoveries and inventions are used to inform personal and community decisions and to solve problems that directly affect people's lives",
                link: {
                  code: "VCSSU073",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU073",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Year 3 to Year 5",
              },
            ],
          },
        ]}
      />
      <IncursionModule
        position={4}
        isMobile={isMobile}
        svg={greenEarth.src}
        svgAlt="graphic of a green earth"
        title="Earth, Weather & Sustainability"
        subtitle="Experiments include making a Solar System, Milky Way, Stocking Plants, Instant-Snow, Recyclable Monsters, Habitats and more!"
        color="#77E78A"
        selected={selectedModule === "earth"}
        onClick={() => handleModuleClicked("earth")}
        incursions={[
          {
            image: earthImages[0],
            title: "Living Things (F - yr 2)",
            content:
              "In this incursion students will understand the needs of living things. They will investigate habitats and wbat happens when habitats change. Students will also focus on the needs of plants and how they grow.",
            curriculumLinks: [
              {
                content:
                  "Living things have a variety of external features and live in different places where their basic needs, including food, water and shelter, are met",
                link: {
                  code: "VCSSU042",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU042",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills and Creating Designed Solutions from Foundation to Year 2",
              },
            ],
          },
          {
            image: earthImages[1],
            title: "Natural Disasters(Yr 3-5)",
            content:
              "In this incursion students will understand different types of natural disasters. We will look closely at key diasters and investigate how they occur and their effects on the earths surface.",
            curriculumLinks: [
              {
                content:
                  "Sudden geological changes or extreme weather conditions can affect Earth's surface",
                link: {
                  code: "VCSSU079",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU079",
                },
              },
              {
                content:
                  "Earth's surface changes over time as a result of natural processes and human activity",
                link: {
                  code: "VCSSU062",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU062",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills and Creating Designed Solutions from Year 3 to Year 5",
              },
            ],
          },
          {
            image: earthImages[2],
            title: "Wild and Wacky Weather (F- Yr 2)",
            content:
              "In this incursion students will understand how different types of weather patterns occur. Students will discover different changes in the sky and landscape and look at how the water cycle works.",
            curriculumLinks: [
              {
                content: "People use science in their daily lives",
                link: {
                  code: "VCSSU041",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU041",
                },
              },
              {
                content:
                  "Observable changes occur in the sky and landscape; daily and seasonal changes affect everyday life",
                link: {
                  code: "VCSSU046",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU046",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Foundation to Year 2",
              },
            ],
          },
          {
            image: earthImages[3],
            title: "Sustainability Superpowers (F - Yr 5)",
            content:
              "In this incursion students will understand the importance sustainability has on the future of the earth. The will look at the effect of pollution and the impact they can have on the environment.",
            curriculumLinks: [
              {
                content:
                  "Earth's surface changes over time as a result of natural processes and human activity",
                link: {
                  code: "VCSSU062",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU062",
                },
              },
              {
                content:
                  "Science knowledge helps people to understand the effects of their actions",
                link: {
                  code: "VCSSU056",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU056",
                },
              },
              {
                content:
                  "Scientific understandings, discoveries and inventions are used to inform personal and community decisions and to solve problems that directly affect people's lives",
                link: {
                  code: "VCSSU073",
                  url: "https://victoriancurriculum.vcaa.vic.edu.au/Curriculum/ContentDescription/VCSSU073",
                },
              },
              {
                content:
                  "Along with Science Inquiry Skills from Foundation to Year 5",
              },
            ],
          },
        ]}
      />
    </div>
  );
};

export default IncursionModulesSection;
