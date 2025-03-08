import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

function JobListings() {
  return (
    <Accordion type="multiple" className="rounded-2xl border">
      <AccordionItem value="1" className="px-4">
        <AccordionTrigger className="font-bold">
          Studio Manager
        </AccordionTrigger>
        <AccordionContent className="text-base">
          <strong>About the role:</strong>
          <br />
          Are you an experienced leader or manager who aspires to have the ideal
          balance between fun and operational excellence? As our Fizz Kidz
          Studio Manager you will lead and inspire a team of passionate
          facilitators, ensuring smooth studio operations and exceptional
          customer service.
          <br />
          <br />
          <strong>Required Skills:</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>Oversee all studio operations and team management</li>
            <li>Train, onboard, and supervise Party/Program Facilitators</li>
            <li>Organise and manage rosters, ensuring adequate staffing</li>
            <li>Facilitate parties and programs, ensuring smooth execution</li>
            <li>Handle customer service and resolve issues as they arise</li>
            <li>Manage inventory and ensure supplies are stocked</li>
            <li>Perform administrative tasks (emails, calls, scheduling)</li>
            <li>
              Work closely with the Leadership Team on business priorities
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="2" className="px-4">
        <AccordionTrigger className="font-bold">
          Studio Supervisor
        </AccordionTrigger>
        <AccordionContent className="text-base">
          <strong>About the role:</strong>
          <br />
          As our Fizz Kidz Studio Supervisor you will play a pivotal role in
          ensuring seamless studio operations and delivering outstanding
          customer experiences. Working closely with the Manager, you'll guide,
          motivate, and assist a team of facilitators, fostering a positive work
          environment and culture within your studio.
          <br />
          <br />
          <strong>Key responsibilities:</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>Support the Studio Manager in day-to-day operations</li>
            <li>
              Supervise Party Facilitators, ensuring smooth party execution
            </li>
            <li>Assist with inventory management and rostering</li>
            <li>
              Guide and mentor new facilitators, aiding in their training and
              onboarding
            </li>
            <li>Step in as a facilitator when required</li>
            <li>
              Ensure the studio is clean and organised before, during, and after
              events
            </li>
            <li>Handle customer service issues and troubleshoot problems</li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="3" className="px-4">
        <AccordionTrigger className="font-bold">
          Party Facilitator
        </AccordionTrigger>
        <AccordionContent className="text-base">
          <strong>About the role:</strong>
          <br />
          Are you confident, enthusiastic and bubbly? Join us and facilitate
          children's parties on the weekend!
          <br />
          <br />
          <strong>Key responsibilities:</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>Set up and decorate party rooms</li>
            <li>Greet parents and children upon arrival</li>
            <li>
              Lead and engage children in fun activities (dancing, games,
              singing)
            </li>
            <li>Prepare kids' party food and serve it</li>
            <li>Take payments and clean up after the event</li>
          </ul>
          <strong>Key Skills:</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>Strong teamwork, leadership, and communication skills</li>
            <li>High energy and enthusiasm when working with children</li>
            <li>
              Ability to manage a room full of kids and adjust activities based
              on age
            </li>
            <li>Solution-oriented and can resolve issues quickly</li>
            <li>Organised and able to manage admin tasks</li>
            <li>Experience in party facilitation and customer service</li>
            <li>
              Ability to work collaboratively and maintain a positive
              environment
            </li>
          </ul>
          <strong>Requirements:</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>Weekend availability (mandatory)</li>
            <li>
              Availability during school holidays and/or after school
              (preferred)
            </li>
            <li>Flexibility for additional shifts last minute</li>
            <li>
              Passion for working with children; experience in drama, education,
              or entertainment is highly regarded
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default JobListings;
