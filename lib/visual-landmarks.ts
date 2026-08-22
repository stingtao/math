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

export const regionLandmarks: Record<number, VisualLandmark> = {
  ...grade7RegionLandmarks,
  ...grade8RegionLandmarks,
  ...grade9RegionLandmarks,
};

export function getRegionLandmark(grade: number, regionId: number) {
  const landmark = regionLandmarks[regionId];
  if (!landmark) return undefined;
  const belongsToGrade = grade === 8 ? regionId < 100 : Math.floor(regionId / 100) === grade;
  return belongsToGrade ? landmark : undefined;
}
