const alertNotDefined = (val: string) => {
  console.error('\x1b[31m%s\x1b[0m', `error - ${val} not defined in .env!`);
  return '';
};

//always use this style when loading new .env variables
export const BACKEND_HOST = process.env.BACKEND_HOST
  ? process.env.BACKEND_HOST
  : alertNotDefined('BACKEND_HOST');
