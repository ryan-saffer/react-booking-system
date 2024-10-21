## Server

Before running `npm install` the following packages must be installed using homebrew:

```sh
brew install pkg-config cairo pango libpng jpeg giflib librsvg pixman python-setuptools
```

This is needed for installation of the [canvas library](https://github.com/Automattic/node-canvas?tab=readme-ov-file#installation) on macOS with Apple Silicon.

You can then install dependencies by running:

```sh
npm install canvas --build-from-source
npm install
```
