[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video) &nbsp; [![badge](https://img.shields.io/github/stars/apivideo/api.video-npm-workspace-publish-from-release?style=social)](https://github.com/apivideo/api.video-npm-workspace-publish-from-release) &nbsp; [![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)
![](https://github.com/apivideo/API_OAS_file/blob/master/apivideo_banner.png)
<h1 align="center">npm-workspace-publish-from-release</h1>

[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in your app.

# Table of contents

- [Table of contents](#table-of-contents)
- [Project description](#project-description)
- [Documentation](#documentation)
  - [Example usage](#example-usage)

# Project description

Publish npm workspace depending on published GitHub release.

# Documentation

## Example usage

```yml
uses: apivideo/api.video-npm-workspace-publish-from-release
with:
  github-auth-token: ${{ secrets.GITHUB_TOKEN }}
```
