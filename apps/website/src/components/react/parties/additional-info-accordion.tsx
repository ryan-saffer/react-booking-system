import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function AdditionalInfoAccordion() {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="info" className="mt-2 border-none">
        <AccordionTrigger
          className="justify-start gap-4 text-sm uppercase text-pink-500"
          icon="plus"
          chevronStart
        >
          Additional Items
        </AccordionTrigger>
        <AccordionContent>
          <ul className="list-disc pl-4">
            <li>Fairy bread platter - $30 (VV)</li>
            <li>
              Fruit platter (watermelon, rockmelon, strawberries, apples) - $45
            </li>
            <li>Watermelon platter - $25</li>
            <li>Frankfurts - $30 (GF, contains Beef)</li>
            <li>Hot potato wedges - $30 (VV) - GF available on request</li>
            <li>Cheese / tomato sandwiches - $35 (VV)</li>
            <li>
              Vegetarian combo sandwich platter (cheese/tomato, Vegemite/butter,
              cheese/butter) - $35 (VV)
            </li>
            <li>Vegetarian Quiches - $35 (V)</li>
            <li>Party Packs - $15 each</li>
          </ul>
          <p className="mt-4">
            Would like to talk through allergy concerns? Feel free to call us on
            03 9059 8144, we are very happy to chat!
            <br />
            <br />
            Please also let us know if you require a vegetarian menu. In this
            case you're welcome to add any two items from the additional options
            (besides a fruit platter) to swap instead of the party pies/sausage
            rolls free of change.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default AdditionalInfoAccordion;
