export const random = (seed = 88675123) => {
  let x = 123456789;
  let y = 362436069;
  let z = 521288629;
  let w = seed;

  const t = x ^ (x << 11);
  x = y;
  y = z;
  z = w;
  return (w = w ^ (w >>> 19) ^ (t ^ (t >>> 8)));
};
