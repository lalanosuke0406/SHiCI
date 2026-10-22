import base from "./playwright.config.mjs";
export default {...base,testMatch:["free.spec.mjs","privacy.spec.mjs"],use:{...base.use,browserName:"webkit"}};
