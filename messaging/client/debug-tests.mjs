// Keep disposable browser binaries in the same execution session while iterating.
import {spawnSync} from "node:child_process";
import {createInterface} from "node:readline";
import {tmpdir} from "node:os";
import {join} from "node:path";
process.env.PLAYWRIGHT_BROWSERS_PATH=join(tmpdir(),"shici-test-browsers");
process.env.SHICI_LOCAL_MATRIX_TEST="1";
function run(command){return spawnSync(command,{shell:true,stdio:"inherit",env:process.env}).status;}
if(run("npx.cmd playwright install chromium --only-shell")!==0)process.exit(1);
run("npm.cmd run build");
run("npx.cmd playwright test");
console.log("READY: test / build / exit");
createInterface({input:process.stdin}).on("line",line=>{
  if(line.trim()==="test")run("npx.cmd playwright test");
  else if(line.trim()==="build")run("npm.cmd run build");
  else if(line.trim()==="exit")process.exit();
  console.log("READY");
});
