import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

import { cn } from "./lib/utils";

const locations = [
  { name: "Balwyn", address: "184 Whitehorse Road, Balwyn 3103" },
  { name: "Cheltenham", address: "273 Bay Rd, Cheltenham VIC 3192" },
  { name: "Essendon", address: "75 Raleigh St, Essendon VIC 3040" },
  {
    name: "Malvern",
    address: "20 Glenferrie Rd, Malvern VIC 3144",
  },
] as const;

function JobListings() {
  return (
    <Accordion type="multiple" className="rounded-2xl border">
      <AccordionItem value="2" className="px-4">
        <AccordionTrigger className="font-bold">
          Cheltenham Studio Manager
        </AccordionTrigger>
        <AccordionContent className="text-base">
          The Studio Manager at Fizz Kidz oversees all aspects of studio
          operations, including training and managing a team of facilitators,
          conducting interviews, ensuring excellent customer service, managing
          inventory, and resolving day-to-day issues. They maintain a clean and
          organized studio environment and provide support and motivation to
          their team. They are responsible for ensuring parties occur by
          ensuring the roster is maintained and stepping in when Facilitators
          are absent.
          <br />
          <br />
          <ul className="mb-4 list-disc pl-4">
            <li>Full weekend availability required.</li>
            <li>Management experience required.</li>
          </ul>
          Get in touch for full role description.
        </AccordionContent>
      </AccordionItem>
      {locations.map((location, idx) => (
        <AccordionItem
          value={location.name}
          className={cn("px-4", { "border-b-0": idx > 2 })}
          key={idx}
        >
          <AccordionTrigger className="font-bold">{`${location.name} Studio Party Facilitator`}</AccordionTrigger>
          <AccordionContent className="text-base">
            We are looking for confident, enthusiastic and bubbly people to join
            our team and run amazing kids birthday parties on the weekend! This
            means you (and your team mates) are in charge of the whole show,
            from setting up the room, to greeting all the parents and children,
            running the party, preparing kids party food, taking payment and
            cleaning up.
            <br />
            <br />
            Full weekend availability required. Availability on Monday - Friday
            during school holidays will be favoured.
            <br />
            <br />
            <strong>Required Skills:</strong>
            <br />
            <br />
            <ul className="mb-4 list-disc pl-4">
              <li>
                Ability to communicate effectively, respectfully and
                professionally with parents.
              </li>
              <li>
                Demonstrate high levels of energy and enthusiasm working with
                children.
              </li>
              <li>Confidence managing a room full of children and parents.</li>
              <li>
                Ability to stay calm under pressure, think on the spot, and
                problem solve.
              </li>
              <li>
                Ability to interact with children and adjust the interaction
                depending on child's age (such as making up games on the spot).
              </li>
            </ul>
            <strong>Responsibilities:</strong>
            <br />
            <br />
            <ul className="mb-4 list-disc pl-4">
              <li>
                Entertaining children at all times; constantly talking,
                laughing, dancing, singing and engaging with children.
              </li>
              <li>Keeping track of time and adapting as required.</li>
              <li>Work efficiently and quickly in a fast-paced environment.</li>
              <li>
                Work collaboratively with your teammate to provide the best
                5-star Fizz Kidz experience in all parties.
              </li>
              <li>Managing payments</li>
              <li>Preparing kids party food</li>
            </ul>
            Is it essential that you love to work with children. Experience or
            interest in drama, entertainment or primary school education is very
            favourable. If this sounds like a role that you would thrive in,
            apply now. We are so excited to meet you!
            <br />
            <br />
            <strong>Role Details:</strong>
            <br />
            <br />
            <ul className="mb-4 list-disc pl-4">
              <li>Location: {location.address}</li>
              <li>Causal work Salary: $25.00 - $38.00 per hour</li>
              <li>
                Schedule: Day shift Work Authorisation: Australia (Required)
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default JobListings;
