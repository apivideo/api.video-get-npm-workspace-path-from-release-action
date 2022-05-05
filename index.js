const fs = require('fs');
const readline = require('readline');
const semver = require('semver')
const core = require('@actions/core');
const { Octokit, App } = require("octokit");
const github = require('@actions/github');
const glob = require("glob")


function listWorkspaces(path, suffixToIgnore) {
    return new Promise((resolve, reject) => glob(path, (err, files1) => {
        if (err) {
            reject(err);
        } else {
            resolve(files1
                .map((f) => {
                    const changeLogPath = f + "/CHANGELOG.md";
                    const packageJsonPath = f + "/package.json";

                    if (fs.existsSync(changeLogPath) && fs.existsSync(packageJsonPath)) {
                        let packageName = JSON.parse(fs.readFileSync(packageJsonPath)).name;
                        if (packageName && suffixToIgnore.length() > 0 && packageName.indexOf(suffixToIgnore) === 0) {
                            packageName = packageName.substring(suffixToIgnore.length);
                        }
                        return ({
                            package: packageName,
                            changelog: changeLogPath,
                            packagePath: f
                        });
                    }
                }).filter(a => a !== undefined));
        }
    }));
}

async function findNpmWorkspacesChangelogs(suffixToIgnore) {
    let packageJson;
    try {
        packageJson = JSON.parse(fs.readFileSync("package.json"));
    } catch (e) {
        throw new Error(`Could not read package.json: ${e}`);
    }

    if (!packageJson.workspaces || packageJson.workspaces.length === 0) {
        throw new Error(`No workspace found in package.json`);
    }

    const res = await Promise.all(packageJson.workspaces.map(w => listWorkspaces(w, suffixToIgnore)));

    let files = [];
    res.forEach(rr => {
        rr.forEach(r => {
            if (!files.find(f => f.changelog === r.changelog && f.package === r.package)) {
                files = files.concat(r);
            }
        });
    });
    return files;
}

(async () => {
    try {
        const suffixToIgnore = core.getInput('package-name-suffix-to-ignore', { required: false });

        const releaseName = github.context.payload.release.name;
        const changelogs = await findNpmWorkspacesChangelogs(suffixToIgnore);

        console.log(releaseName, JSON.stringify(changelogs));

        const matchingChangelogs = changelogs.filter(c => c.package === releaseName.substring(0, releaseName.indexOf("@")));

        if (!matchingChangelogs || matchingChangelogs.length === 0) {
            core.setFailed("No workspace found for release " + releaseName);
        }

        console.log("packagePath", matchingChangelogs[0].packagePath);
        core.setOutput("packagePath", matchingChangelogs[0].packagePath);

    } catch (error) {
        core.setFailed(error.message);
    }
})();