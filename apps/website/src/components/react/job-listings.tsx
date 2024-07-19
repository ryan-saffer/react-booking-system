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
      <AccordionItem value="1" className="px-4">
        <AccordionTrigger className="font-bold">
          Business Development Manager
        </AccordionTrigger>
        <AccordionContent className="text-base">
          We are expanding our team and currently seeking a motivated and
          experienced Business Development Manager to support our exciting
          growth!
          <br />
          <br />
          <strong>Position Overview:</strong>
          <br />
          <br />
          As a Business Development Manager at Fizz Kidz, you will play a
          crucial role in expanding our outreach and establishing partnerships
          with schools, kindergartens, and shopping centres. This position
          requires a proactive individual with a proven track record in outbound
          sales, particularly in the education and entertainment sector.
          Experience with HubSpot, a customer relationship management (CRM)
          platform, is essential to effectively manage and track sales
          activities.
          <br />
          <br />
          The position is part-time, specifically designed for 2 days a week,
          with flexibility to accommodate varying schedules. Preferred work days
          are Tuesdays and Thursdays.
          <br />
          <br />
          <strong>Responsibilities:</strong>
          <br />
          <br />
          <ul className="mb-4 list-disc pl-4">
            <li>
              Conduct outbound sales calls to schools, kindergartens, and
              shopping centres to introduce and book in Fizz Kidz services.
            </li>
            <li>
              Build and maintain strong relationships with key decision-makers
              in educational institutions and commercial spaces.
            </li>
            <li>
              Understand client needs and tailor Fizz Kidz offerings to suit
              their requirements.
            </li>
            <li>Achieve and exceed monthly and quarterly sales targets.</li>
            <li>
              Utilise HubSpot CRM to manage, track, and analyse sales
              activities.
            </li>
            <li>
              Collaborate with the Director to align outbound efforts with
              overall company strategies.
            </li>
            <li>
              Provide regular reports on sales progress, challenges, and
              opportunities.
            </li>
          </ul>
          <strong>Qualifications and Experience:</strong>
          <br />
          <br />
          <ul className="mb-4 list-disc pl-4">
            <li>
              Proven experience in outbound sales, preferably in the education
              and entertainment industry.
            </li>
            <li>
              Familiarity with customer relationship management tools,
              specifically HubSpot.
            </li>
            <li>Excellent communication and interpersonal skills.</li>
            <li>
              Ability to encapsulate the Fizz Kidz fun, kind and flexible
              culture.
            </li>
            <li>Self-motivated with a results-oriented approach.</li>
            <li>
              Ability to work autonomously and as part of a collaborative team.
            </li>
            <li>
              Understanding of the kids' entertainment and education market is a
              plus.
            </li>
          </ul>
          <strong>Benefits:</strong>
          <br />
          <br />
          <ul className="mb-4 list-disc pl-4">
            <li>
              Work closely with our Accounts Manager, COO and Director in a
              vibrant and supportive team.
            </li>
            <li>
              Opportunities for career growth and development within a growing
              company.
            </li>
            <li>Enjoy the flexibility of a remote work environment.</li>
            <li>Flexible hours to suit your lifestyle</li>
          </ul>
          <strong>How to Apply:</strong>
          <br />
          <br />
          If you are passionate about sales, children's education, and
          entertainment, and you meet the specified qualifications, we invite
          you to apply below!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="2" className="px-4">
        <AccordionTrigger className="font-bold">
          Balwyn Studio Manager
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
