export type HiringNormCard = {
  key: string;
  title: string;
  body: string;
};

export type HiringNormsByCountry = Record<string, HiringNormCard[]>;
