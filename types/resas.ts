export type ApiPrefectures = {
  message: string | null;
  result: {
    prefCode: number;
    prefName: string;
  }[];
};

export type ApiPopulationComposition = {
  message: string | null;
  result: {
    boundaryYear: number;
    data: {
      label: string;
      data: {
        year: number;
        value: number;
      }[];
    }[];
  };
};
