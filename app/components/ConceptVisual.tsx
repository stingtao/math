import type { LessonDefinition } from "@/lib/curriculum";
import Image from "next/image";
import katex from "katex";
import { LinearGraphLab } from "./LinearGraphLab";
import { PointToLineMission } from "./PointToLineMission";
import { AdvancedMathTool } from "./AdvancedMathTool";

type ContextScene = {
  src: string;
  alt: string;
  headline: string;
  copy: string;
  model: "number-line" | "symbol-meaning" | "sign-pairs" | "operation-order" | "place-value" | "repeating-decimal" | "negative-distribute" | "root-inverse" | "solid-compare" | "signed-sum" | "subtract-opposite" | "signed-rational-quotient" | "signed-change" | "proportion-table" | "origin-proportion" | "word-equation" | "scale-area" | "composite-area" | "experimental-probability" | "sample-space" | "literal-equation" | "line-forms" | "system-substitution" | "system-model" | "radical-factor" | "like-radicals" | "gcf-factor" | "factor-chain" | "plus-minus-roots" | "zero-product" | "fit-prediction" | "model-choice" | "percent" | "fraction-equivalence" | "fraction-addition" | "substitution" | "power-steps" | "term-structure" | "slope" | "triangle" | "triangle-build" | "angles" | "scatter" | "distribute" | "function" | "transform" | "volume" | "cone-volume" | "sphere-volume" | "cross-section" | "coordinate-location" | "coordinate-distance" | "difference-squares" | "balance" | "root-bracket" | "scientific-scale" | "equation-steps" | "ratio" | "circle" | "prism" | "probability-scale" | "systems-crossing" | "solution-cases" | "inequality-range" | "area-product" | "parabola" | "exponential" | "scale-drawing" | "random-sample" | "arithmetic-sequence" | "quadratic-roots" | "surface-area-net" | "compound-event" | "two-way-table" | "exponential-decay" | "number-kinds" | "system-elimination" | "distribution-compare" | "rational-exponent" | "growth-compare" | "simple-interest" | "graph-line" | "dilation" | "residuals";
  mathSteps?: string[];
  mathStepLabels?: string[];
  modelLabel?: string;
};

const contextScenes: Record<string, ContextScene> = {
  "math-symbols": {
    src: "/visuals/operations-sequence-context.webp",
    alt: "A calm tabletop math lab with distinct stations that turn loose shapes into an organized result",
    headline: "a symbol is an instruction, not decoration",
    copy: "Name the relationship first, then read the two sides in order.",
    model: "symbol-meaning",
    modelLabel: "Math model: less than, greater than, less than or equal to, and not equal each give a different instruction; negative four is less than negative one",
  },
  "signed-numbers": {
    src: "/visuals/signed-numbers-context.webp",
    alt: "A building with floors above and below street level, showing positive and negative positions around a central reference",
    headline: "street level works like zero",
    copy: "Above and below are opposite directions from the same reference point.",
    model: "number-line",
  },
  "sign-rules": {
    src: "/visuals/operations-sequence-context.webp",
    alt: "Four distinct operation stations guide abstract tokens through one ordered workflow",
    headline: "predict the sign before finding the size",
    copy: "Same signs make a positive product. Different signs make a negative product.",
    model: "sign-pairs",
    modelLabel: "Math model: positive times positive and negative times negative are positive; positive times negative and negative times positive are negative; negative six times negative five is positive thirty",
  },
  "order-of-operations": {
    src: "/visuals/operations-sequence-context.webp",
    alt: "A left-to-right sequence of grouping, power, repeated-operation, and combining stations",
    headline: "choose the next operation, not the nearest one",
    copy: "Handle groups and exponents first, then multiply or divide, then add or subtract.",
    model: "operation-order",
    mathSteps: ["2+3\\times4^2", "4^2=16", "3\\times16=48", "2+48=50"],
    mathStepLabels: ["expression", "exponent", "multiply", "add"],
    modelLabel: "Math model: in two plus three times four squared, evaluate four squared as sixteen, multiply three by sixteen to get forty-eight, then add two to get fifty",
  },
  decimals: {
    src: "/visuals/decimal-pattern-context.webp",
    alt: "A whole board passes through magnifying frames into finer subdivisions beside a looping pattern track",
    headline: "each place to the right is ten times smaller",
    copy: "Read 0.35 as three tenths and five hundredths, then connect it to thirty-five hundredths.",
    model: "place-value",
    mathSteps: ["0.35", "3\\text{ tenths}+5\\text{ hundredths}", "\\frac{35}{100}=\\frac7{20}"],
    mathStepLabels: ["decimal", "place-value meaning", "fraction form"],
    modelLabel: "Math model: zero point three five means three tenths plus five hundredths, which is thirty-five hundredths or seven twentieths",
  },
  "repeating-decimals": {
    src: "/visuals/decimal-pattern-context.webp",
    alt: "Magnifying frames reveal finer subdivisions while a colored block pattern continues around a connected loop",
    headline: "the bar marks the block that repeats forever",
    copy: "Follow only the digits under the bar, then connect the repeating pattern to its exact fraction.",
    model: "repeating-decimal",
    mathSteps: ["0.\\overline{3}", "0.333\\ldots", "\\frac13"],
    mathStepLabels: ["bar notation", "repeating pattern", "exact fraction"],
    modelLabel: "Math model: zero point three with a bar over the three means zero point three three three continuing forever, which equals one third",
  },
  "negative-distribution": {
    src: "/visuals/distributive-workshop-context.webp",
    alt: "Repeated workshop trays show one outside group being applied to every object inside each tray",
    headline: "the negative factor must reach every term",
    copy: "Multiply the outside factor by each term, keeping the exponent attached to its variable.",
    model: "negative-distribute",
    mathSteps: ["-3(x^2+y^3)", "-3\\cdot x^2=-3x^2", "-3\\cdot y^3=-3y^3", "-3x^2-3y^3"],
    mathStepLabels: ["start", "first term", "second term", "result"],
    modelLabel: "Math model: negative three times the group x squared plus y cubed distributes to negative three x squared and negative three y cubed, giving negative three x squared minus three y cubed",
  },
  "square-cube-roots": {
    src: "/visuals/rational-exponent-lab-context.webp",
    alt: "A cube made from equal unit blocks is reduced to one edge and then rebuilt as one square layer",
    headline: "a root reverses a power",
    copy: "Ask which original factor was squared or cubed to make the number under the root.",
    model: "root-inverse",
    mathSteps: ["9^2=81", "\\sqrt{81}=9", "3^3=27", "\\sqrt[3]{27}=3"],
    mathStepLabels: ["square builds", "square root undoes", "cube builds", "cube root undoes"],
    modelLabel: "Math model: nine squared is eighty-one, so the square root of eighty-one is nine; three cubed is twenty-seven, so the cube root of twenty-seven is three",
  },
  "mixed-volume": {
    src: "/visuals/cone-measure-context.webp",
    alt: "Three matching cones fill the same amount of space as one cylinder with the same radius and height",
    headline: "identify each solid before choosing a formula",
    copy: "With the same radius and height, a cone is one third of its matching cylinder.",
    model: "solid-compare",
    mathSteps: ["r=2,\\;h=9", "V_{cyl}=36\\pi", "V_{cone}=12\\pi", "36\\pi-12\\pi=24\\pi"],
    mathStepLabels: ["same dimensions", "cylinder", "cone", "difference"],
    modelLabel: "Math model: with radius two and height nine, the cylinder volume is thirty-six pi and the cone volume is twelve pi, so their difference is twenty-four pi",
  },
  "g7-add-rational-numbers": {
    src: "/visuals/signed-numbers-context.webp",
    alt: "A building uses street level as zero with positions above and below it",
    headline: "compare directions and distances from zero",
    copy: "Different signs pull in opposite directions, so subtract the distances and keep the farther sign.",
    model: "signed-sum",
    mathSteps: ["-7+3", "|-7|=7", "|3|=3", "7-3=4", "-4"],
    mathStepLabels: ["sum", "negative distance", "positive distance", "difference", "farther side wins"],
    modelLabel: "Math model: negative seven plus three compares distances seven and three, subtracts to get four, and stays negative because seven is farther from zero",
  },
  "g7-subtract-rational-numbers": {
    src: "/visuals/operations-sequence-context.webp",
    alt: "An ordered tabletop workflow turns a starting set of tokens into one organized result",
    headline: "subtracting means add the opposite",
    copy: "Change the operation and the sign together, then solve the addition you already know.",
    model: "subtract-opposite",
    mathSteps: ["4-(-3)", "4+(+3)", "7"],
    mathStepLabels: ["subtraction", "add the opposite", "result"],
    modelLabel: "Math model: four minus negative three rewrites as four plus positive three, which equals seven",
  },
  "g7-multiply-divide-rationals": {
    src: "/visuals/operations-sequence-context.webp",
    alt: "Distinct tabletop stations process abstract values in a deliberate order",
    headline: "decide the sign, then calculate the size",
    copy: "Different signs make the quotient negative; dividing by a fraction means multiply by its reciprocal.",
    model: "signed-rational-quotient",
    mathSteps: ["(-\\frac34)\\div\\frac12", "\\text{different signs}\\Rightarrow-", "\\frac34\\times\\frac21=\\frac32", "-\\frac32"],
    mathStepLabels: ["quotient", "sign", "magnitude", "result"],
    modelLabel: "Math model: negative three fourths divided by positive one half has a negative sign; three fourths times two gives three halves, so the result is negative three halves",
  },
  "g7-rational-word-problems": {
    src: "/visuals/signed-numbers-context.webp",
    alt: "A building shows positions above and below a shared zero at street level",
    headline: "translate the change before calculating",
    copy: "A descent is a negative change: start at five, change by negative twelve, and finish at negative seven.",
    model: "signed-change",
    mathSteps: ["5\\text{ m}", "-12\\text{ m}", "5+(-12)", "-7\\text{ m}"],
    mathStepLabels: ["start", "signed change", "equation", "finish"],
    modelLabel: "Math model: start at five meters, descend twelve meters, write five plus negative twelve, and finish at negative seven meters",
  },
  "g7-proportional-tables": {
    src: "/visuals/unit-rate-bike-context.webp",
    alt: "A cyclist travels a measured route while a clean rate display compares distance with time",
    headline: "the same quotient in every row means one constant rate",
    copy: "Divide y by x in each row. When every quotient matches, one rule connects the whole table.",
    model: "proportion-table",
    modelLabel: "Math model: the pairs two and six, four and twelve, and six and eighteen all have y divided by x equal to three, so y equals three x",
  },
  "g7-proportional-graphs": {
    src: "/visuals/graphing-line-city-context.webp",
    alt: "A straight route rises through a coordinate city from one marked starting point",
    headline: "a proportional line starts at the origin",
    copy: "Zero input must give zero output, and every other point follows the same rise-to-run ratio.",
    model: "origin-proportion",
    modelLabel: "Math model: y equals two x passes through zero zero and three six, forming a straight line through the origin",
  },
  "g7-equation-word-models": {
    src: "/visuals/multistep-workshop-context.webp",
    alt: "A workshop removes one operation layer at a time from matching mystery boxes",
    headline: "name the unknown, then translate each part",
    copy: "Four dollars per ride becomes 4r; the fixed fee adds 3; the total gives the other side of the equation.",
    model: "word-equation",
    mathSteps: ["r=\\text{rides}", "4r", "+3", "4r+3=19", "r=4"],
    mathStepLabels: ["unknown", "per-ride cost", "fixed fee", "equation", "check"],
    modelLabel: "Math model: let r be the number of rides; four dollars per ride plus a three dollar fee totals nineteen, so four r plus three equals nineteen and r equals four",
  },
  "g7-scale-area": {
    src: "/visuals/scale-drawing-studio-context.webp",
    alt: "A precise design studio compares the same plan at two different scales",
    headline: "length uses k; area uses k squared",
    copy: "Scaling every side by 3 creates three times as many rows and three times as many columns: 9 times the area.",
    model: "scale-area",
    modelLabel: "Math model: a square with side two has area four; after scale factor three, its side is six and area is thirty-six, so area changes by nine",
  },
  "g7-composite-area": {
    src: "/visuals/polynomial-tiles-context.webp",
    alt: "A large rectangular board is partitioned into smaller non-overlapping rectangular regions",
    headline: "start with a familiar whole, then remove the missing part",
    copy: "Find the 10 by 8 rectangle, subtract the 3 by 2 cutout, and keep square units.",
    model: "composite-area",
    modelLabel: "Math model: a ten by eight rectangle has area eighty; subtract a three by two cutout with area six to get seventy-four square units",
  },
  "g7-experimental-probability": {
    src: "/visuals/probability-arcade-context.webp",
    alt: "A probability arcade records repeated trials on a clear results display",
    headline: "estimate chance from what actually happened",
    copy: "Count observed successes, divide by all trials, and expect the estimate to settle with more data.",
    model: "experimental-probability",
    modelLabel: "Math model: eighteen observed heads in thirty tosses gives experimental probability eighteen thirtieths, which is three fifths or zero point six",
  },
  "g7-sample-spaces": {
    src: "/visuals/compound-events-lab-context.webp",
    alt: "A two-stage chance laboratory branches from one event into every possible paired outcome",
    headline: "list every outcome exactly once",
    copy: "Two coin flips create four ordered outcomes: HH, HT, TH, and TT.",
    model: "sample-space",
    modelLabel: "Math model: two coin flips have the sample space head head, head tail, tail head, and tail tail, with four equally likely outcomes",
  },
  "g9-literal-equations": {
    src: "/visuals/multistep-workshop-context.webp",
    alt: "A workshop removes matching outer layers from an equation one operation at a time",
    headline: "isolate the chosen letter with inverse operations",
    copy: "Treat the other letters as known quantities and make the same legal change to both sides.",
    model: "literal-equation",
    mathSteps: ["A=lw", "\\frac{A}{l}=\\frac{lw}{l}", "\\frac{A}{l}=w", "w=\\frac{A}{l}"],
    mathStepLabels: ["formula", "divide both sides by l", "cancel l", "chosen subject"],
    modelLabel: "Math model: starting with A equals l times w, divide both sides by l, cancel l on the right, and get w equals A divided by l",
  },
  "g9-linear-equation-forms": {
    src: "/visuals/graphing-line-city-context.webp",
    alt: "One straight route crosses a coordinate city with a marked starting point and constant slope",
    headline: "different forms describe the same line",
    copy: "Point-slope highlights a known point, slope-intercept highlights m and b, and standard form groups x and y.",
    model: "line-forms",
    modelLabel: "Math model: y minus five equals three times x minus two, y equals three x minus one, and three x minus y equals one are equivalent forms of the same line",
  },
  "g9-systems-substitution-g9": {
    src: "/visuals/substitution-machine-context.webp",
    alt: "One known expression enters a matching variable slot and passes through an ordered calculation",
    headline: "replace a variable with an equal expression",
    copy: "Since y equals 2x, every y can be replaced by 2x before solving and back-substituting.",
    model: "system-substitution",
    mathSteps: ["y=2x", "x+y=9", "x+2x=9", "x=3", "(x,y)=(3,6)"],
    mathStepLabels: ["replacement", "second equation", "substitute", "solve x", "back-substitute"],
    modelLabel: "Math model: use y equals two x in x plus y equals nine, giving x plus two x equals nine, x equals three, and the solution three comma six",
  },
  "g9-systems-elimination-g9": {
    src: "/visuals/elimination-workshop-context.webp",
    alt: "Two equation strips align opposite variable terms so one pair disappears when added",
    headline: "opposite coefficients cancel when equations add",
    copy: "Align like terms, add vertically, solve the remaining variable, then substitute back.",
    model: "system-elimination",
    modelLabel: "Math model: x plus y equals seven and x minus y equals one add to two x equals eight, giving the solution four comma three",
  },
  "g9-system-models": {
    src: "/visuals/systems-transit-context.webp",
    alt: "Two transit conditions cross at one shared solution point",
    headline: "two unknowns need two independent conditions",
    copy: "Define adults and students, translate the total count and total cost, then solve their shared system.",
    model: "system-model",
    mathSteps: ["a=\\text{adults}", "s=\\text{students}", "a+s=20", "10a+6s=152", "(a,s)=(8,12)"],
    mathStepLabels: ["unknown 1", "unknown 2", "head count", "ticket total", "solution"],
    modelLabel: "Math model: let a be adults and s be students; a plus s equals twenty and ten a plus six s equals one hundred fifty-two, so a is eight and s is twelve",
  },
  "g9-simplify-radicals": {
    src: "/visuals/rational-exponent-lab-context.webp",
    alt: "A cube laboratory separates a perfect block structure from the pieces that remain",
    headline: "pull out the largest perfect-square factor",
    copy: "Split 72 into 36 times 2, take the known root of 36, and leave the remaining 2 under the radical.",
    model: "radical-factor",
    mathSteps: ["\\sqrt{72}", "\\sqrt{36\\cdot2}", "6\\sqrt2"],
    mathStepLabels: ["radical", "perfect square × remainder", "simplified"],
    modelLabel: "Math model: the square root of seventy-two becomes the square root of thirty-six times two, which simplifies to six square root two",
  },
  "g9-radical-operations": {
    src: "/visuals/rational-exponent-lab-context.webp",
    alt: "Matching illuminated block structures are grouped while unlike structures remain separate",
    headline: "only matching radical parts combine",
    copy: "Both terms contain √3, so add their coefficients and keep the shared radical unchanged.",
    model: "like-radicals",
    mathSteps: ["2\\sqrt3+5\\sqrt3", "(2+5)\\sqrt3", "7\\sqrt3"],
    mathStepLabels: ["like radicals", "combine coefficients", "result"],
    modelLabel: "Math model: two square root three plus five square root three combines as two plus five times square root three, giving seven square root three",
  },
  "g9-greatest-common-factor": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A sorting workshop gathers the greatest shared tile group before leaving smaller unmatched groups",
    headline: "take the largest factor shared by every term",
    copy: "Use the GCF of the coefficients and the smallest shared variable power, then divide each term by it.",
    model: "gcf-factor",
    mathSteps: ["12x^3+8x^2", "\\gcd(12,8)=4", "\\min(3,2)=2\\Rightarrow x^2", "4x^2(3x+2)"],
    mathStepLabels: ["expression", "coefficient GCF", "shared power", "factored form"],
    modelLabel: "Math model: twelve x cubed plus eight x squared shares coefficient factor four and variable factor x squared, giving four x squared times three x plus two",
  },
  "g9-factoring-completely": {
    src: "/visuals/difference-squares-workshop-context.webp",
    alt: "A geometric workshop removes one common layer and then separates a difference of two squares",
    headline: "factor the GCF first, then check the remainder",
    copy: "After taking out 2, the remaining x²−9 is a difference of squares with two linear factors.",
    model: "factor-chain",
    mathSteps: ["2x^2-18", "2(x^2-9)", "2(x-3)(x+3)"],
    mathStepLabels: ["start", "factor GCF", "factor completely"],
    modelLabel: "Math model: two x squared minus eighteen factors first as two times x squared minus nine, then as two times x minus three times x plus three",
  },
  "g9-solve-by-square-roots": {
    src: "/visuals/rational-exponent-lab-context.webp",
    alt: "A power laboratory reverses a squared structure back to its possible original values",
    headline: "taking a square root creates two possibilities",
    copy: "The squared expression can equal positive 3 or negative 3, so solve both branches.",
    model: "plus-minus-roots",
    mathSteps: ["(x-2)^2=9", "x-2=\\pm3", "x=5", "x=-1"],
    mathStepLabels: ["isolated square", "take both roots", "positive branch", "negative branch"],
    modelLabel: "Math model: x minus two squared equals nine, so x minus two equals plus or minus three, giving x equals five or x equals negative one",
  },
  "g9-solve-by-factoring": {
    src: "/visuals/polynomial-tiles-context.webp",
    alt: "A rectangular algebra-tile product separates into two visible factor dimensions",
    headline: "a zero product means at least one factor is zero",
    copy: "Factor the quadratic, set each factor equal to zero, and solve both short equations.",
    model: "zero-product",
    mathSteps: ["x^2-5x+6=0", "(x-2)(x-3)=0", "x-2=0\\;\\text{or}\\;x-3=0", "x=2,3"],
    mathStepLabels: ["quadratic", "factor", "zero-product rule", "solutions"],
    modelLabel: "Math model: x squared minus five x plus six equals zero factors as x minus two times x minus three, so x equals two or three",
  },
  "g9-scatter-models-g9": {
    src: "/visuals/scatter-field-context.webp",
    alt: "A greenhouse experiment records paired observations that follow an upward overall pattern",
    headline: "use the fitted trend within the observed range",
    copy: "Substitute x into the line of fit for a prediction, then keep the units and avoid claiming causation.",
    model: "fit-prediction",
    modelLabel: "Math model: the fitted line y equals two point five x plus four predicts twenty-nine when x equals ten; use the prediction within the data range",
  },
  "g9-modeling-decisions": {
    src: "/visuals/growth-comparison-context.webp",
    alt: "Three growth displays compare equal additions, changing additions, and repeated multiplication",
    headline: "look at how the outputs change, not just their size",
    copy: "Constant first differences suggest linear, constant second differences suggest quadratic, and constant ratios suggest exponential.",
    model: "model-choice",
    modelLabel: "Math model: constant first differences indicate a linear model, constant second differences indicate a quadratic model, and constant ratios indicate an exponential model",
  },
  percent: {
    src: "/visuals/percent-market-context.webp",
    alt: "A market display with a highlighted part of a larger wall of equal tiles",
    headline: "20% means 20 out of 100",
    copy: "A percent compares one part with a whole split into one hundred equal parts.",
    model: "percent",
  },
  fractions: {
    src: "/visuals/fraction-workshop-context.webp",
    alt: "Two equal-length fraction trays: six of eight equal parts and three of four equal parts cover the same length",
    headline: "different pieces can name the same amount",
    copy: "Keep the whole the same. Six eighths and three fourths cover exactly the same length.",
    model: "fraction-equivalence",
    modelLabel: "Math model: six eighths equals three fourths because both cover the same amount of an equal whole",
  },
  "adding-fractions": {
    src: "/visuals/fraction-workshop-context.webp",
    alt: "Two equal-length trays divided into eighths and fourths, showing why fractions need equal-size pieces for comparison",
    headline: "rename first, then add equal-size pieces",
    copy: "One third becomes two sixths. Now every piece has the same size, so the numerators can be added.",
    model: "fraction-addition",
    modelLabel: "Math model: one third is renamed as two sixths; two sixths plus one sixth equals three sixths, or one half",
  },
  substitution: {
    src: "/visuals/substitution-machine-context.webp",
    alt: "A teal value block entering a matching placeholder socket, passing through two operation modules, and reaching one output tray",
    headline: "replace the variable before you calculate",
    copy: "Put the known value inside parentheses, then follow the operations in order.",
    model: "substitution",
    mathSteps: ["x=-3", "2x^2+1", "2(-3)^2+1", "19"],
    mathStepLabels: ["known value", "expression", "replace x", "result"],
    modelLabel: "Math model: x is negative three; two x squared plus one becomes two times negative three squared plus one, which equals nineteen",
  },
  "g9-evaluate-formulas": {
    src: "/visuals/substitution-machine-context.webp",
    alt: "A teal value block entering a matching placeholder socket, passing through two operation modules, and reaching one output tray",
    headline: "one careful replacement makes the formula concrete",
    copy: "Replace every x with the same parenthesized value before simplifying any operation.",
    model: "substitution",
    mathSteps: ["x=-3", "x^2-2x", "(-3)^2-2(-3)", "15"],
    mathStepLabels: ["known value", "formula", "replace every x", "result"],
    modelLabel: "Math model: x is negative three; x squared minus two x becomes negative three squared minus two times negative three, which equals fifteen",
  },
  powers: {
    src: "/visuals/exponent-lab-context.webp",
    alt: "Four identical teal factor blocks moving into one grouping chamber and leaving as one compact layered power block",
    headline: "a power is a compact count of equal factors",
    copy: "Keep the base the same and let the exponent count how many times it is used as a factor.",
    model: "power-steps",
    mathSteps: ["x\\cdot x\\cdot x\\cdot x", "x^4", "2^4=16"],
    mathStepLabels: ["four equal factors", "compact power", "evaluate an example"],
    modelLabel: "Math model: x times x times x times x is written as x to the fourth power; two to the fourth power equals sixteen",
  },
  "exponent-rules": {
    src: "/visuals/exponent-lab-context.webp",
    alt: "Four identical teal factor blocks moving into one grouping chamber and leaving as one compact layered power block",
    headline: "same base means the factor counts can combine",
    copy: "When powers with the same base multiply, every equal factor joins one longer product.",
    model: "power-steps",
    mathSteps: ["x^2\\cdot x^3", "x^{2+3}", "x^5"],
    mathStepLabels: ["same base", "add factor counts", "combined power"],
    modelLabel: "Math model: x squared times x cubed becomes x to the two plus three power, which is x to the fifth power",
  },
  "exponents-parentheses": {
    src: "/visuals/exponent-lab-context.webp",
    alt: "Four identical teal factor blocks moving into one grouping chamber and leaving as one compact layered power block",
    headline: "parentheses decide what the exponent repeats",
    copy: "Treat the entire parenthesized value as the base before multiplying its copies.",
    model: "power-steps",
    mathSteps: ["(-3)^2", "(-3)(-3)", "9"],
    mathStepLabels: ["whole base", "repeat it twice", "positive result"],
    modelLabel: "Math model: negative three in parentheses squared means negative three times negative three, which equals positive nine",
  },
  "zero-negative-exponents": {
    src: "/visuals/exponent-lab-context.webp",
    alt: "Four identical teal factor blocks moving into one grouping chamber and leaving as one compact layered power block",
    headline: "a negative exponent moves the power to the denominator",
    copy: "The exponent tells how many reciprocal factors remain; it does not make the base negative.",
    model: "power-steps",
    mathSteps: ["x^{-2}", "\\frac{1}{x^2}", "x=3\\Rightarrow\\frac19"],
    mathStepLabels: ["negative exponent", "take the reciprocal", "evaluate an example"],
    modelLabel: "Math model: x to the negative second power equals one over x squared; when x is three, the value is one ninth",
  },
  "scientific-operations": {
    src: "/visuals/scientific-observatory-context.webp",
    alt: "An observatory sightline passing through scale rings toward a distant planet",
    headline: "multiply the leading numbers and combine the powers of ten",
    copy: "Keep the coefficient work separate from the exponent rule, then normalize the result if needed.",
    model: "power-steps",
    mathSteps: ["(3\\times10^4)(2\\times10^3)", "(3\\cdot2)10^{4+3}", "6\\times10^7"],
    mathStepLabels: ["multiply", "group each part", "scientific notation"],
    modelLabel: "Math model: three times ten to the fourth multiplied by two times ten cubed becomes six times ten to the seventh",
  },
  "g9-integer-exponents-g9": {
    src: "/visuals/exponent-lab-context.webp",
    alt: "Four identical teal factor blocks moving into one grouping chamber and leaving as one compact layered power block",
    headline: "quotients remove matching factors",
    copy: "With the same nonzero base, division cancels equal factors, so subtract the exponents.",
    model: "power-steps",
    mathSteps: ["\\frac{a^5}{a^2}", "a^{5-2}", "a^3"],
    mathStepLabels: ["same base", "subtract counts", "factors left"],
    modelLabel: "Math model: a to the fifth divided by a squared becomes a to the five minus two power, which is a cubed",
  },
  "g9-multiply-monomials": {
    src: "/visuals/exponent-lab-context.webp",
    alt: "Four identical teal factor blocks moving into one grouping chamber and leaving as one compact layered power block",
    headline: "multiply coefficients; combine equal variable factors",
    copy: "Numbers multiply with numbers while powers of the same variable use the exponent rule.",
    model: "power-steps",
    mathSteps: ["3x^2\\cdot2x^3", "(3\\cdot2)x^{2+3}", "6x^5"],
    mathStepLabels: ["two monomials", "group like factors", "simplify"],
    modelLabel: "Math model: three x squared times two x cubed becomes three times two times x to the two plus three power, which is six x to the fifth",
  },
  "algebra-language": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A tabletop sorting station separates large square tiles, long rectangular bars, and small unit squares into three matching groups",
    headline: "read each part before you calculate",
    copy: "The coefficient, variable, and constant have different jobs inside one expression.",
    model: "term-structure",
    mathSteps: ["3x+5", "3", "x", "5"],
    mathStepLabels: ["expression", "coefficient", "variable", "constant"],
    modelLabel: "Math model: in three x plus five, three is the coefficient, x is the variable, and five is the constant",
  },
  "combining-like-terms": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A tabletop sorting station routes each of three tile shapes into its own matching lane and collection tray",
    headline: "match the variable structure first",
    copy: "x-terms combine with x-terms. Constants combine with constants. Unlike structures stay separate.",
    model: "term-structure",
    mathSteps: ["3x+2+5x-1", "(3+5)x+(2-1)", "8x+1"],
    mathStepLabels: ["mixed expression", "group matching terms", "simplified"],
    modelLabel: "Math model: three x plus two plus five x minus one groups as three plus five x and two minus one, then simplifies to eight x plus one",
  },
  "g7-equivalent-expressions": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A tabletop algebra workshop with matching tile families gathered without changing any tile shape",
    headline: "the structure can change while the value stays equal",
    copy: "Factor the common 3 to reveal a new form, then test one value to confirm both forms agree.",
    model: "term-structure",
    mathSteps: ["3x+6", "3(x+2)", "x=4:\\;18=18"],
    mathStepLabels: ["expanded form", "factored form", "same value check"],
    modelLabel: "Math model: three x plus six equals three times x plus two; at x equals four, both forms equal eighteen",
  },
  "g9-algebraic-structure": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A tabletop sorting lab uses distinct shapes to keep an outside factor, a grouped object, and a repetition count conceptually separate",
    headline: "read the outside, the group, and the exponent",
    copy: "Treat the parenthesized expression as one object before deciding whether to expand it.",
    model: "term-structure",
    mathSteps: ["3(x+2)^2", "3", "(x+2)", "2"],
    mathStepLabels: ["whole expression", "outside factor", "grouped object", "repeat count"],
    modelLabel: "Math model: in three times x plus two squared, three is the outside factor, x plus two is the grouped object, and two is the exponent",
  },
  "g9-polynomial-vocabulary": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A tabletop sorting station keeps three different algebra tile families visually distinct",
    headline: "term count and greatest exponent name the polynomial",
    copy: "First separate the terms, then find the greatest exponent before classifying the expression.",
    model: "term-structure",
    mathSteps: ["4x^3-2x+1", "3\\text{ terms}", "\\text{degree}=3", "\\text{cubic trinomial}"],
    mathStepLabels: ["polynomial", "count", "greatest exponent", "classification"],
    modelLabel: "Math model: four x cubed minus two x plus one has three terms and degree three, so it is a cubic trinomial",
  },
  "g9-add-subtract-polynomials": {
    src: "/visuals/like-terms-sorting-context.webp",
    alt: "A tabletop sorting lab gathers only algebra tiles with identical shapes into the same tray",
    headline: "distribute the minus, then match structures",
    copy: "Remove the parentheses carefully, group equal powers, and combine only their coefficients.",
    model: "term-structure",
    mathSteps: ["(3x^2+x)-(x^2-4x)", "3x^2+x-x^2+4x", "(3-1)x^2+(1+4)x", "2x^2+5x"],
    mathStepLabels: ["subtract", "distribute the minus", "group like powers", "simplify"],
    modelLabel: "Math model: three x squared plus x minus the group x squared minus four x becomes three x squared plus x minus x squared plus four x, then two x squared plus five x",
  },
  "coordinate-plane": {
    src: "/visuals/coordinate-route-context.webp",
    alt: "A tiled city route moving horizontally from a central origin and then vertically to one marked destination",
    headline: "x moves first, then y",
    copy: "Start at the origin, use the x-coordinate for the horizontal move, then use y for the vertical move.",
    model: "coordinate-location",
    modelLabel: "Math model: start at zero zero, move right three units, then up two units to locate the point three comma two",
  },
  "slope-rate": {
    src: "/visuals/slope-trail-context.webp",
    alt: "A cycling trail rising diagonally across a mountain landscape",
    headline: "slope = rise ÷ run",
    copy: "Compare the vertical change with the horizontal change to describe the trail.",
    model: "slope",
  },
  "pythagorean-theorem": {
    src: "/visuals/pythagorean-city-context.webp",
    alt: "Three park routes forming a right triangle across a blue canal",
    headline: "a² + b² = c²",
    copy: "For a right triangle, the two shorter sides determine the diagonal shortcut.",
    model: "triangle",
  },
  "scatter-plots": {
    src: "/visuals/scatter-field-context.webp",
    alt: "A greenhouse experiment with plants of varied heights under grow lights",
    headline: "look for the overall pattern",
    copy: "Each point is one observation. Together, the points can reveal a relationship.",
    model: "scatter",
  },
  "distributive-property": {
    src: "/visuals/distributive-workshop-context.webp",
    alt: "Four identical workshop trays, each split into one group of blue gears and one group of two coral parts",
    headline: "4(x + 2) = 4x + 8",
    copy: "Four copies of a whole group means four copies of every part inside it.",
    model: "distribute",
  },
  "function-representations": {
    src: "/visuals/function-kiosk-context.webp",
    alt: "A bike-rental rule machine connecting inputs with a route, a table, and a bar display",
    headline: "one function, many representations",
    copy: "A rule, table, graph, and real situation can all describe the same relationship.",
    model: "function",
  },
  "coordinate-transformations": {
    src: "/visuals/transform-plaza-context.webp",
    alt: "Congruent triangular sculptures slid, reflected, and rotated across a tiled plaza",
    headline: "every point follows the same rule",
    copy: "A coordinate rule moves each vertex predictably while preserving the figure.",
    model: "transform",
  },
  "cylinder-volume": {
    src: "/visuals/cylinder-tank-context.webp",
    alt: "A transparent cylindrical water tank filling upward in equal layers with radius and height guides",
    headline: "V = πr²h",
    copy: "Find the circular base area, then stack that area through the full height.",
    model: "volume",
  },
  "one-step-equations": {
    src: "/visuals/equation-balance-context.webp",
    alt: "A level balance with one mystery box and three gold cubes on the left, and seven matching cubes on the right",
    headline: "x + 3 = 7 → x = 4",
    copy: "Remove the same amount from both sides to keep the equation balanced.",
    model: "balance",
  },
  "approximating-irrationals": {
    src: "/visuals/irrational-garden-context.webp",
    alt: "A two-by-four rectangular garden crossed by a diagonal coral measuring cable",
    headline: "4 < √20 < 5",
    copy: "Bracket a root between the square roots of its neighboring perfect squares.",
    model: "root-bracket",
  },
  "scientific-notation": {
    src: "/visuals/scientific-observatory-context.webp",
    alt: "An observatory sightline passing through shrinking scale rings toward a distant planet",
    headline: "4,500,000 = 4.5 × 10⁶",
    copy: "Move the decimal to make one leading digit, then count the places.",
    model: "scientific-scale",
  },
  "multi-step-equations": {
    src: "/visuals/multistep-workshop-context.webp",
    alt: "A workshop sequence removing outer sleeves from two identical mystery boxes one layer at a time",
    headline: "2(x + 3) = 14 → x = 4",
    copy: "Simplify the outer layers, then undo operations in reverse order.",
    model: "equation-steps",
  },
  "solution-types": {
    src: "/visuals/solution-cases-gallery-context.webp",
    alt: "Three side-by-side route displays: two routes crossing once, two parallel routes that never meet, and two routes sharing the same entire path",
    headline: "one intersection, none, or the same line",
    copy: "After simplifying both equations, compare their lines: they can meet once, never meet, or match at every point.",
    model: "solution-cases",
  },
  "two-step-equations": {
    src: "/visuals/equation-balance-context.webp",
    alt: "A level balance with matching quantities on both sides",
    headline: "undo two operations in reverse order",
    copy: "Keep the equation balanced while you remove the outside operation, then the inside one.",
    model: "balance",
  },
  "systems-graphing": {
    src: "/visuals/systems-transit-context.webp",
    alt: "Two straight transit routes crossing at one shared gold station",
    headline: "the intersection makes both equations true",
    copy: "Graph both lines on the same plane and read the ordered pair where they meet.",
    model: "systems-crossing",
  },
  "comparing-functions": {
    src: "/visuals/function-kiosk-context.webp",
    alt: "A rule machine connecting inputs to outputs, a table, and a graph",
    headline: "compare the starting value and rate of change",
    copy: "Translate each representation into the same two features before deciding which function changes faster.",
    model: "function",
  },
  "linear-nonlinear": {
    src: "/visuals/growth-comparison-context.webp",
    alt: "Two growth displays comparing equal additions with repeated multiplication",
    headline: "constant differences create a line",
    copy: "Linear relationships add the same amount; nonlinear relationships change their rate or multiply repeatedly.",
    model: "growth-compare",
  },
  "rigid-transformations": {
    src: "/visuals/transform-plaza-context.webp",
    alt: "Matching triangular sculptures slid, reflected, and rotated across a tiled plaza",
    headline: "slide, flip, or turn every point",
    copy: "A rigid transformation moves a figure without stretching or shrinking it.",
    model: "transform",
  },
  congruence: {
    src: "/visuals/transform-plaza-context.webp",
    alt: "Matching triangular sculptures in several positions across a tiled plaza",
    headline: "rigid moves preserve size and shape",
    copy: "If one figure can land exactly on another after rigid transformations, the figures are congruent.",
    model: "transform",
  },
  "angle-relationships": {
    src: "/visuals/angle-plaza-context.webp",
    alt: "Crossing paths forming vertical angles and adjacent linear pairs",
    headline: "equal opposites · adjacent angles total 180°",
    copy: "Use the structure of intersecting lines before solving for an unknown angle.",
    model: "angles",
  },
  "triangle-angles": {
    src: "/visuals/angle-plaza-context.webp",
    alt: "Geometric paths meeting around a central angle plaza",
    headline: "a triangle’s interior angles total 180°",
    copy: "Two known angles determine the missing angle because all three make one straight-angle total.",
    model: "angles",
  },
  "lines-of-fit": {
    src: "/visuals/residual-observatory-context.webp",
    alt: "Observation points above and below a fitted line with vertical residual guides",
    headline: "fit the overall pattern, then inspect the misses",
    copy: "A useful line passes through the center of the data with small residuals on both sides.",
    model: "residuals",
  },
  probability: {
    src: "/visuals/probability-arcade-context.webp",
    alt: "A spinner, die, and trial tokens in a modern probability arcade",
    headline: "probability stays between 0 and 1",
    copy: "Place an event on the scale from impossible to certain before calculating its chance.",
    model: "probability-scale",
  },
  "g7-inequalities-g7": {
    src: "/visuals/inequality-trail-context.webp",
    alt: "Two number-line trails: an open boundary with highlighted tiles extending left and a closed boundary with highlighted tiles extending right",
    headline: "the point sets the boundary; the arrow shows every solution",
    copy: "An open point excludes the boundary, a closed point includes it, and dividing by a negative flips the inequality direction.",
    model: "inequality-range",
  },
  "g7-multi-step-equations-g7": {
    src: "/visuals/multistep-workshop-context.webp",
    alt: "A sequence removing outer layers from identical mystery boxes one operation at a time",
    headline: "simplify, then undo operations in reverse",
    copy: "Keep both sides equal while you work inward toward the unknown.",
    model: "equation-steps",
  },
  "g7-percent-change": {
    src: "/visuals/percent-market-context.webp",
    alt: "A market display showing one highlighted percent of a whole wall",
    headline: "change = original amount × rate",
    copy: "Find the percent change from the original amount, then add for an increase or subtract for a decrease.",
    model: "percent",
  },
  "g7-tax-tip-commission": {
    src: "/visuals/percent-market-context.webp",
    alt: "A market display showing one highlighted percent of a whole wall",
    headline: "tax, tip, and commission are a percent of a base",
    copy: "Identify the base amount first, multiply by the rate, then decide whether the result is added or reported separately.",
    model: "percent",
  },
  "g9-linear-inequalities-g9": {
    src: "/visuals/inequality-trail-context.webp",
    alt: "Two number-line trails: an open boundary with highlighted tiles extending left and a closed boundary with highlighted tiles extending right",
    headline: "a boundary point and direction describe the solution set",
    copy: "Solve as you would an equation, but reverse the sign when multiplying or dividing by a negative value.",
    model: "inequality-range",
  },
  "g9-multi-step-linear-equations": {
    src: "/visuals/multistep-workshop-context.webp",
    alt: "A sequence removing outer layers from identical mystery boxes one operation at a time",
    headline: "simplify both sides before isolating the variable",
    copy: "Combine structure first, move variable terms together, then undo the remaining operations.",
    model: "equation-steps",
  },
  "g9-equation-solution-cases": {
    src: "/visuals/solution-cases-gallery-context.webp",
    alt: "Three route displays showing one intersection, parallel routes, and two routes sharing the same path",
    headline: "one solution, no solution, or every real number",
    copy: "Simplifying reveals whether the equation ends with one value, a false statement, or an identity.",
    model: "solution-cases",
  },
  "g9-slope-from-points": {
    src: "/visuals/slope-trail-context.webp",
    alt: "A rising trail showing vertical change compared with horizontal change",
    headline: "m = change in y ÷ change in x",
    copy: "Subtract coordinates in the same order so the two signed changes describe one direction.",
    model: "slope",
  },
  "g9-graph-linear-functions": {
    src: "/visuals/graphing-line-city-context.webp",
    alt: "A city route beginning at an intercept and repeating one rise-and-run step",
    headline: "start at the intercept, then repeat the slope",
    copy: "One plotted starting point and one consistent step are enough to build the whole line.",
    model: "graph-line",
  },
  "g9-factor-trinomials": {
    src: "/visuals/polynomial-tiles-context.webp",
    alt: "A rectangular algebra tile board divided into four aligned product regions",
    headline: "read the area model backward to recover the factors",
    copy: "Find two side lengths whose product tiles rebuild the trinomial exactly.",
    model: "area-product",
  },
  "g7-unit-rates": {
    src: "/visuals/unit-rate-bike-context.webp",
    alt: "Three rental bicycles beside a route divided into equal travel sections and one highlighted single-bike comparison",
    headline: "180 miles ÷ 3 hours = 60 mi/h",
    copy: "Divide both quantities by the same value to find the amount for one unit.",
    model: "ratio",
  },
  "g7-circle-measures": {
    src: "/visuals/circle-fountain-context.webp",
    alt: "A circular city fountain with a center point, radius path, diameter path, and outer ring",
    headline: "C = 2πr · A = πr²",
    copy: "The radius controls both the distance around a circle and the space inside it.",
    model: "circle",
  },
  "g7-prism-volume": {
    src: "/visuals/prism-packing-context.webp",
    alt: "A transparent rectangular packing box built from three matching layers of gold parcels",
    headline: "V = Bh",
    copy: "Find one base layer, then stack that same area through the prism’s height.",
    model: "prism",
  },
  "g7-probability-scale": {
    src: "/visuals/probability-arcade-context.webp",
    alt: "A four-section spinner, a die, and repeated trial tokens at a modern probability arcade",
    headline: "0 ≤ P(event) ≤ 1",
    copy: "Probability moves from impossible at zero to certain at one.",
    model: "probability-scale",
  },
  "g9-systems-by-graphing-g9": {
    src: "/visuals/systems-transit-context.webp",
    alt: "Two straight transit routes crossing at one shared gold station",
    headline: "the intersection satisfies both equations",
    copy: "A solution to a system is the point that lies on both lines at once.",
    model: "systems-crossing",
  },
  "g9-multiply-binomials": {
    src: "/visuals/polynomial-tiles-context.webp",
    alt: "One rectangular algebra tile board divided into four aligned product regions",
    headline: "(x + 2)(x + 3) = x² + 5x + 6",
    copy: "Every part of one side multiplies every part of the other side.",
    model: "area-product",
  },
  "g9-quadratic-graphs": {
    src: "/visuals/parabola-bridge-context.webp",
    alt: "A symmetric bridge arch centered on a vertical gold line",
    headline: "y = x² − 4",
    copy: "A quadratic graph is symmetric around its axis and turns at its vertex.",
    model: "parabola",
  },
  "g9-exponential-growth": {
    src: "/visuals/exponential-greenhouse-context.webp",
    alt: "Four greenhouse trays with one, two, four, and eight glowing plants",
    headline: "1, 2, 4, 8, 16, …",
    copy: "Equal multiplicative changes create growth that speeds up over time.",
    model: "exponential",
  },
  "g7-scale-drawings": {
    src: "/visuals/scale-drawing-studio-context.webp",
    alt: "A blueprint and a finished miniature building showing the same footprint at proportional sizes",
    headline: "1 cm : 4 m · 6 cm represents 24 m",
    copy: "A scale drawing multiplies every matching length by the same scale factor.",
    model: "scale-drawing",
  },
  "g7-random-samples": {
    src: "/visuals/random-sample-context.webp",
    alt: "A sampling machine drawing a mixed group of colored pieces from a much larger population",
    headline: "random selection reduces bias",
    copy: "Give every member a fair chance so the sample can represent the whole population.",
    model: "random-sample",
  },
  "g7-informal-inference": {
    src: "/visuals/random-sample-context.webp",
    alt: "A sampling machine drawing a mixed random group from a much larger population",
    headline: "use a fair sample to estimate the whole",
    copy: "A random sample supports a cautious population estimate, but every sample still carries uncertainty.",
    model: "random-sample",
  },
  "g9-arithmetic-sequences": {
    src: "/visuals/arithmetic-sequence-context.webp",
    alt: "An architectural stair installation gaining an equal group of blocks on every new tier",
    headline: "4, 7, 10, 13, … adds 3 each time",
    copy: "A constant difference builds an arithmetic sequence one equal step at a time.",
    model: "arithmetic-sequence",
  },
  "g9-quadratic-formula": {
    src: "/visuals/quadratic-roots-context.webp",
    alt: "A symmetric parabolic arc meeting a horizontal field at two highlighted points",
    headline: "x² − 2x − 3 = 0 → x = −1 or 3",
    copy: "The quadratic formula finds the x-values where a parabola meets the horizontal axis.",
    model: "quadratic-roots",
  },
  "g7-surface-area": {
    src: "/visuals/surface-area-packaging-context.webp",
    alt: "A rectangular box net beside its folded box with matching face colors and alignment guides",
    headline: "a 2 × 3 × 4 box has surface area 52",
    copy: "List every outer face once, pair matching faces, then add all their areas.",
    model: "surface-area-net",
  },
  "g7-compound-events": {
    src: "/visuals/compound-events-lab-context.webp",
    alt: "A two-stage probability station sending a coin-like token toward six possible second outcomes",
    headline: "head and roll 6 → 1/2 × 1/6 = 1/12",
    copy: "For independent events joined by “and,” multiply the probability of each stage.",
    model: "compound-event",
  },
  "two-way-tables": {
    src: "/visuals/two-way-survey-context.webp",
    alt: "Survey tokens sorted into four compartments by color and shape",
    headline: "18 of 30 students = 60%",
    copy: "A joint count sits where two categories meet; divide by the correct total to compare groups.",
    model: "two-way-table",
  },
  "g9-exponential-decay": {
    src: "/visuals/exponential-decay-energy-context.webp",
    alt: "Four connected energy reservoirs holding a smaller fixed fraction at each step",
    headline: "120, 60, 30, 15, … multiplies by 1/2",
    copy: "Exponential decay keeps the same multiplier between zero and one at every step.",
    model: "exponential-decay",
  },
  "g7-discount-markup": {
    src: "/visuals/discount-studio-context.webp",
    alt: "A product box beside one price strip split into five equal panels, with one coral panel and four gold panels",
    headline: "20% off means keep 80%",
    copy: "One of five equal price shares is removed, so four of five shares remain to pay.",
    model: "percent",
  },
  "g7-angle-equations": {
    src: "/visuals/angle-plaza-context.webp",
    alt: "Two paths crossing in a plaza with opposite angle sectors matched by color",
    headline: "x + 65° = 180°",
    copy: "Opposite angles are equal. Adjacent angles on a straight line add to 180°.",
    model: "angles",
  },
  "cone-volume": {
    src: "/visuals/cone-measure-context.webp",
    alt: "Three congruent transparent cones beside a cylinder with the same base and height, showing three equal fills",
    headline: "V = ⅓πr²h",
    copy: "Three matching cones fill one cylinder with the same base and height, so one cone holds one third as much.",
    model: "cone-volume",
  },
  "g9-geometric-sequences": {
    src: "/visuals/geometric-sequence-lab-context.webp",
    alt: "Four connected greenhouse trays holding one, two, four, and eight glowing plants",
    headline: "1, 2, 4, 8, … multiplies by 2",
    copy: "A constant ratio builds a geometric sequence by repeating the same multiplication.",
    model: "exponential",
  },
  "g9-absolute-value-equations": {
    src: "/visuals/absolute-transit-context.webp",
    alt: "Two identical transit capsules parked at equal distances on opposite sides of one glowing zero marker",
    headline: "|x| = 4 → x = −4 or 4",
    copy: "Absolute value measures distance from zero, so the same positive distance can point in two directions.",
    model: "number-line",
  },
  "g7-constructing-triangles": {
    src: "/visuals/triangle-builder-context.webp",
    alt: "A triangular frame built from exactly three rigid measuring beams joined at three vertices",
    headline: "3 + 4 > 5, so the sides can meet",
    copy: "Every pair of side lengths must reach farther than the remaining side before a triangle can close.",
    model: "triangle-build",
  },
  "g7-cross-sections": {
    src: "/visuals/cross-section-studio-context.webp",
    alt: "One transparent cylinder intersected by one horizontal plane with a circular cross-section highlighted",
    headline: "horizontal slice of a cylinder → circle",
    copy: "A cross-section is the flat shape where the slicing plane passes through the solid.",
    model: "cross-section",
  },
  "coordinate-distance": {
    src: "/visuals/coordinate-route-context.webp",
    alt: "Two locations on a square city grid connected by horizontal and vertical legs and one diagonal shortcut",
    headline: "3² + 4² = 5²",
    copy: "The coordinate changes make the legs of a right triangle; the distance is its diagonal.",
    model: "coordinate-distance",
  },
  "sphere-volume": {
    src: "/visuals/sphere-tank-context.webp",
    alt: "A transparent spherical tank with one center marker and one straight radius guide to its surface",
    headline: "V = ⁴⁄₃πr³",
    copy: "One radius controls the sphere in every direction, so its volume grows with the cube of r.",
    model: "sphere-volume",
  },
  "g9-difference-squares": {
    src: "/visuals/difference-squares-workshop-context.webp",
    alt: "A smaller square tile lifted from a matching recess in one larger square board",
    headline: "a² − b² = (a − b)(a + b)",
    copy: "Remove one square area from another, then recognize the two side-length factors that remain.",
    model: "difference-squares",
  },
  "g7-compare-distributions": {
    src: "/visuals/distribution-comparison-context.webp",
    alt: "Two training lanes, one tightly clustered around its center and one spread across a wider range",
    headline: "compare center and spread together",
    copy: "A higher typical value does not automatically mean a group is more consistent; compare both the middle and the variability.",
    model: "distribution-compare",
  },
  "g7-center-spread": {
    src: "/visuals/distribution-comparison-context.webp",
    alt: "Two data lanes with different centers and spreads",
    headline: "describe both the middle and the variability",
    copy: "Center tells what is typical. Range or IQR tells how widely the values are spread.",
    model: "distribution-compare",
  },
  "rational-irrational": {
    src: "/visuals/real-number-sort-context.webp",
    alt: "A number observatory sorting repeating tile patterns from one nonrepeating spiral",
    headline: "terminates or repeats → rational",
    copy: "Rational decimals stop or repeat a fixed pattern. Irrational decimals continue without a repeating block.",
    model: "number-kinds",
  },
  "systems-algebra": {
    src: "/visuals/elimination-workshop-context.webp",
    alt: "Two conveyor lanes combining matching blocks while an opposite pair cancels at the center",
    headline: "add the equations: 2x = 8",
    copy: "Choose substitution or elimination so one unknown disappears, then use the remaining equation to find both values.",
    model: "system-elimination",
  },
  "g9-rational-exponents": {
    src: "/visuals/rational-exponent-lab-context.webp",
    alt: "A three by three by three cube becoming one three-unit edge and then a three by three square",
    headline: "27^(2/3) = (∛27)² = 9",
    copy: "The denominator names the root. The numerator tells which power to apply after finding that root.",
    model: "rational-exponent",
  },
  "g9-linear-vs-exponential": {
    src: "/visuals/growth-comparison-context.webp",
    alt: "Equal additive steps beside accelerating multiplicative columns that begin from the same baseline",
    headline: "constant difference or constant ratio?",
    copy: "Linear patterns add the same amount. Exponential patterns multiply by the same factor and eventually pull away.",
    model: "growth-compare",
  },
  "g7-simple-interest": {
    src: "/visuals/simple-interest-growth-context.webp",
    alt: "A savings vault feeding four account columns that grow by the same gold coin layer at each time step",
    headline: "I = Prt · equal interest each year",
    copy: "Simple interest adds the same percent of the original principal for every unit of time.",
    model: "simple-interest",
  },
  "graphing-lines": {
    src: "/visuals/graphing-line-city-context.webp",
    alt: "A city coordinate plaza with a line crossing the vertical axis above the origin and repeated rise-run steps",
    headline: "y = 2x + 1 starts at 1, then rises 2",
    copy: "Plot the y-intercept first. Repeat the same rise and run to build the line.",
    model: "graph-line",
  },
  "function-rules": {
    src: "/visuals/function-routing-context.webp",
    alt: "Four input capsules traveling through separate unbranched lanes to exactly one output dock each",
    headline: "each input gets exactly one output",
    copy: "A relation is a function when no input branches toward two different outputs.",
    model: "function",
  },
  "dilations-similarity": {
    src: "/visuals/dilation-studio-context.webp",
    alt: "A small triangular frame and an enlarged similar frame aligned with projection rays from one center point",
    headline: "scale factor 2 doubles every side",
    copy: "A dilation keeps every angle equal and multiplies every length by one scale factor.",
    model: "dilation",
  },
  "g9-correlation-residuals": {
    src: "/visuals/residual-observatory-context.webp",
    alt: "Data points above and below a fitted line with vertical gold rods showing their residual distances",
    headline: "residual = actual − predicted",
    copy: "Small residuals scattered above and below zero support a useful linear model.",
    model: "residuals",
  },
  "g9-properties-real-numbers": {
    src: "/visuals/distributive-workshop-context.webp",
    alt: "Four identical workshop trays, each split into a group of blue gears and two coral parts",
    headline: "a property explains why each step is valid",
    copy: "The distributive property sends the outside factor to every term inside the group.",
    model: "distribute",
  },
  "g9-one-variable-data": {
    src: "/visuals/distribution-comparison-context.webp",
    alt: "Two data lanes, one tightly clustered and one spread across a wider range",
    headline: "shape, center, spread, and unusual values tell one story",
    copy: "Choose a display and summary that fit the distribution instead of reporting one number alone.",
    model: "distribution-compare",
  },
};

function mathFor(visual: string) {
  if (visual.includes("exponent") || visual === "powers" || visual === "parentheses") return "x^2\\cdot x^3=x^5";
  if (visual.includes("equation") || visual === "balance" || visual === "substitute") return "3x-4=11";
  if (visual.includes("distribut")) return "a(b+c)=ab+ac";
  if (visual.includes("root")) return "4<\\sqrt{20}<5";
  if (visual.includes("scientific")) return "4.5\\times 10^6";
  if (visual.includes("volume") || ["cylinder", "cone", "sphere", "solid-compare"].includes(visual)) return "V=\\pi r^2h";
  return "3x+5";
}

export function ConceptVisual({ lesson }: { lesson: LessonDefinition }) {
  const visual = lesson.visual;
  if (lesson.grade >= 10) return <AdvancedMathTool lesson={lesson} />;
  const contextScene = contextScenes[lesson.slug];
  const graphEquation = lesson.slug === "g7-proportional-graphs" ? "y=2x" : lesson.slug === "graphing-lines" ? "y=2x+1" : lesson.slug === "g9-graph-linear-functions" ? "y=-2x+3" : null;
  if (contextScene && graphEquation) return <div className="interactive-concept-stack"><ContextLessonVisual scene={contextScene} /><PointToLineMission compact /><LinearGraphLab initialEquation={graphEquation} /></div>;
  if (contextScene) return <ContextLessonVisual scene={contextScene} />;
  if (graphEquation) return <div className="interactive-concept-stack"><PointToLineMission compact /><LinearGraphLab initialEquation={graphEquation} /></div>;
  if (visual.includes("fraction") || visual === "percent-grid" || visual === "place-value") {
    return <div className={`lesson-visual visual-${visual}`}><div className="fraction-model"><span /><span /><span className="empty" /><span className="empty" /></div><strong>{visual === "percent-grid" ? "25% = 25/100" : "3/4"}</strong><p>Equal-size parts make the relationship visible.</p></div>;
  }
  if (visual.includes("coordinate") || visual.includes("slope") || visual.includes("line") || visual.includes("scatter") || visual.includes("systems") || visual.includes("fit")) {
    return <div className={`lesson-visual visual-${visual}`}><div className="coordinate-model"><span className="axis-x" /><span className="axis-y" /><i className="point-one" /><i className="point-two" /><b /></div><strong>{visual.includes("slope") ? "rise / run" : "(x, y)"}</strong><p>Read the horizontal change before the vertical change.</p></div>;
  }
  if (visual.includes("triangle") || visual.includes("angle") || visual.includes("distance") || visual.includes("transform") || visual.includes("congruence") || visual.includes("dilation")) {
    return <div className={`lesson-visual visual-${visual}`}><div className="shape-model"><span /><span /><span /></div><strong>{visual.includes("triangle") ? "a² + b² = c²" : "same shape, clear rule"}</strong><p>Track what moves—and what must stay the same.</p></div>;
  }
  if (["cylinder", "cone", "sphere", "solid-compare"].includes(visual)) {
    return <div className={`lesson-visual visual-${visual}`}><div className="solid-model"><span /><i /></div><strong>V = base area × height</strong><p>Start with the familiar base, then build the solid.</p></div>;
  }
  if (visual === "number-line" || visual === "root-line") {
    return <div className={`lesson-visual visual-${visual}`}><div className="number-line-model"><span>−4</span><span>−2</span><i>0</i><span>2</span><span>4</span><b /></div><strong>right means greater</strong><p>Use direction before calculation.</p></div>;
  }
  return <div className={`lesson-visual visual-${visual}`}><div className="expression-model"><span dangerouslySetInnerHTML={{ __html: katex.renderToString(mathFor(visual), { throwOnError: false }) }} /><i>→</i><strong>{lesson.keyIdea.split(".")[0]}</strong></div><p>Read each structure before you calculate.</p></div>;
}

function ContextLessonVisual({ scene }: { scene: ContextScene }) {
  return (
    <div className={`lesson-visual contextual-lesson-visual context-model-${scene.model}`}>
      <div className="context-scene"><Image src={scene.src} width={1200} height={800} sizes="(max-width: 760px) 92vw, 720px" alt={scene.alt} /></div>
      <div className="context-math-card" aria-label={scene.modelLabel ?? `Math model: ${scene.headline}`}>
        {scene.model === "number-line" && <div className="number-line-model context-number-line"><span>−4</span><span>−2</span><i>0</i><span>2</span><span>4</span><b /></div>}
        {scene.model === "symbol-meaning" && <SymbolMeaningModel />}
        {scene.model === "sign-pairs" && <SignPairsModel />}
        {scene.model === "operation-order" && <OperationOrderModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "place-value" && <PlaceValueModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "repeating-decimal" && <RepeatingDecimalModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "negative-distribute" && <NegativeDistributeModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "root-inverse" && <RootInverseModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "solid-compare" && <SolidCompareModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "signed-sum" && <SignedSumModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "subtract-opposite" && <RationalFlowModel className="subtract-opposite-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "signed-rational-quotient" && <RationalFlowModel className="signed-rational-quotient-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "signed-change" && <RationalFlowModel className="signed-change-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "proportion-table" && <ProportionTableModel />}
        {scene.model === "origin-proportion" && <OriginProportionModel />}
        {scene.model === "word-equation" && <WordEquationModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "scale-area" && <ScaleAreaModel />}
        {scene.model === "composite-area" && <CompositeAreaModel />}
        {scene.model === "experimental-probability" && <ExperimentalProbabilityModel />}
        {scene.model === "sample-space" && <SampleSpaceModel />}
        {scene.model === "literal-equation" && <LiteralEquationModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "line-forms" && <LineFormsModel />}
        {scene.model === "system-substitution" && <SystemSubstitutionModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "system-model" && <SystemModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "radical-factor" && <AlgebraPathModel className="radical-factor-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "like-radicals" && <AlgebraPathModel className="like-radicals-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "gcf-factor" && <AlgebraPathModel className="gcf-factor-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "factor-chain" && <AlgebraPathModel className="factor-chain-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "plus-minus-roots" && <AlgebraPathModel className="plus-minus-roots-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "zero-product" && <AlgebraPathModel className="zero-product-context-model" steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "fit-prediction" && <FitPredictionModel />}
        {scene.model === "model-choice" && <ModelChoiceModel />}
        {scene.model === "percent" && <div className="percent-context-grid" aria-hidden="true">{Array.from({ length: 100 }, (_, index) => <span className={index < 20 ? "filled" : ""} key={index} />)}</div>}
        {scene.model === "fraction-equivalence" && <div className="fraction-equivalence-context-model" aria-hidden="true"><div><small>8 equal parts</small><span className="fraction-strip fraction-eighths">{Array.from({ length: 8 }, (_, index) => <i className={index < 6 ? "filled" : ""} key={index} />)}</span><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("\\frac68", { throwOnError: false }) }} /></div><b>=</b><div><small>4 equal parts</small><span className="fraction-strip fraction-quarters">{Array.from({ length: 4 }, (_, index) => <i className={index < 3 ? "filled" : ""} key={index} />)}</span><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("\\frac34", { throwOnError: false }) }} /></div></div>}
        {scene.model === "fraction-addition" && <div className="fraction-addition-context-model" aria-hidden="true"><header><span dangerouslySetInnerHTML={{ __html: katex.renderToString("\\frac13", { throwOnError: false }) }} /><i>rename</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("\\frac26", { throwOnError: false }) }} /></header><div>{[{ filled: 2, label: "\\frac26" }, { filled: 1, label: "\\frac16" }, { filled: 3, label: "\\frac36=\\frac12" }].map((item, index) => <span className="fraction-addition-part" key={item.label}><em className="fraction-strip fraction-sixths">{Array.from({ length: 6 }, (_, cell) => <i className={cell < item.filled ? "filled" : ""} key={cell} />)}</em><small dangerouslySetInnerHTML={{ __html: katex.renderToString(item.label, { throwOnError: false }) }} />{index < 2 && <b>{index === 0 ? "+" : "="}</b>}</span>)}</div></div>}
        {scene.model === "substitution" && <div className="substitution-context-model" aria-hidden="true">{scene.mathSteps?.map((step, index) => <span className="substitution-context-step" key={step}><small>{scene.mathStepLabels?.[index]}</small><strong dangerouslySetInnerHTML={{ __html: katex.renderToString(step, { throwOnError: false }) }} /></span>)}</div>}
        {scene.model === "power-steps" && <div className="power-context-model" aria-hidden="true">{scene.mathSteps?.map((step, index) => <span className="power-context-step" key={step}><small>{scene.mathStepLabels?.[index]}</small><strong dangerouslySetInnerHTML={{ __html: katex.renderToString(step, { throwOnError: false }) }} />{index < (scene.mathSteps?.length ?? 0) - 1 && <i>→</i>}</span>)}</div>}
        {scene.model === "term-structure" && <TermStructureModel steps={scene.mathSteps ?? []} labels={scene.mathStepLabels ?? []} />}
        {scene.model === "slope" && <div className="coordinate-model context-coordinate"><span className="axis-x" /><span className="axis-y" /><i className="point-one" /><i className="point-two" /><b /><em className="slope-run">run</em><em className="slope-rise">rise</em></div>}
        {scene.model === "triangle" && <div className="shape-model context-triangle"><span /><span /><span /><i aria-hidden="true" /></div>}
        {scene.model === "triangle-build" && <div className="triangle-build-context-model" aria-hidden="true"><div className="triangle-build-frame"><span className="triangle-side-three"><b>3</b></span><span className="triangle-side-four"><b>4</b></span><span className="triangle-side-five"><b>5</b></span><i className="triangle-vertex-one" /><i className="triangle-vertex-two" /><i className="triangle-vertex-three" /></div><strong>3 + 4 &gt; 5 · triangle closes</strong></div>}
        {scene.model === "angles" && <div className="angles-context-model" aria-hidden="true"><i className="angle-line-one" /><i className="angle-line-two" /><span className="angle-x">x°</span><span className="angle-65">65°</span><b>180°</b></div>}
        {scene.model === "scatter" && <div className="scatter-model" aria-hidden="true"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div>}
        {scene.model === "distribute" && <div className="distribute-context-model" aria-hidden="true"><span dangerouslySetInnerHTML={{ __html: katex.renderToString("4(x+2)", { throwOnError: false }) }} /><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("4x+8", { throwOnError: false }) }} /></div>}
        {scene.model === "function" && <div className="function-context-model" aria-hidden="true"><span><b>0</b><b>1</b><b>2</b></span><i>→</i><em>×2 + 1</em><i>→</i><span><b>1</b><b>3</b><b>5</b></span></div>}
        {scene.model === "transform" && <div className="transform-context-model" aria-hidden="true"><i className="transform-axis-x" /><i className="transform-axis-y" /><span className="transform-shape-one" /><span className="transform-shape-two" /><em>(+3, +2)</em></div>}
        {scene.model === "volume" && <div className="volume-context-model" aria-hidden="true"><span className="volume-shell" /><i className="volume-top" /><i className="volume-bottom" /><b className="volume-radius">r</b><b className="volume-height">h</b></div>}
        {scene.model === "cone-volume" && <div className="cone-volume-context-model" aria-hidden="true"><div className="cone-model-group"><span /><span /><span /></div><i>→</i><div className="cone-cylinder-model"><span /><b>3 × cone</b></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("V_{cone}=\\tfrac13\\pi r^2h", { throwOnError: false }) }} /></div>}
        {scene.model === "sphere-volume" && <div className="sphere-volume-context-model" aria-hidden="true"><div className="sphere-volume-orb"><span /><i><b>r</b></i></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("V=\\tfrac43\\pi r^3", { throwOnError: false }) }} /></div>}
        {scene.model === "cross-section" && <div className="cross-section-context-model" aria-hidden="true"><div className="cross-section-solid"><span /><i /><b /></div><strong>horizontal slice <i>→</i> circle</strong></div>}
        {scene.model === "coordinate-location" && <div className="coordinate-location-context-model" aria-hidden="true"><div className="coordinate-location-grid"><i className="location-axis-x" /><i className="location-axis-y" /><span className="location-run"><b>right 3</b></span><span className="location-rise"><b>up 2</b></span><em className="location-origin">0</em><em className="location-point">(3, 2)</em></div><strong><small>ORDERED PAIR</small><span>x first · y second</span></strong></div>}
        {scene.model === "coordinate-distance" && <div className="coordinate-distance-context-model" aria-hidden="true"><div className="coordinate-distance-grid"><i className="distance-run"><b>3</b></i><i className="distance-rise"><b>4</b></i><i className="distance-diagonal"><b>5</b></i><span className="distance-start" /><span className="distance-end" /><em /></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("d=\\sqrt{3^2+4^2}=5", { throwOnError: false }) }} /></div>}
        {scene.model === "difference-squares" && <div className="difference-squares-context-model" aria-hidden="true"><div className="difference-square"><span>a²</span><i>b²</i></div><b>→</b><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("a^2-b^2=(a-b)(a+b)", { throwOnError: false }) }} /></div>}
        {scene.model === "balance" && <div className="balance-context-model" aria-hidden="true"><div><span>x + 3</span><i>=</i><span>7</span></div><div><em>−3</em><b>same change</b><em>−3</em></div><strong>x = 4</strong></div>}
        {scene.model === "root-bracket" && <div className="root-bracket-context-model" aria-hidden="true"><span><small>√16</small><b>4</b></span><i><em>√20</em></i><span><small>√25</small><b>5</b></span></div>}
        {scene.model === "scientific-scale" && <div className="scientific-context-model" aria-hidden="true"><span>4,500,000</span><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("4.5\\times10^6", { throwOnError: false }) }} /><small>6 places</small></div>}
        {scene.model === "equation-steps" && <div className="equation-steps-context-model" aria-hidden="true">{["2(x + 3) = 14", "2x + 6 = 14", "2x = 8", "x = 4"].map((step, index) => <span key={step}><b>{step}</b>{index < 3 && <i>→</i>}</span>)}</div>}
        {scene.model === "ratio" && <div className="ratio-context-model" aria-hidden="true"><span><b>180</b><small>miles</small></span><i>÷</i><span><b>3</b><small>hours</small></span><i>=</i><strong><b>60</b><small>mi/h</small></strong></div>}
        {scene.model === "circle" && <div className="circle-context-model" aria-hidden="true"><span><i>r</i></span><div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("C=2\\pi r", { throwOnError: false }) }} /><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("A=\\pi r^2", { throwOnError: false }) }} /></div></div>}
        {scene.model === "prism" && <div className="prism-context-model" aria-hidden="true"><div><span /><span /><span /></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("V=B\\cdot h", { throwOnError: false }) }} /></div>}
        {scene.model === "probability-scale" && <div className="probability-context-model" aria-hidden="true"><div><span>0</span><i><b /></i><span>1</span></div><small>impossible</small><em>equally likely</em><small>certain</small></div>}
        {scene.model === "systems-crossing" && <div className="systems-context-model" aria-hidden="true"><i className="system-axis-x" /><i className="system-axis-y" /><span className="system-line-one" /><span className="system-line-two" /><b /><em>one shared solution</em></div>}
        {scene.model === "solution-cases" && <div className="solution-cases-context-model" aria-hidden="true"><div className="solution-case-one"><span><i /><b /></span><small>ONE</small><strong>meet once</strong></div><div className="solution-case-none"><span><i /><b /></span><small>NONE</small><strong>parallel lines</strong></div><div className="solution-case-many"><span><i /><b /></span><small>INFINITELY MANY</small><strong>same line</strong></div></div>}
        {scene.model === "inequality-range" && <div className="inequality-range-context-model" aria-hidden="true"><div className="inequality-less"><strong>x &lt; 3</strong><span><i>←</i><b /><em>3</em></span><small>open · 3 is not included</small></div><div className="inequality-greater"><strong>x ≥ −2</strong><span><i>→</i><b /><em>−2</em></span><small>closed · −2 is included</small></div><div className="inequality-flip"><b>−3x ≤ 12</b><i>÷ −3 · flip</i><strong>x ≥ −4</strong></div></div>}
        {scene.model === "area-product" && <div className="area-product-context-model" aria-hidden="true"><div><span>x²</span><span>3x</span><span>2x</span><span>6</span></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("(x+2)(x+3)=x^2+5x+6", { throwOnError: false }) }} /></div>}
        {scene.model === "parabola" && <div className="parabola-context-model" aria-hidden="true"><i className="parabola-axis-x" /><i className="parabola-axis-y" /><span /><b dangerouslySetInnerHTML={{ __html: katex.renderToString("y=x^2-4", { throwOnError: false }) }} /></div>}
        {scene.model === "exponential" && <div className="exponential-context-model" aria-hidden="true">{[1, 2, 4, 8, 16].map((value, index) => <span style={{ height: `${24 + index * 16}px` }} key={value}><b>{value}</b></span>)}</div>}
        {scene.model === "scale-drawing" && <div className="scale-drawing-context-model" aria-hidden="true"><span><b>1 cm</b><small>drawing</small></span><i>:</i><span><b>4 m</b><small>real size</small></span><em>so</em><strong><b>6 cm</b><small>× 4 = 24 m</small></strong></div>}
        {scene.model === "random-sample" && <div className="random-sample-context-model" aria-hidden="true"><div className="sample-population"><small>population</small>{Array.from({ length: 20 }, (_, index) => <span data-group={index % 5} key={index} />)}</div><i>random draw</i><div className="sample-result"><small>sample</small>{[0, 3, 1, 4, 2].map((group, index) => <span data-group={group} key={`${group}-${index}`} />)}</div></div>}
        {scene.model === "arithmetic-sequence" && <div className="arithmetic-sequence-context-model" aria-hidden="true"><div>{[4, 7, 10, 13].map((value, index) => <span key={value}><b>{value}</b>{index < 3 && <i>+3</i>}</span>)}</div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("a_n=4+3(n-1)", { throwOnError: false }) }} /></div>}
        {scene.model === "quadratic-roots" && <div className="quadratic-roots-context-model" aria-hidden="true"><div><i className="root-axis-x" /><i className="root-axis-y" /><span className="root-parabola" /><b className="root-point root-point-one">−1</b><b className="root-point root-point-two">3</b></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("x^2-2x-3=0", { throwOnError: false }) }} /></div>}
        {scene.model === "surface-area-net" && <div className="surface-area-context-model" aria-hidden="true"><div className="surface-net"><span>8</span><span>6</span><span>8</span><span>6</span><span>12</span><span>12</span></div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("2(6+8+12)=52", { throwOnError: false }) }} /></div>}
        {scene.model === "compound-event" && <div className="compound-event-context-model" aria-hidden="true"><span><small>head</small><b>1/2</b></span><i>×</i><span><small>roll 6</small><b>1/6</b></span><i>=</i><strong><small>together</small><b>1/12</b></strong></div>}
        {scene.model === "two-way-table" && <div className="two-way-context-model" aria-hidden="true"><table><thead><tr><th /><th>Tea</th><th>Other</th><th>Total</th></tr></thead><tbody><tr><th>Group A</th><td className="focus-cell">18</td><td>12</td><td className="focus-total">30</td></tr><tr><th>Group B</th><td>12</td><td>18</td><td>30</td></tr></tbody></table><strong>18 ÷ 30 = 60%</strong></div>}
        {scene.model === "exponential-decay" && <div className="exponential-decay-context-model" aria-hidden="true"><div>{[120, 60, 30, 15].map((value, index) => <span key={value}><b style={{ height: `${30 + value / 3}px` }}>{value}</b>{index < 3 && <i>× 1/2</i>}</span>)}</div><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("y=120(\\tfrac12)^t", { throwOnError: false }) }} /></div>}
        {scene.model === "number-kinds" && <div className="number-kinds-context-model" aria-hidden="true"><div><small>RATIONAL</small>{["\\frac34", "0.25", "0.\\overline3"].map((value) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} key={value} />)}</div><i>or</i><div><small>IRRATIONAL</small>{["\\sqrt2", "\\pi", "0.101001\\ldots"].map((value) => <span dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} key={value} />)}</div></div>}
        {scene.model === "system-elimination" && <div className="system-elimination-context-model" aria-hidden="true"><div><span dangerouslySetInnerHTML={{ __html: katex.renderToString("x+y=7", { throwOnError: false }) }} /><span dangerouslySetInnerHTML={{ __html: katex.renderToString("x-y=1", { throwOnError: false }) }} /></div><i>+</i><strong><span dangerouslySetInnerHTML={{ __html: katex.renderToString("2x=8", { throwOnError: false }) }} /><b dangerouslySetInnerHTML={{ __html: katex.renderToString("(x,y)=(4,3)", { throwOnError: false }) }} /></strong></div>}
        {scene.model === "distribution-compare" && <div className="distribution-compare-context-model" aria-hidden="true"><div className="distribution-row distribution-tight"><small>A</small><span><i /><b /><em /></span><strong>median 12 · IQR 3</strong></div><div className="distribution-row distribution-wide"><small>B</small><span><i /><b /><em /></span><strong>median 9 · IQR 8</strong></div></div>}
        {scene.model === "rational-exponent" && <div className="rational-exponent-context-model" aria-hidden="true"><div className="radical-cube-layers">{Array.from({ length: 3 }, (_, layer) => <div key={layer}>{Array.from({ length: 9 }, (_, cell) => <span key={cell} />)}</div>)}</div><i>→</i><strong dangerouslySetInnerHTML={{ __html: katex.renderToString("27^{2/3}=(\\sqrt[3]{27})^2=3^2=9", { throwOnError: false }) }} /></div>}
        {scene.model === "growth-compare" && <div className="growth-compare-context-model" aria-hidden="true"><div><small>LINEAR</small>{[2, 5, 8, 11].map((value, index) => <span key={value}><b>{value}</b>{index < 3 && <i>+3</i>}</span>)}</div><div><small>EXPONENTIAL</small>{[2, 6, 18, 54].map((value, index) => <span key={value}><b>{value}</b>{index < 3 && <i>×3</i>}</span>)}</div></div>}
        {scene.model === "simple-interest" && <div className="simple-interest-context-model" aria-hidden="true"><div><span><small>principal</small><b>$500</b></span><i>×</i><span><small>rate</small><b>0.04</b></span><i>×</i><span><small>time</small><b>2</b></span></div><strong><small>interest</small><b>$40</b></strong></div>}
        {scene.model === "graph-line" && <div className="graph-line-context-model" aria-hidden="true"><span><small>START</small><b>b = 1</b><em>plot (0, 1)</em></span><i>→</i><span><small>STEP</small><b>m = 2/1</b><em>rise 2 · run 1</em></span><strong>y = 2x + 1</strong></div>}
        {scene.model === "dilation" && <div className="dilation-context-model" aria-hidden="true"><div>{[[3, 6], [4, 8], [5, 10]].map(([before, after]) => <span key={before}><b>{before}</b><i>×2</i><strong>{after}</strong></span>)}</div><small>all angles stay equal</small></div>}
        {scene.model === "residuals" && <div className="residuals-context-model" aria-hidden="true"><div><span><small>actual</small><b>14</b></span><i>−</i><span><small>predicted</small><b>11</b></span><strong><small>residual</small><b>+3</b></strong></div><em>small + no pattern → useful linear fit</em></div>}
      </div>
      {scene.model !== "ratio" && <strong>{scene.headline}</strong>}
      <p>{scene.copy}</p>
    </div>
  );
}

function TermStructureModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [source, ...parts] = steps;
  if (!source) return null;
  return <div className="term-structure-context-model" aria-hidden="true"><header><small>{labels[0]}</small><strong dangerouslySetInnerHTML={{ __html: katex.renderToString(source, { throwOnError: false }) }} /></header><div>{parts.map((step, index) => <span key={`${step}-${index}`}><small>{labels[index + 1]}</small><strong dangerouslySetInnerHTML={{ __html: katex.renderToString(step, { throwOnError: false }) }} /></span>)}</div></div>;
}

function MathStep({ value }: { value: string }) {
  return <strong dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { throwOnError: false }) }} />;
}

function SymbolMeaningModel() {
  const symbols = [["<", "less than"], [">", "greater than"], ["\\le", "less or equal"], ["\\ne", "not equal"]];
  return <div className="symbol-meaning-context-model" aria-hidden="true"><div>{symbols.map(([symbol, label]) => <span key={symbol}><MathStep value={symbol} /><small>{label}</small></span>)}</div><footer><MathStep value="-4<-1" /><small>−4 is farther left</small></footer></div>;
}

function SignPairsModel() {
  const pairs = [["(+)\\cdot(+)", "+", "same"], ["(-)\\cdot(-)", "+", "same"], ["(+)\\cdot(-)", "-", "different"], ["(-)\\cdot(+)", "-", "different"]];
  return <div className="sign-pairs-context-model" aria-hidden="true"><div>{pairs.map(([pair, result, label]) => <span key={pair}><small>{label} signs</small><MathStep value={pair} /><i>→</i><MathStep value={result} /></span>)}</div><footer><MathStep value="(-6)(-5)=+30" /><small>sign first · size second</small></footer></div>;
}

function OperationOrderModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [source, ...work] = steps;
  if (!source) return null;
  return <div className="operation-order-context-model" aria-hidden="true"><header><small>{labels[0]}</small><MathStep value={source} /></header><div>{work.map((step, index) => <span key={step}><small>{index + 1} · {labels[index + 1]}</small><MathStep value={step} />{index < work.length - 1 && <i>→</i>}</span>)}</div></div>;
}

function PlaceValueModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [decimal, meaning, fraction] = steps;
  if (!decimal || !meaning || !fraction) return null;
  return <div className="place-value-context-model" aria-hidden="true"><header><small>{labels[0]}</small><MathStep value={decimal} /></header><div><span><small>tenths</small><b>3</b></span><span><small>hundredths</small><b>5</b></span></div><footer><span><small>{labels[1]}</small><MathStep value={meaning} /></span><i>→</i><span><small>{labels[2]}</small><MathStep value={fraction} /></span></footer></div>;
}

function RepeatingDecimalModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  return <div className="repeating-decimal-context-model" aria-hidden="true">{steps.map((step, index) => <span key={step}><small>{labels[index]}</small><MathStep value={step} />{index === 1 && <em><i>3</i><i>3</i><i>3</i><i>↻</i></em>}{index < steps.length - 1 && <b>→</b>}</span>)}</div>;
}

function NegativeDistributeModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [source, first, second, result] = steps;
  if (!source || !first || !second || !result) return null;
  return <div className="negative-distribute-context-model" aria-hidden="true"><header><small>{labels[0]}</small><MathStep value={source} /></header><div><span><small>{labels[1]}</small><MathStep value={first} /></span><span><small>{labels[2]}</small><MathStep value={second} /></span></div><footer><small>{labels[3]}</small><MathStep value={result} /></footer></div>;
}

function RootInverseModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  return <div className="root-inverse-context-model" aria-hidden="true">{[0, 2].map((start) => <div key={steps[start]}><span><small>{labels[start]}</small><MathStep value={steps[start]} /></span><i>↔</i><span><small>{labels[start + 1]}</small><MathStep value={steps[start + 1]} /></span></div>)}</div>;
}

function SolidCompareModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [dimensions, cylinder, cone, difference] = steps;
  if (!dimensions || !cylinder || !cone || !difference) return null;
  return <div className="solid-compare-context-model" aria-hidden="true"><header><small>{labels[0]}</small><MathStep value={dimensions} /></header><div><span><small>{labels[1]}</small><i className="solid-cylinder-mark" /><MathStep value={cylinder} /></span><span><small>{labels[2]}</small><i className="solid-cone-mark" /><MathStep value={cone} /></span></div><footer><small>{labels[3]}</small><MathStep value={difference} /></footer></div>;
}

function SignedSumModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [sum, negativeDistance, positiveDistance, difference, result] = steps;
  if (!sum || !negativeDistance || !positiveDistance || !difference || !result) return null;
  return <div className="signed-sum-context-model" aria-hidden="true"><header><small>{labels[0]}</small><MathStep value={sum} /></header><div><span><small>{labels[1]}</small><MathStep value={negativeDistance} /></span><b>vs.</b><span><small>{labels[2]}</small><MathStep value={positiveDistance} /></span></div><footer><span><small>{labels[3]}</small><MathStep value={difference} /></span><i>→</i><span><small>{labels[4]}</small><MathStep value={result} /></span></footer></div>;
}

function RationalFlowModel({ className, steps, labels }: { className: string; steps: string[]; labels: string[] }) {
  return <div className={`rational-flow-context-model ${className}`} aria-hidden="true">{steps.map((step, index) => <span key={step}><small>{labels[index]}</small><MathStep value={step} />{index < steps.length - 1 && <i>→</i>}</span>)}</div>;
}

function ProportionTableModel() {
  return <div className="proportion-table-context-model" aria-hidden="true"><table><thead><tr><th>x</th><th>y</th><th>y ÷ x</th></tr></thead><tbody>{[[2, 6], [4, 12], [6, 18]].map(([x, y]) => <tr key={x}><td>{x}</td><td>{y}</td><td>3</td></tr>)}</tbody></table><strong><small>constant of proportionality</small><MathStep value="k=3\\Rightarrow y=3x" /></strong></div>;
}

function OriginProportionModel() {
  return <div className="origin-proportion-context-model" aria-hidden="true"><div><i className="origin-proportion-axis-x" /><i className="origin-proportion-axis-y" /><span /><b className="origin-proportion-zero">(0, 0)</b><b className="origin-proportion-point">(3, 6)</b></div><strong><MathStep value="y=2x" /><small>straight line · through the origin</small></strong></div>;
}

function WordEquationModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [unknown, rate, fee, equation, result] = steps;
  if (!unknown || !rate || !fee || !equation || !result) return null;
  return <div className="word-equation-context-model" aria-hidden="true"><header><small>{labels[0]}</small><MathStep value={unknown} /></header><div><span><small>{labels[1]}</small><MathStep value={rate} /></span><i>+</i><span><small>{labels[2]}</small><MathStep value={fee} /></span><b>→</b><span><small>{labels[3]}</small><MathStep value={equation} /></span></div><footer><small>{labels[4]}</small><MathStep value={result} /></footer></div>;
}

function ScaleAreaModel() {
  return <div className="scale-area-context-model" aria-hidden="true"><div className="scale-area-small"><span /><small>side 2</small><strong>area 4</strong></div><i><b>length × 3</b><b>area × 3²</b></i><div className="scale-area-large"><span>{Array.from({ length: 9 }, (_, index) => <em key={index} />)}</span><small>side 6</small><strong>area 36</strong></div><footer><MathStep value="k=3\\Rightarrow k^2=9" /><small>nine times the area</small></footer></div>;
}

function CompositeAreaModel() {
  return <div className="composite-area-context-model" aria-hidden="true"><div><span>10 × 8</span><i>3 × 2</i></div><strong><small>whole − cutout</small><MathStep value="80-6=74\\text{ units}^2" /></strong></div>;
}

function ExperimentalProbabilityModel() {
  return <div className="experimental-probability-context-model" aria-hidden="true"><div>{Array.from({ length: 30 }, (_, index) => <span className={index < 18 ? "observed" : ""} key={index} />)}</div><strong><small>18 observed · 30 trials</small><MathStep value="P(H)=\\frac{18}{30}=\\frac35=0.6" /></strong></div>;
}

function SampleSpaceModel() {
  return <div className="sample-space-context-model" aria-hidden="true"><header><span>FIRST FLIP</span><i>H</i><i>T</i></header><div><small>SECOND FLIP</small>{["HH", "HT", "TH", "TT"].map((outcome) => <span key={outcome}><b>{outcome}</b><em>1 of 4</em></span>)}</div><footer>S = &#123;HH, HT, TH, TT&#125;</footer></div>;
}

function LiteralEquationModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  return <div className="literal-equation-context-model" aria-hidden="true">{steps.map((step, index) => <span key={step}><small>{labels[index]}</small><MathStep value={step} />{index < steps.length - 1 && <i>→</i>}</span>)}</div>;
}

function LineFormsModel() {
  const forms = [["point-slope", "y-5=3(x-2)"], ["slope-intercept", "y=3x-1"], ["standard", "3x-y=1"]];
  return <div className="line-forms-context-model" aria-hidden="true">{forms.map(([label, form], index) => <span key={label}><small>{label}</small><MathStep value={form} />{index < forms.length - 1 && <i>=</i>}</span>)}</div>;
}

function SystemSubstitutionModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  return <div className="system-substitution-context-model" aria-hidden="true">{steps.map((step, index) => <span key={step}><small>{labels[index]}</small><MathStep value={step} />{index < steps.length - 1 && <i>→</i>}</span>)}</div>;
}

function SystemModel({ steps, labels }: { steps: string[]; labels: string[] }) {
  const [adult, student, count, cost, solution] = steps;
  if (!adult || !student || !count || !cost || !solution) return null;
  return <div className="system-model-context-model" aria-hidden="true"><header><span><small>{labels[0]}</small><MathStep value={adult} /></span><span><small>{labels[1]}</small><MathStep value={student} /></span></header><div><span><small>{labels[2]}</small><MathStep value={count} /></span><span><small>{labels[3]}</small><MathStep value={cost} /></span></div><footer><small>{labels[4]}</small><MathStep value={solution} /></footer></div>;
}

function AlgebraPathModel({ className, steps, labels }: { className: string; steps: string[]; labels: string[] }) {
  return <div className={`algebra-path-context-model ${className}`} aria-hidden="true">{steps.map((step, index) => <span key={step}><small>{labels[index]}</small><MathStep value={step} />{index < steps.length - 1 && <i>→</i>}</span>)}</div>;
}

function FitPredictionModel() {
  return <div className="fit-prediction-context-model" aria-hidden="true"><div>{Array.from({ length: 8 }, (_, index) => <span key={index} />)}<i /></div><section><span><small>line of fit</small><MathStep value="y=2.5x+4" /></span><span><small>within range</small><MathStep value="x=10" /></span><strong><small>prediction</small><MathStep value="y=29" /></strong></section></div>;
}

function ModelChoiceModel() {
  const models = [
    { label: "linear", values: "3,5,7,9", check: "+2,+2,+2", clue: "first difference" },
    { label: "quadratic", values: "1,4,9,16", check: "2,2", clue: "second difference" },
    { label: "exponential", values: "2,6,18,54", check: "\\times3,\\times3,\\times3", clue: "constant ratio" },
  ];
  return <div className="model-choice-context-model" aria-hidden="true">{models.map((model) => <span key={model.label}><small>{model.label}</small><b>{model.values}</b><MathStep value={model.check} /><em>{model.clue}</em></span>)}</div>;
}
