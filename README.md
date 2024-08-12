# Tweakpane JSON extention
Plugin template of an input binding for [Tweakpane][tweakpane].

## Version compatibility

| Tweakpane | plugin-template |
| --------- | --------------- |
| 4.x       | [main](https://github.com/tweakpane/plugin-template/tree/main) |
| 3.x       | [v3](https://github.com/tweakpane/plugin-template/tree/v3) |

## Usage


### Browser
```html
<script type="module">
  import {Pane} as Tweakpane from './tweakpane.min.js';
  import * as JsonPlugin from './tweakpane-plugin-template.min.js';

  const pane = new Pane();
  pane.registerPlugin(JsonPlugin);
</script>
```


### Package
```js
import {Pane} from 'tweakpane';
import * as JsonPlugin from 'tweakpane-plugin-template';

const pane = new Pane();
pane.registerPlugin(JsonPlugin);
```


## Usage
```js
const params = {
  prop: 3,
};

// TODO: Update parameters for your plugin
pane.addInput(params, 'prop', {
  view: 'json',
}).on('change', (ev) => {
  console.log(ev.value);
});
```


[tweakpane]: https://github.com/cocopon/tweakpane/
