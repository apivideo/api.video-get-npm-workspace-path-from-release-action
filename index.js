const fs = require('fs');
const readline = require('readline');
const semver = require('semver')
const core = require('@actions/core');
const { Octokit, App } = require("octokit");
const github = require('@actions/github');
const glob = require("glob")

async function getVersionsFromChangelog(changelogFilePath) {
    const fileStream = fs.createReadStream(changelogFilePath);

    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let currentVersion;
    const versions = [];
    for await (const line of rl) {
        const versionRegexResult = /.*\s+\[v?([\d\.]+)\].*/.exec(line);
        if (versionRegexResult) {
            currentVersion = versionRegexResult[1];
            versions[currentVersion] = [];
            continue;
        }

        if (!currentVersion) {
            continue;
        }

        const detailsRegexResult = /\s?-\s?([^\s].*)/.exec(line);
        if (detailsRegexResult) {
            versions[currentVersion].push(detailsRegexResult[1]);
        }
    }
    return versions;
}

function listWorkspaces(path) {
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
                        if (packageName && packageName.indexOf("@") === 0) {
                            packageName = packageName.substring(1);
                        }
                        return ({
                            package: packageName,
                            changelog: changeLogPath,
                        });
                    }
                }).filter(a => a !== undefined));
        }
    }));
}

async function findNpmWorkspacesChangelogs(changelogFilePath) {
    let packageJson;
    try {
        packageJson = JSON.parse(fs.readFileSync("package.json"));
    } catch (e) {
        throw new Error(`Could not read package.json: ${e}`);
    }

    if (!packageJson.workspaces || packageJson.workspaces.length === 0) {
        throw new Error(`No workspace found in package.json`);
    }

    const res = await Promise.all(packageJson.workspaces.map(w => listWorkspaces(w)));

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
        console.log(JSON.stringify(github.context));
    } catch (error) {
        core.setFailed(error.message);
    }
})();