// Installed Google Chrome supplies the platform MP4 decoder missing in some test browsers.
import base from "./playwright.config.mjs";
export default {...base,testMatch:["free.spec.mjs","privacy.spec.mjs"],use:{...base.use,browserName:"chromium",channel:"chrome"}};
