import { initValues } from "..";
import { colorHandler } from './colorHandler';

export const onSettingsChange = (e) => {
  colorHandler(e.settings);
  Object.assign(initValues.settings,e);
};