export type VisualLandmark = {
  src: string;
  alt: string;
  lessonSlug: string;
};

export const grade7RegionLandmarks: Record<number, VisualLandmark> = {
  701: { src: "/visuals/unit-rate-bike-context.webp", alt: "Three bicycles and equal route sections model an amount per one unit", lessonSlug: "g7-unit-rates" },
  702: { src: "/visuals/signed-numbers-context.webp", alt: "Floors above and below street level model rational changes around zero", lessonSlug: "g7-add-rational-numbers" },
  703: { src: "/visuals/inequality-trail-context.webp", alt: "Open and closed trail boundaries model inequality solution sets extending left or right", lessonSlug: "g7-inequalities-g7" },
  704: { src: "/visuals/percent-market-context.webp", alt: "A market display models percent change and everyday percent problems", lessonSlug: "g7-percent-change" },
  705: { src: "/visuals/circle-fountain-context.webp", alt: "A fountain highlights the radius, diameter, circumference, and area of a circle", lessonSlug: "g7-circle-measures" },
  706: { src: "/visuals/prism-packing-context.webp", alt: "A packing box built in equal layers models prism volume", lessonSlug: "g7-prism-volume" },
  707: { src: "/visuals/scatter-field-context.webp", alt: "A greenhouse experiment models observations, samples, center, and spread", lessonSlug: "g7-random-samples" },
  708: { src: "/visuals/probability-arcade-context.webp", alt: "A spinner, die, and trial tokens model probability and sample spaces", lessonSlug: "g7-probability-scale" },
};

export const grade8RegionLandmarks: Record<number, VisualLandmark> = {
  1: { src: "/visuals/signed-numbers-context.webp", alt: "Floors above and below street level model positive and negative positions", lessonSlug: "signed-numbers" },
  2: { src: "/visuals/percent-market-context.webp", alt: "A market wall split into equal tiles models a percent of a whole", lessonSlug: "percent" },
  3: { src: "/visuals/equation-balance-context.webp", alt: "A level balance models doing the same operation to both sides", lessonSlug: "one-step-equations" },
  4: { src: "/visuals/distributive-workshop-context.webp", alt: "Repeated workshop trays model distributing a factor to every term", lessonSlug: "distributive-property" },
  5: { src: "/visuals/irrational-garden-context.webp", alt: "A rectangular garden diagonal models an irrational square root", lessonSlug: "approximating-irrationals" },
  6: { src: "/visuals/scientific-observatory-context.webp", alt: "Shrinking observatory scale rings model powers of ten", lessonSlug: "scientific-notation" },
  7: { src: "/visuals/solution-cases-gallery-context.webp", alt: "Three route displays model lines meeting once, never meeting, or sharing the same path", lessonSlug: "solution-types" },
  8: { src: "/visuals/slope-trail-context.webp", alt: "A rising mountain trail models vertical change over horizontal change", lessonSlug: "slope-rate" },
  9: { src: "/visuals/function-kiosk-context.webp", alt: "A rental kiosk connects one function rule with several representations", lessonSlug: "function-representations" },
  10: { src: "/visuals/transform-plaza-context.webp", alt: "Triangular sculptures model translations, reflections, and rotations", lessonSlug: "coordinate-transformations" },
  11: { src: "/visuals/pythagorean-city-context.webp", alt: "Three city routes form a right triangle and a diagonal shortcut", lessonSlug: "pythagorean-theorem" },
  12: { src: "/visuals/cylinder-tank-context.webp", alt: "A water tank fills in equal circular layers to model cylinder volume", lessonSlug: "cylinder-volume" },
  13: { src: "/visuals/scatter-field-context.webp", alt: "A greenhouse experiment models observations in a scatter plot", lessonSlug: "scatter-plots" },
};

export const grade9RegionLandmarks: Record<number, VisualLandmark> = {
  901: { src: "/visuals/distributive-workshop-context.webp", alt: "A structured workshop tray models the parts and properties of algebraic expressions", lessonSlug: "g9-algebraic-structure" },
  902: { src: "/visuals/multistep-workshop-context.webp", alt: "Nested workshop layers model solving linear equations one operation at a time", lessonSlug: "g9-multi-step-linear-equations" },
  903: { src: "/visuals/slope-trail-context.webp", alt: "A rising trail models slope and a linear relationship", lessonSlug: "g9-slope-from-points" },
  904: { src: "/visuals/systems-transit-context.webp", alt: "Two transit routes crossing at one station model a system’s shared solution", lessonSlug: "g9-systems-by-graphing-g9" },
  905: { src: "/visuals/scientific-observatory-context.webp", alt: "Nested scales model exponents, roots, and radical size", lessonSlug: "g9-integer-exponents-g9" },
  906: { src: "/visuals/polynomial-tiles-context.webp", alt: "One rectangle split into product areas models polynomial multiplication", lessonSlug: "g9-multiply-binomials" },
  907: { src: "/visuals/polynomial-tiles-context.webp", alt: "An aligned algebra tile rectangle models reversing multiplication through factoring", lessonSlug: "g9-factor-trinomials" },
  908: { src: "/visuals/parabola-bridge-context.webp", alt: "A symmetric bridge arch models the graph of a quadratic equation", lessonSlug: "g9-quadratic-graphs" },
  909: { src: "/visuals/exponential-greenhouse-context.webp", alt: "Greenhouse trays with doubling plants model exponential growth", lessonSlug: "g9-exponential-growth" },
  910: { src: "/visuals/scatter-field-context.webp", alt: "A greenhouse data experiment models scatter plots, residuals, and decisions", lessonSlug: "g9-scatter-models-g9" },
};

export const grade10RegionLandmarks: Record<number, VisualLandmark> = {
  1001: { src: "/visuals/angle-plaza-context.webp", alt: "A geometric plaza highlights angle relationships used in a proof", lessonSlug: "g10-angle-proofs" },
  1002: { src: "/visuals/transform-plaza-context.webp", alt: "Rigid transformations move a figure while preserving every length and angle", lessonSlug: "g10-rigid-transformations" },
  1003: { src: "/visuals/triangle-builder-context.webp", alt: "Similar right triangles connect scale, exact ratios, and trigonometry", lessonSlug: "g10-right-triangle-trig" },
  1004: { src: "/visuals/coordinate-route-context.webp", alt: "Coordinate routes model distance, midpoint, slope, and partitioning", lessonSlug: "g10-distance-midpoint" },
  1005: { src: "/visuals/circle-fountain-context.webp", alt: "A circle model connects central angles, chords, tangents, arcs, and equations", lessonSlug: "g10-circle-angle-theorems" },
  1006: { src: "/visuals/cylinder-tank-context.webp", alt: "A scaled tank model connects measurement, volume, density, and units", lessonSlug: "g10-volume-and-scaling" },
  1007: { src: "/visuals/compound-events-lab-context.webp", alt: "A probability lab organizes compound, conditional, and independent events", lessonSlug: "g10-conditional-probability" },
  1008: { src: "/visuals/residual-observatory-context.webp", alt: "A fitted model and residual markers show how predictions differ from observed data", lessonSlug: "g10-regression-and-residuals" },
};

export const grade11RegionLandmarks: Record<number, VisualLandmark> = {
  1101: { src: "/visuals/polynomial-tiles-context.webp", alt: "Polynomial structure, factors, division, and roots are organized in one model", lessonSlug: "g11-polynomial-roots" },
  1102: { src: "/visuals/rational-exponent-lab-context.webp", alt: "A laboratory model connects rational expressions, radicals, and their domains", lessonSlug: "g11-radical-functions" },
  1103: { src: "/visuals/exponential-greenhouse-context.webp", alt: "Repeated growth and logarithmic inverse operations appear in a greenhouse model", lessonSlug: "g11-exponential-models" },
  1104: { src: "/visuals/geometric-sequence-lab-context.webp", alt: "An ordered sequence model compares constant difference, constant ratio, and series sums", lessonSlug: "g11-geometric-sequences" },
  1105: { src: "/visuals/circle-fountain-context.webp", alt: "A unit circle connects radians, exact trigonometric values, and periodic graphs", lessonSlug: "g11-radians-unit-circle" },
  1106: { src: "/visuals/parabola-bridge-context.webp", alt: "Several conic curves connect geometric definitions with algebraic equations", lessonSlug: "g11-conic-classification" },
  1107: { src: "/visuals/systems-transit-context.webp", alt: "A coordinate network represents matrices, systems, transformations, and vectors", lessonSlug: "g11-matrix-systems" },
  1108: { src: "/visuals/distribution-comparison-context.webp", alt: "Sampling distributions and intervals compare center, variation, and uncertainty", lessonSlug: "g11-confidence-intervals" },
};

export const grade12RegionLandmarks: Record<number, VisualLandmark> = {
  1201: { src: "/visuals/function-routing-context.webp", alt: "A function-routing system models composition, inverses, and transformations", lessonSlug: "g12-function-composition" },
  1202: { src: "/visuals/solution-cases-gallery-context.webp", alt: "Approaching paths distinguish two-sided limits, holes, jumps, and continuity", lessonSlug: "g12-limit-from-table-graph" },
  1203: { src: "/visuals/slope-trail-context.webp", alt: "Secant lines approach a tangent line to model an instantaneous derivative", lessonSlug: "g12-derivative-meaning" },
  1204: { src: "/visuals/graphing-line-city-context.webp", alt: "A tangent line and changing curve model motion, shape, and optimization", lessonSlug: "g12-tangent-lines" },
  1205: { src: "/visuals/polynomial-tiles-context.webp", alt: "Equal-width slices accumulate beneath a curve to model definite integrals and total change", lessonSlug: "g12-definite-integrals" },
  1206: { src: "/visuals/coordinate-route-context.webp", alt: "Directed paths and rotating coordinates connect vectors, parametric motion, and polar form", lessonSlug: "g12-vector-dot-product" },
  1207: { src: "/visuals/probability-arcade-context.webp", alt: "Repeated trials model random variables, expected value, and probability distributions", lessonSlug: "g12-binomial-distribution" },
  1208: { src: "/visuals/simple-interest-growth-context.webp", alt: "A long-term growth model connects statistical decisions, compound interest, loans, and networks", lessonSlug: "g12-compound-interest" },
};

export const regionLandmarks: Record<number, VisualLandmark> = {
  ...grade7RegionLandmarks,
  ...grade8RegionLandmarks,
  ...grade9RegionLandmarks,
  ...grade10RegionLandmarks,
  ...grade11RegionLandmarks,
  ...grade12RegionLandmarks,
};

export function getRegionLandmark(grade: number, regionId: number) {
  const landmark = regionLandmarks[regionId];
  if (!landmark) return undefined;
  const belongsToGrade = grade === 8 ? regionId < 100 : Math.floor(regionId / 100) === grade;
  return belongsToGrade ? landmark : undefined;
}
