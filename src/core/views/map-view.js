import View from './view';
import WebMercatorViewport from '../viewports/viewport';

export default class MapView extends View {
  constructor(props) {
    super(
      Object.assign({}, props, {
        type: WebMercatorViewport
      })
    );
  }
}
