'use babel'

import path from "path";

export default {
  repoForPath(goalPath) {
    let iterable = atom.project.getPaths();
    for (let i = 0; i < iterable.length; i++) {
      let projectPath = iterable[i];
      if (goalPath === projectPath || goalPath.indexOf(projectPath + path.sep) === 0) {
        return atom.project.getRepositories()[i];
      }
    }
    return null;
  },

  getStyleObject(el) {
    let styleProperties = window.getComputedStyle(el);
    let styleObject = {};
    for (let property in styleProperties) {
      let value = styleProperties.getPropertyValue(property);
      let camelizedAttr = property.replace(/\-([a-z])/g, (a, b) => b.toUpperCase());
      styleObject[camelizedAttr] = value;
    }
    return styleObject;
  },

  getFullExtension(filePath) {
    let extension;
    let fullExtension = '';
    while (extension = path.extname(filePath)) {
      fullExtension = extension + fullExtension;
      filePath = path.basename(filePath, extension);
    }
    return fullExtension;
  }
};
