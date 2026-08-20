import { grade7Regions } from "./curriculum-grade7.ts";
import { grade9Regions } from "./curriculum-grade9.ts";

export type Accent = "blue" | "teal" | "coral" | "violet" | "gold";

export type PracticeQuestion = {
  id: string;
  prompt: string;
  answer: string;
  hint: string;
  choices?: string[];
};

export type LessonDefinition = {
  id: string;
  grade: 7 | 8 | 9;
  slug: string;
  regionId: number;
  order: number;
  title: string;
  goal: string;
  keyIdea: string;
  example: string;
  exampleSteps: string[];
  standard: string;
  accent: Accent;
  visual: string;
  quickSheet?: string;
  practice: PracticeQuestion[];
};

export type RegionDefinition = {
  id: number;
  grade: 7 | 8 | 9;
  order: number;
  slug: string;
  title: string;
  subtitle: string;
  accent: Accent;
  standard: string;
  lessons: LessonDefinition[];
};

type RawQuestion = [prompt: string, answer: string, hint: string, choices?: string[]];

const sourceSheet = (filename: string) => `/quick-sheets/${filename}`;

function lesson(
  regionId: number,
  order: number,
  slug: string,
  title: string,
  goal: string,
  keyIdea: string,
  example: string,
  exampleSteps: string[],
  standard: string,
  accent: Accent,
  visual: string,
  questions: RawQuestion[],
  quickSheet?: string,
): LessonDefinition {
  return {
    id: `g8-r${regionId}-l${order}`,
    grade: 8,
    regionId,
    order,
    slug,
    title,
    goal,
    keyIdea,
    example,
    exampleSteps,
    standard,
    accent,
    visual,
    quickSheet,
    practice: questions.map(([prompt, answer, hint, choices], index) => ({
      id: `q${index + 1}`,
      prompt,
      answer,
      hint,
      choices,
    })),
  };
}

const regionSpecs: Array<Omit<RegionDefinition, "grade" | "order">> = [
  {
    id: 1,
    slug: "number-foundations",
    title: "Number Foundations",
    subtitle: "Read the language of math with confidence.",
    accent: "blue",
    standard: "Grade 8 readiness",
    lessons: [
      lesson(1, 1, "math-symbols", "Math Symbols", "Read symbols as clear instructions.", "Every symbol tells you what relationship or operation to use.", "−4 < −1", ["Find both numbers on a number line.", "−4 is farther left than −1.", "The open side points to the greater number: −4 < −1."], "Grade 8 readiness", "blue", "symbols", [
        ["What does ≠ mean?", "not equal", "It says two values are different.", ["equal", "not equal", "at least", "multiply"]],
        ["Choose the symbol: 8 __ 3", ">", "The open side faces the greater value.", ["<", ">", "=", "≠"]],
        ["What operation is hidden in 5y?", "multiplication|multiply", "A number beside a variable means multiplication.", ["addition", "subtraction", "multiplication", "division"]],
        ["Choose the symbol: −4 __ −1", "<", "On a number line, −4 is left of −1.", ["<", ">", "=", "≥"]],
        ["What does ≤ mean?", "less than or equal to|less than or equal", "It combines “less than” and “equal.”", ["less than", "less than or equal to", "greater than", "not equal"]],
      ], sourceSheet("10_math_symbols.png")),
      lesson(1, 2, "signed-numbers", "Positive and Negative Numbers", "Move confidently above and below zero.", "Positive numbers sit right of zero; negative numbers sit left.", "−2 + 5 = 3", ["Start at −2.", "Adding 5 means move 5 places right.", "Land on 3."], "Grade 8 readiness", "coral", "number-line", [
        ["Calculate −3 + 8.", "5", "Start at −3 and move 8 places right."],
        ["Calculate 4 − 9.", "-5", "Subtracting 9 means move 9 places left."],
        ["Which is greater: −7 or −2?", "-2", "The number closer to zero is greater.", ["−7", "−2"]],
        ["What is |−7|?", "7", "Absolute value is distance from zero."],
        ["The temperature is −2°C and rises 5°C. What is it now?", "3", "Add 5 to −2."],
      ], sourceSheet("07_positive_negative_numbers.png")),
      lesson(1, 3, "sign-rules", "Sign Rules", "Predict the sign before you calculate.", "Same signs give a positive product; different signs give a negative product.", "(−6)(−5) = 30", ["The signs are the same, so the result is positive.", "Multiply 6 × 5.", "The answer is 30."], "Grade 8 readiness", "coral", "sign-grid", [
        ["Calculate (−6)(−5).", "30", "Same signs make a positive result."],
        ["Calculate 24 ÷ (−8).", "-3", "Different signs make a negative result."],
        ["Calculate (−7)(4).", "-28", "Different signs: negative. Then multiply 7 × 4."],
        ["Calculate −36 ÷ −6.", "6", "Same signs make a positive result."],
        ["What sign does a product with different signs have?", "negative", "One positive and one negative gives a negative product.", ["positive", "negative", "zero"]],
      ], sourceSheet("08_sign_rules.png")),
      lesson(1, 4, "order-of-operations", "Order of Operations", "Choose the right first step every time.", "Group, exponent, multiply or divide, then add or subtract.", "2 + 3 × 4² = 50", ["Evaluate the exponent: 4² = 16.", "Multiply: 3 × 16 = 48.", "Add: 2 + 48 = 50."], "Grade 8 readiness", "blue", "steps", [
        ["Evaluate 5 + 2 × 3².", "23", "Do the exponent, then multiplication, then addition."],
        ["Evaluate (8 − 2) ÷ 3 + 4.", "6", "Start inside parentheses."],
        ["Evaluate 2 + 3 × 4².", "50", "Evaluate 4² before multiplying."],
        ["Evaluate 18 ÷ (3 + 3).", "3", "Finish the grouping first."],
        ["Evaluate 7 − 2 × 3.", "1", "Multiply 2 × 3 before subtracting."],
      ], sourceSheet("09_order_of_operations.png")),
    ],
  },
  {
    id: 2,
    slug: "fractions-percents",
    title: "Fractions & Percents",
    subtitle: "See how parts, decimals, and percents connect.",
    accent: "gold",
    standard: "Grade 8 readiness",
    lessons: [
      lesson(2, 1, "fractions", "Fractions: Part and Division", "Read and simplify fractions as equal parts.", "The numerator counts chosen parts; the denominator names equal parts in all.", "6/8 = 3/4", ["Find a common factor: 2.", "Divide top and bottom by 2.", "6/8 becomes 3/4."], "Grade 8 readiness", "gold", "fractions", [
        ["In 3/5, what does 5 represent?", "the total number of equal parts|total equal parts|denominator", "The bottom number names all equal parts."],
        ["Simplify 12/18.", "2/3", "Divide numerator and denominator by 6."],
        ["Simplify 8/12.", "2/3", "Divide top and bottom by 4."],
        ["Which fraction equals 1/2?", "3/6", "Multiply top and bottom by the same number.", ["2/5", "3/6", "4/10", "5/12"]],
        ["Write 7 ÷ 9 as a fraction.", "7/9", "The dividend becomes the numerator."],
      ], sourceSheet("11_fractions_meaning.png")),
      lesson(2, 2, "adding-fractions", "Adding Fractions", "Rename pieces before adding them.", "Add numerators only after the pieces have the same denominator.", "1/3 + 1/6 = 1/2", ["Rename 1/3 as 2/6.", "Add 2/6 + 1/6 = 3/6.", "Simplify 3/6 to 1/2."], "Grade 8 readiness", "gold", "fraction-bars", [
        ["Calculate 2/5 + 1/5.", "3/5", "The denominators already match."],
        ["Calculate 1/2 + 1/4.", "3/4", "Rename 1/2 as 2/4."],
        ["Calculate 1/3 + 1/6.", "1/2|3/6", "Use sixths: 2/6 + 1/6."],
        ["Calculate 3/8 + 1/4.", "5/8", "Rename 1/4 as 2/8."],
        ["Calculate 2/3 + 1/9.", "7/9", "Rename 2/3 as 6/9."],
      ], sourceSheet("12_adding_fractions.png")),
      lesson(2, 3, "decimals", "Decimals and Place Value", "Connect decimal places to fractions.", "Each step right is ten times smaller.", "0.35 = 35/100 = 7/20", ["35 is in the hundredths place.", "Write 35/100.", "Simplify by dividing by 5."], "Grade 8 readiness", "blue", "place-value", [
        ["Write 0.35 as a simplified fraction.", "7/20", "Write 35/100, then simplify."],
        ["Which is greater: 0.8 or 0.75?", "0.8", "Write 0.8 as 0.80."],
        ["What digit is in the hundredths place in 4.672?", "7", "Count two places right of the decimal."],
        ["Write 3/10 as a decimal.", "0.3", "Tenths use one decimal place."],
        ["Order from least to greatest: 0.4, 0.04, 0.44", "0.04,0.4,0.44|0.04, 0.4, 0.44", "Compare place values from left to right."],
      ], sourceSheet("13_decimals_place_value.png")),
      lesson(2, 4, "percent", "Percent Means Per 100", "Move between fractions, decimals, and percents.", "Percent means “out of 100.”", "20% of 60 = 12", ["Write 20% as 0.20.", "Multiply 0.20 × 60.", "The answer is 12."], "Grade 8 readiness", "teal", "percent-grid", [
        ["Write 65% as a decimal.", "0.65", "Divide by 100."],
        ["Find 15% of 80.", "12", "Multiply 0.15 × 80."],
        ["Write 0.42 as a percent.", "42%|42", "Multiply by 100 and add the percent sign."],
        ["What percent is 3/4?", "75%|75", "3 ÷ 4 = 0.75."],
        ["A $50 item is 20% off. What is the discount?", "10|$10", "Find 0.20 × 50."],
      ], sourceSheet("14_percent.png")),
    ],
  },
  {
    id: 3,
    slug: "algebra-basics",
    title: "Algebra Basics",
    subtitle: "Turn unknowns into clear, solvable steps.",
    accent: "teal",
    standard: "8.EE.C.7",
    lessons: [
      lesson(3, 1, "algebra-language", "Algebra Has a Language", "Name the parts of an expression.", "A variable is a number we do not know yet.", "3x + 5", ["3 is the coefficient.", "x is the variable.", "5 is the constant."], "8.EE.C.7", "blue", "expression", [
        ["In 7y − 2, what is the coefficient?", "7", "The coefficient multiplies the variable."],
        ["Evaluate 2a + 1 when a = 5.", "11", "Replace a with 5."],
        ["In 4m + 9, what is the constant?", "9", "The constant has no variable."],
        ["How many terms are in 3x + 5?", "2", "Terms are separated by plus or minus signs."],
        ["Which letter is the variable in 6p − 1?", "p", "The variable can change."],
      ], sourceSheet("01_algebra_language.png")),
      lesson(3, 2, "substitution", "Substitute a Value", "Replace a variable, then follow operation order.", "Use parentheses around a negative replacement.", "2(−3)² + 1 = 19", ["Replace x with −3 using parentheses.", "Square first: (−3)² = 9.", "Then 2 × 9 + 1 = 19."], "8.EE.C.7", "teal", "substitute", [
        ["Evaluate 3a − 2 when a = 4.", "10", "Replace a with 4."],
        ["Evaluate y² − 1 when y = −5.", "24", "Use parentheses: (−5)²."],
        ["Evaluate 2m + 7 when m = −3.", "1", "Calculate 2(−3) + 7."],
        ["Evaluate 4 − n when n = 9.", "-5", "Replace n with 9."],
        ["Evaluate 3x² when x = 2.", "12", "Square 2 before multiplying by 3."],
      ], sourceSheet("04_substitution.png")),
      lesson(3, 3, "one-step-equations", "Solve a One-Step Equation", "Undo one operation to isolate the variable.", "Keep an equation balanced by doing the same thing to both sides.", "x + 7 = 12 → x = 5", ["Undo +7 with −7.", "Subtract 7 from both sides.", "Check: 5 + 7 = 12."], "8.EE.C.7", "teal", "balance", [
        ["Solve x − 9 = 4.", "13", "Add 9 to both sides."],
        ["Solve x/5 = 3.", "15", "Multiply both sides by 5."],
        ["Solve 4x = 28.", "7", "Divide both sides by 4."],
        ["Solve y + 11 = 18.", "7", "Subtract 11 from both sides."],
        ["Solve −3x = 21.", "-7", "Divide both sides by −3."],
      ], sourceSheet("05_one_step_equations.png")),
      lesson(3, 4, "two-step-equations", "Solve a Two-Step Equation", "Undo addition first, then multiplication.", "Reverse the order of operations to leave the variable alone.", "3x − 4 = 11 → x = 5", ["Add 4 to both sides: 3x = 15.", "Divide both sides by 3.", "Check: 3(5) − 4 = 11."], "8.EE.C.7", "teal", "equation-steps", [
        ["Solve 2x + 3 = 13.", "5", "Subtract 3, then divide by 2."],
        ["Solve 5y − 7 = 18.", "5", "Add 7, then divide by 5."],
        ["Solve 4x + 6 = 30.", "6", "Subtract 6, then divide by 4."],
        ["Solve 3m − 8 = 7.", "5", "Add 8, then divide by 3."],
        ["Solve x/2 + 4 = 9.", "10", "Subtract 4, then multiply by 2."],
      ], sourceSheet("06_two_step_equations.png")),
    ],
  },
  {
    id: 4,
    slug: "expressions-powers",
    title: "Expressions & Powers",
    subtitle: "Spot structure and simplify with purpose.",
    accent: "violet",
    standard: "8.EE.A.1",
    lessons: [
      lesson(4, 1, "powers", "Powers: What Does x² Mean?", "Read powers as repeated multiplication.", "An exponent counts how many equal factors are multiplied.", "x² = x · x", ["The base is x.", "The exponent is 2.", "Use x as a factor two times."], "8.EE.A.1", "violet", "powers", [
        ["Write a⁴ as repeated multiplication.", "a*a*a*a|a·a·a·a|aaaa", "Use a as a factor four times."],
        ["Find 2³.", "8", "Multiply 2 × 2 × 2."],
        ["What is the base in 5⁴?", "5", "The base is the repeated factor."],
        ["What is the exponent in y⁶?", "6", "The small raised number is the exponent."],
        ["Find (−3)².", "9", "Multiply (−3)(−3)."],
      ], sourceSheet("02_powers_meaning.png")),
      lesson(4, 2, "exponent-rules", "Exponent Rules", "Combine powers with the same base.", "Add exponents when multiplying; subtract when dividing.", "x² · x³ = x⁵", ["The base stays x.", "Add the exponents: 2 + 3.", "The result is x⁵."], "8.EE.A.1", "violet", "exponent-blocks", [
        ["Simplify a³ · a⁴.", "a^7|a⁷", "Add the exponents."],
        ["Simplify y⁶/y².", "y^4|y⁴", "Subtract the exponents."],
        ["Simplify m² · m⁵.", "m^7|m⁷", "Keep the base and add 2 + 5."],
        ["Simplify p⁹/p³.", "p^6|p⁶", "Subtract 9 − 3."],
        ["Simplify x · x⁴.", "x^5|x⁵", "A lone x has exponent 1."],
      ], sourceSheet("03_exponent_rules.png")),
      lesson(4, 3, "distributive-property", "The Distributive Property", "Multiply one factor across every term.", "Think: two arrows from the outside factor.", "4(x + 2) = 4x + 8", ["Multiply 4 by x.", "Multiply 4 by 2.", "Write 4x + 8."], "8.EE.C.7", "coral", "distribute", [
        ["Expand 3(y + 5).", "3y+15|15+3y", "Multiply 3 by both terms."],
        ["Expand 2(a − 4).", "2a-8", "Multiply 2 by a and by −4."],
        ["Expand 5(x + 3).", "5x+15|15+5x", "Draw two arrows from 5."],
        ["Expand 4(2m − 1).", "8m-4", "Multiply 4 by each term."],
        ["Expand −2(n + 6).", "-2n-12|-12-2n", "A negative factor changes both terms."],
      ], sourceSheet("16_distributive_property.png")),
      lesson(4, 4, "negative-distribution", "Distribute a Negative Factor", "Carry the negative sign to every term.", "Multiply coefficients and keep each variable power.", "−3(x² + y³) = −3x² − 3y³", ["Multiply −3 by x².", "Multiply −3 by y³.", "Both terms become negative."], "8.EE.C.7", "coral", "negative-distribute", [
        ["Expand −2(a + b).", "-2a-2b", "Multiply −2 by each term."],
        ["Expand −4(x² − y).", "-4x^2+4y|-4x²+4y", "Negative times negative makes positive."],
        ["Expand −3(m + 5).", "-3m-15", "Distribute −3 to both terms."],
        ["Expand −(x − 7).", "-x+7|7-x", "Treat the outside factor as −1."],
        ["Expand −5(2p + q).", "-10p-5q", "Multiply −5 by both terms."],
      ], sourceSheet("17_negative_distribution.png")),
    ],
  },
  {
    id: 5,
    slug: "real-numbers",
    title: "Real Numbers",
    subtitle: "Place every number on the real-number map.",
    accent: "violet",
    standard: "8.NS.A.1–2",
    lessons: [
      lesson(5, 1, "repeating-decimals", "Repeating Decimals", "Recognize a decimal pattern that never ends.", "Only the digits under the bar repeat.", "0.\u03053 = 0.333… = 1/3", ["Read the repeat bar.", "Repeat only the marked digit.", "A repeating decimal is rational."], "8.NS.A.1", "violet", "repeat", [
        ["Write 0.555… using a repeat bar.", "0.(5)|0.5bar|0.\u03055", "Only the 5 repeats."],
        ["What repeats in 0.12343434…?", "34", "Find the block that continues."],
        ["Is 0.272727… rational or irrational?", "rational", "A repeating decimal is rational.", ["rational", "irrational"]],
        ["Write 1/3 as a decimal.", "0.333...|0.333…|0.(3)", "The digit 3 repeats forever."],
        ["Which decimal terminates?", "0.625", "A terminating decimal stops.", ["0.121212…", "0.625", "0.333…", "0.1010010001…"]],
      ], sourceSheet("15_repeating_decimals.png")),
      lesson(5, 2, "rational-irrational", "Rational vs. Irrational", "Sort real numbers by their decimal behavior.", "Rational decimals terminate or repeat; irrational decimals do neither.", "√2 is irrational", ["√2 is not a perfect-square root.", "Its decimal never ends.", "Its digits do not repeat in a fixed block."], "8.NS.A.1", "blue", "number-sets", [
        ["Is 3/7 rational or irrational?", "rational", "Any ratio of integers is rational.", ["rational", "irrational"]],
        ["Is π rational or irrational?", "irrational", "π never terminates or repeats.", ["rational", "irrational"]],
        ["Is 0.125 rational or irrational?", "rational", "Terminating decimals are rational.", ["rational", "irrational"]],
        ["Is √49 rational or irrational?", "rational", "√49 is the integer 7.", ["rational", "irrational"]],
        ["Which number is irrational?", "sqrt(3)|√3", "3 is not a perfect square.", ["√3", "0.4", "−8", "2/9"]],
      ]),
      lesson(5, 3, "square-cube-roots", "Square and Cube Roots", "Use roots to undo powers.", "A square root undoes squaring; a cube root undoes cubing.", "√81 = 9 and ∛27 = 3", ["9² = 81.", "3³ = 27.", "Roots name the original factors."], "8.EE.A.2", "violet", "root-tiles", [
        ["Find √64.", "8", "Ask which positive number squared is 64."],
        ["Find ∛125.", "5", "5 × 5 × 5 = 125."],
        ["Solve x² = 36 for the positive root.", "6", "6² = 36."],
        ["Find √121.", "11", "11 × 11 = 121."],
        ["Find ∛−8.", "-2", "(−2)³ = −8."],
      ]),
      lesson(5, 4, "approximating-irrationals", "Approximating Irrational Numbers", "Locate an irrational number between familiar values.", "Bracket a root between neighboring perfect squares.", "4 < √20 < 5", ["16 < 20 < 25.", "Take square roots: 4 < √20 < 5.", "√20 is closer to 4.5 than 4."], "8.NS.A.2", "gold", "root-line", [
        ["Between which integers is √30?", "5 and 6|5,6", "25 < 30 < 36."],
        ["Estimate √10 to the nearest tenth.", "3.2", "3.1² = 9.61 and 3.2² = 10.24."],
        ["Which is greater: √50 or 7?", "sqrt(50)|√50", "7² = 49, so √50 is just above 7.", ["√50", "7"]],
        ["Between which integers is √70?", "8 and 9|8,9", "64 < 70 < 81."],
        ["Place √5 closest to which decimal?", "2.2", "2.2² = 4.84.", ["1.5", "2.2", "3.1", "4.5"]],
      ]),
    ],
  },
  {
    id: 6,
    slug: "exponents-scientific-notation",
    title: "Exponents & Scientific Notation",
    subtitle: "Make very large and very small numbers manageable.",
    accent: "violet",
    standard: "8.EE.A.1–4",
    lessons: [
      lesson(6, 1, "exponents-parentheses", "Exponents and Parentheses", "Tell whether a negative sign is inside the power.", "Parentheses decide what the exponent controls.", "(−3)² = 9, but −3² = −9", ["Inside parentheses, −3 is the base.", "Without parentheses, only 3 is squared.", "Apply the outside negative last."], "8.EE.A.1", "violet", "parentheses", [
        ["Evaluate (−4)².", "16", "The negative is inside the squared base."],
        ["Evaluate −4².", "-16", "Square 4, then apply the negative."],
        ["Simplify (x²)⁶.", "x^12|x¹²", "Multiply the exponents."],
        ["Evaluate (−2)³.", "-8", "Three negative factors give a negative result."],
        ["Simplify (a³)⁴.", "a^12|a¹²", "Multiply 3 × 4."],
      ], sourceSheet("18_exponents_parentheses.png")),
      lesson(6, 2, "zero-negative-exponents", "Zero and Negative Exponents", "Rewrite negative powers as reciprocals.", "For nonzero a: a⁰ = 1 and a⁻ⁿ = 1/aⁿ.", "2⁻³ = 1/8", ["A negative exponent asks for a reciprocal.", "Rewrite 2⁻³ as 1/2³.", "Evaluate 1/8."], "8.EE.A.1", "violet", "reciprocal", [
        ["Evaluate 7⁰.", "1", "Any nonzero base to power zero is 1."],
        ["Rewrite 3⁻² as a fraction.", "1/9", "Use 1/3²."],
        ["Simplify x⁻⁴.", "1/x^4|1/x⁴", "Move x⁴ to the denominator."],
        ["Evaluate 10⁻³.", "0.001|1/1000", "Move the decimal three places left."],
        ["Simplify a⁵/a⁷.", "1/a^2|a^-2|1/a²", "Subtract to get a⁻², then use a reciprocal."],
      ]),
      lesson(6, 3, "scientific-notation", "Scientific Notation", "Write numbers as one digit times a power of ten.", "Scientific notation has the form a × 10ⁿ where 1 ≤ |a| < 10.", "4,500,000 = 4.5 × 10⁶", ["Move the decimal after the first nonzero digit.", "Count six places moved left.", "Use exponent 6."], "8.EE.A.3", "blue", "scientific", [
        ["Write 6,200,000 in scientific notation.", "6.2*10^6|6.2x10^6|6.2×10⁶", "Move the decimal six places left."],
        ["Write 0.00045 in scientific notation.", "4.5*10^-4|4.5x10^-4|4.5×10⁻⁴", "Move the decimal four places right."],
        ["Write 3.1 × 10⁵ in standard form.", "310000|310,000", "Move the decimal five places right."],
        ["Write 8.2 × 10⁻³ in standard form.", "0.0082", "Move the decimal three places left."],
        ["Which is valid scientific notation?", "7.4 × 10^3|7.4*10^3", "The first factor must be at least 1 and less than 10.", ["74 × 10²", "0.74 × 10⁴", "7.4 × 10³", "7400 × 10⁰"]],
      ]),
      lesson(6, 4, "scientific-operations", "Operations in Scientific Notation", "Combine coefficients and powers separately.", "Multiply coefficients and add powers of ten.", "(2 × 10³)(3 × 10⁴) = 6 × 10⁷", ["Multiply 2 × 3 = 6.", "Add exponents: 3 + 4 = 7.", "Write 6 × 10⁷."], "8.EE.A.4", "teal", "scientific-ops", [
        ["Multiply (2 × 10³)(4 × 10²).", "8*10^5|8x10^5|8×10⁵", "Multiply coefficients and add exponents."],
        ["Divide (9 × 10⁶)/(3 × 10²).", "3*10^4|3x10^4|3×10⁴", "Divide coefficients and subtract exponents."],
        ["Add 3.2 × 10⁴ + 1.5 × 10⁴.", "4.7*10^4|4.7x10^4|4.7×10⁴", "The powers match, so add coefficients."],
        ["How many times larger is 6 × 10⁸ than 3 × 10⁶?", "200", "Divide to get 2 × 10²."],
        ["Write 12 × 10⁵ in proper scientific notation.", "1.2*10^6|1.2x10^6|1.2×10⁶", "Move the decimal once left and raise the exponent."],
      ]),
    ],
  },
  {
    id: 7,
    slug: "linear-equations",
    title: "Linear Equations",
    subtitle: "Transform equations without losing their balance.",
    accent: "teal",
    standard: "8.EE.C.7",
    lessons: [
      lesson(7, 1, "combining-like-terms", "Combining Like Terms", "Gather terms that share the same variable part.", "Like terms have identical variables and exponents.", "3x + 2 + 5x − 1 = 8x + 1", ["Combine 3x and 5x.", "Combine 2 and −1.", "Write 8x + 1."], "8.EE.C.7", "blue", "term-groups", [
        ["Simplify 4x + 3x.", "7x", "Add the coefficients."],
        ["Simplify 5a + 2 − 3a + 7.", "2a+9|9+2a", "Group a-terms and constants."],
        ["Simplify 6m − 4 + m.", "7m-4|-4+7m", "6m and m are like terms."],
        ["Simplify 2x + 3y + 4x.", "6x+3y|3y+6x", "Only x-terms combine."],
        ["Simplify 9p − 2p − 5.", "7p-5|-5+7p", "Subtract the coefficients 9 − 2."],
      ]),
      lesson(7, 2, "multi-step-equations", "Multi-Step Equations", "Simplify both sides before isolating x.", "Distribute, combine like terms, then use inverse operations.", "2(x + 3) = 14 → x = 4", ["Distribute: 2x + 6 = 14.", "Subtract 6: 2x = 8.", "Divide by 2: x = 4."], "8.EE.C.7.b", "teal", "equation-steps", [
        ["Solve 3(x + 2) = 21.", "5", "Distribute, subtract 6, divide by 3."],
        ["Solve 4x − 3 = 2x + 9.", "6", "Move x-terms to one side."],
        ["Solve 2(x − 5) + 4 = 10.", "8", "Distribute and combine constants first."],
        ["Solve x/3 + 5 = 9.", "12", "Subtract 5, then multiply by 3."],
        ["Solve 5 − 2x = 17.", "-6", "Subtract 5, then divide by −2."],
      ]),
      lesson(7, 3, "solution-types", "One, None, or Infinitely Many", "Recognize what remains after simplifying.", "x = a gives one solution; a = a gives all solutions; a = b gives none.", "2(x + 3) = 2x + 6 → all real numbers", ["Distribute the left side.", "Both sides become 2x + 6.", "Every x makes the equation true."], "8.EE.C.7.a", "coral", "solution-types", [
        ["How many solutions: 3x + 2 = 3x + 5?", "none|no solution", "Subtract 3x to get 2 = 5."],
        ["How many solutions: 4(x + 1) = 4x + 4?", "infinitely many|all real numbers", "Both sides are identical."],
        ["How many solutions: 2x + 7 = 15?", "one|1", "It simplifies to one value of x."],
        ["Solve 5x − 1 = 5x − 1.", "all real numbers|infinitely many", "The statement is always true."],
        ["Solve 2(x + 4) = 2x + 3.", "no solution|none", "It becomes 8 = 3."],
      ]),
      lesson(7, 4, "coordinate-plane", "The Coordinate Plane", "Locate points by moving x, then y.", "An ordered pair is written (x, y).", "A(−3, 2) lies in Quadrant II", ["Move 3 left on the x-axis.", "Move 2 up on the y-axis.", "Negative x and positive y means Quadrant II."], "8.EE.B.6", "blue", "coordinate", [
        ["Which quadrant contains (2, −4)?", "4|iv|quadrant iv", "Positive x and negative y is Quadrant IV."],
        ["Which quadrant contains (−1, −3)?", "3|iii|quadrant iii", "Both coordinates are negative."],
        ["What point is 3 right and 2 up from the origin?", "(3,2)|3,2", "Move along x first, then y."],
        ["Which axis contains (0, 5)?", "y-axis|y axis", "x = 0 places a point on the y-axis."],
        ["Reflect (4, −2) across the x-axis.", "(4,2)|4,2", "Keep x and change the sign of y."],
      ], sourceSheet("19_coordinate_plane.png")),
    ],
  },
  {
    id: 8,
    slug: "lines-systems",
    title: "Lines & Systems",
    subtitle: "Connect rates, graphs, and equations.",
    accent: "blue",
    standard: "8.EE.B.5–C.8",
    lessons: [
      lesson(8, 1, "slope-rate", "Slope and Rate of Change", "Measure vertical change for each horizontal step.", "Slope is rise divided by run.", "From (1, 2) to (3, 6): m = 4/2 = 2", ["Rise: 6 − 2 = 4.", "Run: 3 − 1 = 2.", "Slope = 4/2 = 2."], "8.EE.B.5–6", "blue", "slope", [
        ["Find the slope through (0, 1) and (2, 5).", "2", "Use (5 − 1)/(2 − 0)."],
        ["A line rises 6 and runs 3. What is its slope?", "2", "Divide rise by run."],
        ["Find the slope through (−1, 4) and (3, 4).", "0", "The y-values do not change."],
        ["What is the slope of a vertical line?", "undefined", "Its run is zero.", ["0", "1", "undefined", "−1"]],
        ["A car travels 150 miles in 3 hours. What is the rate?", "50|50 mph", "Divide distance by time."],
      ]),
      lesson(8, 2, "graphing-lines", "Graphing y = mx + b", "Use slope and intercept to draw a line.", "b is the y-intercept; m is the slope.", "y = 2x + 1", ["Plot the intercept (0, 1).", "Use slope 2 = 2/1: rise 2, run 1.", "Draw the line through the points."], "8.EE.B.6", "teal", "line-graph", [
        ["What is the slope of y = 3x − 4?", "3", "m is the coefficient of x."],
        ["What is the y-intercept of y = −2x + 5?", "5|(0,5)", "b is the constant term."],
        ["Write the equation with slope 2 and y-intercept −1.", "y=2x-1", "Use y = mx + b."],
        ["Does (2, 7) lie on y = 3x + 1?", "yes", "Substitute x = 2 and compare y.", ["yes", "no"]],
        ["Which line is steeper?", "y=4x", "Compare absolute slope values.", ["y = 4x", "y = 2x + 9"]],
      ]),
      lesson(8, 3, "systems-graphing", "Systems by Graphing", "Find the point shared by two lines.", "The intersection solves both equations.", "y = x + 1 and y = −x + 5 meet at (2, 3)", ["Set the y-values equal.", "x + 1 = −x + 5 gives x = 2.", "Substitute to get y = 3."], "8.EE.C.8.a–b", "violet", "systems", [
        ["Solve: y = x and y = −x + 4.", "(2,2)|2,2", "Set x = −x + 4."],
        ["What does parallel graphing indicate?", "no solution", "Parallel lines never intersect.", ["one solution", "no solution", "infinitely many"]],
        ["What does the same line indicate?", "infinitely many|all solutions", "Every point is shared."],
        ["Does (1, 3) solve y = 2x + 1 and y = −x + 4?", "yes", "Test the point in both equations.", ["yes", "no"]],
        ["How many solutions do two intersecting lines have?", "one|1", "They share one point."],
      ]),
      lesson(8, 4, "systems-algebra", "Systems Algebraically", "Eliminate or substitute to solve two equations.", "A solution must make both equations true.", "x + y = 7, x − y = 1 → (4, 3)", ["Add the equations: 2x = 8.", "So x = 4.", "Substitute to find y = 3."], "8.EE.C.8.b–c", "coral", "elimination", [
        ["Solve x + y = 9 and x − y = 3.", "(6,3)|6,3", "Add the equations to eliminate y."],
        ["Solve y = x + 2 and y = 3x − 2.", "(2,4)|2,4", "Set the expressions for y equal."],
        ["Solve 2x + y = 7 and y = 1.", "(3,1)|3,1", "Substitute y = 1."],
        ["Tickets cost $5 or $3. Two tickets cost $8. Which pair?", "one $5 and one $3|5 and 3", "Find two prices that total 8."],
        ["Classify x + y = 4 and 2x + 2y = 8.", "infinitely many", "The second equation is twice the first."],
      ]),
    ],
  },
  {
    id: 9,
    slug: "functions",
    title: "Functions",
    subtitle: "Describe how one quantity controls another.",
    accent: "teal",
    standard: "8.F.A.1–B.5",
    lessons: [
      lesson(9, 1, "function-rules", "What Is a Function?", "Decide whether each input has exactly one output.", "A function assigns every input exactly one output.", "1 → 4, 2 → 5, 3 → 6 is a function", ["Check each input.", "No input points to two outputs.", "The relation is a function."], "8.F.A.1", "teal", "mapping", [
        ["Can one input have two outputs in a function?", "no", "Each input gets exactly one output.", ["yes", "no"]],
        ["Is {(1,2), (2,3), (3,4)} a function?", "yes", "Each x-value appears once.", ["yes", "no"]],
        ["Is {(1,2), (1,5), (3,4)} a function?", "no", "Input 1 has two outputs.", ["yes", "no"]],
        ["In y = 2x + 1, what is the output when x = 3?", "7", "Substitute x = 3."],
        ["Which is an input variable?", "x", "x is commonly the independent input.", ["x", "y"]],
      ]),
      lesson(9, 2, "function-representations", "Multiple Representations", "Move between rules, tables, graphs, and words.", "Different representations can describe the same function.", "y = 2x + 1 gives 0 → 1, 1 → 3, 2 → 5", ["Choose input values.", "Apply the rule each time.", "Record the ordered pairs."], "8.F.A.2", "blue", "representations", [
        ["For y = 3x − 1, find y when x = 2.", "5", "Substitute 2 for x."],
        ["A table has x: 0,1,2 and y: 4,6,8. What is the rule?", "y=2x+4", "The output starts at 4 and rises by 2."],
        ["Which ordered pair lies on y = x + 3?", "(2,5)", "Test each pair.", ["(1,3)", "(2,5)", "(3,3)", "(4,2)"]],
        ["In “$4 per ticket plus $2 fee,” what is the initial value?", "2|$2", "The fixed fee is the starting value."],
        ["What graph represents a constant rate of change?", "a straight line|straight line", "A linear relationship graphs as a line."],
      ]),
      lesson(9, 3, "comparing-functions", "Comparing Functions", "Compare rates and starting values across forms.", "Translate both functions into slope and initial value.", "y = 3x + 2 grows faster than a table rising by 2", ["Find each rate of change.", "Compare 3 with 2.", "The first function grows faster."], "8.F.A.2", "gold", "compare", [
        ["Which grows faster: y = 4x + 1 or y = 2x + 8?", "y=4x+1", "Compare slopes 4 and 2."],
        ["Function A rises 3 per step. Function B rises 5. Which is faster?", "function b|b", "The greater rate is 5."],
        ["Which starts higher: y = x + 7 or y = 3x + 2?", "y=x+7", "Compare y-intercepts 7 and 2."],
        ["A table rises by 4 for every x-step. What is its slope?", "4", "Change in y divided by change in x."],
        ["Two functions have the same slope but different intercepts. Are their graphs parallel?", "yes", "Equal slopes give parallel lines.", ["yes", "no"]],
      ]),
      lesson(9, 4, "linear-nonlinear", "Linear and Nonlinear Relationships", "Recognize constant and changing rates.", "Linear functions change at a constant rate.", "y = x² is nonlinear", ["Check equal x-steps.", "The y-changes are not equal.", "The graph bends, so it is nonlinear."], "8.F.A.3–B.5", "violet", "curve-line", [
        ["Is y = 5x − 2 linear?", "yes|linear", "It has the form y = mx + b."],
        ["Is y = x² linear?", "no|nonlinear", "Its rate changes."],
        ["A graph rises, stays flat, then falls. Is it increasing the whole time?", "no", "A flat or falling section breaks continuous increase."],
        ["Which table is linear?", "y: 2,5,8,11", "Look for equal first differences.", ["y: 2,5,8,11", "y: 1,4,9,16"]],
        ["What does a horizontal graph segment mean?", "the output is constant|constant|no change", "y does not change there."],
      ]),
    ],
  },
  {
    id: 10,
    slug: "transformations",
    title: "Transformations",
    subtitle: "Move shapes while tracking what stays true.",
    accent: "coral",
    standard: "8.G.A.1–4",
    lessons: [
      lesson(10, 1, "rigid-transformations", "Translations, Reflections, Rotations", "Name and perform rigid motions.", "Rigid transformations preserve lengths and angles.", "A translation slides every point the same distance", ["Choose a direction and distance.", "Move every vertex identically.", "The image stays congruent."], "8.G.A.1", "coral", "transform", [
        ["Which transformation is a slide?", "translation", "Every point moves the same direction and distance.", ["translation", "reflection", "rotation", "dilation"]],
        ["Which transformation is a flip?", "reflection", "A reflection mirrors a figure."],
        ["Which transformation turns around a center?", "rotation", "Rotations use a center and angle."],
        ["Do rigid motions preserve side lengths?", "yes", "They keep size and shape.", ["yes", "no"]],
        ["Does a translation change angle measures?", "no", "Rigid motions preserve angles.", ["yes", "no"]],
      ]),
      lesson(10, 2, "coordinate-transformations", "Coordinate Transformations", "Apply transformation rules to coordinates.", "Coordinate rules move every point predictably.", "Reflect over x-axis: (x, y) → (x, −y)", ["Keep the x-coordinate.", "Change the sign of y.", "(3, −2) becomes (3, 2)."], "8.G.A.3", "blue", "coordinate-transform", [
        ["Reflect (4, −3) over the x-axis.", "(4,3)|4,3", "Keep x; change y's sign."],
        ["Reflect (−2, 5) over the y-axis.", "(2,5)|2,5", "Change x's sign; keep y."],
        ["Translate (1, 2) right 3 and up 4.", "(4,6)|4,6", "Add 3 to x and 4 to y."],
        ["Rotate (2, 1) 90° counterclockwise about the origin.", "(-1,2)|(−1,2)", "Use (x, y) → (−y, x)."],
        ["Rotate (3, −4) 180° about the origin.", "(-3,4)|(−3,4)", "Change both signs."],
      ]),
      lesson(10, 3, "congruence", "Congruence", "Prove two figures match by rigid motions.", "Congruent figures have the same size and shape.", "Translate, rotate, or reflect one figure onto the other", ["Compare corresponding lengths.", "Compare corresponding angles.", "Describe a rigid-motion sequence."], "8.G.A.2", "teal", "congruence", [
        ["Do congruent triangles have equal corresponding sides?", "yes", "Congruence preserves length.", ["yes", "no"]],
        ["Can a dilation with scale factor 2 prove congruence?", "no", "It changes size.", ["yes", "no"]],
        ["Which sequence preserves congruence?", "rotation then translation", "Both are rigid motions.", ["dilation then translation", "rotation then translation"]],
        ["If two figures are congruent, are corresponding angles equal?", "yes", "Rigid motions preserve angles."],
        ["A square moves 5 units right. Is its image congruent?", "yes", "A translation keeps size and shape."],
      ]),
      lesson(10, 4, "dilations-similarity", "Dilations and Similarity", "Use scale factor to create similar figures.", "Dilations preserve angles and multiply all lengths by one scale factor.", "Scale factor 2: a side of 3 becomes 6", ["Identify the scale factor.", "Multiply each length by 2.", "Angles stay equal."], "8.G.A.3–4", "gold", "dilation", [
        ["A side of 5 is dilated by scale factor 3. New length?", "15", "Multiply 5 × 3."],
        ["Does a dilation preserve angle measures?", "yes", "Similar figures have matching angles."],
        ["A length changes from 8 to 4. What is the scale factor?", "1/2|0.5", "Divide image length by original length."],
        ["Are all congruent figures also similar?", "yes", "Their scale factor is 1."],
        ["A triangle has sides 3, 4, 5. Scale by 2. What are the new sides?", "6,8,10|6, 8, 10", "Multiply every side by 2."],
      ]),
    ],
  },
  {
    id: 11,
    slug: "geometry",
    title: "Geometry",
    subtitle: "Use angle and distance relationships to solve shapes.",
    accent: "blue",
    standard: "8.G.A.5–B.8",
    lessons: [
      lesson(11, 1, "angle-relationships", "Angle Relationships", "Use lines and transversals to find missing angles.", "Vertical angles are equal; supplementary angles total 180°.", "If one angle is 65°, its vertical angle is 65°", ["Identify the relationship.", "Vertical angles have equal measure.", "Copy the measure: 65°."], "8.G.A.5", "blue", "angles", [
        ["Vertical angles: one is 72°. Find the other.", "72|72°", "Vertical angles are equal."],
        ["Two angles form a straight line. One is 110°. Find the other.", "70|70°", "Supplementary angles total 180°."],
        ["Complementary angles: one is 35°. Find the other.", "55|55°", "Complementary angles total 90°."],
        ["With parallel lines, corresponding angles are…", "equal|congruent", "They occupy matching positions."],
        ["An angle and its supplement are equal. Find each.", "90|90°", "Two equal angles total 180°."],
      ]),
      lesson(11, 2, "triangle-angles", "Triangle Angles", "Use angle sums inside and outside triangles.", "Interior angles of a triangle total 180°.", "50° + 60° + x = 180°, so x = 70°", ["Add the known angles: 110°.", "Subtract from 180°.", "The missing angle is 70°."], "8.G.A.5", "gold", "triangle", [
        ["A triangle has angles 45° and 65°. Find the third.", "70|70°", "Subtract their sum from 180°."],
        ["An isosceles triangle has two 50° angles. Find the third.", "80|80°", "180 − 100 = 80."],
        ["A right triangle has one acute angle 32°. Find the other.", "58|58°", "The two acute angles total 90°."],
        ["Two remote interior angles are 40° and 75°. Find the exterior angle.", "115|115°", "An exterior angle equals their sum."],
        ["Can a triangle have angles 90°, 60°, and 40°?", "no", "Their total is 190°, not 180°.", ["yes", "no"]],
      ]),
      lesson(11, 3, "pythagorean-theorem", "Pythagorean Theorem and Converse", "Connect the sides of a right triangle.", "For a right triangle, a² + b² = c².", "3² + 4² = 5²", ["Square the legs: 9 and 16.", "Add: 25.", "√25 = 5, so the hypotenuse is 5."], "8.G.B.6–7", "violet", "right-triangle", [
        ["Legs are 6 and 8. Find the hypotenuse.", "10", "Use 6² + 8² = c²."],
        ["Hypotenuse 13, one leg 5. Find the other leg.", "12", "Use 13² − 5²."],
        ["Do side lengths 5, 12, 13 form a right triangle?", "yes", "Check 5² + 12² = 13²."],
        ["Do side lengths 6, 7, 10 form a right triangle?", "no", "Check whether 6² + 7² equals 10²."],
        ["A square has diagonal √50 and side 5. Does that fit Pythagoras?", "yes", "5² + 5² = 50."],
      ]),
      lesson(11, 4, "coordinate-distance", "Distance on the Coordinate Plane", "Use the Pythagorean theorem between two points.", "Horizontal and vertical changes form the legs of a right triangle.", "From (1, 1) to (4, 5): distance = 5", ["Horizontal change is 3.", "Vertical change is 4.", "Distance is √(3² + 4²) = 5."], "8.G.B.8", "teal", "distance", [
        ["Find the distance from (0, 0) to (3, 4).", "5", "Use a 3–4–5 triangle."],
        ["Find the distance from (−1, 2) to (−1, 8).", "6", "The points have the same x-coordinate."],
        ["Find the distance from (2, −3) to (7, −3).", "5", "The points have the same y-coordinate."],
        ["Find the distance from (1, 1) to (7, 9).", "10", "Changes are 6 and 8."],
        ["A segment changes 5 horizontally and 12 vertically. Its length?", "13", "Use 5² + 12² = 13²."],
      ]),
    ],
  },
  {
    id: 12,
    slug: "measurement",
    title: "3D Measurement",
    subtitle: "Measure curved solids with familiar ideas.",
    accent: "gold",
    standard: "8.G.C.9",
    lessons: [
      lesson(12, 1, "cylinder-volume", "Volume of Cylinders", "Find volume as base area times height.", "A cylinder has volume V = πr²h.", "r = 3, h = 5 → V = 45π", ["Find base area: π·3² = 9π.", "Multiply by height 5.", "Volume is 45π cubic units."], "8.G.C.9", "blue", "cylinder", [
        ["Cylinder r = 2, h = 6. Find exact volume.", "24pi|24π", "Use πr²h."],
        ["Cylinder diameter 10, h = 3. Find exact volume.", "75pi|75π", "The radius is 5."],
        ["Cylinder volume 36π, r = 3. Find h.", "4", "36π = 9πh."],
        ["Which unit measures volume?", "cubic units", "Volume uses units³.", ["units", "square units", "cubic units"]],
        ["If radius doubles, volume changes by what factor?", "4", "The formula contains r²."],
      ]),
      lesson(12, 2, "cone-volume", "Volume of Cones", "Connect a cone to one third of a cylinder.", "A cone has volume V = ⅓πr²h.", "r = 3, h = 4 → V = 12π", ["Find πr²h = 36π.", "Take one third.", "Volume is 12π."], "8.G.C.9", "coral", "cone", [
        ["Cone r = 3, h = 6. Find exact volume.", "18pi|18π", "Use one third of π·9·6."],
        ["Cone diameter 8, h = 3. Find exact volume.", "16pi|16π", "Radius is 4; then use ⅓πr²h."],
        ["A cone and cylinder share r and h. Cone volume is what fraction?", "1/3|one third", "Compare their formulas."],
        ["Cone volume 25π, r = 5. Find h.", "3", "25π = ⅓·25π·h."],
        ["If height doubles, cone volume changes by what factor?", "2", "Volume is directly proportional to h."],
      ]),
      lesson(12, 3, "sphere-volume", "Volume of Spheres", "Use radius to measure a sphere's space.", "A sphere has volume V = ⁴⁄₃πr³.", "r = 3 → V = 36π", ["Cube the radius: 3³ = 27.", "Multiply by 4/3: 36.", "Volume is 36π."], "8.G.C.9", "violet", "sphere", [
        ["Sphere r = 3. Find exact volume.", "36pi|36π", "Use ⁴⁄₃π·27."],
        ["Sphere r = 6. Find exact volume.", "288pi|288π", "6³ = 216; multiply by 4/3."],
        ["Sphere diameter 10. What radius goes in the formula?", "5", "Radius is half the diameter."],
        ["If radius doubles, volume changes by what factor?", "8", "The formula contains r³."],
        ["A hemisphere has what fraction of a sphere's volume?", "1/2|one half", "A hemisphere is half a sphere."],
      ]),
      lesson(12, 4, "mixed-volume", "Mixed Volume Problems", "Choose the correct formula from the shape.", "Label radius and height before substituting.", "A cone inside a matching cylinder uses one third of its volume", ["Identify each solid.", "Write each formula before inserting numbers.", "Compare or combine the volumes."], "8.G.C.9", "gold", "solid-compare", [
        ["Cylinder r = 2, h = 9. Cone with same dimensions. Difference?", "24pi|24π", "Cylinder 36π minus cone 12π."],
        ["Two hemispheres of radius 3 make what solid?", "sphere|a sphere", "Two halves make one whole sphere."],
        ["A tank is a cylinder r = 4, h = 5. Exact capacity?", "80pi|80π", "Use πr²h."],
        ["Which holds more with the same r and h: cone or cylinder?", "cylinder", "A cone is one third of the cylinder."],
        ["Sphere r = 3 and cylinder r = 3, h = 4. Compare volumes.", "equal|same", "Both volumes are 36π."],
      ]),
    ],
  },
  {
    id: 13,
    slug: "data-probability",
    title: "Data & Probability",
    subtitle: "Read patterns, models, and chance with care.",
    accent: "teal",
    standard: "8.SP.A.1–4",
    lessons: [
      lesson(13, 1, "scatter-plots", "Scatter Plots", "Describe association between two quantities.", "Look for direction, form, strength, clusters, and outliers.", "Points rising left to right show positive association", ["Scan the overall direction.", "Check how closely points follow a pattern.", "Notice any point far from the rest."], "8.SP.A.1", "blue", "scatter", [
        ["Points rise from left to right. What association?", "positive|positive association", "Both variables tend to increase together."],
        ["Points fall from left to right. What association?", "negative|negative association", "One variable decreases as the other increases."],
        ["Points show no pattern. What association?", "none|no association", "There is no clear relationship."],
        ["What is an outlier?", "a point far from the pattern|point far from the pattern", "It sits away from the main cluster."],
        ["Tightly grouped points around a line show what strength?", "strong|strong association", "Less scatter means a stronger association."],
      ]),
      lesson(13, 2, "lines-of-fit", "Lines of Fit", "Use a line to model a scatter-plot trend.", "A good line of fit runs through the middle of the data.", "y = 2x + 5 predicts 25 when x = 10", ["Substitute x = 10.", "Calculate 2(10) + 5.", "The model predicts 25."], "8.SP.A.2–3", "teal", "fit-line", [
        ["For y = 3x + 2, predict y when x = 4.", "14", "Substitute 4 for x."],
        ["In y = 1.5x + 8, interpret slope 1.5.", "y increases 1.5 for each 1 increase in x|1.5 per x", "Slope is change in output per input."],
        ["In y = 4x + 10, what is the initial value?", "10", "The y-intercept is the value at x = 0."],
        ["Should a line of fit pass through every point?", "no", "It summarizes the overall trend.", ["yes", "no"]],
        ["Actual y is 20, predicted y is 18. What is the residual actual − predicted?", "2", "Compute 20 − 18."],
      ]),
      lesson(13, 3, "two-way-tables", "Two-Way Tables", "Compare categories with frequencies and percents.", "Relative frequencies make groups of different sizes comparable.", "18 of 30 students = 60%", ["Choose the correct row or column total.", "Divide the cell by that total.", "Convert 0.60 to 60%."], "8.SP.A.4", "gold", "two-way", [
        ["12 of 20 students prefer tea. What percent?", "60%|60", "12 ÷ 20 = 0.60."],
        ["A row totals 40; a cell is 10. Row relative frequency?", "25%|25|0.25", "Divide 10 by 40."],
        ["Why use relative frequency?", "to compare groups of different sizes|compare different group sizes", "Percents put groups on the same scale."],
        ["A table cell counts students in both categories. What is it called?", "joint frequency", "It lies at the intersection of two categories."],
        ["If two row percentages differ greatly, is association possible?", "yes", "Different conditional rates suggest association.", ["yes", "no"]],
      ]),
      lesson(13, 4, "probability", "Probability", "Compare favorable outcomes with all outcomes.", "Probability is between 0 and 1.", "3 red of 5 total → P(red) = 3/5", ["Count favorable outcomes: 3.", "Count all outcomes: 5.", "Write 3/5."], "Grade 8 readiness", "teal", "probability", [
        ["A bag has 3 red and 2 blue. Find P(red).", "3/5|0.6|60%", "Use favorable over total."],
        ["A fair coin is tossed. Find P(heads).", "1/2|0.5|50%", "One of two equally likely outcomes."],
        ["A fair die is rolled. Find P(rolling 6).", "1/6", "One favorable face out of six."],
        ["What probability represents an impossible event?", "0", "Impossible means no favorable outcomes."],
        ["What probability represents a certain event?", "1|100%", "Certain means every outcome is favorable."],
      ], sourceSheet("20_probability.png")),
    ],
  },
];

export const grade8Regions: RegionDefinition[] = regionSpecs.map((region, index) => ({ ...region, grade: 8, order: index + 1 }));
export const gradeCurricula = [
  { grade: 7 as const, title: "Grade 7", subtitle: "Ratios, rational numbers, equations, geometry, statistics, and probability", regions: grade7Regions },
  { grade: 8 as const, title: "Grade 8", subtitle: "Real numbers, linear relationships, transformations, geometry, and data", regions: grade8Regions },
  { grade: 9 as const, title: "Grade 9", subtitle: "Algebra I: equations, functions, systems, polynomials, quadratics, and modeling", regions: grade9Regions },
];
export const regions: RegionDefinition[] = gradeCurricula.flatMap((curriculum) => curriculum.regions);
export const lessons: LessonDefinition[] = regions.flatMap((region) => region.lessons);

export function getGradeCurriculum(grade: number) {
  return gradeCurricula.find((curriculum) => curriculum.grade === grade) ?? gradeCurricula[1];
}

export function getGradeLessons(grade: number) {
  return getGradeCurriculum(grade).regions.flatMap((region) => region.lessons);
}

export const lessonBySlug = new Map(lessons.map((item) => [item.slug, item]));
export const lessonById = new Map(lessons.map((item) => [item.id, item]));

export function getLesson(slug: string) {
  return lessonBySlug.get(slug);
}

export function getRegion(id: number) {
  return regions.find((region) => region.id === id);
}

export function nextLesson(current: LessonDefinition) {
  const gradeLessons = getGradeLessons(current.grade);
  return gradeLessons[gradeLessons.findIndex((item) => item.id === current.id) + 1];
}

function normalizeText(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[−–—]/g, "-")
    .replace(/[×·]/g, "*")
    .replace(/\s+/g, "")
    .replace(/quadrant/g, "")
    .replace(/\$/g, "")
    .replace(/°/g, "");
}

function asFraction(value: string): number | null {
  const normalized = normalizeText(value).replace(/%$/, "");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) {
    const parsed = Number(normalized);
    return value.trim().endsWith("%") ? parsed / 100 : parsed;
  }
  const match = normalized.match(/^(-?\d+)\/(-?\d+)$/);
  if (!match) return null;
  const denominator = Number(match[2]);
  return denominator === 0 ? null : Number(match[1]) / denominator;
}

export function isAnswerCorrect(input: string, accepted: string) {
  const variants = accepted.split("|");
  const inputNumber = asFraction(input);
  return variants.some((variant) => {
    const variantNumber = asFraction(variant);
    if (inputNumber !== null && variantNumber !== null) {
      return Math.abs(inputNumber - variantNumber) < 1e-9;
    }
    return normalizeText(input) === normalizeText(variant);
  });
}

export const curriculumStats = {
  grades: gradeCurricula.length,
  regions: regions.length,
  lessons: lessons.length,
  bosses: regions.length,
  questions: lessons.reduce((total, item) => total + item.practice.length, 0),
};
