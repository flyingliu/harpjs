//npm install -g fis-parser-es6-babel
fis.set('project.fileType.text', 'es');
fis.match('*.es', {
    rExt: '.js',
    parser: fis.plugin('es6-babel', {})
});