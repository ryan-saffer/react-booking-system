import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

function JobListings() {
  return (
    <Accordion type="multiple" className="rounded-2xl border">
      {/* <AccordionItem value="1" className="px-4"> */}
      {/*   <AccordionTrigger className="font-bold">Area Manager</AccordionTrigger> */}
      {/*   <AccordionContent className="text-base"> */}
      {/*     <strong>Position Overview:</strong> */}
      {/*     <br /> */}
      {/*     The Area Manager is a key leadership role responsible for overseeing */}
      {/*     multiple Fizz Kidz studio locations within a designated geographic */}
      {/*     area. This position involves strategic planning, operational */}
      {/*     management, and driving business growth while ensuring consistent */}
      {/*     delivery of high-quality, engaging experiences for children across all */}
      {/*     studios. The Area Manager will lead a team of Studio Supervisors and */}
      {/*     Franchisees, fostering a culture of excellence and innovation in line */}
      {/*     with Fizz Kidz's mission and values. */}
      {/*     <br /> */}
      {/*     <br /> */}
      {/*     <strong>Key Responsibilities:</strong> */}
      {/*     <br /> */}
      {/*     <i>Strategic Leadership</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Develop and implement regional strategies to drive growth, */}
      {/*         profitability, and market share. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Drive performance goals for each studio and monitor progress */}
      {/*         through key performance indicators (KPIs). */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <br /> */}
      {/*     <i>Operational Excellence</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Oversee the day-to-day operations of multiple Fizz Kidz studios */}
      {/*         within the region. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Ensure consistency in service quality, safety standards, and brand */}
      {/*         experience across all locations. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Implement and maintain operational systems and processes to */}
      {/*         maximize efficiency and effectiveness. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <i>Financial Management</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Manage regional budgets, including cost control, and revenue */}
      {/*         optimization. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Analyse financial performance of individual studios and the region */}
      {/*         as a whole. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Identify areas for cost savings and revenue growth opportunities. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <br /> */}
      {/*     <i>Team Leadership and Development</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Recruit, train, and mentor Studio Supervisors to build a */}
      {/*         high-performing regional team. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Conduct regular performance reviews and provide ongoing feedback */}
      {/*         and coaching. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Foster a positive work culture that aligns with Fizz Kidz values */}
      {/*         and promotes employee engagement and retention. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <i>Quality Assurance and Compliance</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Ensure all studios adhere to Fizz Kidz brand standards, safety */}
      {/*         protocols, and legal requirements. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Conduct regular audits of studio operations and implement */}
      {/*         corrective actions as needed. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Stay informed about industry trends and regulations, updating */}
      {/*         regional practices accordingly. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <i>Customer Experience and Satisfaction</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Monitor customer feedback across the region and implement */}
      {/*         strategies to enhance overall satisfaction. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Address and resolve escalated customer issues promptly and */}
      {/*         effectively. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Develop initiatives to improve the customer journey and increase */}
      {/*         repeat business. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <i>Marketing and Business Development</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Collaborate with the marketing team to develop and execute */}
      {/*         regional marketing strategies. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Build and maintain relationships with key stakeholders, including */}
      {/*         local businesses, schools, and community organizations. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <i>Innovation and Program Development</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Work with the product development team to test and implement new */}
      {/*         party themes and activities. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Gather insights from Studio team and customers to inform product */}
      {/*         improvements and innovations. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Lead the rollout of new programs and initiatives across the */}
      {/*         region. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <br /> */}
      {/*     <strong>Qualifications:</strong> */}
      {/*     <br /> */}
      {/*     <i>Essential Skills &amp; Experience</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Minimum of 3 years of multi-unit management experience, preferably */}
      {/*         in the children's entertainment, education, or hospitality */}
      {/*         sectors. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Proven track record of driving business growth and improving */}
      {/*         operational efficiency. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Strong financial acumen with experience in budgeting and P&amp;L */}
      {/*         management. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Excellent leadership skills with the ability to motivate and */}
      {/*         develop teams. */}
      {/*       </li> */}
      {/*       <li>Working with Children Check.</li> */}
      {/*     </ul> */}
      {/*     <i>Preferred Skills</i> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Knowledge of children's developmental needs and educational */}
      {/*         trends. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Experience in franchise operations or working with franchisees */}
      {/*         highly regarded. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <br /> */}
      {/*     <strong>Key Attributes:</strong> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li>Hands-on approach to problem-solving.</li> */}
      {/*       <li> */}
      {/*         Excellent communicator with the ability to build relationships at */}
      {/*         all levels. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Adaptable and resilient, able to thrive in a fast-paced, dynamic */}
      {/*         environment. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Passionate about creating positive experiences for children and */}
      {/*         families. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <br /> */}
      {/*     <strong>Work Conditions:</strong> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li> */}
      {/*         Regular travel required to visit studios within the region (up to */}
      {/*         50% of time). */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Flexible schedule including weekends and occasional evenings to */}
      {/*         attend training, events, or address urgent matters. */}
      {/*       </li> */}
      {/*       <li> */}
      {/*         Base location in studios with remote work options as appropriate. */}
      {/*       </li> */}
      {/*     </ul> */}
      {/*     <br /> */}
      {/*     This position offers an exciting opportunity to lead and grow a */}
      {/*     vibrant network of Fizz Kidz party studios, making a positive impact */}
      {/*     on children's lives while driving business success. */}
      {/*   </AccordionContent> */}
      {/* </AccordionItem> */}
      <AccordionItem value="2" className="px-4">
        <AccordionTrigger className="font-bold">
          Social Media & Content Creator
        </AccordionTrigger>
        <AccordionContent className="text-base">
          Fizz Kidz are a <strong>vibrant and rapidly growing</strong> business
          specialising in fun, educational, and engaging experiences for
          children. We are seeking a <strong>Part-Time,</strong> Social Media
          Content Creator to <strong>capture real moments</strong> and drive
          engaging social campaigns across Instagram and TikTok.
          <br />
          <br />
          <strong>About the role:</strong>
          <br />
          The Social Media & Content Creator is responsible for planning,
          capturing, editing and publishing engaging social media content that
          <strong>brings the Fizz Kidz brand to life.</strong> This role
          requires a <strong>confident, extroverted individual</strong> who is
          comfortable attending parties and events, interviewing parents,
          engaging with families, and appearing on camera as a brand
          personality. The role owns the full content lifecycle from concept
          through to posting.
          <br />
          <br />
          This role reports directly into the General Manager and plays a huge
          part in our growth through brand awareness and community engagement.
          <br />
          <br />
          <strong>Key Responsibilities ✨</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>
              <strong>Social Campaigns & Trend Execution:</strong> You will
              drive social media campaigns by identifying relevant trends and
              translating them into timely, on-brand content that increases
              reach, engagement and audience growth.
            </li>
            <li>
              <strong>Editing, Design & Posting:</strong> You will independently
              edit video content, write captions, and publish posts efficiently
              to ensure content is delivered quickly, consistently and in line
              with brand standards.
            </li>
            <li>
              <strong>Community Management:</strong> You will support community
              growth by monitoring and responding to comments and messages and
              fostering positive, engaging and on-brand interactions across
              social platforms.
            </li>
            <li>
              <strong>Innovation:</strong> Champion new ideas through keeping up
              with the latest trends to ensure we are capturing the biggest
              market.
            </li>
            <li>
              <strong>Fizz Kidz Values:</strong> Demonstrate through leadership
              and interactions with franchisees, staff and customers the Fizz
              Kidz values.
            </li>
          </ul>
          <strong>Why Join Fizz Kidz? 🎨🧪</strong>
          <br />
          At Fizz Kidz, you'll be part of a passionate team dedicated to
          creating memorable and enriching experiences for children. This is an
          exciting and creative opportunity to bring your passion and enthusiasm
          for all things creative to life in an environment where fun is
          literally our brand!
          <br />
          <br />
          <strong>Key Attributes 🌈</strong>
          <ul className="mb-4 list-disc pl-4">
            <li>
              <strong>Content creation:</strong> You have experience creating
              content across Instagram and TikTok, with the ability to produce
              engaging, platform appropriate short form content.
            </li>
            <li>
              <strong>On camera presence:</strong> You'll be a confident and
              natural on-camera presence with an outgoing, engaging personality
              suited to representing the brand publicly.
            </li>
            <li>
              <strong>Customer service:</strong> The role requires the ability
              to comfortably engage children, parents and staff, creating a
              positive and enthusiastic on-camera experience.
            </li>
            <li>
              <strong>Editing:</strong> Previous experience editing videos as
              well as some basic graphic design skills to support fast,
              effective content delivery.
            </li>
            <li>
              <strong>Written communication:</strong> You pride yourself on your
              written communication skills with the ability to craft clear,
              engaging captions and social storytelling.
            </li>
            <li>
              <strong>Trends:</strong> The role requires a strong understanding
              of social media trends, platform algorithms and evolving content
              formats.
            </li>
            <li>
              <strong>Work Ethic:</strong> You will be a self-starter who can
              work autonomously, manage competing priorities and move quickly in
              a fast-paced environment.
            </li>
          </ul>
        </AccordionContent>
      </AccordionItem>
      {/* <AccordionItem value="4" className="px-4"> */}
      {/*   <AccordionTrigger className="font-bold"> */}
      {/*     Cheltenham Studio Supervisor */}
      {/*   </AccordionTrigger> */}
      {/*   <AccordionContent className="text-base"> */}
      {/*     <strong>About the role:</strong> */}
      {/*     <br /> */}
      {/*     As our Fizz Kidz Studio Supervisor you will play a pivotal role in */}
      {/*     ensuring seamless studio operations and delivering outstanding */}
      {/*     customer experiences. Working closely with the Manager, you'll guide, */}
      {/*     motivate, and assist a team of facilitators, fostering a positive work */}
      {/*     environment and culture within your studio. */}
      {/*     <br /> */}
      {/*     <br /> */}
      {/*     <strong>Key responsibilities:</strong> */}
      {/*     <ul className="mb-4 list-disc pl-4"> */}
      {/*       <li>Support the Studio Manager in day-to-day operations</li> */}
      {/*       <li> */}
      {/*         Supervise Party Facilitators, ensuring smooth party execution */}
      {/*       </li> */}
      {/*       <li>Assist with inventory management and rostering</li> */}
      {/*       <li> */}
      {/*         Guide and mentor new facilitators, aiding in their training and */}
      {/*         onboarding */}
      {/*       </li> */}
      {/*       <li>Step in as a facilitator when required</li> */}
      {/*       <li> */}
      {/*         Ensure the studio is clean and organised before, during, and after */}
      {/*         events */}
      {/*       </li> */}
      {/*       <li>Handle customer service issues and troubleshoot problems</li> */}
      {/*     </ul> */}
      {/*   </AccordionContent> */}
      {/* </AccordionItem> */}
      <AccordionItem value="6" className="px-4">
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
