import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

import type { GetImageResult } from "astro";

export type SingleIncursionProps = {
  image: GetImageResult;
  title: string;
  content: string;
  curriculumLinks: { content: string; link?: { code: string; url: string } }[];
};

function IncursionExpandableItem({
  image,
  title,
  content,
  curriculumLinks,
  color,
}: SingleIncursionProps & { color: string }) {
  return (
    <div className="flex flex-1 flex-col rounded-md shadow-lg">
      <img
        src={image.src}
        className="h-48 min-h-48 rounded-t-md object-cover"
      />
      <div className="flex h-full flex-col justify-between rounded-b-md p-4">
        <div>
          <p className="mb-4 font-lilita text-lg" style={{ color }}>
            {title}
          </p>
          <p className="text-sm">{content}</p>
        </div>
        <Accordion type="single" collapsible>
          <AccordionItem value="links" className="border-none">
            <AccordionTrigger
              chevronStart
              className="justify-start gap-4 text-xs text-cyan-400"
            >
              Victorian Curriculum Links
            </AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-10">
                {curriculumLinks.map((link, idx) => (
                  <li key={idx} className="text-xs">
                    {link.content}
                    {link.link && (
                      <a
                        href={link.link.url}
                        target="_blank"
                        className="hover:text-cyan-400"
                      >
                        {" "}
                        ({link.link.code})
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

export default IncursionExpandableItem;
