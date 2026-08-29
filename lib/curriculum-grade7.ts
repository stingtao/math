import type { Accent, LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";

type Drill = [prompt: string, answer: string, choices?: string[]];
type LessonSpec = {
  slug: string;
  title: string;
  goal: string;
  key: string;
  example: string;
  standard: string;
  visual: string;
  drills: Drill[];
};

const accents: Accent[] = ["blue", "teal", "coral", "violet", "gold"];

function makeLesson(regionId: number, order: number, accent: Accent, spec: LessonSpec): LessonDefinition {
  const practice: PracticeQuestion[] = spec.drills.map(([prompt, answer, choices], index) => ({
    id: `q${index + 1}`,
    prompt,
    answer,
    choices,
    hint: spec.key,
  }));
  return {
    id: `g7-r${regionId}-l${order}`,
    grade: 7,
    slug: `g7-${spec.slug}`,
    regionId,
    order,
    title: spec.title,
    goal: spec.goal,
    keyIdea: spec.key,
    example: spec.example,
    exampleSteps: ["Name what is known.", spec.key, `Check the result with ${spec.example}.`],
    standard: spec.standard,
    accent,
    visual: spec.visual,
    practice,
  };
}

function makeRegion(order: number, title: string, subtitle: string, standard: string, specs: LessonSpec[]): RegionDefinition {
  const id = 700 + order;
  const accent = accents[(order - 1) % accents.length];
  return {
    id,
    grade: 7,
    order,
    slug: `g7-${specs[0].slug}`,
    title,
    subtitle,
    standard,
    accent,
    lessons: specs.map((spec, index) => makeLesson(id, index + 1, accents[(order + index - 1) % accents.length], spec)),
  };
}

export const grade7Regions: RegionDefinition[] = [
  makeRegion(1, "Ratios and Unit Rates", "Compare two quantities and describe how they change together.", "7.RP.A.1–2", [
    { slug: "unit-rates", title: "Unit Rates", goal: "Find an amount for one unit.", key: "Divide both quantities by the same value until the second quantity is 1.", example: "180 miles in 3 hours = 60 miles per hour", standard: "7.RP.A.1", visual: "ratio-table", drills: [
      ["180 miles in 3 hours. Miles per hour?", "60"], ["$12 for 4 notebooks. Cost per notebook?", "3|$3"], ["5 cups fill 20 glasses. Cups per glass?", "1/4|0.25"], ["A runner covers 7.5 km in 1.5 h. Rate?", "5"], ["Which is the unit rate for 24 pages in 6 minutes?", "4 pages per minute|4", ["3 pages per minute", "4 pages per minute", "6 pages per minute", "18 pages per minute"]],
    ] },
    { slug: "proportional-tables", title: "Proportional Tables", goal: "Recognize a constant ratio in a table.", key: "A table is proportional when y ÷ x has the same value in every row.", example: "(2, 6), (4, 12), (6, 18) all have y/x = 3", standard: "7.RP.A.2", visual: "table", drills: [
      ["For x: 1,2,3 and y: 4,8,12, what is y/x?", "4"], ["Is x: 2,4,6 and y: 5,10,15 proportional?", "yes"], ["Complete a proportional table: x = 3, y = 12; x = 5, y = ?", "20"], ["In y = 7x, find y when x = 6.", "42"], ["Which pair belongs to y = 2.5x?", "(4,10)", ["(2,4)", "(4,10)", "(5,10)", "(6,12)"]],
    ] },
    { slug: "proportional-graphs", title: "Graphs of Proportions", goal: "Read proportional relationships on a graph.", key: "A proportional graph is a straight line through the origin.", example: "y = 2x passes through (0, 0) and (3, 6)", standard: "7.RP.A.2", visual: "line-graph", drills: [
      ["Must a proportional graph pass through (0, 0)?", "yes"], ["A line passes through (0,0) and (4,12). What is its constant?", "3"], ["Is y = 5x proportional?", "yes"], ["Is y = 5x + 2 proportional?", "no"], ["A proportional graph contains (6, 9). Find y/x.", "3/2|1.5"],
    ] },
    { slug: "scale-drawings", title: "Scale Drawings", goal: "Use a scale to move between a drawing and real size.", key: "Multiply or divide every length by the same scale factor.", example: "1 cm : 4 m, so 6 cm represents 24 m", standard: "7.G.A.1", visual: "scale", drills: [
      ["Scale: 1 cm = 5 m. What does 7 cm represent?", "35|35 m"], ["A 24 m wall is 6 cm on a plan. Meters per centimeter?", "4"], ["Scale 1:100. A 3 cm line represents how many cm?", "300"], ["A model is 1/20 actual size. Actual length 80 cm; model length?", "4|4 cm"], ["A map uses 2 cm = 15 km. What does 6 cm represent?", "45|45 km"],
    ] },
  ]),
  makeRegion(2, "Rational Number Operations", "Work confidently with positive and negative fractions and decimals.", "7.NS.A.1–3", [
    { slug: "add-rational-numbers", title: "Add Rational Numbers", goal: "Add signed numbers using distance and direction.", key: "Same signs combine; different signs subtract their distances and keep the sign of the larger distance.", example: "−7 + 3 = −4", standard: "7.NS.A.1", visual: "number-line", drills: [
      ["Calculate −8 + 5.", "-3"], ["Calculate 6 + (−11).", "-5"], ["Calculate −3.5 + 1.2.", "-2.3"], ["Calculate −2/3 + 1/6.", "-1/2"], ["A temperature of −4°C rises 9°C. New temperature?", "5|5°C"],
    ] },
    { slug: "subtract-rational-numbers", title: "Subtract Rational Numbers", goal: "Rewrite subtraction as adding the opposite.", key: "a − b means a + (−b).", example: "4 − (−3) = 4 + 3 = 7", standard: "7.NS.A.1", visual: "number-line", drills: [
      ["Calculate 5 − (−6).", "11"], ["Calculate −3 − 7.", "-10"], ["Calculate −8 − (−2).", "-6"], ["Calculate 1/4 − 3/4.", "-1/2"], ["The balance is $12, then a $20 charge occurs. New balance?", "-8|-$8"],
    ] },
    { slug: "multiply-divide-rationals", title: "Multiply and Divide Rational Numbers", goal: "Use sign rules with fractions and decimals.", key: "Same signs give a positive result; different signs give a negative result.", example: "(−3/4) ÷ (1/2) = −3/2", standard: "7.NS.A.2", visual: "sign-grid", drills: [
      ["Calculate (−7)(6).", "-42"], ["Calculate −48 ÷ −8.", "6"], ["Calculate (−2/3)(9/4).", "-3/2|-1.5"], ["Calculate 3.6 ÷ (−1.2).", "-3"], ["What sign has a quotient of two negative numbers?", "positive", ["positive", "negative", "zero"]],
    ] },
    { slug: "rational-word-problems", title: "Rational Number Problems", goal: "Choose operations for real changes above and below zero.", key: "Label the starting value, the signed change, and the final value.", example: "Start 5 m, descend 12 m → 5 + (−12) = −7 m", standard: "7.NS.A.3", visual: "steps", drills: [
      ["A diver is at −8 m and descends 5 m. New depth?", "-13|-13 m"], ["A debt of $24 is split equally across 6 payments. Change per payment?", "-4|-$4"], ["A stock changes −2.5, +1.2, and +0.8. Total change?", "-0.5"], ["An elevator goes from floor −3 to floor 8. How many floors?", "11"], ["A game score is −6, then doubles. New score?", "-12"],
    ] },
  ]),
  makeRegion(3, "Expressions, Equations, and Inequalities", "Write, simplify, and solve statements with unknown values.", "7.EE.A–B", [
    { slug: "equivalent-expressions", title: "Equivalent Expressions", goal: "Rewrite expressions without changing their value.", key: "Use properties to combine like terms and factor common coefficients.", example: "3x + 6 = 3(x + 2)", standard: "7.EE.A.1–2", visual: "expression", drills: [
      ["Simplify 4x + 3x.", "7x"], ["Expand 5(a − 2).", "5a-10"], ["Factor 6y + 18.", "6(y+3)"], ["Simplify 2m + 7 − 5m.", "-3m+7|7-3m"], ["Which equals 4(x + 3)?", "4x+12", ["4x+3", "4x+7", "4x+12", "x+12"]],
    ] },
    { slug: "multi-step-equations-g7", title: "Multi-Step Equations", goal: "Solve equations by undoing operations in order.", key: "Simplify each side, then use inverse operations while keeping both sides balanced.", example: "3x + 5 = 20 → x = 5", standard: "7.EE.B.4", visual: "balance", drills: [
      ["Solve 3x + 5 = 20.", "5"], ["Solve 7 − 2x = 15.", "-4"], ["Solve x/4 + 6 = 9.", "12"], ["Solve 5(x − 1) = 30.", "7"], ["Solve 0.5x + 2 = 8.", "12"],
    ] },
    { slug: "inequalities-g7", title: "Inequalities", goal: "Solve and graph a range of possible values.", key: "Reverse the inequality sign only when multiplying or dividing by a negative number.", example: "−2x > 8 → x < −4", standard: "7.EE.B.4", visual: "inequality-line", drills: [
      ["Solve x + 4 > 9.", "x>5|>5"], ["Solve 3x ≤ 18.", "x<=6|x≤6|≤6"], ["Solve −2x > 8.", "x<-4|<-4"], ["Solve x/5 − 1 ≥ 2.", "x>=15|x≥15|≥15"], ["Which value satisfies x < 3?", "2", ["5", "3", "2", "7"]],
    ] },
    { slug: "equation-word-models", title: "Equation Word Models", goal: "Turn a situation into an equation or inequality.", key: "Define the unknown first, then translate each quantity and relationship.", example: "$4 per ride plus $3 fee totals $19 → 4r + 3 = 19", standard: "7.EE.B.3–4", visual: "model", drills: [
      ["$5 per ticket plus $2 fee totals $27. How many tickets?", "5"], ["A number decreased by 8 is 14. Find it.", "22"], ["Three equal boxes and 4 loose items total 25. Items per box?", "7"], ["At least 60 points; you have 18 and earn 6 per round. Minimum rounds?", "7"], ["A 90-page book: 12 pages read each day. Days to finish at most?", "8"],
    ] },
  ]),
  makeRegion(4, "Percents and Proportions", "Use percent to describe change, cost, and comparison.", "7.RP.A.3", [
    { slug: "percent-change", title: "Percent Change", goal: "Measure an increase or decrease relative to the original.", key: "Percent change = change ÷ original × 100%.", example: "50 to 60: 10/50 = 20% increase", standard: "7.RP.A.3", visual: "percent-grid", drills: [
      ["Price rises from 40 to 50. Percent increase?", "25%|25"], ["Value falls from 80 to 60. Percent decrease?", "25%|25"], ["A population grows from 200 to 230. Percent increase?", "15%|15"], ["A score drops from 90 to 81. Percent decrease?", "10%|10"], ["What is the original value in a percent-change fraction?", "the starting value|starting value|original value"],
    ] },
    { slug: "discount-markup", title: "Discount and Markup", goal: "Find a sale price or marked-up price.", key: "Find the percent amount, then subtract for discount or add for markup.", example: "$80 with 25% off → $60", standard: "7.RP.A.3", visual: "percent-grid", drills: [
      ["$80 with 25% off. Sale price?", "60|$60"], ["$50 marked up 20%. New price?", "60|$60"], ["$120 with 15% discount. Discount amount?", "18|$18"], ["A $40 item sells for $34. Percent discount?", "15%|15"], ["Cost $30, markup $9. Percent markup?", "30%|30"],
    ] },
    { slug: "tax-tip-commission", title: "Tax, Tip, and Commission", goal: "Use percent in everyday payment problems.", key: "Multiply the base amount by the percent written as a decimal.", example: "18% tip on $50 = $9", standard: "7.RP.A.3", visual: "percent-grid", drills: [
      ["Find 8% tax on $75.", "6|$6"], ["Find a 20% tip on $45.", "9|$9"], ["A 5% commission on $2,000 equals?", "100|$100"], ["A $60 meal has 10% tax. Total?", "66|$66"], ["A $32 bill plus 15% tip totals?", "36.8|$36.80"],
    ] },
    { slug: "simple-interest", title: "Simple Interest", goal: "Find interest from principal, rate, and time.", key: "Simple interest uses I = Prt, with the rate written as a decimal.", example: "$500 at 4% for 2 years → I = $40", standard: "7.RP.A.3", visual: "formula", drills: [
      ["$500 at 4% for 2 years. Interest?", "40|$40"], ["$800 at 5% for 3 years. Interest?", "120|$120"], ["$300 earns $18 in 2 years. Annual rate?", "3%|3"], ["$1,000 at 2.5% for 4 years. Final amount?", "1100|$1100"], ["In I = Prt, what does P mean?", "principal|starting amount"],
    ] },
  ]),
  makeRegion(5, "Geometry and Circles", "Use angle facts, scale, and circle formulas.", "7.G.A–B", [
    { slug: "constructing-triangles", title: "Constructing Triangles", goal: "Decide when side or angle conditions make a unique triangle.", key: "Three side lengths form a triangle only when every pair sums to more than the third side.", example: "3, 4, 5 forms a triangle because 3 + 4 > 5", standard: "7.G.A.2", visual: "triangle", drills: [
      ["Can sides 3, 4, 5 form a triangle?", "yes"], ["Can sides 2, 3, 6 form a triangle?", "no"], ["Can sides 5, 5, 9 form a triangle?", "yes"], ["Which set cannot form a triangle?", "1,2,4|1, 2, 4", ["3,4,6", "1,2,4", "5,5,8"]], ["Two sides are 4 and 7. Must the third side be greater than what value?", "3"],
    ] },
    { slug: "angle-equations", title: "Angle Equations", goal: "Find missing angles with equations.", key: "Vertical angles are equal; complementary total 90°; supplementary total 180°.", example: "x + 35 = 90 → x = 55°", standard: "7.G.B.5", visual: "angles", drills: [
      ["An angle supplements 125°. Find it.", "55|55°"], ["An angle complements 38°. Find it.", "52|52°"], ["Vertical angles are (3x + 5)° and 50°. Find x.", "15"], ["A straight angle is split into x and 2x. Find x.", "60|60°"], ["Two equal supplementary angles each measure?", "90|90°"],
    ] },
    { slug: "circle-measures", title: "Circle Measures", goal: "Connect radius, diameter, circumference, and area.", key: "Diameter is 2r, circumference is 2πr, and area is πr².", example: "r = 4 → C = 8π and A = 16π", standard: "7.G.B.4", visual: "circle", drills: [
      ["Radius 6. Diameter?", "12"], ["Radius 5. Exact circumference?", "10pi|10π"], ["Diameter 14. Exact circumference?", "14pi|14π"], ["Radius 3. Exact area?", "9pi|9π"], ["Area 49π. Radius?", "7"],
    ] },
    { slug: "scale-area", title: "Scale Factor and Area", goal: "Predict how scaling changes length and area.", key: "Lengths scale by k; areas scale by k².", example: "Scale factor 3 makes area 9 times as large", standard: "7.G.A.1", visual: "dilation", drills: [
      ["Scale factor 2. Area factor?", "4"], ["Scale factor 1/2. Area factor?", "1/4|0.25"], ["A 6 cm side scales by 3. New side?", "18|18 cm"], ["Area 20 scales by factor 2. New area?", "80"], ["Area becomes 25 times larger. Positive length scale factor?", "5"],
    ] },
  ]),
  makeRegion(6, "Area, Surface Area, and Volume", "Measure composite figures and three-dimensional objects.", "7.G.B.6", [
    { slug: "composite-area", title: "Composite Area", goal: "Break an irregular figure into familiar shapes.", key: "Add non-overlapping parts or subtract missing parts from a larger shape.", example: "10×8 rectangle minus 3×2 cutout = 74 square units", standard: "7.G.B.6", visual: "area", drills: [
      ["A 10×8 rectangle has a 3×2 corner removed. Area?", "74"], ["Two non-overlapping rectangles have areas 24 and 15. Total area?", "39"], ["Rectangle 12×5 plus triangle base 4 height 3. Total area?", "66"], ["A 9×9 square has a 3×3 hole. Remaining area?", "72"], ["Which units measure area?", "square units", ["units", "square units", "cubic units"]],
    ] },
    { slug: "prism-volume", title: "Volume of Prisms", goal: "Find volume from base area and height.", key: "For any prism, V = Bh.", example: "Base area 12, height 5 → V = 60", standard: "7.G.B.6", visual: "prism", drills: [
      ["Base area 12, height 5. Volume?", "60"], ["Rectangular prism 3×4×8. Volume?", "96"], ["Volume 90, base area 15. Height?", "6"], ["Triangular base area 10, prism length 7. Volume?", "70"], ["Which units measure volume?", "cubic units", ["units", "square units", "cubic units"]],
    ] },
    { slug: "surface-area", title: "Surface Area", goal: "Find the total area of every outer face.", key: "Use a net or list each face once, then add the face areas.", example: "Cube side 4 → 6×16 = 96 square units", standard: "7.G.B.6", visual: "net", drills: [
      ["Cube side 3. Surface area?", "54"], ["Box 2×3×4. Surface area?", "52"], ["A prism has face areas 10,10,12,12,15,15. Total?", "74"], ["Cube surface area is 150. Area of one face?", "25"], ["A net has six equal squares. What solid?", "cube"],
    ] },
    { slug: "cross-sections", title: "Cross-Sections", goal: "Predict the 2D shape made by slicing a solid.", key: "A cross-section is the flat shape where a plane cuts a solid.", example: "A horizontal slice of a cylinder is a circle", standard: "7.G.A.3", visual: "cross-section", drills: [
      ["Horizontal slice of a cylinder?", "circle"], ["Slice a rectangular prism parallel to its base. Shape?", "rectangle"], ["Slice a cone parallel to its base. Shape?", "circle"], ["A vertical slice through a sphere's center?", "circle"], ["Can a cube cross-section be a triangle?", "yes", ["yes", "no"]],
    ] },
  ]),
  makeRegion(7, "Statistics and Sampling", "Use samples and distributions to make careful comparisons.", "7.SP.A–B", [
    { slug: "random-samples", title: "Random Samples", goal: "Choose a sample that represents a population.", key: "Random selection gives every member a fair chance and reduces bias.", example: "Randomly select student IDs instead of asking one lunch table", standard: "7.SP.A.1–2", visual: "sample", drills: [
      ["Survey only basketball players about favorite sports. Biased?", "yes"], ["Select 50 names with a random number generator. Random sample?", "yes"], ["What group does a sample describe?", "population|the population"], ["Which is least biased for a school survey?", "random student IDs", ["one club", "random student IDs", "your friends"]], ["A sample is 10% of 800 people. Sample size?", "80"],
    ] },
    { slug: "center-spread", title: "Center and Spread", goal: "Describe a data set with center and variability.", key: "Use mean or median for center and range or IQR for spread.", example: "For 2, 4, 4, 9, median = 4 and range = 7", standard: "7.SP.B.3–4", visual: "data-line", drills: [
      ["Find the mean of 2, 4, 6.", "4"], ["Find the median of 1, 3, 8, 10.", "5.5"], ["Find the range of 4, 7, 12.", "8"], ["For Q1 = 3 and Q3 = 11, find IQR.", "8"], ["Which center resists a large outlier better?", "median", ["mean", "median"]],
    ] },
    { slug: "compare-distributions", title: "Compare Distributions", goal: "Compare groups using center and spread.", key: "A useful comparison mentions both a typical value and how much values vary.", example: "Group A has the higher median but also the larger IQR", standard: "7.SP.B.3–4", visual: "box-plots", drills: [
      ["A median is 12 and B median is 9. Which has higher center?", "a|group a"], ["A IQR is 3 and B IQR is 8. Which is more variable?", "b|group b"], ["Two distributions have equal medians. Must their spreads match?", "no"], ["What does overlapping box plots suggest?", "some values are similar|overlap|shared range"], ["Difference of means 5 with MAD 1 is a large or small separation?", "large"],
    ] },
    { slug: "informal-inference", title: "Informal Inference", goal: "Use sample evidence to make a cautious population claim.", key: "A larger random sample usually gives a more stable estimate, but every estimate has uncertainty.", example: "62% of a random sample suggests about 62% of the population", standard: "7.SP.A.2", visual: "estimate", drills: [
      ["60% of a random sample of 200 prefer A. Estimated count?", "120"], ["A sample proportion is 0.35. Estimated percent?", "35%|35"], ["Which is usually more stable: sample of 20 or 200?", "200"], ["Can one voluntary online poll represent everyone?", "no"], ["A sample estimates 48% of 1,000 people. Estimated number?", "480"],
    ] },
  ]),
  makeRegion(8, "Probability", "Model simple and compound chance events.", "7.SP.C.5–8", [
    { slug: "probability-scale", title: "The Probability Scale", goal: "Interpret probability from impossible to certain.", key: "Every probability is between 0 and 1, inclusive.", example: "0.5 means an event is equally likely to happen or not happen", standard: "7.SP.C.5", visual: "probability", drills: [
      ["Probability of an impossible event?", "0"], ["Probability of a certain event?", "1|100%"], ["Which is more likely: 0.7 or 0.4?", "0.7"], ["Write 25% as a probability decimal.", "0.25"], ["Can a probability equal 1.2?", "no"],
    ] },
    { slug: "experimental-probability", title: "Experimental Probability", goal: "Estimate chance from repeated trials.", key: "Experimental probability = observed successes ÷ total trials.", example: "18 heads in 30 tosses → 18/30 = 0.6", standard: "7.SP.C.6", visual: "trials", drills: [
      ["12 successes in 20 trials. Experimental probability?", "3/5|0.6|60%"], ["A color appears 15 times in 50 spins. Probability?", "3/10|0.3|30%"], ["At probability 0.4, expected successes in 100 trials?", "40"], ["Do more trials usually make estimates steadier?", "yes"], ["7 misses in 25 attempts. Experimental P(miss)?", "7/25|0.28|28%"],
    ] },
    { slug: "compound-events", title: "Compound Events", goal: "Find probability when independent events occur together.", key: "For independent 'and' events, multiply their probabilities.", example: "Head and roll 6 → 1/2 × 1/6 = 1/12", standard: "7.SP.C.8", visual: "tree", drills: [
      ["Flip a head and roll a 6. Probability?", "1/12"], ["Two heads in two fair flips. Probability?", "1/4|0.25"], ["Roll an even number, then an even number. Probability?", "1/4|0.25"], ["Choose red with P=0.3 twice independently. Probability?", "0.09|9%"], ["For independent events, how do you find P(A and B)?", "multiply|multiply the probabilities"],
    ] },
    { slug: "sample-spaces", title: "Sample Spaces and Simulations", goal: "List outcomes and use simulations for complex chance.", key: "A sample space lists every possible outcome exactly once.", example: "Two coin flips: HH, HT, TH, TT", standard: "7.SP.C.7–8", visual: "tree", drills: [
      ["How many outcomes for two coin flips?", "4"], ["How many outcomes for a die and a coin?", "12"], ["List outcomes for one red/blue spinner and a coin: how many?", "4"], ["Why use a simulation?", "to model repeated chance|model chance|estimate probability"], ["Two dice have how many ordered outcomes?", "36"],
    ] },
  ]),
];
