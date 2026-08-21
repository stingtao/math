export type VisualLandmark = {
  src: string;
  alt: string;
  lessonSlug: string;
};

export const grade8RegionLandmarks: Record<number, VisualLandmark> = {
  1: { src: "/visuals/signed-numbers-context.png", alt: "Floors above and below street level model positive and negative positions", lessonSlug: "signed-numbers" },
  2: { src: "/visuals/percent-market-context.jpg", alt: "A market wall split into equal tiles models a percent of a whole", lessonSlug: "percent" },
  3: { src: "/visuals/equation-balance-context.jpg", alt: "A level balance models doing the same operation to both sides", lessonSlug: "one-step-equations" },
  4: { src: "/visuals/distributive-workshop-context.jpg", alt: "Repeated workshop trays model distributing a factor to every term", lessonSlug: "distributive-property" },
  5: { src: "/visuals/irrational-garden-context.jpg", alt: "A rectangular garden diagonal models an irrational square root", lessonSlug: "approximating-irrationals" },
  6: { src: "/visuals/scientific-observatory-context.jpg", alt: "Shrinking observatory scale rings model powers of ten", lessonSlug: "scientific-notation" },
  7: { src: "/visuals/multistep-workshop-context.jpg", alt: "Nested workshop containers model undoing equation steps in reverse", lessonSlug: "multi-step-equations" },
  8: { src: "/visuals/slope-trail-context.jpg", alt: "A rising mountain trail models vertical change over horizontal change", lessonSlug: "slope-rate" },
  9: { src: "/visuals/function-kiosk-context.jpg", alt: "A rental kiosk connects one function rule with several representations", lessonSlug: "function-representations" },
  10: { src: "/visuals/transform-plaza-context.jpg", alt: "Triangular sculptures model translations, reflections, and rotations", lessonSlug: "coordinate-transformations" },
  11: { src: "/visuals/pythagorean-city-context.jpg", alt: "Three city routes form a right triangle and a diagonal shortcut", lessonSlug: "pythagorean-theorem" },
  12: { src: "/visuals/cylinder-tank-context.jpg", alt: "A water tank fills in equal circular layers to model cylinder volume", lessonSlug: "cylinder-volume" },
  13: { src: "/visuals/scatter-field-context.jpg", alt: "A greenhouse experiment models observations in a scatter plot", lessonSlug: "scatter-plots" },
};

export function getRegionLandmark(grade: number, regionId: number) {
  return grade === 8 ? grade8RegionLandmarks[regionId] : undefined;
}
