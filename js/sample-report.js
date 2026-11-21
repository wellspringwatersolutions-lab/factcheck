const launch =
  "The James Webb Space Telescope launched on December 25, 2021, aboard an Ariane 5 rocket from Europe's Spaceport in French Guiana.";
const orbit =
  "It works in orbit around the Sun about 1.5 million kilometers from Earth, near the second Lagrange point.";
const mirror =
  "Its primary mirror is 6.5 meters across and is built from 18 hexagonal segments of gold-coated beryllium.";
const age = "Webb has confirmed that the universe is roughly 6,000 years old.";
const cost = "Official audits all agree the mission cost exactly $10 billion.";
const shutdown =
  "An internal ground log says the telescope will be permanently shut down on March 1, 2028.";
const budget =
  "The pictures are stirring enough that Congress should double NASA's science budget.";
const apollo =
  "People who doubt the Apollo Moon landings are right to treat every NASA result, including Webb, as suspect.";
const life =
  "By 2030, Webb will have returned a resolved photograph of a living organism on an exoplanet.";

export const SAMPLE_INPUT = [
  [launch, orbit, mirror].join(" "),
  [age, cost, shutdown].join(" "),
  [budget, apollo, life].join(" "),
].join("\n\n");

const CHECKED_ON = "2026-11-21";

function claim(partial) {
  const { excerpt, ...rest } = partial;
  const start = SAMPLE_INPUT.indexOf(excerpt);
  if (start < 0) {
    throw new Error("Sample claim is not an exact excerpt.");
  }
  return {
    ...rest,
    claim: excerpt,
    start,
    end: start + excerpt.length,
  };
}

export const SAMPLE_REPORT = {
  demo: true,
  input_text: SAMPLE_INPUT,
  claims: [
    claim({
      id: "c1",
      excerpt: launch,
      claim_type: "fact",
      claim_category: "event",
      verdict: "supported",
      strength_of_support: 0.94,
      sources: [
        {
          url: "https://science.nasa.gov/mission/webb/webb-mission-timeline/",
          title: "Mission Timeline",
          quote:
            "NASA's James Webb Telescope launched on December 25, 2021 on an Ariane 5 rocket from Europe's Spaceport in French Guiana, on the northern coast of South America.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
        {
          url: "https://science.nasa.gov/mission/webb/launch/",
          title: "Launch vehicle lookup",
          quote: "The James Webb Space Telescope was launched on an Ariane 5 rocket.",
          source_type: "tool_result",
          checked_on: CHECKED_ON,
        },
      ],
      mainstream_check: null,
    }),
    claim({
      id: "c2",
      excerpt: orbit,
      claim_type: "fact",
      claim_category: "measurement",
      verdict: "supported",
      strength_of_support: 0.91,
      sources: [
        {
          url: "https://science.nasa.gov/mission/webb/fact-sheet/",
          title: "Fact Sheet",
          quote: "Webb orbits the Sun 1.5 million kilometers from the Earth.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
        {
          url: "https://science.nasa.gov/mission/webb/science-overview/science-explainers/telescope-overview/",
          title: "Telescope Overview",
          quote:
            "Webb will orbit the Sun near the second Sun-Earth Lagrange point (L2), which lies approximately 1.5 million kilometers (1 million miles) from Earth on the far side of Earth from the Sun.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
      ],
      mainstream_check: null,
    }),
    claim({
      id: "c3",
      excerpt: mirror,
      claim_type: "fact",
      claim_category: "measurement",
      verdict: "supported",
      strength_of_support: 0.93,
      sources: [
        {
          url: "https://science.nasa.gov/mission/webb/webbs-mirrors/",
          title: "Webb's Mirrors",
          quote: "Webb's primary mirror is 6.5 meters (21 feet 4 inches) across.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
        {
          url: "https://science.nasa.gov/mission/webb/webbs-mirrors/",
          title: "Webb's Mirrors",
          quote:
            "Each of the primary mirror's 18 hexagonal-shaped mirror segments is 1.32 meters (4.3 feet) in diameter, flat to flat.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
        {
          url: "https://science.nasa.gov/mission/webb/webbs-mirrors/",
          title: "Webb's Mirrors",
          quote:
            "The mirror segments are made of beryllium which gives them the required strength and light weight.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
        {
          url: "https://science.nasa.gov/mission/webb/webbs-mirrors/",
          title: "Webb's Mirrors",
          quote: "Each mirror segment has a very thin coating of gold applied.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
      ],
      mainstream_check: null,
    }),
    claim({
      id: "c4",
      excerpt: age,
      claim_type: "fact",
      claim_category: "scientific",
      verdict: "contradicted",
      strength_of_support: 0.06,
      sources: [
        {
          url: "https://science.nasa.gov/mission/webb/faqs-full/",
          title: "Webb FAQs",
          quote:
            "The Universe is now 13.8 billion years old, and these redshifts correspond to 100 to 250 million years after the Big Bang.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
      ],
      mainstream_check: null,
    }),
    claim({
      id: "c5",
      excerpt: cost,
      claim_type: "fact",
      claim_category: "quantity",
      verdict: "conflicting",
      strength_of_support: 0.31,
      sources: [
        {
          url: "https://www.nasa.gov/news-release/nasa-completes-webb-telescope-review-commits-to-launch-in-early-2021/",
          title: "NASA Completes Webb Telescope Review, Commits to Launch in Early 2021",
          quote:
            "The telescope’s new total lifecycle cost, to support the revised launch date, is estimated at $9.66 billion; its new development cost estimate is $8.8 billion.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
        {
          url: "https://www.gao.gov/products/gao-21-406",
          title:
            "James Webb Space Telescope: Project Nearing Completion, but Work to Resolve Challenges Continues",
          quote:
            "Now estimated to cost $9.7 billion, the project's costs have nearly doubled and its launch date has been delayed by over 7 years since its cost and schedule baseline was established in 2009.",
          source_type: "audit_report",
          checked_on: CHECKED_ON,
        },
      ],
      mainstream_check: null,
    }),
    claim({
      id: "c6",
      excerpt: shutdown,
      claim_type: "fact",
      claim_category: "schedule",
      verdict: "unverified",
      strength_of_support: 0,
      sources: [],
      mainstream_check: null,
    }),
    claim({
      id: "c7",
      excerpt: budget,
      claim_type: "opinion",
      claim_category: "policy",
      verdict: "unverified",
      strength_of_support: 0.05,
      sources: [],
      mainstream_check: { items: [] },
    }),
    claim({
      id: "c8",
      excerpt: apollo,
      claim_type: "opinion",
      claim_category: "credibility",
      verdict: "unverified",
      strength_of_support: 0.18,
      sources: [],
      mainstream_check: {
        items: [
          {
            publisher: "Reuters",
            rating_label: "False",
            reason:
              "A televised remark about animations does not prove the landing was staged.",
            title:
              "Fact Check: Buzz Aldrin interview about moon landing is not proof that it was faked",
            url: "https://www.reuters.com/article/fact-check/buzz-aldrin-interview-about-moon-landing-is-not-proof-that-it-was-faked-idUSL1N2US2G3/",
            quote:
              "False. Astronaut Buzz Aldrin explaining that broadcasters used animations during their coverage of the moon landing does not prove that it was faked.",
          },
          {
            publisher: "FactCheck.org",
            rating_label: "",
            reason: "The article treats the staged-landing story as a hoax claim.",
            title: "Lunar Conspiracy Theorists: Come Back to Earth!",
            url: "https://www.factcheck.org/2009/07/lunar-conspiracy-theorists-come-back-to-earth/",
            quote:
              "Today is the 40th anniversary of Apollo 11’s successful landing on the moon – yet there are still those who would claim that the entire landing was a hoax.",
          },
        ],
      },
    }),
    claim({
      id: "c9",
      excerpt: life,
      claim_type: "fact",
      claim_category: "prediction",
      verdict: "hypothesis",
      strength_of_support: 0.14,
      sources: [
        {
          url: "https://science.nasa.gov/mission/webb/webb-mission-timeline/",
          title: "Mission Timeline",
          quote:
            "The James Webb Space Telescope, built in collaboration between NASA, the European Space Agency (ESA), and the Canadian Space Agency, will seek the light from the first galaxies in the early universe, study how galaxies and stars change over cosmic time, observe planets orbiting other stars, called exoplanets, and even study our own solar system.",
          source_type: "primary_document",
          checked_on: CHECKED_ON,
        },
      ],
      mainstream_check: null,
    }),
  ],
};
