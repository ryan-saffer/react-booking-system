import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function FaqAccordion() {
  return (
    <Accordion type="multiple">
      <AccordionItem value="1">
        <AccordionTrigger>When do I choose creation options?</AccordionTrigger>
        <AccordionContent>About 2 weeks before the party.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="2">
        <AccordionTrigger>When do I let you know numbers?</AccordionTrigger>
        <AccordionContent>
          About 2 weeks before the party. We will only charge you for the number
          of kids that turn up!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="3">
        <AccordionTrigger>
          Can I change the party food if I like?
        </AccordionTrigger>
        <AccordionContent>Yes we have options!</AccordionContent>
      </AccordionItem>
      <AccordionItem value="4">
        <AccordionTrigger>When do you take payment?</AccordionTrigger>
        <AccordionContent>
          At the end of the party. We do not take any deposit!
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="5">
        <AccordionTrigger>Can we bring food for parents?</AccordionTrigger>
        <AccordionContent>Sure, just make sure it's nut free.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="6">
        <AccordionTrigger>Can parents stay during the party?</AccordionTrigger>
        <AccordionContent>Sure, parents can stay or drop off.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="7">
        <AccordionTrigger>Is there a maximum patron capacity?</AccordionTrigger>
        <AccordionContent>
          Yes, it is 35 in total (of adults and children combined) for all
          venues.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default FaqAccordion;
