import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';
import { version } from './package.json';

const banner = `/**
 * @name darkside ${version}
 * @license MIT
 * @author @cirocfc (ciro.cfc@gmail.com) | @jefferson-amorim (jefferson@jeffersonamorim.com.br)
 */`;

export default {
  input: 'src/index.js',
  output: {
    name: 'darkside',
    banner: banner,
    file: 'dist/darkside.js',
    format: 'iife'
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    uglify({
      mangle: false,
    })
  ],
  watch: {
    exclude: 'node_modules/**'
  }
};
