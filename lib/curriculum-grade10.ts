import type { Accent, LessonDefinition, PracticeQuestion, RegionDefinition } from "./curriculum.ts";
import { buildPracticeQuestion } from "./question-interactions.ts";

type Drill = [prompt: string, answer: string, choices?: string[]];
type LessonSpec = { slug: string; title: string; goal: string; key: string; example: string; steps?: string[]; standard: string; visual: string; drills: Drill[] };
const accents: Accent[] = ["blue", "teal", "violet", "coral", "gold"];

function makeLesson(regionId: number, order: number, accent: Accent, spec: LessonSpec): LessonDefinition {
  const practice: PracticeQuestion[] = spec.drills.map(([prompt, answer, choices], index) => buildPracticeQuestion({ id: `q${index + 1}`, prompt, answer, choices, hint: spec.key }));
  return {
    id: `g10-r${regionId}-l${order}`,
    grade: 10,
    slug: `g10-${spec.slug}`,
    regionId,
    order,
    title: spec.title,
    goal: spec.goal,
    keyIdea: spec.key,
    example: spec.example,
    exampleSteps: spec.steps ?? ["Name what is known and what must be found.", spec.key, `Check the result against the model: ${spec.example}.`],
    standard: spec.standard,
    accent,
    visual: spec.visual,
    practice,
  };
}

function makeRegion(order: number, title: string, subtitle: string, standard: string, specs: LessonSpec[]): RegionDefinition {
  const id = 1000 + order;
  const accent = accents[(order - 1) % accents.length];
  return { id, grade: 10, order, slug: `g10-${specs[0].slug}`, title, subtitle, standard, accent, lessons: specs.map((spec, index) => makeLesson(id, index + 1, accents[(order + index - 1) % accents.length], spec)) };
}

export const grade10Regions: RegionDefinition[] = [
  makeRegion(1, "Reasoning and Proof", "Build valid arguments from definitions, diagrams, and theorems.", "HSG.CO.A–C", [
    { slug: "logic-and-conditionals", title: "Logic and Conditionals", goal: "Read if-then statements and their related forms.", key: "A conditional and its contrapositive are logically equivalent; the converse may not be.", example: "If a figure is a square, then it has four right angles", standard: "HSG.CO.C.9", visual: "steps", drills: [
      ["In 'If p, then q,' which part is the conclusion?", "q"], ["Write the converse of 'If p, then q.'", "if q then p|if q, then p"], ["Which statement is equivalent to a conditional?", "contrapositive", ["converse", "inverse", "contrapositive"]], ["A counterexample is used to disprove what kind of claim?", "universal claim|a universal claim"], ["True or false: every rectangle is a square.", "false", ["true", "false"]],
    ] },
    { slug: "definitions-and-postulates", title: "Definitions and Postulates", goal: "Separate agreed facts from conclusions that require proof.", key: "Definitions give exact meaning; postulates are accepted without proof; theorems are proved.", example: "A midpoint divides a segment into two congruent segments", standard: "HSG.CO.C.9", visual: "steps", drills: [
      ["What divides a segment into two congruent segments?", "midpoint|a midpoint"], ["A statement accepted without proof is a what?", "postulate|axiom"], ["A statement established by proof is a what?", "theorem"], ["If M is midpoint of AB and AB = 14, find AM.", "7"], ["Which word means equal in measure?", "congruent", ["parallel", "congruent", "perpendicular"]],
    ] },
    { slug: "angle-proofs", title: "Angle Relationships", goal: "Use vertical, complementary, and supplementary angle facts.", key: "Vertical angles are congruent; a linear pair sums to 180°; complementary angles sum to 90°.", example: "Angles measuring 3x + 10 and 5x − 30 are vertical angles, so x = 20", standard: "HSG.CO.C.9", visual: "angles", drills: [
      ["Vertical angles measure 4x + 6 and 6x − 18. Find x.", "12"], ["Two angles form a linear pair. One is 68°. Find the other.", "112|112°"], ["Complement of 37°?", "53|53°"], ["If two parallel lines are cut by a transversal, corresponding angles are?", "congruent|equal"], ["Same-side interior angles between parallel lines sum to?", "180|180°"],
    ] },
    { slug: "proof-structure", title: "Build a Geometric Proof", goal: "Link statements with reasons in a valid order.", key: "Begin with the givens, justify each step, and finish with the exact claim.", example: "Given M is midpoint of AB → AM = MB by definition of midpoint", standard: "HSG.CO.C.10", visual: "steps", drills: [
      ["A proof should begin from what information?", "givens|the givens|given information"], ["If AB = CD and CD = EF, why is AB = EF?", "transitive property|transitive"], ["If x = y, why may 3x = 3y?", "multiplication property of equality|multiplication property"], ["If two angles are each 90°, they are congruent by what idea?", "all right angles are congruent|right angle congruence"], ["What ends a proof?", "the claim|conclusion|what was to be proved"],
    ] },
    { slug: "geometric-constructions", title: "Geometric Constructions", goal: "Use compass-and-straightedge moves to construct bisectors, perpendiculars, and regular shapes.", key: "A valid construction uses intersections of equal-radius arcs and straight lines; measurements can check the result but do not create it.", example: "Equal-radius arcs from A and B meet on the perpendicular bisector of segment AB", steps: ["Open the compass wider than half of AB and draw equal-radius arcs from A and B.", "Connect the two arc intersections; both are equidistant from A and B.", "The connecting line crosses AB at its midpoint and forms a 90° angle."], standard: "HSG.CO.D.12–13", visual: "construction", drills: [
      ["Which tool transfers an exact distance in a classical construction?", "compass", ["compass", "protractor", "calculator", "grid paper"]],
      ["Points where equal-radius arcs from both endpoints meet lie on which line?", "the perpendicular bisector", ["the perpendicular bisector", "a parallel line", "the segment itself", "a tangent"]],
      ["An angle bisector creates two angles that are what?", "congruent", ["congruent", "supplementary", "vertical", "always right"]],
      ["Which construction locates points equidistant from A and B?", "perpendicular bisector", ["perpendicular bisector", "parallel through A", "angle copy", "tangent at A"]],
      ["To inscribe a regular hexagon in a circle, what length can be stepped around the circle?", "the radius", ["the radius", "the diameter", "half the radius", "the circumference"]],
    ] },
  ]),
  makeRegion(2, "Congruence and Transformations", "Use rigid motions and triangle criteria to prove sameness.", "HSG.CO.A–B", [
    { slug: "rigid-transformations", title: "Rigid Transformations", goal: "Recognize translations, rotations, and reflections.", key: "Rigid motions preserve distances and angle measures, so they preserve congruence.", example: "(x,y) → (x+3,y−2) translates right 3 and down 2", standard: "HSG.CO.A.2–5", visual: "coordinate-transform", drills: [
      ["Translate (2, −1) right 4 and up 3.", "(6,2)|6,2"], ["Reflect (5, −2) across the x-axis.", "(5,2)|5,2"], ["Rotate (3, 1) 90° counterclockwise about the origin.", "(-1,3)|−1,3"], ["Do rigid motions preserve length?", "yes"], ["Which is not rigid?", "dilation", ["translation", "reflection", "rotation", "dilation"]],
    ] },
    { slug: "triangle-congruence", title: "Triangle Congruence", goal: "Choose a valid triangle congruence test.", key: "SSS, SAS, ASA, AAS, and HL establish congruence; AAA and SSA do not.", example: "Two sides and the included angle give SAS", standard: "HSG.CO.B.7–8", visual: "congruence", drills: [
      ["Three matching side pairs prove congruence by?", "SSS"], ["Two sides and the included angle prove congruence by?", "SAS"], ["Is AAA a congruence test?", "no"], ["For right triangles, hypotenuse and one leg give?", "HL|hypotenuse-leg"], ["Two angles and a non-included side give?", "AAS"],
    ] },
    { slug: "cpctc", title: "Corresponding Parts", goal: "Use congruence to conclude matching parts are equal.", key: "After triangles are proved congruent, CPCTC justifies congruent corresponding sides and angles.", example: "△ABC ≅ △DEF means AB ↔ DE and ∠C ↔ ∠F", standard: "HSG.CO.B.7", visual: "congruence", drills: [
      ["If △ABC ≅ △DEF, which side corresponds to BC?", "EF"], ["If △ABC ≅ △DEF, which angle corresponds to ∠A?", "∠D|D"], ["What does CPCTC stand for?", "corresponding parts of congruent triangles are congruent"], ["If AC = 9, what is DF?", "9"], ["May CPCTC be used before proving triangles congruent?", "no"],
    ] },
    { slug: "isosceles-triangles", title: "Isosceles Triangle Theorems", goal: "Connect equal sides with equal base angles.", key: "In a triangle, congruent sides have congruent opposite angles, and the converse is true.", example: "AB = AC → ∠B = ∠C", standard: "HSG.CO.C.10", visual: "triangle", drills: [
      ["If AB = AC, which angles are congruent?", "B and C|∠B and ∠C"], ["An isosceles triangle has vertex angle 40°. Each base angle?", "70|70°"], ["Two equal angles are 55°. Third angle?", "70|70°"], ["If ∠A = ∠B, which opposite sides are equal?", "BC and AC|AC and BC"], ["An equilateral triangle has each angle equal to?", "60|60°"],
    ] },
  ]),
  makeRegion(3, "Similarity and Right Triangles", "Scale figures and solve right triangles with ratios.", "HSG.SRT.A–C", [
    { slug: "similarity-transformations", title: "Similarity Transformations", goal: "Use dilations and rigid motions to establish similarity.", key: "A dilation preserves angles and multiplies every length by one scale factor.", example: "Scale factor 1.5 turns a side of 8 into 12", standard: "HSG.SRT.A.1–3", visual: "dilation", drills: [
      ["Scale factor 3 sends length 5 to?", "15"], ["Scale factor 1/2 sends (8, −6) from the origin to?", "(4,-3)|4,-3"], ["Do dilations preserve angle measure?", "yes"], ["Similar figures have corresponding side lengths that are?", "proportional"], ["If corresponding sides are 6 and 9, scale factor?", "1.5|3/2"],
    ] },
    { slug: "triangle-similarity", title: "Triangle Similarity", goal: "Use AA, SAS, or SSS similarity.", key: "AA needs two equal angles; SAS and SSS compare proportional side lengths.", example: "Two angle pairs match, so the triangles are similar by AA", standard: "HSG.SRT.A.2–3", visual: "triangle", drills: [
      ["Two matching angle pairs prove similarity by?", "AA"], ["Triangles have side lengths 3, 4, 5 and 6, 8, 10. Which test proves they are similar?", "SSS"], ["A triangle has angles 40°, 60°, 80°. A similar triangle must have what angles?", "40,60,80|40°,60°,80°"], ["If scale factor is 2 and small side is 7, large side?", "14"], ["Are all right triangles similar?", "no"],
    ] },
    { slug: "right-triangle-trig", title: "Sine, Cosine, and Tangent", goal: "Use side ratios to find missing sides and angles.", key: "Relative to angle θ: sin = opposite/hypotenuse, cos = adjacent/hypotenuse, tan = opposite/adjacent.", example: "Opposite 3, adjacent 4, hypotenuse 5 → sin θ = 3/5", standard: "HSG.SRT.C.6–8", visual: "right-triangle", drills: [
      ["Opposite 3, hypotenuse 5. Find sin θ.", "3/5|0.6"], ["Adjacent 4, hypotenuse 5. Find cos θ.", "4/5|0.8"], ["Opposite 6, adjacent 8. Find tan θ.", "3/4|0.75"], ["Which ratio uses opposite and adjacent?", "tangent|tan"], ["A 45-45-90 triangle with leg 5 has hypotenuse?", "5sqrt(2)|5√2"],
    ] },
    { slug: "special-right-triangles", title: "Special Right Triangles", goal: "Use exact side patterns for 45-45-90 and 30-60-90 triangles.", key: "45-45-90 sides are x,x,x√2; 30-60-90 sides are x,x√3,2x.", example: "Short leg 4 in a 30-60-90 triangle gives hypotenuse 8", standard: "HSG.SRT.C.8", visual: "right-triangle", drills: [
      ["45-45-90 leg 7. Hypotenuse?", "7sqrt(2)|7√2"], ["30-60-90 short leg 5. Hypotenuse?", "10"], ["30-60-90 short leg 3. Long leg?", "3sqrt(3)|3√3"], ["45-45-90 hypotenuse 12. Each leg?", "6sqrt(2)|6√2"], ["Which side is opposite 30° in a 30-60-90 triangle?", "short leg|the short leg"],
    ] },
    { slug: "similarity-proofs", title: "Similarity Proofs and Proportions", goal: "Use parallel lines and triangle similarity to prove proportional relationships.", key: "A line parallel to one side of a triangle creates a smaller similar triangle, so corresponding side lengths form equal ratios.", example: "DE ∥ BC in △ABC gives AD/AB = AE/AC = DE/BC", steps: ["Use DE ∥ BC to mark two pairs of equal corresponding angles.", "Conclude △ADE ∼ △ABC by AA similarity.", "Match vertices in order, then write AD/AB = AE/AC = DE/BC."], standard: "HSG.SRT.B.4–5", visual: "triangle", drills: [
      ["If DE ∥ BC in △ABC, why are △ADE and △ABC similar?", "AA similarity", ["AA similarity", "SSS congruence", "vertical angles only", "the triangles share one side"]],
      ["A parallel segment divides two triangle sides in what way?", "proportionally", ["proportionally", "into equal lengths", "perpendicularly", "randomly"]],
      ["In similar triangles, small/large = 3/5. A large side is 20. Matching small side?", "12", ["8", "12", "15", "25"]],
      ["Two similar triangles have scale factor 2 from small to large. Their area factor is?", "4", ["2", "3", "4", "8"]],
      ["Which statement follows from triangle similarity?", "corresponding sides are proportional", ["corresponding sides are proportional", "all corresponding sides are equal", "areas have the same value", "every angle is 90°"]],
    ] },
    { slug: "laws-of-sines-and-cosines", title: "Laws of Sines and Cosines", goal: "Solve general triangles and choose the law that matches the known information.", key: "Use the Law of Sines with known opposite pairs; use the Law of Cosines with SSS or SAS data, and use area = ½ab sin C for two sides and the included angle.", example: "a = 5, b = 7, C = 60° gives c² = 5² + 7² − 2(5)(7)cos60° = 39", steps: ["The known information is SAS, so choose c² = a² + b² − 2ab cos C.", "Substitute 5, 7, and 60° to get c² = 25 + 49 − 70(0.5) = 39.", "Take the positive square root: c = √39 ≈ 6.2, which fits between |7−5| and 7+5."], standard: "HSG.SRT.D.9–11", visual: "triangle-law", drills: [
      ["Given a=5, b=7, and included angle C=60°, which law finds c directly?", "Law of Cosines", ["Law of Cosines", "Law of Sines", "Pythagorean theorem only", "arc-length formula"]],
      ["For a=5, b=7, C=60°, what is c²?", "39", ["24", "39", "49", "74"]],
      ["If A=30°, a=5, and B=90°, find b.", "10", ["5", "5√2", "10", "15"]],
      ["Find the area when a=6, b=8, and included angle C=30°.", "12", ["12", "24", "48", "96"]],
      ["Which data naturally start with the Law of Sines?", "two angles and one side", ["two angles and one side", "three sides", "two sides and their included angle", "one side only"]],
    ] },
  ]),
  makeRegion(4, "Coordinate Geometry", "Prove geometric facts and model figures on the coordinate plane.", "HSG.GPE.B", [
    { slug: "distance-midpoint", title: "Distance and Midpoint", goal: "Measure and locate between coordinate points.", key: "Distance uses the Pythagorean theorem; midpoint averages the x-values and y-values.", example: "Between (0,0) and (6,8): distance 10, midpoint (3,4)", standard: "HSG.GPE.B.4–7", visual: "distance", drills: [
      ["Distance from (0,0) to (3,4)?", "5"], ["Midpoint of (2,6) and (8,10)?", "(5,8)|5,8"], ["Distance between (−1,2) and (−1,9)?", "7"], ["Midpoint of (−4,3) and (2,−1)?", "(-1,1)|−1,1"], ["A segment with horizontal change 5 and vertical change 12 has length?", "13"],
    ] },
    { slug: "parallel-perpendicular", title: "Parallel and Perpendicular Lines", goal: "Use slopes to classify line relationships.", key: "Parallel nonvertical lines have equal slopes; the slopes of perpendicular lines have product −1.", example: "Lines with slopes 2/3 and −3/2 are perpendicular", standard: "HSG.GPE.B.5", visual: "line-graph", drills: [
      ["Are lines with slopes 4 and 4 parallel or perpendicular?", "parallel"], ["A line perpendicular to slope 2 has slope?", "-1/2"], ["A line parallel to y = −3x + 1 has slope?", "-3"], ["Are lines with slopes 1/3 and −3 perpendicular?", "yes"], ["Vertical and horizontal lines are?", "perpendicular"],
    ] },
    { slug: "coordinate-proofs", title: "Coordinate Proofs", goal: "Use slope and distance to prove shape properties.", key: "Show equal side lengths, equal slopes, or negative reciprocal slopes that match the shape definition.", example: "Four equal side lengths and one right angle prove a square", standard: "HSG.GPE.B.4–5", visual: "coordinate", drills: [
      ["To prove a quadrilateral is a parallelogram, show both pairs of opposite sides are?", "parallel"], ["To prove a rectangle, a parallelogram needs one what?", "right angle"], ["To prove a rhombus, show all four sides are?", "congruent|equal"], ["Segment AB slope 2 and CD slope 2. What relation is possible?", "parallel"], ["Equal diagonals alone prove every quadrilateral is a rectangle?", "no"],
    ] },
    { slug: "partition-segments", title: "Partition a Segment", goal: "Locate a point that divides a segment in a given ratio.", key: "For a fraction t from A to B, use A + t(B − A) on each coordinate.", example: "One third from (0,0) to (6,9) is (2,3)", standard: "HSG.GPE.B.6", visual: "coordinate", drills: [
      ["Halfway from (2,4) to (8,10)?", "(5,7)|5,7"], ["One third from (0,0) to (9,6)?", "(3,2)|3,2"], ["Three fourths from (0,0) to (8,12)?", "(6,9)|6,9"], ["Point dividing A to B in ratio 1:1 is the?", "midpoint"], ["One half from (−4,2) to (2,8)?", "(-1,5)|−1,5"],
    ] },
  ]),
  makeRegion(5, "Circles", "Connect arcs, angles, chords, tangents, and equations.", "HSG.C.A–B · HSG.GPE.A.1", [
    { slug: "circle-angle-theorems", title: "Angles in Circles", goal: "Relate central and inscribed angles to intercepted arcs.", key: "A central angle equals its arc; an inscribed angle equals half its intercepted arc.", example: "An inscribed angle intercepting 100° measures 50°", standard: "HSG.C.A.2", visual: "circle", drills: [
      ["Central angle intercepts an 80° arc. Angle measure?", "80|80°"], ["Inscribed angle intercepts a 120° arc. Angle measure?", "60|60°"], ["An inscribed angle is 35°. Its intercepted arc?", "70|70°"], ["An angle inscribed in a semicircle is?", "90|90°|right angle"], ["A full circle contains how many degrees?", "360|360°"],
    ] },
    { slug: "chords-and-tangents", title: "Chords and Tangents", goal: "Use radius, chord, and tangent relationships.", key: "A radius to a point of tangency is perpendicular to the tangent; equal chords intercept equal arcs.", example: "Radius OT and tangent line at T form a 90° angle", standard: "HSG.C.A.2–4", visual: "circle", drills: [
      ["Radius and tangent at the contact point form what angle?", "90|90°|right angle"], ["Congruent chords intercept arcs that are?", "congruent|equal"], ["A line touching a circle at one point is a?", "tangent"], ["A segment with endpoints on a circle is a?", "chord"], ["The longest chord of a circle is the?", "diameter"],
    ] },
    { slug: "arc-length-sector-area", title: "Arc Length and Sector Area", goal: "Find a fraction of circumference or circle area.", key: "Use θ/360 times the full circumference for arc length or full area for sector area.", example: "90° in radius 4 gives arc 2π and sector area 4π", standard: "HSG.C.B.5", visual: "circle", drills: [
      ["Radius 6, central angle 60°. Exact arc length?", "2pi|2π"], ["Radius 4, angle 90°. Exact sector area?", "4pi|4π"], ["Radius 10, angle 180°. Arc length?", "10pi|10π"], ["A 72° sector is what fraction of a circle?", "1/5|0.2"], ["Radius 3, angle 120°. Sector area?", "3pi|3π"],
    ] },
    { slug: "circle-equations", title: "Equations of Circles", goal: "Read and write a circle from its center and radius.", key: "A circle centered at (h,k) with radius r has equation (x−h)²+(y−k)²=r².", example: "Center (2,−1), radius 3 → (x−2)²+(y+1)²=9", standard: "HSG.GPE.A.1", visual: "coordinate", drills: [
      ["Center and radius of x² + y² = 25?", "(0,0),5|center (0,0), radius 5"], ["Write circle center (3,−2), radius 4.", "(x-3)^2+(y+2)^2=16"], ["Center of (x+5)²+(y−1)²=9?", "(-5,1)|−5,1"], ["Radius of (x−2)²+(y+4)²=36?", "6"], ["Does (3,4) lie on x²+y²=25?", "yes"],
    ] },
  ]),
  makeRegion(6, "Measurement and Modeling", "Use area, volume, density, and similarity in real situations.", "HSG.GMD.A–B · HSG.MG.A", [
    { slug: "area-and-similarity", title: "Area under Scaling", goal: "Predict how area changes with scale.", key: "If lengths scale by k, areas scale by k².", example: "Scale factor 3 multiplies area by 9", standard: "HSG.MG.A.1", visual: "scale", drills: [
      ["Length scale factor 4. Area factor?", "16"], ["Area factor 25. Positive length scale factor?", "5"], ["A similar figure has scale factor 1/2. Area 80 becomes?", "20"], ["Side length doubles. Perimeter factor?", "2"], ["Side length doubles. Area factor?", "4"],
    ] },
    { slug: "volume-and-scaling", title: "Volume under Scaling", goal: "Predict how volume changes with scale.", key: "If lengths scale by k, volumes scale by k³.", example: "Scale factor 2 multiplies volume by 8", standard: "HSG.GMD.A.1–3", visual: "solid-compare", drills: [
      ["Length scale factor 3. Volume factor?", "27"], ["Volume factor 64. Positive length scale factor?", "4"], ["A solid volume 10 scales by factor 2. New volume?", "80"], ["Radius doubles in a sphere. Volume factor?", "8"], ["Radius and height both triple in a cylinder. Volume factor?", "27"],
    ] },
    { slug: "density-and-units", title: "Density and Units", goal: "Use units to build and check a model.", key: "Density = mass/volume; carry units through every calculation and convert before combining.", example: "Mass 240 g, volume 80 cm³ → density 3 g/cm³", standard: "HSG.MG.A.2–3", visual: "formula", drills: [
      ["Mass 200 g, volume 50 cm³. Density?", "4|4 g/cm^3|4g/cm³"], ["Density 5 g/cm³, volume 12 cm³. Mass?", "60|60g"], ["Convert 2.5 m to centimeters.", "250|250 cm"], ["Which units describe speed?", "distance per time|miles per hour|meters per second"], ["A model's units do not match. Is the equation likely valid?", "no"],
    ] },
    { slug: "modeling-with-geometry", title: "Model with Geometry", goal: "Choose assumptions, formulas, and precision for a real object.", key: "Approximate a complex object with familiar shapes, state assumptions, then report sensible units and precision.", example: "Model a can as a cylinder: V=πr²h", standard: "HSG.MG.A.1–3", visual: "cylinder", drills: [
      ["Best common model for a soup can?", "cylinder", ["sphere", "cylinder", "cone"]], ["Best common model for a ball?", "sphere", ["sphere", "prism", "cone"]], ["A cylinder r=3, h=10 has exact volume?", "90pi|90π"], ["Why state assumptions?", "to explain the model's limits|explain model limits|clarity"], ["Volume should use what kind of units?", "cubic units"],
    ] },
    { slug: "cross-sections-and-rotations", title: "Cross-Sections and Solids of Rotation", goal: "Predict two-dimensional slices and three-dimensional solids created by rotation.", key: "A plane intersection creates a cross-section; rotating a region around an axis sweeps out a solid whose radius is its distance from the axis.", example: "Rotating a rectangle around one side creates a cylinder", steps: ["Mark the rotation axis along one side of the rectangle.", "Every point sweeps a circle whose radius is its distance from the axis.", "The opposite side sweeps the outer cylinder; the rectangle height becomes the cylinder height."], standard: "HSG.GMD.B.4", visual: "cross-section", drills: [
      ["A plane parallel to a cylinder's circular base creates what cross-section?", "circle", ["circle", "triangle", "parabola", "pentagon"]],
      ["A plane through the axis of a right circular cylinder creates what cross-section?", "rectangle", ["rectangle", "circle", "ellipse only", "hexagon"]],
      ["Rotating a rectangle around one of its sides creates a what?", "cylinder", ["cylinder", "sphere", "cone", "pyramid"]],
      ["Rotating a right triangle around one leg creates a what?", "cone", ["cone", "prism", "sphere", "torus"]],
      ["As a horizontal slice moves from a sphere's center toward its top, its circular radius does what?", "decreases", ["decreases", "increases", "stays constant", "becomes negative"]],
    ] },
  ]),
  makeRegion(7, "Probability", "Use counting, conditional probability, and independence.", "HSS.CP.A–B", [
    { slug: "sets-and-sample-spaces", title: "Sets and Sample Spaces", goal: "Represent events with lists, tables, and diagrams.", key: "The sample space contains every possible outcome; an event is a subset of it.", example: "Two coins: {HH, HT, TH, TT}", standard: "HSS.CP.A.1", visual: "tree", drills: [
      ["How many outcomes for two coin flips?", "4"], ["A die and a coin have how many ordered outcomes?", "12"], ["An event is a subset of the what?", "sample space"], ["The complement of an event contains outcomes where it does?", "not occur|does not occur"], ["P(A)+P(not A)=?", "1"],
    ] },
    { slug: "addition-rule", title: "The Addition Rule", goal: "Find probability of A or B without double-counting.", key: "P(A or B)=P(A)+P(B)−P(A and B).",
      example: "P(A)=0.6, P(B)=0.5, overlap=0.2 → union=0.9", standard: "HSS.CP.B.7", visual: "probability", drills: [
      ["P(A)=0.4, P(B)=0.5, P(A and B)=0.2. Find P(A or B).", "0.7|70%"], ["Disjoint events have P(A and B)=?", "0"], ["On a die, P(even or greater than 4)?", "2/3|0.6666666667"], ["Why subtract the overlap?", "to avoid double counting|avoid double-counting"], ["P(A)=0.3 and P(B)=0.2, disjoint. P(A or B)?", "0.5|50%"],
    ] },
    { slug: "conditional-probability", title: "Conditional Probability", goal: "Update probability after learning new information.", key: "P(A|B)=P(A and B)/P(B), when P(B)>0.", example: "12 are both A and B among 30 B outcomes → P(A|B)=0.4", standard: "HSS.CP.B.6", visual: "two-way", drills: [
      ["20 students play music; 8 also play sports. P(sports|music)?", "0.4|2/5|40%"], ["P(A and B)=0.18 and P(B)=0.6. P(A|B)?", "0.3|30%"], ["In P(A|B), which event is known?", "B"], ["Can P(A|B) be found if P(B)=0?", "no"], ["A card is known to be a face card. Probability it is a king?", "1/3"],
    ] },
    { slug: "independence", title: "Independent Events", goal: "Determine whether one event changes the chance of another.", key: "A and B are independent when P(A|B)=P(A), equivalently P(A and B)=P(A)P(B).", example: "Coin result and die result are independent", standard: "HSS.CP.A.2–5", visual: "tree", drills: [
      ["Coin result and die result independent?", "yes"], ["Drawing two cards without replacement independent?", "no"], ["P(A)=0.5, P(B)=0.4, independent. P(A and B)?", "0.2|20%"], ["If P(A|B)=P(A), the events are?", "independent"], ["P(A and B)=0.12 and P(A)=0.3 for independent events. P(B)?", "0.4|40%"],
    ] },
    { slug: "sets-and-venn-diagrams", title: "Sets and Venn Diagrams", goal: "Read unions, intersections, and complements directly from overlapping sets.", key: "Union means in A or B, intersection means in both, and complement means outside the named set.", example: "If |A|=18, |B|=15, and |A∩B|=6, then |A∪B|=27", standard: "HSS.CP.A.1", visual: "venn", drills: [
      ["Which symbol means the outcomes in both A and B?", "A ∩ B", ["A ∩ B", "A ∪ B", "Aᶜ", "A ⊂ B"]],
      ["Which symbol means the outcomes in A or B or both?", "A ∪ B", ["A ∪ B", "A ∩ B", "Aᶜ", "A = B"]],
      ["If |A|=18, |B|=15, and |A∩B|=6, find |A∪B|.", "27", ["21", "27", "33", "39"]],
      ["What region represents Aᶜ in a Venn diagram?", "everything outside A", ["everything outside A", "only the overlap", "everything inside A", "only the universal set border"]],
      ["If every member of A is also in B, which relation is true?", "A is a subset of B", ["A is a subset of B", "A and B are disjoint", "A is the complement of B", "A and B have no universal set"]],
    ] },
  ]),
  makeRegion(8, "Functions and Data", "Model change with functions and summarize variation.", "HSF.IF · HSS.ID", [
    { slug: "function-notation-review", title: "Function Notation", goal: "Evaluate and interpret function inputs and outputs.", key: "f(a) means the output of f when the input is a; it does not mean f times a.", example: "f(x)=2x²−1 gives f(3)=17", standard: "HSF.IF.A.2", visual: "mapping", drills: [
      ["f(x)=3x−2. Find f(5).", "13"], ["g(x)=x²+4. Find g(−3).", "13"], ["If f(2)=7, what is the input?", "2"], ["If f(2)=7, what is the output?", "7"], ["Is x²+y²=1 a function of x over all real x?", "no"],
    ] },
    { slug: "piecewise-functions", title: "Piecewise Functions", goal: "Choose the rule that matches an input interval.", key: "Check the condition first, then use only the rule assigned to that interval.", example: "f(x)=x+2 if x<0, x² if x≥0 → f(−3)=−1", standard: "HSF.IF.C.7", visual: "curve-line", drills: [
      ["f(x)=x+1 for x<0 and x² for x≥0. Find f(−2).", "-1"], ["For the same f, find f(3).", "9"], ["At x=0, which rule includes equality?", "x^2|x²|the second rule"], ["A jump between pieces means the function is?", "discontinuous|not continuous"], ["Can a piecewise function still be a function?", "yes"],
    ] },
    { slug: "data-displays", title: "Data Distributions", goal: "Describe shape, center, spread, and unusual values.", key: "Use mean and standard deviation for roughly symmetric data; use median and IQR for skewed data or outliers.", example: "A right-skewed income set is better summarized by median and IQR", standard: "HSS.ID.A.1–3", visual: "box-plots", drills: [
      ["Which center resists outliers?", "median"], ["Which spread pairs naturally with the median?", "IQR|interquartile range"], ["A long right tail describes what skew?", "right skew|right-skewed|positive skew"], ["If every value increases by 5, the mean changes by?", "5"], ["If every value increases by 5, standard deviation changes by?", "0|does not change|unchanged"],
    ] },
    { slug: "regression-and-residuals", title: "Regression and Residuals", goal: "Judge how well a model predicts data.", key: "Residual = actual − predicted; a useful model leaves small residuals with no clear pattern.", example: "Actual 18, predicted 15 → residual 3", standard: "HSS.ID.B.6", visual: "residual", drills: [
      ["Actual 20, predicted 17. Residual?", "3"], ["Actual 8, predicted 10. Residual?", "-2"], ["A random residual plot around zero supports the model?", "yes"], ["A curved residual pattern suggests the linear model is?", "not appropriate|poor|inadequate"], ["Correlation alone proves causation?", "no"],
    ] },
    { slug: "categorical-data", title: "Categorical Data", goal: "Use two-way tables and relative frequencies to compare groups fairly.", key: "A conditional relative frequency divides by the total of the group being conditioned on, not by the whole table.", example: "18 of 30 bus riders prefer later starts, so 60% of bus riders do", standard: "HSS.ID.B.5", visual: "two-way", drills: [
      ["18 of 30 bus riders prefer a later start. What percent of bus riders is that?", "60%|0.6", ["40%", "50%", "60%", "75%"]],
      ["To compare preferences within each grade, which totals should be the denominators?", "the grade totals", ["the grade totals", "the full-table total", "the preference totals", "the number of cells"]],
      ["Which frequency counts observations that are both Grade 10 and bus riders?", "joint frequency", ["joint frequency", "marginal frequency", "mean", "standard deviation"]],
      ["Which values appear at the edge of a two-way table after row or column totals?", "marginal frequencies", ["marginal frequencies", "joint frequencies", "residuals", "quartiles"]],
      ["Group A has 30 of 50 yes; Group B has 42 of 70 yes. Which conclusion is supported?", "the yes rates are equal", ["the yes rates are equal", "Group A has the higher yes rate", "Group B has the higher yes rate", "the rates cannot be compared"]],
    ] },
  ]),
];
